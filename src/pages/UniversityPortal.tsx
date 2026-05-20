import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Shield, GraduationCap, Building2, CheckCircle, ChevronRight, AlertTriangle, Users } from 'lucide-react';

const UniversityPortal = () => {
    const { uniSlug } = useParams();
    const [uniData, setUniData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'departments' | 'labs' | 'sports' | 'auditorium'>('departments');

    useEffect(() => {
        fetch(`http://localhost:5000/api/university/${uniSlug}`)
            .then(res => res.json())
            .then(data => {
                if (data.name) setUniData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [uniSlug]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-body">
            <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium tracking-wide">Establishing Secure Connection...</p>
        </div>
    );

    const uniName = uniData?.name ? uniData.name.charAt(0).toUpperCase() + uniData.name.slice(1) : '';

    if (!uniData) return (
        <div className="min-h-screen flex flex-col items-center justify-center font-body text-center p-6 bg-slate-50">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <AlertTriangle className="text-slate-600 w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Portal Unavailable</h1>
            <p className="text-slate-600 mb-8 max-w-md text-lg leading-relaxed">The institutional portal you are attempting to access is currently unavailable or awaiting administrative validation.</p>
            <Link to="/" className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold shadow-md transition-colors">Return to Directory</Link>
        </div>
    );

    const galleryTabs = [
        { id: 'departments', label: 'Departments', count: uniData.departmentImages?.length || 0 },
        { id: 'labs', label: 'Laboratories', count: uniData.labImages?.length || 0 },
        { id: 'sports', label: 'Sports Complex', count: uniData.sportsImages?.length || 0 },
        { id: 'auditorium', label: 'Auditoriums', count: uniData.auditoriumImages?.length || 0 },
    ].filter(t => t.count > 0);

    const getActiveImages = () => {
        switch (activeTab) {
            case 'departments': return uniData.departmentImages || [];
            case 'labs': return uniData.labImages || [];
            case 'sports': return uniData.sportsImages || [];
            case 'auditorium': return uniData.auditoriumImages || [];
            default: return [];
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-body selection:bg-slate-800 selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 sm:py-0">
                    <div className="flex items-center gap-4">
                        {uniData.logoUrl ? (
                            <img src={`http://localhost:5000/${uniData.logoUrl?.replace(/^\/+/g, '')}`} alt="Institutional Crest" className="h-12 w-auto object-contain drop-shadow-sm" />
                        ) : (
                            <div className="w-12 h-12 bg-slate-800 text-white rounded-md flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm">
                                {uniData.name.charAt(0)}
                            </div>
                        )}
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate tracking-tight hidden md:block">
                            {uniName}
                        </h1>
                    </div>
                    <div className="flex gap-3 sm:gap-4 flex-shrink-0">
                        {/* Professional Student Login Button */}
                        <Link to={`/login`} className="group flex items-center gap-2 px-4 py-1.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-semibold rounded-md transition-all duration-200 text-sm shadow-sm border border-[#1e3a8a]">
                            <GraduationCap className="w-4 h-4 text-blue-200 group-hover:text-white transition-colors" />
                            <span className="hidden sm:inline">Student Portal</span>
                            <span className="sm:hidden">Student</span>
                        </Link>

                        {/* Professional Faculty Login Button */}
                        <Link to={`/login`} className="group flex items-center gap-2 px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-md transition-all duration-200 text-sm shadow-sm border border-slate-300 hover:border-slate-400">
                            <Users className="w-4 h-4 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                            <span className="hidden sm:inline">Faculty Portal</span>
                            <span className="sm:hidden">Faculty</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Academic Hero Section */}
            <section className="relative w-full bg-slate-900 text-white overflow-hidden py-24 lg:py-32">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/40 to-slate-900/90 mix-blend-multiply"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-10"></div>

                <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center animate-slide-up">
                    {uniData.logoUrl && (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-xl p-3 shadow-2xl mb-8 border border-slate-200">
                            <img src={`http://localhost:5000/${uniData.logoUrl?.replace(/^\/+/g, '')}`} alt="Institutional Crest" className="w-full h-full object-contain" />
                        </div>
                    )}

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6 text-slate-100">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="tracking-wide">Officially Verified Institution</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-5xl font-bold mb-6 tracking-tight drop-shadow-md leading-tight text-white">
                        {uniName}
                    </h2>

                    <p className="text-lg sm:text-xl text-slate-300 max-w-3xl leading-relaxed mb-10 font-medium">
                        Welcome to the official digital gateway of {uniName}. This unified portal provides students, faculty, and administrative staff with secure access to academic records, institutional notices, and comprehensive campus resources.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-200">
                        <span className="px-4 py-2 bg-slate-800/60 backdrop-blur-md rounded-md border border-slate-700 uppercase tracking-widest">{uniData.plan || 'Standard'} Accreditation</span>
                        <span className="px-4 py-2 bg-slate-800/60 backdrop-blur-md rounded-md border border-slate-700 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {uniData.state}, {uniData.country}</span>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 py-16">
                {/* Institutional Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Location & Campus</h3>
                            <p className="font-semibold text-slate-900 leading-snug">{uniData.address || 'Address not provided'}</p>
                            <p className="text-sm text-slate-600 mt-1">{uniData.state}, {uniData.country}</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Admissions & Inquiries</h3>
                            <p className="font-semibold text-slate-900 leading-snug break-all">{uniData.email}</p>
                            <a href={`mailto:${uniData.email}`} className="text-sm text-[#1e3a8a] mt-2 inline-block hover:underline font-medium">Send Official Inquiry</a>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                        <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Administrative Support</h3>
                            <p className="font-semibold text-slate-900 leading-snug">{uniData.phone || 'Phone not provided'}</p>
                            <p className="text-sm text-slate-600 mt-1">Available during institutional hours</p>
                        </div>
                    </div>
                </div>

                {/* Campus Infrastructure Gallery */}
                {galleryTabs.length > 0 && (
                    <div className="mb-20">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-6">
                            <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Facilities</h3>
                        </div>

                        {/* Gallery Tabs */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {galleryTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === tab.id
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    {tab.label} <span className="ml-2 px-2 py-0.5 rounded bg-slate-200/50 text-xs font-bold text-inherit">{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
                            {getActiveImages().map((img: string, i: number) => (
                                <div key={i} className="group relative overflow-hidden rounded-xl shadow-sm border border-slate-200 bg-white cursor-pointer">
                                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                                        <img
                                            src={`http://localhost:5000/${img?.replace(/^\/+/g, '')}`}
                                            alt={`Facility ${i + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                                        <p className="text-white font-bold text-lg mb-2">
                                            {galleryTabs.find(t => t.id === activeTab)?.label} View {i + 1}
                                        </p>
                                        <p className="text-slate-300 text-sm font-medium flex items-center gap-1">
                                            View High-Resolution Image <ChevronRight className="w-4 h-4" />
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 text-center text-slate-400 font-medium">
                <div className="max-w-7xl mx-auto px-6">
                    <p>© {new Date().getFullYear()} {uniName}. All rights reserved.</p>
                    <p className="text-sm mt-2">Technology powered by <span className="font-bold text-slate-200">CampusCore URP</span>.</p>
                </div>
            </footer>
        </div>
    );
};

export default UniversityPortal;

