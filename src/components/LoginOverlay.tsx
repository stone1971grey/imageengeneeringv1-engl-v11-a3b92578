import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface LoginOverlayProps {
  onSuccess: () => void;
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on username field when component mounts
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  const handleLogin = () => {
    if (username === 'CCDS' && password === 'image-e') {
      localStorage.setItem('ie_startpage_unlocked', 'true');
      setIsVisible(false);
      // Fade out animation then call success
      setTimeout(() => {
        onSuccess();
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

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${!isVisible ? 'opacity-0' : 'opacity-100'}`}>
      <Card className="w-full max-w-sm mx-4 p-6 bg-background shadow-lg rounded-xl sm:max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground">Login required</h2>
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
              />
            </div>
            
            {error && (
              <div className="text-destructive text-sm text-center">
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
  );
};

export default LoginOverlay;