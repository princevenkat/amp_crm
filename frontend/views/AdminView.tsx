import React, { useState, useContext } from 'react';
import { DataContext } from '../contexts/DataContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { EyeIcon, EyeOffIcon, LoadingIcon } from '../components/ui/Icons';


const PasswordInput: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isVisible: boolean;
    toggleVisibility: () => void;
}> = ({ label, value, onChange, isVisible, toggleVisibility }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <div className="relative">
            <input
                type={isVisible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                className="w-full bg-surface border border-gray-300 rounded-md p-2 pr-10"
                required
            />
            <button
                type="button"
                onClick={toggleVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary hover:text-text-primary"
                aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
            >
                {isVisible ? EyeOffIcon : EyeIcon}
            </button>
        </div>
    </div>
);

export const AdminView: React.FC = () => {
    const { updateMyPassword } = useContext(DataContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (newPassword !== confirmPassword) {
            setFeedback({ type: 'error', message: "New passwords do not match." });
            return;
        }
        if (newPassword.length < 6) {
            setFeedback({ type: 'error', message: "New password must be at least 6 characters long." });
            return;
        }

        setIsLoading(true);
        const result = await updateMyPassword({ currentPassword, newPassword });
        setIsLoading(false);

        if (result.success) {
            setFeedback({ type: 'success', message: result.message });
            // Reset form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setFeedback({ type: 'error', message: result.message });
        }
    };



    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>
            <Card>
                <CardHeader>My Account</CardHeader>
                <CardContent>
                    <p className="mb-6 text-text-secondary text-sm">Update your account details and password.</p>
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                        <PasswordInput
                            label="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            isVisible={showCurrent}
                            toggleVisibility={() => setShowCurrent(!showCurrent)}
                        />
                        <PasswordInput
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            isVisible={showNew}
                            toggleVisibility={() => setShowNew(!showNew)}
                        />
                        <PasswordInput
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            isVisible={showConfirm}
                            toggleVisibility={() => setShowConfirm(!showConfirm)}
                        />
                        {feedback && (
                            <div className={`p-3 text-sm rounded-md ${feedback.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                                {feedback.message}
                            </div>
                        )}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-gray-400"
                            >
                                {isLoading ? <>{LoadingIcon} Updating...</> : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};