import React, { useState, useEffect } from "react";
import { EyeIcon, EyeOffIcon, LoadingIcon } from "../components/ui/Icons";

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Detect reset token in URL (e.g. /?token=123)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setResetToken(token);
      setShowForgotPassword(true);
    }
  }, []);

  // ✅ Handle normal login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const success = await onLogin(email, password);
    if (!success) {
      setError("Invalid email or password. Please try again.");
    }
    setIsLoading(false);
  };

  // ✅ Handle forgot password request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return setResetMessage("Please enter your email.");

    setIsResetting(true);
    setResetMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();
      setResetMessage(data.message || "Check your email for reset link.");
    } catch {
      setResetMessage("Failed to send reset email. Try again later.");
    }

    setIsResetting(false);
  };

  // ✅ Handle reset password (when token is in URL)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return setResetMessage("Please enter a new password.");

    setIsResetting(true);
    setResetMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      const data = await res.json();
      setResetMessage(data.message || "Password reset successful!");

      if (res.ok) {
        // Optional: clear token and go back to login
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch {
      setResetMessage("Failed to reset password. Try again later.");
    }

    setIsResetting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm p-8 space-y-6 bg-surface rounded-2xl shadow-lg border">
        <img
          src="/logo.png"
          alt="Advance Mortgages & Protection Logo"
          className="h-50 object-contain"
        />

        <div className="text-center">
          <p className="mt-2 text-sm text-text-primary uppercase font-bold tracking-wider">
            {resetToken
              ? "Reset Your Password"
              : showForgotPassword
                ? "Forgot Password"
                : "Sign in to your account"}
          </p>
        </div>

        {/* ================================
            LOGIN FORM
        ================================= */}
        {!showForgotPassword && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 mt-1 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary hover:text-text-primary"
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

            <div className="flex justify-between text-xs text-text-secondary">
              <span></span>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-secondary focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-gray-400"
            >
              {isLoading ? (
                <>
                  {LoadingIcon} Signing In...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        )}

        {/* ================================
            FORGOT PASSWORD FORM
        ================================= */}
        {showForgotPassword && !resetToken && (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <p className="text-sm text-text-secondary">
              Enter your email address and we’ll send you a link to reset your
              password.
            </p>

            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
            />

            {resetMessage && (
              <div className="p-2 text-xs text-text-secondary bg-gray-50 rounded-md border">
                {resetMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isResetting}
              className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-secondary transition-colors disabled:bg-gray-400"
            >
              {isResetting ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-xs text-text-secondary hover:underline mt-2"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* ================================
            RESET PASSWORD FORM (when token present)
        ================================= */}
        {resetToken && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <p className="text-sm text-text-secondary">
              Enter your new password below.
            </p>

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
            />

            {resetMessage && (
              <div className="p-2 text-xs text-text-secondary bg-gray-50 rounded-md border">
                {resetMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isResetting}
              className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-secondary transition-colors disabled:bg-gray-400"
            >
              {isResetting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};



// import React, { useState } from 'react';
// import { EyeIcon, EyeOffIcon, LoadingIcon } from '../components/ui/Icons';

// interface LoginViewProps {
//   onLogin: (email: string, password: string) => Promise<boolean>;
// }

// export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);


//   const [showForgotPassword, setShowForgotPassword] = useState(false);
//   const [resetEmail, setResetEmail] = useState('');
//   const [isResetting, setIsResetting] = useState(false);
//   const [resetMessage, setResetMessage] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);
//     const success = await onLogin(email, password);
//     if (!success) {
//       setError('Invalid email or password. Please try again.');
//     }
//     setIsLoading(false);
//   };


//   return (
//     <div className="flex items-center justify-center min-h-screen bg-background">

//       <div className="w-full max-w-sm p-8 space-y-6 bg-surface rounded-2xl shadow-lg border">

//         <img
//           src="/logo.png"
//           alt="Advance Mortgages & Protection Logo"
//           className="h-50 object-contain"
//         />
//         <div className="text-center">
//           {/* <h2 className="text-2xl font-bold text-text-primary">
//             Advance Mortgages & Protection
//           </h2> */}
//           <p className="mt-2 text-sm text-text-primary uppercase font-bold tracking-wider">
//             Sign in to your account
//           </p>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-text-secondary"
//             >
//               Email address
//             </label>
//             <div className="mt-1">
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 disabled={isLoading}
//                 className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary sm:text-sm transition-colors disabled:bg-gray-200"
//               />
//             </div>
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-text-secondary"
//             >
//               Password
//             </label>
//             <div className="mt-1 relative">
//               <input
//                 id="password"
//                 name="password"
//                 type={isPasswordVisible ? 'text' : 'password'}
//                 autoComplete="current-password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 disabled={isLoading}
//                 className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary sm:text-sm transition-colors disabled:bg-gray-200"
//               />
//               <button
//                 type="button"
//                 onClick={() => setIsPasswordVisible(!isPasswordVisible)}
//                 className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary hover:text-text-primary"
//                 aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
//               >
//                 {isPasswordVisible ? EyeOffIcon : EyeIcon}
//               </button>
//             </div>
//           </div>

//           {error && (
//             <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
//               {error}
//             </div>
//           )}

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-gray-400"
//             >
//               {isLoading ? <>{LoadingIcon} Signing In...</> : 'Sign in'}
//             </button>
//           </div>
//         </form>
//         <div className="text-center text-xs text-text-secondary pt-4 border-t">
//           <p>You can log in with a user from the backend.</p>
//         </div>
//       </div>
//     </div>
//   );
// };
