import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LibraryBig, Building2, Globe, HeartPulse, GraduationCap, Microscope, BookOpen } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        universityName: '',
        email: '',
        password: '',
        countryCode: '+91',
        phone: '',
        country: 'India',
        state: 'Delhi',
        agreed: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock signup logic -> redirect to dashboard
        if (formData.agreed) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-white font-body flex overflow-hidden">
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
                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-border-color last:border-0 opacity-80 hover:opacity-100 transition-opacity">
                                <div className="mt-1 flex-shrink-0 text-text-secondary">{item.icon}</div>
                                <p className="text-[15px] leading-relaxed text-text-primary">
                                    <span className="font-semibold">{item.strong}</span> {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col pt-8 pb-12 px-6 sm:px-12 md:px-24 justify-center items-center lg:items-start overflow-y-auto">
                <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-8">
                    {/* Logo Header */}
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-9 h-9 border-2 border-accent-primary rounded-full flex items-center justify-center bg-white text-accent-primary p-1.5">
                            <BookOpen size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-text-primary leading-tight">Lumina</span>
                            <span className="text-[13px] font-bold text-text-secondary leading-none">URP</span>
                        </div>
                    </div>

                    <h2 className="text-[2rem] font-bold text-text-primary mb-8 tracking-tight">Let's get started</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    className="w-full h-12 px-3 bg-[#FCFCFD] border border-[#D0D5DD] rounded-md outline-none focus:border-accent-primary text-[14px] appearance-none"
                                >
                                    <option>Delhi</option>
                                    <option>Maharashtra</option>
                                    <option>Karnataka</option>
                                    <option>Texas</option>
                                </select>
                            </div>
                        </div>

                        <p className="text-[12px] text-text-muted mt-2">
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
                            disabled={!formData.agreed}
                            className="w-full h-12 mt-6 bg-[#3b82f6] text-white font-semibold text-[15px] rounded-md hover:bg-[#2563eb] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        >
                            Create your account
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
