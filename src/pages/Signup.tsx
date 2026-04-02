import { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LibraryBig, Building2, Globe, HeartPulse, GraduationCap, Microscope, BookOpen, CheckCircle2, Crown } from 'lucide-react';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const Signup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialPlan = searchParams.get('plan') || 'autonomous';
    
    const [formData, setFormData] = useState({
        universityName: '',
        email: '',
        password: '',
        countryCode: '+91',
        phone: '',
        address: '',
        country: 'India',
        state: 'Delhi',
        plan: initialPlan,
        agreed: false
    });
    
    const [applicationSent, setApplicationSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [docPreviewName, setDocPreviewName] = useState('');
    const [docBase64, setDocBase64] = useState('');

    const logoRef = useRef<HTMLInputElement>(null);
    const departmentsRef = useRef<HTMLInputElement>(null);
    const labsRef = useRef<HTMLInputElement>(null);
    const sportsRef = useRef<HTMLInputElement>(null);
    const auditoriumRef = useRef<HTMLInputElement>(null);
    const affiliationDocRef = useRef<HTMLInputElement>(null);

    const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setDocPreviewName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.agreed) return;
        setIsLoading(true);

        const data = new FormData();
        data.append('universityName', formData.universityName);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('phone', `${formData.countryCode} ${formData.phone}`);
        data.append('address', formData.address);
        data.append('country', formData.country);
        data.append('state', formData.state);
        data.append('plan', formData.plan);
        data.append('duration', searchParams.get('duration') || 'yearly');

        if (logoRef.current?.files?.[0]) data.append('logo', logoRef.current.files[0]);
        if (affiliationDocRef.current?.files?.[0]) data.append('affiliationDoc', affiliationDocRef.current.files[0]);
        if (docBase64) data.append('affiliationDocBase64', docBase64);
        
        if (departmentsRef.current?.files) {
            Array.from(departmentsRef.current.files).forEach(f => data.append('departments', f));
        }
        if (labsRef.current?.files) {
            Array.from(labsRef.current.files).forEach(f => data.append('labs', f));
        }
        if (sportsRef.current?.files) {
            Array.from(sportsRef.current.files).forEach(f => data.append('sports', f));
        }
        if (auditoriumRef.current?.files) {
            Array.from(auditoriumRef.current.files).forEach(f => data.append('auditorium', f));
        }

        try {
            const res = await fetch('http://localhost:5000/api/university/register', {
                method: 'POST',
                body: data
            });
            const json = await res.json();
            
            if (res.ok) {
                setApplicationSent(true);
            } else {
                alert(json.message || 'Error submitting application');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    if (applicationSent) {
        return (
            <div className="min-h-screen bg-bg-primary font-body flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white p-8 rounded-xl border border-border-color shadow-sm text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-6 text-status-success">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Application Submitted</h2>
                    <p className="text-text-secondary text-[15px] leading-relaxed mb-6">
                        Your university details and affiliation contracts have been securely submitted. Our team will verify your documents shortly.
                    </p>
                    <p className="text-text-secondary text-[15px] leading-relaxed mb-8">
                        Upon successful verification, the Superadmin credentials will be issued to your email. You will then be able to access University Administration modules, like the Examination Controller, College Controller, and Unique ID Issuance.
                    </p>
                    <Link to="/" className="w-full h-12 flex items-center justify-center bg-accent-primary text-white font-semibold text-[15px] rounded-md hover:bg-[#2563eb] transition-colors">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-white font-body flex overflow-hidden">
            {/* Left Side - Hero / Marketing (Hidden on Mobile) */}
            <div className="hidden lg:flex w-5/12 relative flex-col justify-center px-16 lg:px-20 xl:px-28"
                style={{
                    background: 'linear-gradient(135deg, #fff7ed 0%, #f0fdf4 25%, #eff6ff 50%, #fafafa 100%)'
                }}>
                {/* City background decoration mimicking the vector graphic */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100h100V70H90v-20H75v20H60V50H45v40H30V60H15v40H0z' fill='%23000'/%3E%3C/svg%3E")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'bottom'
                    }}>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-[2.75rem] leading-[1.1] font-bold text-text-primary tracking-tight mb-10 text-left">
                        Introducing <br />
                        <span className="text-[#3b82f6]">a new era of URP</span>
                    </h1>

                    <div className="space-y-6">
                        {[
                            { icon: <Building2 size={18} />, strong: 'Engineered for institutions', text: 'starting with a single campus or scaling globally.' },
                            { icon: <GraduationCap size={18} />, strong: 'Admitting their first student', text: 'or guiding millions to academic success.' },
                            { icon: <Globe size={18} />, strong: 'Chasing academic excellence', text: 'or driving global research initiatives.' },
                            { icon: <LibraryBig size={18} />, strong: 'Born in a historic hall', text: 'or headquartered in a modern smart campus.' },
                            { icon: <Microscope size={18} />, strong: 'Leaving their setup stage', text: 'or managing a multi-disciplinary university system.' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-border-color last:border-0 opacity-80 hover:opacity-100 transform hover:translate-x-2 transition-all duration-300 cursor-default group">
                                <div className="mt-1 flex-shrink-0 text-text-secondary group-hover:text-[#3b82f6] group-hover:scale-110 transition-all duration-300">{item.icon}</div>
                                <p className="text-[15px] leading-relaxed text-text-primary group-hover:text-[#1e40af] transition-colors duration-300">
                                    <span className="font-semibold text-text-primary group-hover:text-[#3b82f6]">{item.strong}</span> {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col py-12 px-6 sm:px-12 md:px-24 items-center lg:items-start overflow-y-auto">
                <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-8 my-auto flex-shrink-0">
                    {/* Logo Header */}
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-9 h-9 border-2 border-accent-primary rounded-full flex items-center justify-center bg-white text-accent-primary p-1.5">
                            <BookOpen size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-text-primary leading-tight">CampusCore</span>
                            <span className="text-[13px] font-bold text-text-secondary leading-none">URP</span>
                        </div>
                    </div>

                    <h2 className="text-[2rem] font-bold text-text-primary mb-8 tracking-tight">Let's get started</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Plan Selection */}
                        <div className="mb-6">
                            <span className="block text-[13px] font-semibold text-text-primary mb-3">Selected Subscription Plan</span>
                            {searchParams.get('duration') === '5year' ? (
                                <div className="border-2 border-[#eab308] bg-[#fefce8] p-4 rounded-md flex items-center justify-between shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#fef08a] to-[#ca8a04] opacity-20 rounded-bl-full" />
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fef08a] to-[#eab308] flex items-center justify-center text-white shadow-sm">
                                            <Crown size={20} className="fill-white drop-shadow-sm" />
                                        </div>
                                        <div>
                                            <h4 className="text-[16px] font-extrabold text-[#854d0e] capitalize tracking-tight">{formData.plan} Plan</h4>
                                            <span className="text-[12px] font-bold text-[#b45309] uppercase tracking-wider">5-Year Premium Access</span>
                                        </div>
                                    </div>
                                    <CheckCircle2 size={24} className="text-[#eab308] relative z-10" />
                                </div>
                            ) : (
                                <div className="border border-accent-primary bg-[#f0f6ff] p-4 rounded-md flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#bfdbfe] flex items-center justify-center text-accent-primary">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-bold text-accent-primary capitalize">{formData.plan} Plan</h4>
                                            <span className="text-[12px] font-semibold text-[#1d4ed8] capitalize">{searchParams.get('duration') || 'Yearly'} Access</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* University Name */}
                        <div className="relative group">
                            <span className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-text-muted z-10 flex items-center gap-1">
                                <Building2 size={12} /> University Name *
                            </span>
                            <input
                                type="text"
                                required
                                value={formData.universityName}
                                onChange={e => setFormData({ ...formData, universityName: e.target.value })}
                                className="w-full h-12 px-4 bg-white border border-[#D0D5DD] rounded-md outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-[15px] transition-all"
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <span className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-text-muted z-10">
                                Email *
                            </span>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-12 px-4 bg-white border border-[#D0D5DD] rounded-md outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-[15px] transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <span className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-text-muted z-10">
                                Password *
                            </span>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full h-12 px-4 bg-white border border-[#D0D5DD] rounded-md outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-[15px] transition-all"
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex gap-3">
                            <div className="relative group w-28 shrink-0">
                                <select
                                    value={formData.countryCode}
                                    onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                                    className="w-full h-12 px-3 bg-white border border-[#D0D5DD] rounded-md outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-[14px] appearance-none"
                                >
                                    <option value="+91">+91 (IN)</option>
                                    <option value="+1">+1 (US)</option>
                                    <option value="+44">+44 (UK)</option>
                                    <option value="+61">+61 (AU)</option>
                                </select>
                            </div>
                            <div className="relative group flex-1">
                                <span className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-text-muted z-10">
                                    Phone Number *
                                </span>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full h-12 px-4 bg-white border border-[#D0D5DD] rounded-md outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-[15px] transition-all"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="relative group">
                            <span className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-text-muted z-10">
                                Complete Address *
                            </span>
                            <textarea
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="w-full h-24 p-3 bg-white border border-[#D0D5DD] rounded-md outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-[15px] transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Region */}
                        <div className="flex gap-3">
                            <div className="relative group flex-1">
                                <span className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-text-muted z-10">
                                    Country
                                </span>
                                <select
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full h-12 px-3 bg-[#FCFCFD] border border-[#D0D5DD] rounded-md outline-none focus:border-accent-primary text-[14px] appearance-none"
                                >
                                    <option>India</option>
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                </select>
                            </div>
                            <div className="relative group flex-1">
                                <span className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-text-muted z-10">
                                    State / Region
                                </span>
                                <select
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full h-12 px-3 bg-[#FCFCFD] border border-[#D0D5DD] rounded-md outline-none focus:border-accent-primary text-[14px] appearance-none cursor-pointer"
                                >
                                    {formData.country === 'India' ? (
                                        INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)
                                    ) : (
                                        <>
                                            <option>Delhi</option>
                                            <option>Maharashtra</option>
                                            <option>Karnataka</option>
                                            <option>Texas</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>


                        {/* Campus Media & Facilities Uploads */}
                        <div className="pt-4 border-t border-border-color mt-4">
                            <h3 className="text-[15px] font-bold text-text-primary mb-4">Campus Facilities & Media</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Logo */}
                                <div>
                                    <span className="block text-[11px] font-semibold text-text-primary mb-1">University Logo *</span>
                                    <label className="flex flex-col items-center justify-center w-full h-20 px-2 bg-bg-secondary border border-dashed border-[#D0D5DD] rounded-md cursor-pointer hover:border-accent-primary transition-all overflow-hidden text-center">
                                        <span className="text-accent-primary text-[12px] font-semibold">Upload Logo</span>
                                        <span className="text-text-muted text-[10px]">PNG/JPG (Max 5MB)</span>
                                        <input ref={logoRef} type="file" accept="image/*" required className="hidden" />
                                    </label>
                                </div>
                                {/* Departments */}
                                <div>
                                    <span className="block text-[11px] font-semibold text-text-primary mb-1">Department Buildings</span>
                                    <label className="flex flex-col items-center justify-center w-full h-20 px-2 bg-bg-secondary border border-dashed border-[#D0D5DD] rounded-md cursor-pointer hover:border-accent-primary transition-all overflow-hidden text-center">
                                        <span className="text-accent-primary text-[12px] font-semibold">Upload Images</span>
                                        <span className="text-text-muted text-[10px]">Multiple Allowed</span>
                                        <input ref={departmentsRef} type="file" accept="image/*" multiple className="hidden" />
                                    </label>
                                </div>
                                {/* Labs */}
                                <div>
                                    <span className="block text-[11px] font-semibold text-text-primary mb-1">Laboratories</span>
                                    <label className="flex flex-col items-center justify-center w-full h-20 px-2 bg-bg-secondary border border-dashed border-[#D0D5DD] rounded-md cursor-pointer hover:border-accent-primary transition-all overflow-hidden text-center">
                                        <span className="text-accent-primary text-[12px] font-semibold">Upload Images</span>
                                        <span className="text-text-muted text-[10px]">Multiple Allowed</span>
                                        <input ref={labsRef} type="file" accept="image/*" multiple className="hidden" />
                                    </label>
                                </div>
                                {/* Sports Area */}
                                <div>
                                    <span className="block text-[11px] font-semibold text-text-primary mb-1">Sports Area</span>
                                    <label className="flex flex-col items-center justify-center w-full h-20 px-2 bg-bg-secondary border border-dashed border-[#D0D5DD] rounded-md cursor-pointer hover:border-accent-primary transition-all overflow-hidden text-center">
                                        <span className="text-accent-primary text-[12px] font-semibold">Upload Images</span>
                                        <span className="text-text-muted text-[10px]">Multiple Allowed</span>
                                        <input ref={sportsRef} type="file" accept="image/*" multiple className="hidden" />
                                    </label>
                                </div>
                                {/* Auditorium */}
                                <div className="sm:col-span-2">
                                    <span className="block text-[11px] font-semibold text-text-primary mb-1">Auditorium / Halls</span>
                                    <label className="flex flex-col items-center justify-center w-full h-20 px-2 bg-bg-secondary border border-dashed border-[#D0D5DD] rounded-md cursor-pointer hover:border-accent-primary transition-all overflow-hidden text-center">
                                        <span className="text-accent-primary text-[12px] font-semibold">Upload Images</span>
                                        <span className="text-text-muted text-[10px]">Multiple Allowed</span>
                                        <input ref={auditoriumRef} type="file" accept="image/*" multiple className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Affiliation / Contract Document */}
                        <div className="pt-4 border-t border-border-color mt-2">
                            <span className="block text-[13px] font-semibold text-text-primary mb-2">University Affiliation & Contract Upload *</span>
                            <div className="relative group">
                                <label className="flex flex-col items-center justify-center w-full h-24 px-4 bg-[#FCFCFD] border-2 border-dashed border-[#D0D5DD] rounded-md cursor-pointer hover:border-accent-primary hover:bg-[#f0f6ff]/30 transition-all">
                                    <span className="text-accent-primary text-[13px] font-semibold mb-1">Click to upload document</span>
                                    <span className="text-text-muted text-[11px]">Attach verification & accreditation proofs (PDF/ZIP up to 20MB)</span>
                                    <input ref={affiliationDocRef} type="file" required className="hidden" onChange={handleDocChange} />
                                </label>
                                {docPreviewName && (
                                    <div className="mt-3 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded flex justify-between items-center text-sm">
                                        <span className="truncate text-[#166534] font-medium max-w-[70%]">📄 {docPreviewName}</span>
                                        {docBase64 && docBase64.startsWith('data:image/') && (
                                            <img src={docBase64} alt="preview" className="h-8 max-w-16 object-contain rounded border border-gray-200 shadow-sm" />
                                        )}
                                        {docBase64 && docBase64.startsWith('data:application/pdf') && (
                                            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded">PDF Preview Configured</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-[12px] text-text-muted mt-4">
                            Your university data will be securely stored in our Asia Pacific data centers.
                        </p>

                        <label className="flex items-start gap-3 mt-4 cursor-pointer">
                            <input
                                type="checkbox"
                                required
                                checked={formData.agreed}
                                onChange={e => setFormData({ ...formData, agreed: e.target.checked })}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#3b82f6] focus:ring-[#3b82f6]"
                            />
                            <span className="text-[13px] text-text-primary leading-snug">
                                I agree to the <a href="#" className="font-semibold hover:underline">Terms of Service</a> and <a href="#" className="font-semibold hover:underline">Privacy Policy</a>.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={!formData.agreed || isLoading}
                            className={`w-full h-12 mt-6 bg-[#3b82f6] text-white font-semibold text-[15px] rounded-md hover:bg-[#2563eb] transition-colors ${
                                (!formData.agreed || isLoading) ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? 'Uploading...' : 'Submit for Verification'}
                        </button>
                    </form>

                    <div className="mt-8 text-center sm:text-left">
                        <span className="text-[14px] text-text-secondary">
                            Already have an account? <Link to="/login" className="text-[#3b82f6] font-semibold hover:underline ml-1">Sign in</Link>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
