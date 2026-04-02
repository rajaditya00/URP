import { Users, GraduationCap, Building, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { StatCard, Card } from '../components/UI/Card';

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border-color">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-text-primary">University Overview</h1>
            <span className="px-2 py-0.5 rounded border border-accent-primary/30 bg-accent-primary/10 text-accent-primary text-[10px] font-bold uppercase tracking-wider">Professional Plan</span>
          </div>
          <p className="text-sm text-text-secondary">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <button className="primary-btn shrink-0">Generate Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value="18,245"
          icon={<Users size={20} />}
          trend="12% from last year"
          trendUp={true}
        />
        <StatCard
          title="Active Departments"
          value="42"
          icon={<Building size={20} />}
          trend="Stable"
          trendUp={true}
        />
        <StatCard
          title="Overall Placement"
          value="94%"
          icon={<TrendingUp size={20} />}
          trend="4.5% vs 2024"
          trendUp={true}
        />
        <StatCard
          title="Pending Notices"
          value="12"
          icon={<FileText size={20} />}
          trend="Needs attention"
          trendUp={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 min-h-[360px] flex flex-col">
          <div className="mb-5 flex-between">
            <h3 className="text-base font-semibold text-text-primary">Enrollment Trends</h3>
            <select className="bg-bg-secondary text-text-primary border border-border-color px-3 py-1.5 rounded-md text-sm outline-none focus:border-accent-primary font-body">
              <option>This Year</option>
              <option>Last 5 Years</option>
            </select>
          </div>
          <div className="flex-1 rounded-md border border-dashed border-border-highlight text-text-muted flex flex-col items-center justify-center gap-3 bg-bg-secondary">
            <TrendingUp size={48} className="text-accent-primary opacity-30" />
            <p className="text-sm">Interactive Chart Component Area</p>
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-text-primary">Recent Activities</h3>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { dept: 'Computer Science', action: 'uploaded marks for Sem 6', hours: 2 },
              { dept: 'Mechanical Engg', action: 'submitted placement report', hours: 4 },
              { dept: 'Examination Cell', action: 'released timetable', hours: 6 },
              { dept: 'Student Affairs', action: 'posted new notice', hours: 8 },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start pb-4 border-b border-border-color last:border-0 last:pb-0">
                <div className="w-7 h-7 rounded-full bg-status-success/10 text-status-success flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={14} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-text-primary leading-snug">
                    <strong className="text-accent-primary font-semibold">{item.dept}</strong> {item.action}
                  </p>
                  <span className="text-xs text-text-muted">{item.hours} hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;