import { Card, StatCard } from '../components/UI/Card';
import { Microscope, BookOpen, FileText, Download, Target, TrendingUp, Presentation } from 'lucide-react';

const projects = [
    { id: 1, title: 'Quantum Cryptography Protocols', PI: 'Dr. Alan Turing', funder: 'NSF', grant: '$1.2M', status: 'Ongoing', progress: 65 },
    { id: 2, title: 'AI for Climate Modeling', PI: 'Dr. Ada Lovelace', funder: 'DOE', grant: '$850K', status: 'Ongoing', progress: 40 },
    { id: 3, title: 'Next-Gen Solid State Batteries', PI: 'Dr. Richard Feynman', funder: 'ARPA-E', grant: '$2.1M', status: 'Completed', progress: 100 },
];

const publications = [
    { id: 1, title: 'Emergent Behaviors in LLMs', authors: 'Hopper G., Turing A.', journal: 'Nature AI', date: 'Sep 2026', citations: 124 },
    { id: 2, title: 'Novel Syntheses of Graphene', authors: 'Curie M., Feynman R.', journal: 'Science', date: 'Aug 2026', citations: 89 },
];

const ResearchHub = () => {
    return (
        <div className="flex flex-col gap-12 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl tracking-tight mb-2 text-gradient">Research & Innovation Hub</h1>
                    <p className="text-lg text-text-secondary">Tracking university grants, ongoing projects, and high-impact publications.</p>
                </div>
                <button className="primary-btn flex-center gap-2 shrink-0">
                    <Presentation size={18} /> Submit Proposal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 -mb-4">
                <StatCard title="Active Grants" value="$14.2M" icon={<Target size={24} />} trend="+$2.1M this year" trendUp={true} />
                <StatCard title="Ongoing Projects" value="48" icon={<Microscope size={24} />} trend="5 new approvals" trendUp={true} />
                <StatCard title="Publications (YTD)" value="312" icon={<BookOpen size={24} />} trend="15% increase" trendUp={true} />
                <StatCard title="Total Citations" value="12.4K" icon={<TrendingUp size={24} />} trend="Top decile impact" trendUp={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 pl-1 pr-1">
                {/* Active Projects */}
                <div className="flex flex-col gap-6">
                    <div className="border-b border-border-color pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-3">
                            <Microscope size={20} className="text-accent-tertiary" /> Sponsored Projects
                        </h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        {projects.map(proj => (
              <Card key={proj.id} className="hover-lift !bg-bg-tertiary border border-border-color">
                <div className="flex-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-text-primary m-0 leading-tight">{proj.title}</h3>
                  <span className={`px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider rounded-full border ${
                    proj.status === 'Completed' ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-status-warning/10 text-status-warning border-status-warning/20'
                  }`}>
                    {proj.status}
                  </span>
                </div>
                
                <p className="text-text-secondary text-[0.95rem] mb-4">PI: <span className="text-text-primary font-medium">{proj.PI}</span></p>
                
                <div className="flex-between items-end gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-muted">Funding Agency</span>
                    <span className="font-semibold text-text-primary">{proj.funder}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-text-muted">Grant Amount</span>
                    <span className="font-bold text-gradient text-lg">{proj.grant}</span>
                  </div>
                </div>

                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                   <div className="bg-gradient-to-r from-accent-primary to-accent-tertiary h-full rounded-full relative" style={{width: `${proj.progress}%`}}>
                      <div className="absolute inset-0 bg-white/20 animate-[shine_2s_infinite]"></div>
                   </div>
                </div>
                </Card>
            ))}
            </div>
        </div>

        {/* Recent Publications */ }
    <div className="flex flex-col gap-6">
        <div className="border-b border-border-color pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-3">
                <FileText size={20} className="text-accent-secondary" /> Recent High-Impact Publications
            </h2>
        </div>
        <div className="flex flex-col gap-4">
            {publications.map(pub => (
                <div key={pub.id} className="p-6 bg-gradient-to-br from-bg-tertiary to-transparent border border-border-color rounded-2xl hover-lift flex flex-col gap-3">
                    <h3 className="text-[1.1rem] font-semibold text-text-primary leading-tight">{pub.title}</h3>
                    <p className="text-text-secondary text-sm">{pub.authors}</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                        <span className="bg-bg-tertiary/80 text-text-primary px-3 py-1 rounded text-sm">{pub.journal}</span>
                        <span className="text-text-muted flex items-center text-sm">• {pub.date}</span>
                    </div>
                    <div className="flex-between items-center mt-4 pt-4 border-t border-border-color">
                        <div className="text-accent-secondary font-semibold text-sm">
                            {pub.citations} Citations
                        </div>
                        <button className="text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-2 text-sm font-medium">
                            <Download size={16} /> PDF
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
      </div >
    </div >
  );
};

export default ResearchHub;
