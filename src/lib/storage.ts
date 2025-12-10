import {
  Customer,
  BlackListEntry,
  WhiteListEntry,
  Transaction,
  AuditLogEntry,
  initialMockCustomers,
  initialMockBlackList,
  initialMockWhiteList,
  initialMockTransactions,
  initialMockAuditLog,
  generateId,
  getCurrentTimestamp
} from './mockData';

const STORAGE_KEYS = {
  CUSTOMERS: 'aml_customers',
  BLACK_LIST: 'aml_black_list',
  WHITE_LIST: 'aml_white_list',
  TRANSACTIONS: 'aml_transactions',
  AUDIT_LOG: 'aml_audit_log',
  CURRENT_USER: 'aml_current_user',
  USER_ROLE: 'aml_user_role',
};

// Initialize storage with default data if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialMockCustomers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BLACK_LIST)) {
    localStorage.setItem(STORAGE_KEYS.BLACK_LIST, JSON.stringify(initialMockBlackList));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WHITE_LIST)) {
    localStorage.setItem(STORAGE_KEYS.WHITE_LIST, JSON.stringify(initialMockWhiteList));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialMockTransactions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOG)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(initialMockAuditLog));
  }
};

// Customer operations
export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  return data ? JSON.parse(data) : [];
};

export const getCustomerByNo = (customerNo: string): Customer | undefined => {
  const customers = getCustomers();
  return customers.find(c => c.customerNo === customerNo);
};

export const addCustomer = (customer: Omit<Customer, 'createdDate'>): Customer => {
  const customers = getCustomers();
  const newCustomer = { ...customer, createdDate: getCurrentTimestamp() };
  customers.push(newCustomer);
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  return newCustomer;
};

export const addCustomers = (newCustomers: Omit<Customer, 'createdDate'>[]): Customer[] => {
  const customers = getCustomers();
  const addedCustomers = newCustomers.map(c => ({ ...c, createdDate: getCurrentTimestamp() }));
  customers.push(...addedCustomers);
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  return addedCustomers;
};

// Black List operations
export const getBlackList = (): BlackListEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BLACK_LIST);
  return data ? JSON.parse(data) : [];
};

export const addToBlackList = (entry: Omit<BlackListEntry, 'id' | 'createdDate'>): BlackListEntry => {
  const list = getBlackList();
  const newEntry = { ...entry, id: generateId(), createdDate: getCurrentTimestamp() };
  list.push(newEntry);
  localStorage.setItem(STORAGE_KEYS.BLACK_LIST, JSON.stringify(list));
  return newEntry;
};

export const updateBlackListEntry = (id: string, updates: Partial<BlackListEntry>) => {
  const list = getBlackList();
  const index = list.findIndex(e => e.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.BLACK_LIST, JSON.stringify(list));
  }
};

export const deleteFromBlackList = (customerNo: string) => {
  const list = getBlackList();
  const index = list.findIndex(e => e.customerNo === customerNo && e.status === 'Active');
  if (index !== -1) {
    list[index].status = 'Deleted';
    localStorage.setItem(STORAGE_KEYS.BLACK_LIST, JSON.stringify(list));
  }
};

// White List operations
export const getWhiteList = (): WhiteListEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.WHITE_LIST);
  return data ? JSON.parse(data) : [];
};

export const addToWhiteList = (entry: Omit<WhiteListEntry, 'id' | 'createdDate'>): WhiteListEntry => {
  const list = getWhiteList();
  const newEntry = { ...entry, id: generateId(), createdDate: getCurrentTimestamp() };
  list.push(newEntry);
  localStorage.setItem(STORAGE_KEYS.WHITE_LIST, JSON.stringify(list));
  return newEntry;
};

export const deleteFromWhiteList = (customerNo: string) => {
  const list = getWhiteList();
  const index = list.findIndex(e => e.customerNo === customerNo && e.status === 'Active');
  if (index !== -1) {
    list[index].status = 'Deleted';
    localStorage.setItem(STORAGE_KEYS.WHITE_LIST, JSON.stringify(list));
  }
};

// Transaction operations
export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdDate'>): Transaction => {
  const transactions = getTransactions();
  const newTransaction = { ...transaction, id: generateId(), createdDate: getCurrentTimestamp() };
  transactions.push(newTransaction);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  return newTransaction;
};

export const updateTransaction = (id: string, updates: Partial<Transaction>) => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }
};

// Audit Log operations
export const getAuditLog = (): AuditLogEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
  return data ? JSON.parse(data) : [];
};

export const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry => {
  const log = getAuditLog();
  const newEntry = { ...entry, id: generateId(), timestamp: getCurrentTimestamp() };
  log.unshift(newEntry);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(log));
  return newEntry;
};

// User session operations
export const setCurrentUser = (username: string, role: 'Maker' | 'Approver') => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
};

export const getCurrentUser = (): { username: string; role: 'Maker' | 'Approver' } | null => {
  const username = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  const role = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as 'Maker' | 'Approver';
  if (username && role) {
    return { username, role };
  }
  return null;
};

export const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
};

// Find coincidences in Black List
export const findCoincidences = (customerNo: string, name: string): { customerNo: string; name: string; matchType: 'Exact' | 'Partial'; originSource: string }[] => {
  const blackList = getBlackList().filter(e => e.status === 'Active');
  const coincidences: { customerNo: string; name: string; matchType: 'Exact' | 'Partial'; originSource: string }[] = [];
  
  const normalizedName = name.toUpperCase().replace(/\s+/g, '');
  
  blackList.forEach(entry => {
    // Exact match by customer number
    if (entry.customerNo === customerNo) {
      coincidences.push({
        customerNo: entry.customerNo,
        name: entry.name,
        matchType: 'Exact',
        originSource: entry.originSource
      });
    }
    // Partial match by name (Levenshtein-like simple check)
    else if (entry.searchName === normalizedName) {
      coincidences.push({
        customerNo: entry.customerNo,
        name: entry.name,
        matchType: 'Exact',
        originSource: entry.originSource
      });
    }
    else if (entry.searchName.includes(normalizedName) || normalizedName.includes(entry.searchName)) {
      coincidences.push({
        customerNo: entry.customerNo,
        name: entry.name,
        matchType: 'Partial',
        originSource: entry.originSource
      });
    }
  });
  
  return coincidences;
};

// Reset all data
export const resetAllData = () => {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialMockCustomers));
  localStorage.setItem(STORAGE_KEYS.BLACK_LIST, JSON.stringify(initialMockBlackList));
  localStorage.setItem(STORAGE_KEYS.WHITE_LIST, JSON.stringify(initialMockWhiteList));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialMockTransactions));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(initialMockAuditLog));
};
