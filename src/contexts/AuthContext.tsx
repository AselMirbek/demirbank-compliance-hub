import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, setCurrentUser, clearCurrentUser, addAuditLog } from '@/lib/storage';

interface AuthContextType {
  user: { username: string; role: 'Maker' | 'Approver' } | null;
  login: (role: 'Maker' | 'Approver') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ username: string; role: 'Maker' | 'Approver' } | null>(null);

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = (role: 'Maker' | 'Approver') => {
    const username = role === 'Maker' ? 'maker01' : 'approver01';
    setCurrentUser(username, role);
    setUser({ username, role });
    addAuditLog({
      action: 'LOGIN',
      user: username,
      role,
      details: `User logged in as ${role}`
    });
  };

  const logout = () => {
    if (user) {
      addAuditLog({
        action: 'LOGOUT',
        user: user.username,
        role: user.role,
        details: 'User logged out'
      });
    }
    clearCurrentUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
