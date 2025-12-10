import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { getAuditLog } from '@/lib/storage';
import { AuditLogEntry } from '@/lib/mockData';
import { ClipboardList, Download } from 'lucide-react';

const AuditLog: React.FC = () => {
  const auditLog = getAuditLog();

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'User', 'Role', 'Tx No', 'Old Value', 'New Value', 'Details'].join(','),
      ...auditLog.map(entry => 
        [
          entry.timestamp, 
          entry.action, 
          entry.user, 
          entry.role, 
          entry.txNo || '', 
          entry.oldValue || '', 
          entry.newValue || '', 
          entry.details || ''
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'timestamp', header: 'Timestamp', sortable: true },
    { key: 'action', header: 'Action', sortable: true },
    { key: 'user', header: 'User', sortable: true },
    { 
      key: 'role', 
      header: 'Role',
      render: (row: AuditLogEntry) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          row.role === 'Approver' 
            ? 'bg-success/10 text-success' 
            : 'bg-primary/10 text-primary'
        }`}>
          {row.role}
        </span>
      )
    },
    { key: 'txNo', header: 'Tx No', render: (row: AuditLogEntry) => row.txNo || '-' },
    { key: 'oldValue', header: 'Old Value', render: (row: AuditLogEntry) => row.oldValue || '-' },
    { key: 'newValue', header: 'New Value', render: (row: AuditLogEntry) => row.newValue || '-' },
    { 
      key: 'details', 
      header: 'Details', 
      render: (row: AuditLogEntry) => (
        <span className="max-w-xs truncate block" title={row.details}>
          {row.details || '-'}
        </span>
      )
    },
  ];

  return (
    <PageLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary" />
            Audit Log
          </h1>
          <p className="page-description">
            Complete audit trail of all system actions
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="bank-card p-6">
        <DataTable
          data={auditLog}
          columns={columns}
          searchable
          searchPlaceholder="Search by action, user, or Tx No..."
          searchKeys={['action', 'user', 'txNo', 'details']}
          getRowId={(row) => row.id}
          pageSize={15}
          emptyMessage="No audit log entries"
        />
      </div>
    </PageLayout>
  );
};

export default AuditLog;
