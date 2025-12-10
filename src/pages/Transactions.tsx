import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getTransactions, 
  updateTransaction, 
  addToBlackList, 
  deleteFromBlackList,
  addAuditLog 
} from '@/lib/storage';
import { Transaction, normalizeSearchName, getCurrentTimestamp } from '@/lib/mockData';
import { FileCheck, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const allTx = getTransactions();
    if (user?.role === 'Maker') {
      // Maker sees only their transactions
      setTransactions(allTx.filter(t => t.createdUser === user.username));
    } else {
      // Approver sees pending transactions
      setTransactions(allTx.filter(t => t.status === 'PENDING_APPROVAL'));
    }
  };

  const handleApprove = (tx: Transaction) => {
    // Apply the transaction
    if (tx.txType === 'INSERT') {
      addToBlackList({
        customerNo: tx.customerNo,
        name: tx.name,
        searchName: normalizeSearchName(tx.name),
        originSource: tx.originSource,
        listGroup: tx.listGroup,
        createdUser: tx.createdUser,
        status: 'Active'
      });
    } else if (tx.txType === 'DELETE') {
      deleteFromBlackList(tx.customerNo);
    }

    // Update transaction status
    updateTransaction(tx.id, {
      status: 'APPROVED',
      approvedDate: getCurrentTimestamp(),
      approvedUser: user?.username
    });

    // Log the action
    addAuditLog({
      action: 'TRANSACTION_APPROVED',
      user: user?.username || 'unknown',
      role: 'Approver',
      txNo: tx.txNo,
      oldValue: 'PENDING_APPROVAL',
      newValue: 'APPROVED',
      details: `Approved ${tx.txType} for ${tx.customerNo}`
    });

    toast.success(`Transaction ${tx.txNo} approved`);
    loadTransactions();
    setSelectedTx(null);
  };

  const handleReject = (tx: Transaction) => {
    updateTransaction(tx.id, {
      status: 'REJECTED',
      approvedDate: getCurrentTimestamp(),
      approvedUser: user?.username
    });

    addAuditLog({
      action: 'TRANSACTION_REJECTED',
      user: user?.username || 'unknown',
      role: 'Approver',
      txNo: tx.txNo,
      oldValue: 'PENDING_APPROVAL',
      newValue: 'REJECTED',
      details: `Rejected ${tx.txType} for ${tx.customerNo}`
    });

    toast.info(`Transaction ${tx.txNo} rejected`);
    loadTransactions();
    setSelectedTx(null);
  };

  const columns = [
    { key: 'txNo', header: 'Tx No', sortable: true },
    { key: 'customerNo', header: 'Customer No', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { 
      key: 'txType', 
      header: 'Tx Type',
      render: (row: Transaction) => <StatusBadge status={row.txType} />
    },
    { key: 'originSource', header: 'Origin Source' },
    { 
      key: 'status', 
      header: 'Status',
      render: (row: Transaction) => <StatusBadge status={row.status} />
    },
    { key: 'createdDate', header: 'Created Date', sortable: true },
    { key: 'createdUser', header: 'Created By' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Transaction) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedTx(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {user?.role === 'Approver' && row.status === 'PENDING_APPROVAL' && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-success hover:bg-success/10"
                onClick={() => handleApprove(row)}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleReject(row)}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <FileCheck className="w-7 h-7 text-primary" />
          Transactions
        </h1>
        <p className="page-description">
          {user?.role === 'Maker' 
            ? 'View your submitted transactions' 
            : 'Review and approve pending transactions'}
        </p>
      </div>

      <div className="bank-card p-6">
        <DataTable
          data={transactions}
          columns={columns}
          searchable
          searchPlaceholder="Search by Tx No, customer no or name..."
          searchKeys={['txNo', 'customerNo', 'name']}
          getRowId={(row) => row.id}
          emptyMessage={user?.role === 'Maker' 
            ? "You haven't submitted any transactions yet" 
            : "No pending transactions for approval"}
        />
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction No</p>
                  <p className="font-medium font-mono">{selectedTx.txNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={selectedTx.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer No</p>
                  <p className="font-medium">{selectedTx.customerNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedTx.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Type</p>
                  <StatusBadge status={selectedTx.txType} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">List Type</p>
                  <p className="font-medium">{selectedTx.listType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Origin Source</p>
                  <p className="font-medium">{selectedTx.originSource}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">List Group</p>
                  <p className="font-medium">{selectedTx.listGroup}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="font-medium">{selectedTx.createdDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">{selectedTx.createdUser}</p>
                </div>
                {selectedTx.approvedDate && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved Date</p>
                      <p className="font-medium">{selectedTx.approvedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved By</p>
                      <p className="font-medium">{selectedTx.approvedUser}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {user?.role === 'Approver' && selectedTx?.status === 'PENDING_APPROVAL' && (
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleReject(selectedTx)}
                className="text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => handleApprove(selectedTx)}>
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Transactions;
