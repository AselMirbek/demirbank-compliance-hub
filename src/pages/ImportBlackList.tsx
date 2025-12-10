import React, { useState, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Upload, 
  FileText, 
  Send, 
  Trash2, 
  CheckSquare,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ImportedRow,
  CoincidenceEntry,
  generateTxNo,
  generateId,
  getCurrentTimestamp,
  getListGroup,
  originSourceOptions,
  normalizeSearchName
} from '@/lib/mockData';
import {
  getCustomerByNo,
  getBlackList,
  addTransaction,
  addAuditLog,
  findCoincidences
} from '@/lib/storage';
import { cn } from '@/lib/utils';

const ImportBlackList: React.FC = () => {
  const { user } = useAuth();
  const [txType, setTxType] = useState<'INSERT' | 'DELETE'>('INSERT');
  const [originSource, setOriginSource] = useState('');
  const [listGroup, setListGroup] = useState('');
  const [filePath, setFilePath] = useState('');
  const [importedData, setImportedData] = useState<ImportedRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [coincidences, setCoincidences] = useState<CoincidenceEntry[]>([]);

  const handleOriginSourceChange = (value: string) => {
    setOriginSource(value);
    setListGroup(getListGroup(value));
  };

  const parseFile = useCallback(async (file: File) => {
    const fileName = file.name.toLowerCase();
    const newRows: ImportedRow[] = [];
    const newCoincidences: CoincidenceEntry[] = [];

    if (fileName.endsWith('.txt')) {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const isOnlyDigits = /^\d+$/.test(trimmed);
        const isOnlyLetters = /^[A-Za-zА-Яа-яЁё\s]+$/.test(trimmed);

        if (!isOnlyDigits && !isOnlyLetters) {
          toast.error(`Invalid line: "${trimmed}" contains mixed characters`);
          continue;
        }

        let customerNo = '';
        let name = '';

        if (isOnlyDigits) {
          customerNo = trimmed;
          // If INSERT and CUSTOMER source, lookup name from customer DB
          if (txType === 'INSERT' && originSource === 'CUSTOMER') {
            const customer = getCustomerByNo(customerNo);
            name = customer?.name || 'UNKNOWN';
          }
        } else {
          name = trimmed.toUpperCase();
        }

        const row: ImportedRow = {
          id: generateId(),
          txNo: generateTxNo(),
          customerNo,
          name,
          txType,
          createDate: getCurrentTimestamp(),
          createUser: user?.username || 'unknown',
          selected: false,
          originSource,
          listGroup
        };

        newRows.push(row);

        // Find coincidences
        if (customerNo || name) {
          const matches = findCoincidences(customerNo, name);
          matches.forEach(match => {
            if (!newCoincidences.find(c => c.customerNo === match.customerNo)) {
              newCoincidences.push(match);
            }
          });
        }
      }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // For XLSX, we'll use a simple simulation since we can't import xlsx library
      toast.info('XLSX parsing simulated. In production, use xlsx library.');
      
      // Simulate some data
      const sampleData = [
        { customerNo: '12345678901234', name: 'IVANOV IVAN' },
        { customerNo: '23456789012345', name: 'PETROV PETR' },
      ];

      for (const item of sampleData) {
        const row: ImportedRow = {
          id: generateId(),
          txNo: generateTxNo(),
          customerNo: item.customerNo,
          name: item.name,
          txType,
          createDate: getCurrentTimestamp(),
          createUser: user?.username || 'unknown',
          selected: false,
          originSource,
          listGroup
        };

        newRows.push(row);

        const matches = findCoincidences(item.customerNo, item.name);
        matches.forEach(match => {
          if (!newCoincidences.find(c => c.customerNo === match.customerNo)) {
            newCoincidences.push(match);
          }
        });
      }
    } else {
      toast.error('Unsupported file format. Please use .txt or .xlsx');
      return;
    }

    setImportedData(prev => [...prev, ...newRows]);
    setCoincidences(prev => [...prev, ...newCoincidences]);
    setFilePath(file.name);
    toast.success(`Imported ${newRows.length} records`);
  }, [txType, originSource, listGroup, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!originSource) {
        toast.error('Please select Origin Source first');
        return;
      }
      parseFile(file);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === importedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(importedData.map(r => r.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRows.size === 0) {
      toast.error('No rows selected');
      return;
    }

    setImportedData(prev => 
      prev.map(row => 
        selectedRows.has(row.id) ? { ...row, txType: 'DELETE' as const } : row
      )
    );
    toast.success(`Marked ${selectedRows.size} rows for deletion`);
    setSelectedRows(new Set());
  };

  const handleTransactionSend = () => {
    if (selectedRows.size === 0) {
      toast.error('No rows selected');
      return;
    }

    const selectedData = importedData.filter(row => selectedRows.has(row.id));
    
    selectedData.forEach(row => {
      addTransaction({
        txNo: row.txNo,
        customerNo: row.customerNo,
        name: row.name,
        txType: row.txType,
        originSource: row.originSource,
        listGroup: row.listGroup,
        status: 'PENDING_APPROVAL',
        createdUser: user?.username || 'unknown',
        listType: 'BLACK'
      });

      addAuditLog({
        action: 'TRANSACTION_CREATED',
        user: user?.username || 'unknown',
        role: user?.role || 'Maker',
        txNo: row.txNo,
        details: `Created ${row.txType} transaction for ${row.customerNo}`
      });
    });

    // Remove sent rows from imported data
    setImportedData(prev => prev.filter(row => !selectedRows.has(row.id)));
    setSelectedRows(new Set());
    
    toast.success(`Sent ${selectedData.length} transactions for approval`);
  };

  const importedColumns = [
    { key: 'txNo', header: 'Tx No', sortable: true },
    { key: 'customerNo', header: 'Customer No', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { 
      key: 'txType', 
      header: 'Tx Type',
      render: (row: ImportedRow) => <StatusBadge status={row.txType} />
    },
    { key: 'createDate', header: 'Create Date', sortable: true },
    { key: 'createUser', header: 'Create User' },
  ];

  const coincidenceColumns = [
    { key: 'customerNo', header: 'Customer No' },
    { key: 'name', header: 'Name' },
    { 
      key: 'matchType', 
      header: 'Match Type',
      render: (row: CoincidenceEntry) => <StatusBadge status={row.matchType} />
    },
    { key: 'originSource', header: 'Origin Source' },
  ];

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">Import Black List (TX1234)</h1>
        <p className="page-description">
          Import customers to the Black List for AML screening
        </p>
      </div>

      {/* Import Form */}
      <div className="bank-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Transaction Import
        </h2>

        <div className="form-row">
          <div>
            <Label className="form-label">Transaction Type</Label>
            <Select value={txType} onValueChange={(v) => setTxType(v as 'INSERT' | 'DELETE')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSERT">INSERT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="form-label">Origin Source</Label>
            <Select value={originSource} onValueChange={handleOriginSourceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {originSourceOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="form-label">List Group</Label>
            <Input value={listGroup} readOnly className="bg-muted" />
          </div>

          <div>
            <Label className="form-label">File Path</Label>
            <Input value={filePath} readOnly placeholder="No file selected" className="bg-muted" />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="relative">
            <input
              type="file"
              accept=".txt,.xlsx,.xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="pointer-events-none">
              <FileText className="w-4 h-4 mr-2" />
              Browse...
            </Button>
          </div>
          <Button 
            onClick={() => {
              if (filePath) {
                toast.info('File already imported. Select a new file to import more.');
              }
            }}
            disabled={!originSource}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>

        {originSource === 'CUSTOMER' && txType === 'INSERT' && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-2">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              When importing from CUSTOMER source with INSERT type, names will be automatically looked up from the customer database.
            </p>
          </div>
        )}
      </div>

      {/* Imported Data Table */}
      <div className="bank-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Imported Data</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              <CheckSquare className="w-4 h-4 mr-2" />
              {selectedRows.size === importedData.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeleteSelected}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Mark Delete
            </Button>
            <Button size="sm" onClick={handleTransactionSend}>
              <Send className="w-4 h-4 mr-2" />
              Transaction Send
            </Button>
          </div>
        </div>

        <DataTable
          data={importedData}
          columns={importedColumns}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          getRowId={(row) => row.id}
          searchable
          searchPlaceholder="Search by customer no or name..."
          searchKeys={['customerNo', 'name', 'txNo']}
          emptyMessage="No data imported. Please select a file to import."
        />
      </div>

      {/* Coincidence Data */}
      {coincidences.length > 0 && (
        <div className="bank-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            Coincidence Data ({coincidences.length} matches found)
          </h2>

          <DataTable
            data={coincidences}
            columns={coincidenceColumns}
            searchable={false}
            pageSize={5}
            getRowId={(row) => row.customerNo}
            emptyMessage="No coincidences found"
          />
        </div>
      )}
    </PageLayout>
  );
};

export default ImportBlackList;
