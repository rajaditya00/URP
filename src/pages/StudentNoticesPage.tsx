import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone, Calendar, Download, Search, Bell, FileText } from 'lucide-react';

const StudentNoticesPage = () => {
    const navigate = useNavigate();
    const [notices, setNotices] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('urp_notices');
        if (stored) setNotices(JSON.parse(stored));

        // Live sync if admin publishes while on this page
        const handleStorage = () => {
            const s = localStorage.getItem('urp_notices');
            if (s) setNotices(JSON.parse(s));
        };
        const interval = setInterval(handleStorage, 2000);
        window.addEventListener('storage', handleStorage);
        return () => { clearInterval(interval); window.removeEventListener('storage', handleStorage); };
    }, []);

    const filtered = notices.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.desc.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f4f6fb] font-body">
            {/* HEADER */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/40 sticky top-0 z-50 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                            <Megaphone size={16} />
                        </div>
                        <span className="font-black text-sm text-slate-900 tracking-tight">Campus Notices</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notices.length} Total</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                {/* HERO BANNER */}
                <div className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white">Official Notice Board</h1>
                                <p className="text-rose-200 text-xs font-semibold uppercase tracking-wider">All Institutional Broadcasts</p>
                            </div>
                        </div>
                        <p className="text-rose-100/80 text-sm leading-relaxed max-w-lg">
                            Important announcements, examination schedules, and administrative circulars are published here by the college administration.
                        </p>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="relative mb-6">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search notices by title or description…"
                        className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all shadow-sm"
                    />
                </div>

                {/* NOTICES LIST */}
                {filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                            <FileText size={36} className="text-slate-300" />
                        </div>
                        <h3 className="font-black text-slate-700 text-lg mb-2">
                            {search ? 'No matching notices found' : 'No notices published yet'}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium">
                            {search ? 'Try a different search term.' : 'Check back later for official announcements.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((n, idx) => (
                            <div
                                key={n.id}
                                className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all ${idx === 0 && !search ? 'border-rose-200 ring-1 ring-rose-200' : 'border-slate-200'}`}
                            >
                                {/* Top row */}
                                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {idx === 0 && !search && (
                                            <span className="px-2.5 py-1 bg-rose-600 text-white text-[8px] font-black uppercase tracking-wider rounded-lg">
                                                Latest
                                            </span>
                                        )}
                                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-rose-100">
                                            {n.type || 'Notice'}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                            <Calendar size={11} /> {n.date}
                                        </span>
                                    </div>

                                    {n.pdfDataUrl && (
                                        <a
                                            href={n.pdfDataUrl}
                                            download={n.pdfName || 'notice.pdf'}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                                        >
                                            <Download size={12} /> Download PDF
                                        </a>
                                    )}
                                </div>

                                {/* Title */}
                                <h2 className="text-base font-black text-slate-900 mb-2 leading-snug">{n.title}</h2>

                                {/* Divider */}
                                <div className="h-px bg-slate-100 mb-3"></div>

                                {/* Description */}
                                <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{n.desc}</p>

                                {/* Footer */}
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">College Administration</span>
                                    {n.pdfDataUrl && (
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-rose-500">
                                            <FileText size={10} /> PDF Attached
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentNoticesPage;
