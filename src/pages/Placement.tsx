import { Card, StatCard } from '../components/UI/Card';
import { Briefcase, Building, MapPin, Award } from 'lucide-react';

const topAlumni = [
  { id: 1, name: 'Priya Sharma', batch: '2015', role: 'VP of Engineering', company: 'Netflix' },
  { id: 2, name: 'Rahul Desai', batch: '2018', role: 'Founder', company: 'FinTech Pro' },
  { id: 3, name: 'Ananya Gupta', batch: '2019', role: 'Senior Product Manager', company: 'Amazon' },
];

const placementDrives = [
  { id: 1, company: 'Goldman Sachs', roles: 'Analyst, SDE', date: 'Oct 15, 2026', ctc: '24 LPA' },
  { id: 2, company: 'Samsung R&D', roles: 'Research Engineer', date: 'Oct 18, 2026', ctc: '20 LPA' },
];

const Placement = () => {
  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl tracking-tight mb-2 text-gradient">Placement & Alumni</h1>
          <p className="text-lg text-text-secondary">Track placement drives, statistics, and our global alumni network.</p>
        </div>
        <button className="primary-btn shrink-0">Schedule Drive</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8 -mb-4">
        <StatCard title="Highest Package" value="₹1.2 Cr" icon={<Award size={24} />} trend="New Record" trendUp={true} />
        <StatCard title="Average Package" value="₹14.5 LPA" icon={<Briefcase size={24} />} trend="↑ 12% YoY" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12 pl-1 pr-1">
        <div className="flex flex-col gap-6">
          <div className="border-b border-border-color pb-4">
            <h2 className="text-xl font-semibold">Upcoming Placement Drives</h2>
          </div>
          <div className="flex flex-col gap-4">
            {placementDrives.map(drive => (
              <Card key={drive.id} className="hover-lift !bg-gradient-to-br !from-bg-tertiary !to-transparent border border-border-color p-6">
                <div className="flex-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text-primary m-0 flex items-center gap-3">
                    <Building size={20} className="text-accent-primary" /> {drive.company}
                  </h3>
                  <span className="bg-accent-primary/15 text-accent-primary px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                    {drive.date}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-text-secondary text-[0.95rem]">Roles: <span className="text-text-primary font-medium">{drive.roles}</span></p>
                  <p className="text-xl font-bold tracking-tight text-gradient mt-2">CTC: {drive.ctc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border-b border-border-color pb-4">
            <h2 className="text-xl font-semibold">Featured Alumni</h2>
          </div>
          <div className="flex flex-col gap-4">
            {topAlumni.map(alumni => (
              <Card key={alumni.id} className="hover-lift !bg-bg-tertiary border border-border-color p-6 flex flex-col justify-center">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex-center text-white text-xl font-bold tracking-tight shadow-md shrink-0">
                    {alumni.name.charAt(0)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-text-primary m-0">
                      {alumni.name}
                      <span className="text-text-muted font-normal text-sm ml-2"> (Class of '{alumni.batch.slice(2)})</span>
                    </h3>
                    <p className="text-text-secondary text-[0.95rem]">{alumni.role} <span className="text-accent-primary font-medium">@ {alumni.company}</span></p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Placement;