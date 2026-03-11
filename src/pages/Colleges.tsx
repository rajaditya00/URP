import { Card, StatCard } from '../components/UI/Card';
import { LibraryBig, GraduationCap, Users, MapPin, ExternalLink, ShieldAlert } from 'lucide-react';

const colleges = [
  { id: 1, name: 'Institute of Technology', code: 'IOT', location: 'North Campus', students: 4500, affiliation: 'Autonomous', rating: 'A+' },
  { id: 2, name: 'School of Management', code: 'SOM', location: 'South Campus', students: 1200, affiliation: 'Constituent', rating: 'A' },
  { id: 3, name: 'College of Arts & Science', code: 'CAS', location: 'City Center', students: 3800, affiliation: 'Affiliated', rating: 'B+' },
];

const Colleges = () => {
  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl tracking-tight mb-2 text-gradient">Affiliated Colleges</h1>
          <p className="text-lg text-text-secondary">Oversight and management of all colleges under the university umbrella.</p>
        </div>
        <button className="primary-btn flex-center gap-2 shrink-0">
          New Affiliation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8 -mb-4">
        <StatCard title="Total Associated Colleges" value="24" icon={<LibraryBig size={24} />} trend="2 added this year" trendUp={true} />
        <StatCard title="Total Student Body" value="84,200" icon={<Users size={24} />} trend="across all campuses" trendUp={true} />
        <StatCard title="Pending Affiliation Renewals" value="3" icon={<ShieldAlert size={24} />} trend="Requires action" trendUp={false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 pl-1 pr-1">
        {colleges.map(college => (
          <Card key={college.id} className="hover-lift p-8 flex flex-col justify-between" glow>
            <div>
              <div className="flex-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex-center text-white text-[0.85rem] font-bold shadow-md shrink-0 border border-border-highlight">
                    {college.code}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary m-0 leading-tight">{college.name}</h3>
                </div>
                <span className="bg-accent-primary/15 text-accent-primary px-3 py-1 rounded-full text-[0.85rem] font-bold tracking-wide shrink-0">
                  {college.rating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-bg-tertiary border border-border-color px-3 py-2 rounded-lg text-[0.85rem] text-text-secondary flex items-center gap-2 truncate">
                  <MapPin size={16} className="text-text-muted shrink-0" /> {college.location}
                </div>
                <div className="bg-bg-tertiary border border-border-color px-3 py-2 rounded-lg text-[0.85rem] text-text-secondary flex items-center gap-2 truncate">
                  <GraduationCap size={16} className="text-text-muted shrink-0" /> {college.students}
                </div>
              </div>
            </div>

            <div className="flex-between items-center pt-6 border-t border-border-color">
              <span className="text-[0.85rem] text-text-muted">Type: <strong className="text-text-primary px-2 py-1 bg-bg-tertiary rounded mx-1 border border-border-color">{college.affiliation}</strong></span>
              <button className="text-accent-primary font-semibold text-[0.9rem] flex items-center gap-2 hover:underline">
                Manage Portal <ExternalLink size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Colleges;