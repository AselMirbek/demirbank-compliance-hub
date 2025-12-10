// Mock Databases for Banking AML System

export interface Customer {
  customerNo: string;
  name: string;
  type: 'individual' | 'organization';
  riskLevel: 'low' | 'medium' | 'high';
  reason?: string;
  source?: string;
  createdDate: string;
}

export interface BlackListEntry {
  id: string;
  customerNo: string;
  name: string;
  searchName: string;
  originSource: string;
  listGroup: string;
  createdDate: string;
  createdUser: string;
  status: 'Active' | 'Deleted';
}

export interface WhiteListEntry {
  id: string;
  customerNo: string;
  name: string;
  searchName: string;
  originSource: string;
  listGroup: string;
  createdDate: string;
  createdUser: string;
  status: 'Active' | 'Deleted';
}

export interface Transaction {
  id: string;
  txNo: string;
  customerNo: string;
  name: string;
  txType: 'INSERT' | 'DELETE' | 'SEARCH';
  originSource: string;
  listGroup: string;
  status: 'NEW' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdDate: string;
  createdUser: string;
  approvedDate?: string;
  approvedUser?: string;
  listType: 'BLACK' | 'WHITE';
}

export interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  role: 'Maker' | 'Approver';
  timestamp: string;
  txNo?: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
}

export interface ImportedRow {
  id: string;
  txNo: string;
  customerNo: string;
  name: string;
  txType: 'INSERT' | 'DELETE' | 'SEARCH';
  createDate: string;
  createUser: string;
  selected: boolean;
  originSource: string;
  listGroup: string;
}

export interface CoincidenceEntry {
  customerNo: string;
  name: string;
  matchType: 'Exact' | 'Partial';
  originSource: string;
}

// Initial Mock Customers Database
export const initialMockCustomers: Customer[] = [
  { customerNo: "12345678901234", name: "IVANOV IVAN PETROVICH", type: "individual", riskLevel: "low", source: "BANK", createdDate: "2024-01-15" },
  { customerNo: "23456789012345", name: "PETROV PETR IVANOVICH", type: "individual", riskLevel: "medium", source: "BANK", createdDate: "2024-02-20" },
  { customerNo: "34567890123456", name: "SIDOROV SIDR SIDOROVICH", type: "individual", riskLevel: "low", source: "BANK", createdDate: "2024-03-10" },
  { customerNo: "45678901234567", name: "KOZLOV KOZMA KOZIMOVICH", type: "individual", riskLevel: "high", reason: "PEP", source: "FIU", createdDate: "2024-04-05" },
  { customerNo: "56789012345678", name: "SMIRNOV SMIRNOV SMIRNOVOVICH", type: "individual", riskLevel: "low", source: "BANK", createdDate: "2024-05-12" },
  { customerNo: "67890123456789", name: "KUZNETSOV KUZMA KUZMICH", type: "individual", riskLevel: "medium", source: "BANK", createdDate: "2024-06-18" },
  { customerNo: "78901234567890", name: "POPOV POPOV POPOVICH", type: "individual", riskLevel: "low", source: "BANK", createdDate: "2024-07-22" },
  { customerNo: "89012345678901", name: "VASILEV VASIL VASILIEVICH", type: "individual", riskLevel: "high", reason: "Sanctions", source: "NBKR", createdDate: "2024-08-30" },
  { customerNo: "90123456789012", name: "FEDOROV FEDOR FEDOROVICH", type: "individual", riskLevel: "low", source: "BANK", createdDate: "2024-09-14" },
  { customerNo: "01234567890123", name: "MIKHAILOV MIKHAIL MIKHAILOVICH", type: "individual", riskLevel: "medium", source: "BANK", createdDate: "2024-10-25" },
  { customerNo: "BIN1234567890", name: "OOO ALPHA COMPANY", type: "organization", riskLevel: "low", source: "BANK", createdDate: "2024-01-20" },
  { customerNo: "BIN2345678901", name: "ZAO BETA HOLDINGS", type: "organization", riskLevel: "medium", source: "BANK", createdDate: "2024-02-15" },
  { customerNo: "BIN3456789012", name: "TOO GAMMA TRADE", type: "organization", riskLevel: "high", reason: "Shell Company", source: "FIU", createdDate: "2024-03-28" },
];

// Initial Black List
export const initialMockBlackList: BlackListEntry[] = [
  {
    id: "BL001",
    customerNo: "99999999999999",
    name: "CRIMINAL IVAN IVANOVICH",
    searchName: "CRIMINALIVANIVANOVICH",
    originSource: "FIU",
    listGroup: "SANCTIONS",
    createdDate: "2024-01-10",
    createdUser: "system",
    status: "Active"
  },
  {
    id: "BL002",
    customerNo: "88888888888888",
    name: "TERRORIST AHMED ALI",
    searchName: "TERRORISTAHMEDALI",
    originSource: "NBKR",
    listGroup: "TERRORISM",
    createdDate: "2024-02-15",
    createdUser: "system",
    status: "Active"
  },
  {
    id: "BL003",
    customerNo: "77777777777777",
    name: "FRAUD FEDOR FEDOROVICH",
    searchName: "FRAUDFEDORFEDOROVICH",
    originSource: "COURT",
    listGroup: "FRAUD",
    createdDate: "2024-03-20",
    createdUser: "maker01",
    status: "Active"
  },
];

// Initial White List
export const initialMockWhiteList: WhiteListEntry[] = [
  {
    id: "WL001",
    customerNo: "11111111111111",
    name: "VIP CLIENT PREMIUM",
    searchName: "VIPCLIENTPREMIUM",
    originSource: "MANUAL",
    listGroup: "VIP",
    createdDate: "2024-01-05",
    createdUser: "approver01",
    status: "Active"
  },
];

// Initial Transactions
export const initialMockTransactions: Transaction[] = [];

// Initial Audit Log
export const initialMockAuditLog: AuditLogEntry[] = [
  {
    id: "AL001",
    action: "SYSTEM_INIT",
    user: "system",
    role: "Maker",
    timestamp: "2024-01-01 00:00:00",
    details: "System initialized with default data"
  }
];

// Helper functions
export const generateTxNo = (): string => {
  const prefix = "TX1234";
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${randomNum}`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const normalizeSearchName = (name: string): string => {
  return name.toUpperCase().replace(/\s+/g, '').replace(/[^A-ZА-ЯЁ]/gi, '');
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

// List Group mappings based on Origin Source
export const getListGroup = (originSource: string): string => {
  const mapping: Record<string, string> = {
    'CUSTOMER': 'INTERNAL',
    'FIU': 'SANCTIONS',
    'NBKR': 'REGULATORY',
    'COURT': 'LEGAL',
    'COMPANY': 'CORPORATE',
    'MANUAL': 'MANUAL_ENTRY'
  };
  return mapping[originSource] || 'OTHER';
};

// Origin Source options
export const originSourceOptions = [
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'FIU', label: 'FIU (Financial Intelligence Unit)' },
  { value: 'NBKR', label: 'NBKR (National Bank)' },
  { value: 'COURT', label: 'Court Decision' },
  { value: 'COMPANY', label: 'Company' },
  { value: 'MANUAL', label: 'Manual Entry' },
];
