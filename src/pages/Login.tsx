import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCog, ShieldCheck } from 'lucide-react';
import { initializeStorage } from '@/lib/storage';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    initializeStorage();
  }, []);

  const handleLogin = (role: 'Maker' | 'Approver') => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-sidebar to-primary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4 shadow-lg">
            <span className="text-primary-foreground font-bold text-3xl">DB</span>
          </div>
          <h1 className="text-3xl font-bold text-sidebar-foreground">DemirBank</h1>
          <p className="text-sidebar-foreground/60 mt-2">AML Compliance System</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-bank-lg p-8 border border-border">
          <h2 className="text-xl font-semibold text-center text-foreground mb-6">
            Select Your Role
          </h2>
          
          <div className="space-y-4">
            <Button
              onClick={() => handleLogin('Maker')}
              className="w-full h-20 text-lg font-medium bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserCog className="w-6 h-6 mr-3" />
              Login as Maker
            </Button>
            
            <Button
              onClick={() => handleLogin('Approver')}
              variant="outline"
              className="w-full h-20 text-lg font-medium border-2 border-success text-success hover:bg-success hover:text-success-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="w-6 h-6 mr-3" />
              Login as Approver
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Choose your role to access the compliance system
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sidebar-foreground/40 text-xs mt-8">
          © 2024 DemirBank AML System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
