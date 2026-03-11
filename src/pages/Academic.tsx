import { Plus, MoreVertical, Search, Filter } from 'lucide-react';
import { Card } from '../components/UI/Card';

const departments = [
  { id: 1, name: 'Computer Science & Engineering', hod: 'Dr. Alan Turing', faculty: 45, students: 1200, status: 'Active' },
  { id: 2, name: 'Electrical Engineering', hod: 'Dr. Nikola Tesla', faculty: 38, students: 850, status: 'Active' },
  { id: 3, name: 'Mechanical Engineering', hod: 'Dr. Henry Ford', faculty: 42, students: 920, status: 'Active' },
  { id: 4, name: 'Civil Engineering', hod: 'Dr. John Smeaton', faculty: 35, students: 780, status: 'Active' },
  { id: 5, name: 'Biotechnology', hod: 'Dr. Rosalind Franklin', faculty: 28, students: 450, status: 'Under Review' },
  { id: 6, name: 'Mathematics', hod: 'Dr. Leonhard Euler', faculty: 30, students: 600, status: 'Active' },
];

const Academic = () => {
  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl tracking-tight mb-2 text-gradient">Academic Departments</h1>
          <p className="text-lg text-text-secondary">Manage all academic faculties, courses, and department heads.</p>
        </div>
        <button className="primary-btn flex-center gap-2 shrink-0">
          <Plus size={18} /> Add Department
        </button>
      </div>

      <Card className="!p-0 overflow-hidden" glow>
        <div className="p-6 lg:px-8 border-b border-border-color flex-between flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-bg-tertiary border border-border-color rounded-lg px-4 py-2 w-full max-w-sm focus-within:border-accent-primary focus-within:ring-2 focus-within:ring-accent-primary/20 transition-all">
            <Search size={18} className="text-text-muted shrink-0" />
            <input type="text" placeholder="Search departments..." className="bg-transparent border-none text-text-primary text-sm w-full outline-none placeholder:text-text-muted" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-tertiary text-text-primary border border-border-color hover:-translate-y-1 hover:shadow-sm transition-all duration-300 shrink-0">
            <Filter size={18} /> Filter
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Department Name</th>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Head of Department (HOD)</th>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Faculty Count</th>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Students</th>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Status</th>
                <th className="px-6 lg:px-8 py-4 text-text-muted font-medium text-[0.85rem] uppercase tracking-wider border-b border-border-color">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="transition-colors duration-200 hover:bg-bg-tertiary border-b border-border-color last:border-0">
                  <td className="px-6 lg:px-8 py-5 text-text-primary font-medium">{dept.name}</td>
                  <td className="px-6 lg:px-8 py-5 text-text-secondary">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-primary flex-center text-white text-xs font-semibold shrink-0 shadow-md">
                        {dept.hod.charAt(4)}
                      </div>
                      {dept.hod}
                    </div>
                  </td>
                  <td className="px-6 lg:px-8 py-5 text-text-secondary">{dept.faculty}</td>
                  <td className="px-6 lg:px-8 py-5 text-text-secondary">{dept.students}</td>
                  <td className="px-6 lg:px-8 py-5">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      dept.status === 'Active' 
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

export default Academic;