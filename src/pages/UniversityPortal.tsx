import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const UniversityPortal = () => {
    const { uniSlug } = useParams();
    const [uniData, setUniData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch university branding info
        fetch(`http://localhost:5000/api/university/${uniSlug}`)
            .then(res => res.json())
            .then(data => {
                if (data.name) setUniData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [uniSlug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-body text-text-muted">Loading portal...</div>;
    if (!uniData) return (
        <div className="min-h-screen flex flex-col items-center justify-center font-body text-center p-6">
            <h1 className="text-3xl font-bold text-text-primary mb-4">University Not Found</h1>
            <p className="text-text-secondary mb-8">The university portal you're looking for doesn't exist or is still pending verification.</p>
            <Link to="/" className="px-6 py-2 bg-accent-primary text-white rounded-md font-semibold">Return to CampusCore</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-primary font-body">
            {/* Header */}
            <header className="bg-white border-b border-border-color shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 sm:py-0">
                    <div className="flex items-center gap-4">
                        {uniData.logoUrl ? (
                            <img src={`http://localhost:5000/${uniData.logoUrl}`} alt="logo" className="h-12 w-auto object-contain" />
                        ) : (
                            <div className="w-12 h-12 bg-accent-primary text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                                {uniData.name.charAt(0)}
                            </div>
                        )}
                        <h1 className="text-xl sm:text-2xl font-bold text-text-primary truncate">{uniData.name} Portal</h1>
                    </div>
                    <div className="flex gap-2 sm:gap-4 flex-shrink-0">
                        <Link to={`/university-login?university=${uniData.name}`} className="px-4 py-2 border border-[#D0D5DD] text-text-primary font-medium rounded hover:bg-gray-50 transition-colors text-sm">Admin Access</Link>
                        <Link to={`/university-login?university=${uniData.name}`} className="px-4 py-2 bg-accent-primary text-white font-medium rounded hover:bg-[#2563eb] transition-colors text-sm shadow-sm">Student / College</Link>
                    </div>
                </div>
            </header>

            {/* Hero / Images */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-16 px-4 py-16 bg-gradient-to-br from-[#eff6ff] to-[#f0fdf4] rounded-2xl shadow-sm border border-[#e2e8f0]">
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">Welcome to {uniData.name}</h2>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                        Access the central University Resource Portal. Students, Faculty, and Administrators can log in to manage academics, examinations, and university administration.
                    </p>
                </div>

                {uniData.departmentImages && uniData.departmentImages.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-2xl font-bold text-text-primary mb-8 border-b pb-4">Campus Facilities Gallery</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {uniData.departmentImages.map((img: string, i: number) => (
                                <div key={i} className="group overflow-hidden rounded-xl shadow-sm border border-border-color bg-white hover:shadow-md transition-all cursor-pointer">
                                    <div className="aspect-[4/3] w-full overflow-hidden">
                                        <img src={`http://localhost:5000/${img}`} alt={`Campus Facility ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4 border-t border-border-color">
                                        <p className="text-sm font-semibold text-text-primary text-center">Facility Image {i + 1}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UniversityPortal;
