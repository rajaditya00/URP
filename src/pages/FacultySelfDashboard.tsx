import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import { 
    GraduationCap, BookOpen, Clock, FileText, Download, 
    ShieldCheck, Mail, MapPin, User, Calendar, Phone, IdCard, Layers
} from 'lucide-react';
import QuestionBank from '../components/Examination/QuestionBank';

const FacultySelfDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'questionbank'>('profile');
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('urp_user');
        if (!stored) { navigate('/login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'PROFESSOR' && u.role !== 'STAFF') { navigate('/login'); return; }
        setUser(u);
    }, [navigate]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-body pb-12">
            <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

            {/* HEADER */}
            <header className="bg-[#1e3a5f] text-white sticky top-0 z-40 shadow-md flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between w-full relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-indigo-300/30">
                            <GraduationCap className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-extrabold text-sm tracking-wide">{user.university?.name || 'Faculty Management Portal'}</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">{user.college?.name}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-5">
                        <button onClick={() => setShowChangePassword(true)} className="text-xs text-white/80 hover:text-white font-bold transition-colors">Change Password</button>
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-xs px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 font-bold transition-colors">Secure Logout</button>
                    </div>
                </div>
            </header>

            {/* HORIZONTAL NAVIGATION */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'profile', label: 'My Official Profile', icon: <User className="w-4 h-4" /> },
                            { id: 'questionbank', label: 'Question Bank', icon: <Layers className="w-4 h-4" /> },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                
                <div className="space-y-8">
                    {activeTab === 'profile' ? (
                        <div className="animate-fade-in space-y-8">
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200">
                                <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a77] p-8 text-white relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <GraduationCap size={120} />
                                    </div>
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl font-black text-white shadow-2xl">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-black tracking-tight mb-1">{user.name}</h1>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">{user.role} Record</span>
                                                <span className="px-3 py-1 bg-blue-400/20 backdrop-blur-md text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-400/20">{user.position || 'Professional'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <section className="space-y-6">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Layers size={14} /> Professional Record
                                            </h3>
                                            <div className="space-y-4">
                                                <DetailRow label="Department" value={user.department} />
                                                <DetailRow label="Designation" value={user.position} highlight />
                                                <DetailRow label="Special Role" value={user.specialRole} />
                                                <DetailRow label="Employee Status" value={user.status || 'Active'} />
                                                <DetailRow label="System ID" value={user.id.slice(-8).toUpperCase()} />
                                            </div>
                                        </section>

                                        <section className="space-y-6">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <User size={14} /> Personal Information
                                            </h3>
                                            <div className="space-y-4">
                                                <DetailRow icon={<Mail size={12} />} label="Official Email" value={user.email} />
                                                <DetailRow icon={<Phone size={12} />} label="Mobile Number" value={user.mobile} />
                                                <DetailRow icon={<Calendar size={12} />} label="Date of Birth" value={user.dob} />
                                                <DetailRow icon={<IdCard size={12} />} label="Aadhar No" value={user.aadharNo} />
                                                <DetailRow icon={<MapPin size={12} />} label="Residential Address" value={user.address} />
                                            </div>
                                        </section>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-8">
                                    <span>Joined on: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
                                    <span>EMS Security Level: Verified</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Question Bank Management</h2>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Scope: {user.department} Department</p>
                            </div>
                            <div className="border-t border-slate-100 pt-6">
                <QuestionBank role="PROFESSOR" department={user.department} collegeId={user.college?._id} facultyName={user.name} facultyProfileUrl={`/college-admin/faculty/${user.id}`} />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const DetailRow = ({ label, value, highlight, icon }: any) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">{icon} {label}</span>
        <span className={`text-sm font-bold ${highlight ? 'text-[#1e3a5f]' : 'text-slate-700'}`}>{value || '—'}</span>
    </div>
);

export default FacultySelfDashboard;
