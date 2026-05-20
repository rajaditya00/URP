import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import { BookOpen, Users, Layers, GraduationCap } from 'lucide-react';
import QuestionBank from '../components/Examination/QuestionBank';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'questionbank'>('overview');
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('urp_user');
        if (!stored) { navigate('/login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'PROFESSOR') { navigate('/login'); return; }
        setUser(u);
    }, [navigate]);

    return (
        <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-sans">
            <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

            {/* SIDEBAR NAVIGATION */}
            <div className="w-64 bg-[#f8fafc] border-r border-slate-200 flex-shrink-0 py-6 flex flex-col overflow-y-auto z-10">
                <div className="px-6 pb-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Main Menu</div>

                {[
                    { id: 'overview', label: 'Dashboard Overview', icon: <BookOpen className="w-4 h-4" /> },
                    { id: 'questionbank', label: 'My Question Bank', icon: <Layers className="w-4 h-4" /> },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full text-left px-6 py-3 text-sm font-bold transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-white text-[#1e3a5f] border-r-4 border-[#1e3a5f] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* HEADER */}
                <header className="bg-[#1e3a5f] text-white sticky top-0 z-40 shadow-md flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div className="px-6 h-16 flex items-center justify-between w-full relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-indigo-300/30">
                                <GraduationCap className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-extrabold text-sm tracking-wide">{user?.name || 'Faculty Portal'}</p>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">{user?.department || 'Department'} Faculty</p>
                            </div>
                        </div>

                        {/* Role Indicator in the Middle */}
                        <div className="hidden lg:flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2 z-10">
                            <span className="text-xs text-white/60 font-semibold tracking-wider uppercase mb-0.5">Your Role</span>
                            <div className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                                <span className="text-sm font-bold text-white tracking-wide">EMS Faculty Administration</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <button onClick={() => setShowChangePassword(true)} className="text-xs text-white/80 hover:text-white font-bold transition-colors">Change Password</button>
                            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-xs px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 font-bold transition-colors">Secure Logout</button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 relative bg-white">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in space-y-6 max-w-4xl">
                            <h2 className="text-2xl font-bold text-text-primary mb-6">Welcome, Professor {user?.name?.split(' ')[0] || ''}</h2>
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                                <h3 className="font-bold text-slate-800 text-lg mb-2">Faculty Management Portal</h3>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-xl mx-auto">
                                    Use the menu on the left to manage your academic responsibilities. You can upload questions to your department's Question Bank, generate papers for your subjects, and monitor your assigned courses.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border border-border-color rounded-xl p-6 bg-white shadow-sm flex items-start gap-4 hover:border-accent-primary transition-colors cursor-pointer" onClick={() => setActiveTab('questionbank')}>
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Layers size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary mb-1">Question Bank</h4>
                                        <p className="text-sm text-text-secondary">Upload new questions, manage existing ones, and generate question papers for your assigned subjects.</p>
                                    </div>
                                </div>
                                <div className="border border-border-color rounded-xl p-6 bg-white shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary mb-1">My Students & Classes</h4>
                                        <p className="text-sm text-text-secondary">View student rosters, attendance, and performance for courses assigned to you. (Coming Soon)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QUESTION BANK TAB */}
                    {activeTab === 'questionbank' && (
                        <div className="animate-fade-in max-w-[1200px] mx-auto">
                            <h2 className="text-2xl font-bold text-text-primary mb-2">Department Question Bank</h2>
                            <p className="text-sm text-text-secondary mb-6">Manage questions and generate papers specifically for your department: {user?.department || 'General'}</p>
                            {/* Role and Department passed to QuestionBank so it can filter/scope data */}
                            <QuestionBank role="PROFESSOR" department={user?.department} collegeId={user?.college?._id} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
