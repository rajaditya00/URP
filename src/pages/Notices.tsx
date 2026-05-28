import BASE_URL from '../config/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Bell, Megaphone, Calendar, FileDown, ArrowRight, ArrowLeft, Search, Sparkles } from 'lucide-react';

const SEED_NOTICES = [
  { id: 1, title: 'Revised Academic Calendar 2026-27', dept: 'Registrar Office', date: 'Oct 12, 2026', type: 'Important', desc: 'The revised academic timeline has been released by the Office of the Registrar. All department heads are requested to align their mid-semester and end-semester schedules accordingly.' },
  { id: 2, title: 'Call for Proposals: Annual Tech Fest', dept: 'Student Council', date: 'Oct 10, 2026', type: 'General', desc: 'URP is inviting comprehensive proposals from engineering students and clubs for organizing events at the upcoming Annual Tech Fest. Outstanding ideas will receive university seed funding.' },
  { id: 3, title: 'Maintenance Shutdown of University ERP', dept: 'IT Services', date: 'Oct 08, 2026', type: 'Alert', desc: 'The URP Portal will undergo scheduled system upgrades and server database indexing on October 14th from 02:00 AM to 06:00 AM. Access will be temporarily unavailable.' },
  { id: 4, title: 'Last Date for Semester Fee Payment', dept: 'Accounts', date: 'Oct 05, 2026', type: 'Important', desc: 'This is a gentle reminder that the absolute deadline for Semester VI academic fee payment without a late fine is October 20th, 2026. Please ensure all dues are cleared.' },
  { id: 5, title: 'Faculty Development Program on Generative AI', dept: 'Research Wing', date: 'Oct 01, 2026', type: 'General', desc: 'A hands-on, 5-day workshop on Generative AI integrations in engineering curriculum will be hosted at the Main Seminar Complex starting next Monday.' },
  { id: 6, title: 'Hostel Outing Timings Revised', dept: 'Warden Office', date: 'Sep 28, 2026', type: 'Important', desc: 'Hostel entry gates will close strictly at 09:30 PM starting from October 1st. Inmates are requested to adhere strictly to the revised standard code of conduct.' },
  { id: 7, title: 'Library Book Returns Deadline Extended', dept: 'Library Administration', date: 'Sep 25, 2026', type: 'General', desc: 'Library book return window has been extended by one additional week. Overdue penalties accrued during the mid-term week will be fully waived off.' },
  { id: 8, title: 'Inter-College Sports Registration Open', dept: 'Sports Council', date: 'Sep 22, 2026', type: 'General', desc: 'Registrations are officially open for cricket, football, basketball, and track events. Interested university teams should submit rosters to the sports desk.' },
  { id: 9, title: 'Placement Drive: Tata Consultancy Services', dept: 'Placement Cell', date: 'Sep 18, 2026', type: 'Alert', desc: 'A major placement and recruitment drive for graduating B.Tech students will commence on October 2nd. Mandatory resume uploads must be completed before September 28th.' },
  { id: 10, title: 'Postgraduate Scholarship Applications', dept: 'Financial Aid', date: 'Sep 15, 2026', type: 'General', desc: 'UGC-sponsored fellowships and post-graduate financial aid applications are now open. Eligible students must submit certified marks sheets online.' }
];

const Notices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(4); // Default to 4 to fill above the fold beautifully

  const handleBack = () => {
    const role = user?.role;
    if (role === 'SUPER_ADMIN') {
      navigate('/uni-admin/dashboard');
    } else if (role === 'COLLEGE') {
      navigate('/college-admin/dashboard');
    } else if (role === 'PROFESSOR') {
      navigate('/faculty-dashboard');
    } else if (role === 'STUDENT') {
      navigate('/student-portal');
    } else {
      navigate('/');
    }
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotices = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('urp_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(BASE_URL + '/api/notice', { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.map((n: any, idx: number) => ({
              id: n._id || idx + 100,
              title: n.title,
              dept: n.dept || 'University Administration',
              date: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today',
              type: n.type || 'Important',
              desc: n.description || n.desc || '',
              pdfUrl: n.pdfUrl
            }));
            setNotices([...mapped, ...SEED_NOTICES]);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to fetch from backend notice registry, using fallback', e);
      }

      // Fallback to local storage if API is offline
      const stored = localStorage.getItem('urp_notices');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const mapped = parsed.map((n: any, idx: number) => ({
            id: n._id || idx + 100,
            title: n.title,
            dept: n.dept || 'University Administration',
            date: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today',
            type: n.type || 'Important',
            desc: n.description || n.desc || ''
          }));
          setNotices([...mapped, ...SEED_NOTICES]);
        } catch {
          setNotices(SEED_NOTICES);
        }
      } else {
        setNotices(SEED_NOTICES);
      }
      setLoading(false);
    };
    
    loadNotices();
    const interval = setInterval(loadNotices, 4000);
    window.addEventListener('storage', loadNotices);
    window.addEventListener('storage_local', loadNotices);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadNotices);
      window.removeEventListener('storage_local', loadNotices);
    };
  }, []);

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.dept.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    return n.type === activeFilter && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in font-body pb-10">
      {/* HEADER SECTION WITH FULL WIDTH GLASS BAR */}
      <div className="w-full bg-[#1e3a5f]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white shadow-[0_12px_40px_rgba(30,58,95,0.12)] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -z-10"></div>
        <div>
          <button 
            onClick={handleBack}
            className="mb-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-[10px] font-black uppercase tracking-widest text-sky-200 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft size={12} /> Return to Dashboard
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest text-sky-300 inline-flex items-center gap-1.5">
              <Sparkles size={10} className="animate-pulse" /> Official University Bulletin
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Notice Board & Circulars</h1>
          <p className="text-sm text-sky-200/80 max-w-xl">Centralized, real-time broadcast registry for academic guidelines, schedules, and important announcements.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/60" />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search announcements..." 
              className="w-full h-10 pl-10 pr-4 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder:text-sky-200/50 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all font-semibold"
            />
          </div>
        </div>
      </div>

      {/* FILTER CONTROL CARD */}
      <div className="w-full bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {['All', 'Important', 'Alert', 'General'].map(filter => (
            <button 
              key={filter} 
              onClick={() => { setActiveFilter(filter); setVisibleCount(4); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                activeFilter === filter 
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
              }`}
            >
              {filter} Notices
            </button>
          ))}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Showing {Math.min(filteredNotices.length, visibleCount)} of {filteredNotices.length} Announcements
        </span>
      </div>

      {/* NOTICES LIST (UTILIZING FULL HEIGHT & WIDTH WITH GLASS CARDS) */}
      {filteredNotices.length === 0 ? (
        <Card className="text-center py-20 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/50">
          <div className="text-4xl mb-4">📢</div>
          <h3 className="font-bold text-slate-700 text-lg mb-1">No announcements found</h3>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Try refining your filter or search query</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {filteredNotices.slice(0, visibleCount).map((notice) => (
            <div 
              key={notice.id} 
              className="glass-card-premium p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Meta Row */}
                <div className="flex items-center justify-between gap-3">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                    notice.type === 'Important' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    notice.type === 'Alert' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                    'bg-sky-50 border-sky-200 text-sky-700'
                  }`}>
                    {notice.type}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <Calendar size={11} /> {notice.date}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-base font-black text-[#1e3a5f] leading-snug mb-2">{notice.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">{notice.desc}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
                {notice.pdfUrl ? (
                  <a 
                    href={`${BASE_URL}/${notice.pdfUrl.replace(/^\/+/, '')}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-850 uppercase tracking-widest flex items-center gap-0.5 hover:underline"
                  >
                    View PDF <ArrowRight size={11} />
                  </a>
                ) : (
                  <span className="text-[9px] text-slate-350 font-bold uppercase tracking-wider">No Attachment</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHOW MORE OPTION */}
      {filteredNotices.length > visibleCount && (
        <button 
          onClick={() => setVisibleCount(prev => prev + 4)}
          className="w-full py-4 bg-white/70 backdrop-blur-md border border-slate-200/50 hover:border-slate-350 hover:bg-white rounded-3xl text-xs font-black text-[#1e3a5f] hover:text-indigo-800 uppercase tracking-widest transition-all cursor-pointer text-center shadow-sm"
        >
          Load Older Announcements (+{filteredNotices.length - visibleCount} more circulars)
        </button>
      )}
    </div>
  );
};

export default Notices;