import { Card, StatCard } from '../components/UI/Card';
import { AlertTriangle, Clock, CheckCircle2, MessageSquare, Plus, Filter } from 'lucide-react';

const tickets = [
    { id: 'TKT-2026-089', subject: 'Hostel Wi-Fi Connectivity Issue', category: 'IT Infrastructure', date: 'Oct 14, 2026', status: 'In Progress', priority: 'High' },
    { id: 'TKT-2026-088', subject: 'Discrepancy in Semester 5 Marks', category: 'Examination', date: 'Oct 12, 2026', status: 'Pending', priority: 'Critical' },
    { id: 'TKT-2026-085', subject: 'Library Card Renewal Delay', category: 'Library Services', date: 'Oct 10, 2026', status: 'Resolved', priority: 'Low' },
    { id: 'TKT-2026-081', subject: 'Maintenance in Lab 304', category: 'Facilities', date: 'Oct 05, 2026', status: 'Resolved', priority: 'Medium' },
];

const Grievance = () => {
    return (
        <div className="flex flex-col gap-12 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl tracking-tight mb-2 text-gradient">Grievance Redressal</h1>
                    <p className="text-lg text-text-secondary">Official portal for raising, tracking, and resolving university-related issues.</p>
                </div>
                <button className="primary-btn flex-center gap-2 shrink-0">
                    <Plus size={18} /> New Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 -mb-4">
                <StatCard title="Active Tickets" value="14" icon={<AlertTriangle size={24} />} trend="4 new today" trendUp={false} />
                <StatCard title="Avg Resolution Time" value="2.4" icon={<Clock size={24} />} trend="Days" trendUp={true} />
                <StatCard title="Resolution Rate" value="92%" icon={<CheckCircle2 size={24} />} trend="Target: 95%" trendUp={true} />
                <StatCard title="Total Resolved" value="1,245" icon={<MessageSquare size={24} />} trend="Lifetime" trendUp={true} />
            </div>

            <Card className="!p-0 overflow-hidden" glow>
                <div className="p-6 lg:px-8 border-b border-border-color flex-between flex-wrap gap-4">
                    <div className="flex gap-6">
                        <button className="text-text-primary text-[0.95rem] font-semibold pb-2 border-b-2 border-accent-primary transition-all">My Tickets</button>
                        <button className="text-text-muted text-[0.95rem] font-medium pb-2 border-b-2 border-transparent hover:text-text-primary transition-all">Resolved</button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-tertiary text-text-primary border border-border-color hover:-translate-y-1 hover:shadow-sm transition-all duration-300 shrink-0">
                        <Filter size={18} /> Filter Status
                    </button>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Ticket ID</th>
                                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Subject & Category</th>
                                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Date Filed</th>
                                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Priority</th>
                                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className="transition-colors duration-200 hover:bg-bg-tertiary border-b border-border-color last:border-0 cursor-pointer">
                                    <td className="px-6 lg:px-8 py-5 text-accent-primary font-bold text-sm tracking-wide">{ticket.id}</td>
                                    <td className="px-6 lg:px-8 py-5">
                                        <div className="text-text-primary font-semibold mb-1">{ticket.subject}</div>
                                        <div className="text-text-muted text-[0.85rem] flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-white/20"></span> {ticket.category}
                                        </div>
                                    </td>
                                    <td className="px-6 lg:px-8 py-5 text-text-secondary">{ticket.date}</td>
                                    <td className="px-6 lg:px-8 py-5">
                                        <span className={`flex items-center gap-1.5 text-sm font-medium ${
                                            ticket.priority === 'Critical' ? 'text-status-danger' :
                                                ticket.priority === 'High' ? 'text-status-warning' :
                                                    ticket.priority === 'Medium' ? 'text-accent-tertiary' : 'text-text-muted'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            ticket.priority === 'Critical' ? 'bg-status-danger' :
                                                ticket.priority === 'High' ? 'bg-status-warning' :
                                                    ticket.priority === 'Medium' ? 'bg-accent-tertiary' : 'bg-text-muted'
                                        }`}></span>
                                    {ticket.priority}
                                </span>
                  </td>
                        <td className="px-6 lg:px-8 py-5">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                                ticket.status === 'Resolved'
                                    ? 'bg-status-success/10 text-status-success border-status-success/20'
                                    : ticket.status === 'In Progress'
                                        ? 'bg-status-warning/10 text-status-warning border-status-warning/20'
                                        : 'bg-bg-tertiary text-text-secondary border-border-color'
                            }`}>
                            {ticket.status}
                        </span>
                    </td>
                </tr>
              ))}
            </tbody>
        </table>
        </div >
      </Card >
    </div >
  );
};

export default Grievance;
