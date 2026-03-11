import { Card } from '../components/UI/Card';
import { Bell, Megaphone, Calendar, FileDown } from 'lucide-react';

const notices = [
  { id: 1, title: 'Revised Academic Calendar 2026-27', dept: 'Registrar Office', date: 'Oct 12, 2026', type: 'Important' },
  { id: 2, title: 'Call for Proposals: Annual Tech Fest', dept: 'Student Council', date: 'Oct 10, 2026', type: 'General' },
  { id: 3, title: 'Maintenance Shutdown of University ERP', dept: 'IT Services', date: 'Oct 08, 2026', type: 'Alert' },
  { id: 4, title: 'Last Date for Semester Fee Payment', dept: 'Accounts', date: 'Oct 05, 2026', type: 'Important' },
];

const Notices = () => {
  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl tracking-tight mb-2 text-gradient">Notice Board & Announcements</h1>
          <p className="text-lg text-text-secondary">Centralized broadcast center for university-wide communications.</p>
        </div>
        <button className="primary-btn flex-center gap-2 shrink-0">
          <Megaphone size={18} /> New Announcement
        </button>
      </div>

      <Card className="!p-0 overflow-hidden" glow>
        <div className="p-6 lg:px-8 border-b border-border-color flex-between flex-wrap gap-4">
          <div className="flex gap-6">
            <button className="text-text-primary text-[0.95rem] font-semibold pb-2 border-b-2 border-accent-primary transition-all">All Notices</button>
            <button className="text-text-muted text-[0.95rem] font-medium pb-2 border-b-2 border-transparent hover:text-text-primary transition-all">Important</button>
            <button className="text-text-muted text-[0.95rem] font-medium pb-2 border-b-2 border-transparent hover:text-text-primary transition-all">Event Details</button>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6 lg:p-8">
          {notices.map((notice) => (
            <div key={notice.id} className="flex-between flex-wrap gap-4 p-5 bg-bg-tertiary rounded-xl border border-border-color hover-lift hover:bg-bg-tertiary/80 transition-all duration-300">
               
               <div className="flex items-start md:items-center gap-5">
                 <div className={`w-12 h-12 rounded-xl flex-center shrink-0 shadow-md ${
                   notice.type === 'Important' ? 'bg-status-warning/10 text-status-warning' : 
                   notice.type === 'Alert' ? 'bg-status-danger/10 text-status-danger' : 
                   'bg-accent-primary/10 text-accent-primary'
                 }`}>
                   {notice.type === 'Alert' ? <Bell size={22} /> : notice.type === 'Important' ? <Megaphone size={22} /> : <FileDown size={22} />}
                 </div>
                 
                 <div className="flex flex-col gap-1.5">
                   <h3 className="text-[1.1rem] font-semibold text-text-primary m-0 leading-tight">{notice.title}</h3>
                   <div className="flex items-center gap-4 text-text-muted text-[0.85rem]">
                     <span className="flex-center gap-2 font-medium bg-bg-secondary px-2 py-0.5 rounded border border-border-color"><Calendar size={14} /> {notice.date}</span>
                     <span>• By <strong className="text-text-secondary">{notice.dept}</strong></span>
                   </div>
                 </div>
               </div>
               
               <button className="secondary-btn !py-2 !px-4 text-[0.85rem] shrink-0">View PDF</button>
            </div>
          ))}
    </div>
      </Card >
    </div >
  );
};

export default Notices;