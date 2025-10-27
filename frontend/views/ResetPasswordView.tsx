import React, { useState, useEffect } from "react";

export const ResetPasswordView: React.FC = () => {
    const [newPassword, setNewPassword] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [isResetting, setIsResetting] = useState(false);
    const [token, setToken] = useState("");

    useEffect(() => {
        const tokenParam = new URLSearchParams(window.location.search).get("token");
        if (tokenParam) setToken(tokenParam);
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword) return setResetMessage("Please enter a new password.");

        setIsResetting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();
            setResetMessage(data.message || "Password reset successful!");

            if (res.ok) {
                setTimeout(() => (window.location.href = "/"), 2000);
            }
        } catch {
            setResetMessage("Error resetting password. Please try again later.");
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-sm p-8 bg-surface rounded-2xl shadow-lg border space-y-6">
                <img src="/logo.png" alt="Logo" className="h-50 object-contain mx-auto" />
                <h2 className="text-center text-xl font-bold text-text-primary">Reset Your Password</h2>

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50"
                    />

                    {resetMessage && (
                        <div className="p-2 text-xs text-text-secondary bg-gray-50 border rounded-md">{resetMessage}</div>
                    )}

                    <button
                        type="submit"
                        disabled={isResetting}
                        className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-secondary transition-colors disabled:bg-gray-400"
                    >
                        {isResetting ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};
