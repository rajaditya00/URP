import { Card } from '../components/UI/Card';
import { Rocket, Target, Users, MapPin, ExternalLink } from 'lucide-react';

const startups = [
  { id: 1, name: 'EcoTech Solutions', founder: 'Alice Smith', stage: 'Seed', funding: '$500K', industry: 'Green Tech' },
  { id: 2, name: 'Nexus AI', founder: 'David Kim', stage: 'Pre-seed', funding: '$150K', industry: 'Artificial Intelligence' },
  { id: 3, name: 'HealthFlow', founder: 'Sara Jenkins', stage: 'Series A', funding: '$2.5M', industry: 'Health Tech' },
];

const internships = [
  { id: 1, role: 'Software Engineering Intern', company: 'Google', location: 'Bangalore', stipend: '₹1L/month', duration: '6 Months' },
  { id: 2, role: 'Data Science Intern', company: 'Microsoft', location: 'Hyderabad', stipend: '₹80K/month', duration: '3 Months' },
  { id: 3, role: 'Product Design Intern', company: 'Atlassian', location: 'Remote', stipend: '₹90K/month', duration: '6 Months' },
];

const InternshipStartup = () => {
  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl tracking-tight mb-2 text-gradient">Internship & Startup Cell</h1>
          <p className="text-lg text-text-secondary">Incubating ideas and connecting students with industry opportunities.</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button className="primary-btn">Post Internship</button>
          <button className="secondary-btn">Register Startup</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12 pl-1 pr-1">
        {/* Internships Section */}
        <div className="flex flex-col gap-6">
          <div className="flex-between border-b border-border-color pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <Target size={24} className="text-accent-secondary" /> Active Internships
            </h2>
            <button className="text-accent-primary font-semibold text-sm hover:underline">View All</button>
          </div>

          <div className="flex flex-col gap-4">
            {internships.map(intern => (
              <Card key={intern.id} className="hover-lift !bg-gradient-to-br !from-bg-tertiary !to-transparent border border-border-color">
                <div className="flex-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-text-primary m-0">{intern.role}</h3>
                  <span className="bg-accent-primary/15 text-accent-primary px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                    {intern.duration}
                  </span>
                </div>
                <p className="text-accent-primary font-medium text-[0.95rem] mb-4">{intern.company}</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-bg-tertiary px-3 py-2 rounded-lg text-sm text-text-secondary flex items-center gap-2">
                    <MapPin size={16} className="text-text-muted" /> {intern.location}
                  </div>
                  <div className="bg-status-success/10 text-status-success px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                    {intern.stipend}
                  </div>
                </div>
                <button className="w-full flex-center gap-2 bg-accent-primary/10 text-accent-primary font-semibold py-3 rounded-xl border border-accent-primary/20 hover:bg-accent-primary hover:text-white transition-all duration-300">
                  Apply Now <ExternalLink size={16} />
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* Startups Section */}
        <div className="flex flex-col gap-6">
          <div className="flex-between border-b border-border-color pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <Rocket size={24} className="text-accent-primary" /> Incubated Startups
            </h2>
            <button className="text-accent-primary font-semibold text-sm hover:underline">View Incubator</button>
          </div>

          <div className="flex flex-col gap-4">
            {startups.map(startup => (
              <Card key={startup.id} className="hover-lift !bg-gradient-to-tl !from-bg-tertiary !to-transparent border border-border-color">
                <div className="flex-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-text-primary m-0">{startup.name}</h3>
                  <span className="border border-text-muted text-text-secondary px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                    {startup.stage}
                  </span>
                </div>
                <p className="text-text-muted text-[0.95rem] mb-4">Founder: <span className="text-text-secondary font-medium">{startup.founder}</span></p>

                <div className="bg-bg-tertiary p-4 rounded-xl border border-border-color mb-4 flex-center">
                  <div className="text-xl font-bold tracking-tight text-gradient">Funding: {startup.funding}</div>
                </div>

                <div className="flex items-center">
                  <span className="bg-bg-secondary text-text-secondary border border-border-color px-3 py-1.5 rounded-lg text-sm font-medium">
                    {startup.industry}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipStartup;