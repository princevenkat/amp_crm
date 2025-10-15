import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, LoadingIcon } from '../components/ui/Icons';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onLogin(email, password);
    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm p-8 space-y-6 bg-surface rounded-2xl shadow-lg border">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary">
            Advance Mortgages & Protection
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-secondary"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary sm:text-sm transition-colors disabled:bg-gray-200"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-secondary"
            >
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary sm:text-sm transition-colors disabled:bg-gray-200"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary hover:text-text-primary"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                >
                {isPasswordVisible ? EyeOffIcon : EyeIcon}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-gray-400"
            >
              {isLoading ? <>{LoadingIcon} Signing In...</> : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="text-center text-xs text-text-secondary pt-4 border-t">
          <p>You can log in with a user from the backend.</p>
        </div>
      </div>
    </div>
  );
};
