import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
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
import { getCustomers, addCustomers, addAuditLog } from '@/lib/storage';
import { Customer, generateId, getCurrentTimestamp } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Upload, Download, FileText, Building2, User } from 'lucide-react';
import { toast } from 'sonner';

const CustomerBase: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(getCustomers());
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const filteredCustomers = riskFilter === 'all' 
    ? customers 
    : customers.filter(c => c.riskLevel === riskFilter);

  const handleImportIndividuals = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate import
    const newCustomers: Omit<Customer, 'createdDate'>[] = [
      { customerNo: generateId().slice(0, 14), name: 'NEW INDIVIDUAL ' + Date.now(), type: 'individual', riskLevel: 'low', source: 'IMPORT' },
    ];

    addCustomers(newCustomers);
    setCustomers(getCustomers());

    addAuditLog({
      action: 'IMPORT_INDIVIDUALS',
      user: user?.username || 'unknown',
      role: user?.role || 'Maker',
      details: `Imported ${newCustomers.length} individual customers`
    });

    toast.success('Individuals imported successfully');
  };

  const handleImportOrganizations = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate import
    const newCustomers: Omit<Customer, 'createdDate'>[] = [
      { customerNo: 'BIN' + generateId().slice(0, 10), name: 'NEW ORGANIZATION ' + Date.now(), type: 'organization', riskLevel: 'medium', source: 'IMPORT' },
    ];

    addCustomers(newCustomers);
    setCustomers(getCustomers());

    addAuditLog({
      action: 'IMPORT_ORGANIZATIONS',
      user: user?.username || 'unknown',
      role: user?.role || 'Maker',
      details: `Imported ${newCustomers.length} organizations`
    });

    toast.success('Organizations imported successfully');
  };

  const handleExport = () => {
    const csvContent = [
      ['Customer No/BIN', 'Name', 'Type', 'Risk Level', 'Reason', 'Source', 'Created Date'].join(','),
      ...filteredCustomers.map(c => 
        [c.customerNo, c.name, c.type, c.riskLevel, c.reason || '', c.source || '', c.createdDate].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'customerNo', header: 'Customer No / BIN', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { 
      key: 'type', 
      header: 'Type',
      render: (row: Customer) => (
        <div className="flex items-center gap-2">
          {row.type === 'individual' ? (
            <User className="w-4 h-4 text-primary" />
          ) : (
            <Building2 className="w-4 h-4 text-success" />
          )}
          <span className="capitalize">{row.type}</span>
        </div>
      )
    },
    { 
      key: 'riskLevel', 
      header: 'Risk Level',
      sortable: true,
      render: (row: Customer) => <StatusBadge status={row.riskLevel} />
    },
    { key: 'reason', header: 'Reason', render: (row: Customer) => row.reason || '-' },
    { key: 'source', header: 'Source', render: (row: Customer) => row.source || '-' },
    { key: 'createdDate', header: 'Created Date', sortable: true },
  ];

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          Customer Base (LURS)
        </h1>
        <p className="page-description">
          Manage the customer database for individuals and organizations
        </p>
      </div>

      {/* Import Section */}
      <div className="bank-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Import Customers
        </h2>
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <input
              type="file"
              accept=".txt,.xlsx,.xls,.csv"
              onChange={handleImportIndividuals}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="pointer-events-none">
              <User className="w-4 h-4 mr-2" />
              Import Individuals
            </Button>
          </div>
          <div className="relative">
            <input
              type="file"
              accept=".txt,.xlsx,.xls,.csv"
              onChange={handleImportOrganizations}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="pointer-events-none">
              <Building2 className="w-4 h-4 mr-2" />
              Import Organizations
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bank-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <Label className="form-label">Risk Level Filter</Label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <DataTable
          data={filteredCustomers}
          columns={columns}
          searchable
          searchPlaceholder="Search by customer no or name..."
          searchKeys={['customerNo', 'name']}
          getRowId={(row) => row.customerNo}
          emptyMessage="No customers found"
        />
      </div>
    </PageLayout>
  );
};

export default CustomerBase;
