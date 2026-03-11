import { Plus, MoreVertical, Search, Filter, ShieldCheck, Wrench, Briefcase, BadgeDollarSign } from 'lucide-react';
import { Card, StatCard } from '../components/UI/Card';

const departments = [
  { id: 1, name: 'Human Resources', head: 'Sarah Jenkins', staff: 24, budget: '$1.2M', status: 'Operational', icon: <Briefcase /> },
  { id: 2, name: 'IT Infrastructure & Support', head: 'Michael Chen', staff: 45, budget: '$3.5M', status: 'Operational', icon: <Wrench /> },
  { id: 3, name: 'Finance & Accounts', head: 'Robert Taylor', staff: 18, budget: '$0.8M', status: 'Review Needed', icon: <BadgeDollarSign /> },
  { id: 4, name: 'Campus Security', head: 'James Wilson', staff: 65, budget: '$2.1M', status: 'Operational', icon: <ShieldCheck /> },
];

const NonAcademic = () => {
  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl tracking-tight mb-2 text-gradient">Non-Academic Departments</h1>
          <p className="text-lg text-text-secondary">Administrative, support, and operational divisions.</p>
        </div>
        <button className="primary-btn flex-center gap-2 shrink-0">
          <Plus size={18} /> Add Division
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8 -mb-4">
        <StatCard title="Total Admin Staff" value="482" icon={<Briefcase size={24} />} trend="2% increase" trendUp={true} />
        <StatCard title="Annual Budget Allocated" value="$24.5M" icon={<BadgeDollarSign size={24} />} trend="On track" trendUp={true} />
      </div>

      <Card className="!p-0 overflow-hidden" glow>
        <div className="p-6 lg:px-8 border-b border-border-color flex-between flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-bg-tertiary border border-border-color rounded-lg px-4 py-2 w-full max-w-sm focus-within:border-accent-primary focus-within:ring-2 focus-within:ring-accent-primary/20 transition-all">
            <Search size={18} className="text-text-muted shrink-0" />
            <input type="text" placeholder="Search administrative divisions..." className="bg-transparent border-none text-text-primary text-sm w-full outline-none placeholder:text-text-muted" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-tertiary text-text-primary border border-border-color hover:-translate-y-1 hover:shadow-sm transition-all duration-300 shrink-0">
            <Filter size={18} /> Filter
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Division Name</th>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Department Head</th>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Staff Count</th>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Allocated Budget</th>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Status</th>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="transition-colors duration-200 hover:bg-bg-tertiary border-b border-border-color last:border-0">
                  <td className="px-6 lg:px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 flex-center shrink-0 shadow-md">
                        {dept.icon}
                      </div>
                      <span className="text-text-primary font-medium">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-6 lg:px-8 py-5 text-text-secondary">{dept.head}</td>
                  <td className="px-6 lg:px-8 py-5 text-text-secondary">{dept.staff}</td>
                  <td className="px-6 lg:px-8 py-5 font-bold text-gradient text-lg tracking-tight">{dept.budget}</td>
                  <td className="px-6 lg:px-8 py-5">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      dept.status === 'Operational' 
                        ? 'bg-status-success/10 text-status-success border-status-success/20' 
                        : 'bg-status-warning/10 text-status-warning border-status-warning/20'
                    }`}>
                      {dept.status}
                    </span>
                  </td>
                  <td className="px-6 lg:px-8 py-5">
                    <button className="text-text-muted p-1.5 rounded bg-transparent hover:bg-bg-tertiary/80 hover:text-text-primary transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
    </div>
      </Card >
    </div >
  );
};

export default NonAcademic;