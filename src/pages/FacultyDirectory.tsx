import { Card } from '../components/UI/Card';
import { Search, Filter, Mail, Phone, BookOpen, Presentation, ChevronRight, UserRound } from 'lucide-react';

const facultyList = [
    { id: 1, name: 'Dr. Alan Turing', role: 'Head of Department', dept: 'Computer Science', email: 'a.turing@urp.edu', ext: 'x4021', publications: 42, image: 'A' },
    { id: 2, name: 'Prof. Grace Hopper', role: 'Senior Professor', dept: 'Computer Science', email: 'g.hopper@urp.edu', ext: 'x4022', publications: 38, image: 'G' },
    { id: 3, name: 'Dr. Richard Feynman', role: 'Distinguished Prof.', dept: 'Physics', email: 'r.feynman@urp.edu', ext: 'x5105', publications: 85, image: 'R' },
    { id: 4, name: 'Dr. Marie Curie', role: 'Associate Professor', dept: 'Chemistry', email: 'm.curie@urp.edu', ext: 'x3201', publications: 64, image: 'M' },
    { id: 5, name: 'Prof. John Nash', role: 'Assistant Professor', dept: 'Mathematics', email: 'j.nash@urp.edu', ext: 'x2190', publications: 18, image: 'J' },
    { id: 6, name: 'Dr. Ada Lovelace', role: 'Research Fellow', dept: 'Artificial Intelligence', email: 'a.lovelace@urp.edu', ext: 'x4099', publications: 22, image: 'A' },
];

const FacultyDirectory = () => {
    return (
        <div className="flex flex-col gap-12 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl tracking-tight mb-2 text-gradient">Faculty Directory</h1>
                    <p className="text-lg text-text-secondary">Comprehensive database of academic staff, researchers, and professors.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-1 flex items-center gap-3 bg-bg-tertiary border border-border-color rounded-xl px-4 py-3 focus-within:border-accent-primary focus-within:ring-2 focus-within:ring-accent-primary/20 transition-all">
                    <Search size={20} className="text-text-muted shrink-0" />
                    <input type="text" placeholder="Search by name, department, or research area..." className="bg-transparent border-none text-text-primary w-full outline-none placeholder:text-text-muted text-lg" />
                </div>
                <div className="flex gap-4">
                    <select className="bg-bg-tertiary text-text-primary border border-border-color px-4 py-3 rounded-xl outline-none focus:border-accent-primary min-w-[200px]">
                        <option className="bg-bg-secondary">All Departments</option>
                        <option className="bg-bg-secondary">Computer Science</option>
                        <option className="bg-bg-secondary">Physics</option>
                    </select>
                    <button className="secondary-btn !py-3 !px-5 flex-center gap-2 shrink-0">
                        <Filter size={18} /> Filters
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 pr-2">
                {facultyList.map(faculty => (
                    <Card key={faculty.id} className="hover-lift !bg-bg-tertiary border border-border-color flex flex-col overflow-hidden group">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex-center font-bold text-2xl border border-border-color shrink-0 text-white shadow-inner relative overflow-hidden group-hover:shadow-sm transition-all">
                                {faculty.id % 2 === 0 ? (
                                    <span className="text-accent-secondary">{faculty.image}</span>
                                ) : (
                                    <span className="text-accent-primary">{faculty.image}</span>
                                )}
                                <div className="absolute inset-0 bg-bg-tertiary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold text-text-primary leading-tight mb-1">{faculty.name}</h3>
                                <p className="text-accent-primary font-medium text-sm">{faculty.role}</p>
                                <p className="text-text-muted text-[0.85rem] mt-0.5">{faculty.dept}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-auto mb-6">
                            <div className="flex items-center gap-3 text-text-secondary text-sm bg-bg-secondary p-2 rounded-lg border border-border-color">
                                <Mail size={16} className="text-text-muted shrink-0" /> <span className="truncate">{faculty.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-text-secondary text-sm bg-bg-secondary p-2 rounded-lg border border-border-color">
                                <Phone size={16} className="text-text-muted shrink-0" /> <span>Ext: {faculty.ext}</span>
                            </div>
                        </div>

                        <div className="flex-between items-center pt-5 border-t border-border-color">
                            <div className="flex items-center gap-2 text-text-muted text-sm" title="Publications">
                                <BookOpen size={16} /> <strong className="text-text-primary">{faculty.publications}</strong> Papers
                            </div>
                            <button className="w-10 h-10 rounded-full bg-bg-tertiary flex-center text-text-secondary hover:bg-accent-primary hover:text-white transition-all group-hover:translate-x-1">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default FacultyDirectory;
