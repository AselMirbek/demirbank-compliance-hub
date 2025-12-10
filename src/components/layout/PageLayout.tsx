import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
};
