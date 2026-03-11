import { Card, StatCard } from '../components/UI/Card';
import { BookOpen, CalendarCheck, Clock, Download, PieChart, CreditCard } from 'lucide-react';

const subjects = [
  { code: 'CS601', name: 'Computer Networks', attendance: 85, credits: 4, faculty: 'Dr. Alan Turing' },
  { code: 'CS602', name: 'Database Systems', attendance: 92, credits: 4, faculty: 'Prof. Grace Hopper' },
  { code: 'CS603', name: 'Operating Systems', attendance: 78, credits: 3, faculty: 'Dr. Linus Torvalds' },
];

const schedule = [
  { time: '09:00 AM', course: 'Computer Networks', hall: 'L-201', type: 'Lecture' },
  { time: '11:00 AM', course: 'Database Lab', hall: 'Lab A3', type: 'Practical' },
  { time: '02:00 PM', course: 'Operating Systems', hall: 'L-204', type: 'Lecture' },
];

const StudentPortal = () => {
  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex-center overflow-hidden border-2 border-accent-primary shadow-[0_0_20px_rgba(99,102,241,0.4)] shrink-0">
             <img src="https://ui-avatars.com/api/?name=Alex+Johnson&background=random" alt="Student" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-4xl tracking-tight mb-1 text-gradient">Alex Johnson</h1>
            <p className="text-lg text-text-secondary">#STU-2024-0891 • B.Tech Computer Science (Sem 6)</p>
          </div>
        </div>
        <button className="secondary-btn flex-center gap-2 shrink-0"><Download size={18} /> Download ID</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 -mb-4">
        <StatCard title="Overall CGPA" value="8.94" icon={<PieChart size={24} />} trend="Top 10%" trendUp={true} />
        <StatCard title="Total Credits" value="112" icon={<BookOpen size={24} />} trend="Out of 160" trendUp={true} />
        <StatCard title="Attendance" value="86%" icon={<CalendarCheck size={24} />} trend="Above 75% req" trendUp={true} />
        <StatCard title="Fee Due" value="₹0" icon={<CreditCard size={24} />} trend="All cleared" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
        <Card className="lg:col-span-2 flex flex-col hover-lift" glow>
          <div className="mb-6 flex-between">
            <h3 className="text-xl font-semibold">Current Semester Courses</h3>
          </div>
          <div className="flex flex-col gap-4">
            {subjects.map((sub, i) => (
              <div key={i} className="bg-bg-tertiary border border-border-color rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-bg-tertiary/80 transition-colors">
                <div>
                  <h4 className="text-text-primary font-semibold text-lg flex items-center gap-3">
                    {sub.name} <span className="bg-bg-tertiary/80 text-text-secondary text-xs px-2 py-0.5 rounded font-normal">{sub.code}</span>
                  </h4>
                  <p className="text-text-muted text-sm mt-1">{sub.faculty} • {sub.credits} Credits</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-text-muted mb-1">Attendance</span>
                    <div className="flex items-center gap-2">
                       <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden">
                         <div className={`h-full rounded-full ${sub.attendance > 80 ? 'bg-status-success' : 'bg-status-warning'}`} style={{width: `${sub.attendance}%`}}></div>
                       </div>
                       <span className="text-sm font-semibold">{sub.attendance}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1 border-accent-secondary/20">
          <div className="mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2"><Clock size={20} className="text-accent-secondary" /> Today's Schedule</h3>
          </div>
          <div className="flex flex-col relative before:absolute before:inset-y-2 before:left-[15px] before:w-[2px] before:bg-bg-tertiary/80">
            {schedule.map((item, i) => (
              <div key={i} className="flex gap-4 items-start relative mb-8 last:mb-0 group">
                <div className="w-8 h-8 rounded-full bg-accent-secondary/20 border-2 border-accent-secondary/50 flex-center shrink-0 z-10 group-hover:scale-110 transition-transform">
                  <div className="w-2 h-2 rounded-full bg-accent-secondary"></div>
                </div>
                <div className="flex flex-col gap-1 -mt-1 pt-0.5">
                  <span className="text-xs font-bold text-accent-secondary/80 bg-accent-secondary/10 px-2 py-0.5 rounded-full w-fit">{item.time}</span>
                  <p className="text-[1.05rem] text-text-primary font-semibold mt-1">{item.course}</p>
                  <span className="text-xs text-text-muted">{item.type} • {item.hall}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div >
    </div >
  );
};

export default StudentPortal;
