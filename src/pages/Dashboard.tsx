import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getBlackList, 
  getWhiteList, 
  getTransactions, 
  getCustomers,
  getAuditLog 
} from '@/lib/storage';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  FileCheck, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const blackList = getBlackList();
  const whiteList = getWhiteList();
  const transactions = getTransactions();
  const customers = getCustomers();
  const auditLog = getAuditLog();

  const activeBlackList = blackList.filter(e => e.status === 'Active').length;
  const activeWhiteList = whiteList.filter(e => e.status === 'Active').length;
  const pendingTransactions = transactions.filter(t => t.status === 'PENDING_APPROVAL').length;
  const approvedTransactions = transactions.filter(t => t.status === 'APPROVED').length;
  const rejectedTransactions = transactions.filter(t => t.status === 'REJECTED').length;

  const stats = [
    { 
      label: 'Black List Entries', 
      value: activeBlackList, 
      icon: ShieldAlert, 
      color: 'bg-destructive/10 text-destructive',
      iconBg: 'bg-destructive'
    },
    { 
      label: 'White List Entries', 
      value: activeWhiteList, 
      icon: ShieldCheck, 
      color: 'bg-success/10 text-success',
      iconBg: 'bg-success'
    },
    { 
      label: 'Total Customers', 
      value: customers.length, 
      icon: Users, 
      color: 'bg-primary/10 text-primary',
      iconBg: 'bg-primary'
    },
    { 
      label: 'Pending Approval', 
      value: pendingTransactions, 
      icon: Clock, 
      color: 'bg-warning/10 text-warning',
      iconBg: 'bg-warning'
    },
  ];

  const recentAudit = auditLog.slice(0, 5);

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Welcome back, {user?.username}. Here's an overview of the AML system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bank-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-lg", stat.iconBg)}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Summary */}
        <div className="bank-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            Transaction Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-warning" />
                <span className="font-medium">Pending Approval</span>
              </div>
              <span className="text-2xl font-bold text-warning">{pendingTransactions}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-medium">Approved</span>
              </div>
              <span className="text-2xl font-bold text-success">{approvedTransactions}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="font-medium">Rejected</span>
              </div>
              <span className="text-2xl font-bold text-destructive">{rejectedTransactions}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bank-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentAudit.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              recentAudit.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.user} • {entry.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Role-specific message */}
      {user?.role === 'Approver' && pendingTransactions > 0 && (
        <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-sm">
            <span className="font-medium">Attention:</span> You have {pendingTransactions} transaction(s) pending approval. 
            Please review them in the Transactions section.
          </p>
        </div>
      )}
    </PageLayout>
  );
};

export default Dashboard;
