import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { getBlackList } from '@/lib/storage';
import { BlackListEntry } from '@/lib/mockData';
import { ShieldAlert, Download, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const BlackList: React.FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<BlackListEntry | null>(null);
  const blackList = getBlackList();

  const handleExport = () => {
    const csvContent = [
      ['Customer No', 'Name', 'Search Name', 'Origin Source', 'List Group', 'Created Date', 'Created User', 'Status'].join(','),
      ...blackList.map(entry => 
        [entry.customerNo, entry.name, entry.searchName, entry.originSource, entry.listGroup, entry.createdDate, entry.createdUser, entry.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blacklist_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'customerNo', header: 'Customer No', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'originSource', header: 'Origin Source', sortable: true },
    { key: 'listGroup', header: 'List Group', sortable: true },
    { key: 'createdDate', header: 'Created Date', sortable: true },
    { key: 'createdUser', header: 'Created User' },
    { 
      key: 'status', 
      header: 'Status',
      render: (row: BlackListEntry) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: BlackListEntry) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setSelectedEntry(row)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ];

  return (
    <PageLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-destructive" />
            Black List
          </h1>
          <p className="page-description">
            View and manage blacklisted customers for AML compliance
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="bank-card p-6">
        <DataTable
          data={blackList}
          columns={columns}
          searchable
          searchPlaceholder="Search by customer no or name..."
          searchKeys={['customerNo', 'name', 'originSource']}
          getRowId={(row) => row.id}
          emptyMessage="No entries in Black List"
        />
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Black List Entry Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer No</p>
                  <p className="font-medium">{selectedEntry.customerNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedEntry.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Search Name</p>
                  <p className="font-medium font-mono text-xs">{selectedEntry.searchName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Origin Source</p>
                  <p className="font-medium">{selectedEntry.originSource}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">List Group</p>
                  <p className="font-medium">{selectedEntry.listGroup}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={selectedEntry.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="font-medium">{selectedEntry.createdDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created User</p>
                  <p className="font-medium">{selectedEntry.createdUser}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default BlackList;
