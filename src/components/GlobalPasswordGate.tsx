import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface GlobalPasswordGateProps {
  children: React.ReactNode;
}

const GlobalPasswordGate: React.FC<GlobalPasswordGateProps> = ({ children }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const unlocked = localStorage.getItem('ie_global_unlocked') === 'true';
    setIsUnlocked(unlocked);
    setIsLoading(false);
    
    // Focus on username field when overlay is shown
    if (!unlocked && usernameRef.current) {
      setTimeout(() => {
        usernameRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleLogin = () => {
    if (username === 'CCDS' && password === 'image-e') {
      localStorage.setItem('ie_global_unlocked', 'true');
      setIsVisible(false);
      // Fade out animation then unlock
      setTimeout(() => {
        setIsUnlocked(true);
      }, 300);
    } else {
      setError('Invalid credentials');
      setUsername('');
      setPassword('');
      if (usernameRef.current) {
        usernameRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Show loading state briefly to avoid flash
  if (isLoading) {
    return null;
  }

  // If unlocked, render children normally
  if (isUnlocked) {
    return <>{children}</>;
  }

  // Show login overlay
  return (
    <>
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${!isVisible ? 'opacity-0' : 'opacity-100'}`}
           role="dialog"
           aria-modal="true"
           aria-labelledby="login-title">
        <Card className="w-full max-w-sm mx-4 p-6 bg-background shadow-xl rounded-xl sm:max-w-md">
          <div className="space-y-6">
            <div className="text-center">
              <h2 id="login-title" className="text-2xl font-semibold text-foreground">Login required</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  ref={usernameRef}
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>
              
              {error && (
                <div id="login-error" className="text-destructive text-sm text-center" role="alert">
                  {error}
                </div>
              )}
              
              <Button 
                onClick={handleLogin}
                className="w-full"
                size="lg"
              >
                Enter
              </Button>
            </div>
          </div>
        </Card>
      </div>
      {/* Render children but make them non-interactive */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>
    </>
  );
};

export default GlobalPasswordGate;