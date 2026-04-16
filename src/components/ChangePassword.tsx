import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, X, CheckCircle2 } from 'lucide-react';

interface ChangePasswordProps {
    isOpen: boolean;
    onClose: () => void;
    tokenOverride?: string | null;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ isOpen, onClose, tokenOverride }) => {
    const { token: authToken } = useAuth();
    const token = tokenOverride ?? authToken;
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.msg || 'Failed to change password');
                setLoading(false);
                return;
            }

            setSuccess('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => onClose(), 2000);
        } catch (err) {
            setError('Cannot connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-border-color">
                <div className="p-6 text-center border-b border-border-color relative bg-[#f8fafc]">
                    <button onClick={onClose} className="absolute right-4 top-4 p-2 text-text-muted hover:bg-gray-100 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                    <div className="w-12 h-12 bg-accent-primary rounded-xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary tracking-tight">Change Password</h2>
                    <p className="text-sm text-text-secondary mt-1">Update your login credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center font-semibold">{error}</div>}
                    {success && (
                        <div className="p-3 bg-green-100 text-green-700 text-sm rounded-lg text-center font-semibold flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> {success}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-text-muted" size={16} />
                            <input
                                required
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-border-color rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-text-muted" size={16} />
                            <input
                                required
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-border-color rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                placeholder="At least 6 characters"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-text-muted" size={16} />
                            <input
                                required
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-border-color rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                placeholder="Re-enter new password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-2 bg-accent-primary text-white font-bold rounded-lg shadow-sm hover:bg-[#1661a3] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
