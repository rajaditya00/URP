import BASE_URL from '../config/api';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, X, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

interface ChangePasswordProps {
    isOpen: boolean;
    onClose: () => void;
    tokenOverride?: string | null;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ isOpen, onClose, tokenOverride }) => {
    const { token: authToken, user } = useAuth();
    const token = tokenOverride ?? authToken;
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Show/hide passwords
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    if (!isOpen) return null;

    const role = user?.role;

    // Dynamic role-aware theme mapping
    const theme = {
        bg: 'from-slate-500/10 to-neutral-500/10',
        accent: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10',
        focus: 'focus:border-slate-900 focus:ring-slate-900/5',
        badge: 'bg-slate-100 text-slate-900 border-slate-200',
        text: 'text-slate-900',
        iconBg: 'bg-slate-900',
        glow: 'shadow-slate-900/5'
    };

    if (role === 'COLLEGE') {
        theme.bg = 'from-emerald-500/10 to-teal-500/10';
        theme.accent = 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/15';
        theme.focus = 'focus:border-emerald-500 focus:ring-emerald-500/5';
        theme.badge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
        theme.text = 'text-emerald-700';
        theme.iconBg = 'bg-emerald-600';
        theme.glow = 'shadow-emerald-500/5';
    } else if (role === 'PROFESSOR' || role === 'STAFF') {
        theme.bg = 'from-blue-500/10 to-indigo-500/10';
        theme.accent = 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/15';
        theme.focus = 'focus:border-blue-500 focus:ring-blue-500/5';
        theme.badge = 'bg-blue-50 text-blue-700 border-blue-100';
        theme.text = 'text-blue-700';
        theme.iconBg = 'bg-blue-600';
        theme.glow = 'shadow-blue-500/5';
    } else if (role === 'STUDENT') {
        theme.bg = 'from-purple-500/10 to-fuchsia-500/10';
        theme.accent = 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/15';
        theme.focus = 'focus:border-purple-500 focus:ring-purple-500/5';
        theme.badge = 'bg-purple-50 text-purple-700 border-purple-100';
        theme.text = 'text-purple-700';
        theme.iconBg = 'bg-purple-600';
        theme.glow = 'shadow-purple-500/5';
    } else if (role === 'SYSTEM_ADMIN') {
        theme.bg = 'from-indigo-500/10 to-blue-500/10';
        theme.accent = 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/15';
        theme.focus = 'focus:border-indigo-500 focus:ring-indigo-500/5';
        theme.badge = 'bg-indigo-50 text-indigo-700 border-indigo-100';
        theme.text = 'text-indigo-700';
        theme.iconBg = 'bg-indigo-600';
        theme.glow = 'shadow-indigo-500/5';
    }

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
            const res = await fetch(BASE_URL + '/api/auth/change-password', {
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
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-slide-up border-[1px] border-slate-200/80 relative">
                {/* Decorative background glow matching role theme */}
                <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br ${theme.bg} blur-2xl opacity-60`} />
                <div className={`absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-gradient-to-tr ${theme.bg} blur-2xl opacity-60`} />

                <div className="p-6 text-center border-b-[1px] border-slate-100 relative bg-slate-50/50 backdrop-blur-md">
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="absolute right-4 top-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-all"
                    >
                        <X size={16} />
                    </button>
                    <div className={`w-12 h-12 ${theme.iconBg} rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-md ${theme.glow}`}>
                        <Lock className="text-white" size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Change Password</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1">Update your secure login credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 relative z-10">
                    {error && (
                        <div className="p-3 bg-red-50 border-[1px] border-red-100 text-red-700 text-xs font-bold rounded-xl text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-50 border-[1px] border-green-100 text-green-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
                            <CheckCircle2 size={14} /> {success}
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Current Password</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Lock size={15} />
                            </span>
                            <input
                                required
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className={`w-full pl-10 pr-10 py-2.5 border-[1px] border-slate-200 rounded-xl text-xs bg-white outline-none transition-all focus:bg-white focus:ring-4 ${theme.focus}`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
                            >
                                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Lock size={15} />
                            </span>
                            <input
                                required
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className={`w-full pl-10 pr-10 py-2.5 border-[1px] border-slate-200 rounded-xl text-xs bg-white outline-none transition-all focus:bg-white focus:ring-4 ${theme.focus}`}
                                placeholder="At least 6 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
                            >
                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Lock size={15} />
                            </span>
                            <input
                                required
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className={`w-full pl-10 pr-10 py-2.5 border-[1px] border-slate-200 rounded-xl text-xs bg-white outline-none transition-all focus:bg-white focus:ring-4 ${theme.focus}`}
                                placeholder="Re-enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
                            >
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 mt-4 ${theme.accent} font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Updating Password...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
