import BASE_URL from '../config/api';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Globe, CheckCircle2, Crown, BookOpen, Camera, ChevronRight, ChevronLeft, ShieldCheck, Mail, Lock, Phone, MapPin, Navigation, Check, FileText, X, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import { ImageCropperModal } from '../components/Common/ImageCropperModal';
import { GlorifiedImagePreview } from '../components/Common/GlorifiedImagePreview';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const WIZARD_STEPS = [
    { id: 1, title: 'Institution Basics', description: 'Core contact details', icon: <Building2 size={20} /> },
    { id: 2, title: 'Location & Plan', description: 'Address & subscription', icon: <Globe size={20} /> },
    { id: 3, title: 'Campus Media', description: 'Photos & facilities', icon: <Camera size={20} /> },
    { id: 4, title: 'Verification', description: 'Legal documents', icon: <ShieldCheck size={20} /> }
];

const Signup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialPlan = searchParams.get('plan') || 'autonomous';

    // Wizard State
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        universityName: '',
        email: '',
        password: '',
        confirmPassword: '',
        countryCode: '+91',
        phone: '',
        address: '',
        country: 'India',
        state: 'Delhi',
        plan: initialPlan,
        agreed: false
    });

    // Per-field OTP State
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtpVerified, setEmailOtpVerified] = useState(false);
    const [emailOtpValue, setEmailOtpValue] = useState('');
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
    const [phoneOtpValue, setPhoneOtpValue] = useState('');
    const [otpLoading, setOtpLoading] = useState<'email' | 'phone' | null>(null);
    const [otpError, setOtpError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [emailResendTimer, setEmailResendTimer] = useState(0);
    const [phoneResendTimer, setPhoneResendTimer] = useState(0);
    const emailTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const phoneTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startEmailTimer = () => {
        setEmailResendTimer(120);
        if (emailTimerRef.current) clearInterval(emailTimerRef.current);
        emailTimerRef.current = setInterval(() => {
            setEmailResendTimer(t => { if (t <= 1) { clearInterval(emailTimerRef.current!); return 0; } return t - 1; });
        }, 1000);
    };
    const startPhoneTimer = () => {
        setPhoneResendTimer(120);
        if (phoneTimerRef.current) clearInterval(phoneTimerRef.current);
        phoneTimerRef.current = setInterval(() => {
            setPhoneResendTimer(t => { if (t <= 1) { clearInterval(phoneTimerRef.current!); return 0; } return t - 1; });
        }, 1000);
    };
    useEffect(() => () => { if (emailTimerRef.current) clearInterval(emailTimerRef.current); if (phoneTimerRef.current) clearInterval(phoneTimerRef.current); }, []);

    const [applicationSent, setApplicationSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    interface FacilityImage { file: File; facilityName: string; }
    interface VerificationDoc { file: File; docName: string; base64: string; }

    const [verificationDocs, setVerificationDocs] = useState<VerificationDoc[]>([]);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [departmentsFiles, setDepartmentsFiles] = useState<FacilityImage[]>([]);
    const [labsFiles, setLabsFiles] = useState<FacilityImage[]>([]);
    const [sportsFiles, setSportsFiles] = useState<FacilityImage[]>([]);
    const [auditoriumFiles, setAuditoriumFiles] = useState<FacilityImage[]>([]);

    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState('');
    const [cropFileName, setCropFileName] = useState('cropped-image.jpg');
    const [activeCropField, setActiveCropField] = useState<'logo' | 'departments' | 'labs' | 'sports' | 'auditorium' | null>(null);

    // Name-prompt state
    const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
    const [namePromptOpen, setNamePromptOpen] = useState(false);
    const [facilityNameInput, setFacilityNameInput] = useState('');

    const [pendingDocFile, setPendingDocFile] = useState<File | null>(null);
    const [docNamePromptOpen, setDocNamePromptOpen] = useState(false);
    const [docNameInput, setDocNameInput] = useState('');

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'departments' | 'labs' | 'sports' | 'auditorium') => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setCropFileName(file.name);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImageSrc(reader.result?.toString() || '');
                setActiveCropField(field);
                setCropperOpen(true);
            });
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleCropComplete = (file: File) => {
        if (activeCropField === 'logo') {
            setLogoFile(file);
        } else {
            setPendingCropFile(file);
            setFacilityNameInput('');
            setNamePromptOpen(true);
        }
    };

    const handleFacilityNameConfirm = () => {
        if (!pendingCropFile) return;
        const entry: FacilityImage = { file: pendingCropFile, facilityName: facilityNameInput.trim() || 'Unnamed' };
        switch (activeCropField) {
            case 'departments': setDepartmentsFiles(p => [...p, entry]); break;
            case 'labs': setLabsFiles(p => [...p, entry]); break;
            case 'sports': setSportsFiles(p => [...p, entry]); break;
            case 'auditorium': setAuditoriumFiles(p => [...p, entry]); break;
        }
        setPendingCropFile(null);
        setNamePromptOpen(false);
        setFacilityNameInput('');
    };

    const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingDocFile(file);
            setDocNameInput('');
            setDocNamePromptOpen(true);
            e.target.value = '';
        }
    };

    const handleDocNameConfirm = () => {
        if (!pendingDocFile) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const entry: VerificationDoc = {
                file: pendingDocFile,
                docName: docNameInput.trim() || pendingDocFile.name,
                base64: reader.result as string
            };
            setVerificationDocs(p => [...p, entry]);
            setPendingDocFile(null);
            setDocNamePromptOpen(false);
            setDocNameInput('');
        };
        reader.readAsDataURL(pendingDocFile);
    };

    const handleSendEmailOtp = async () => {
        if (!formData.email) { setOtpError('Please enter your email first.'); return; }
        setOtpLoading('email'); setOtpError('');
        try {
            const res = await fetch(BASE_URL + '/api/university/send-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, type: 'email' })
            });
            if (res.ok) { setEmailOtpSent(true); startEmailTimer(); }
            else { const j = await res.json(); setOtpError(j.message || 'Failed to send email OTP.'); }
        } catch { setOtpError('Could not connect to server.'); }
        finally { setOtpLoading(null); }
    };

    const handleVerifyEmailOtp = async () => {
        if (!emailOtpValue) { setOtpError('Please enter the email OTP.'); return; }
        setOtpLoading('email'); setOtpError('');
        try {
            const res = await fetch(BASE_URL + '/api/university/verify-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, emailOtp: emailOtpValue })
            });
            const j = await res.json();
            if (res.ok) { setEmailOtpVerified(true); setOtpError(''); }
            else setOtpError(j.message || 'Invalid email OTP.');
        } catch { setOtpError('Could not connect to server.'); }
        finally { setOtpLoading(null); }
    };

    const handleSendPhoneOtp = async () => {
        if (!formData.phone) { setOtpError('Please enter your phone number first.'); return; }
        setOtpLoading('phone'); setOtpError('');
        try {
            const res = await fetch(BASE_URL + '/api/university/send-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `${formData.countryCode}${formData.phone}`, type: 'phone' })
            });
            if (res.ok) { setPhoneOtpSent(true); startPhoneTimer(); }
            else { const j = await res.json(); setOtpError(j.message || 'Failed to send phone OTP.'); }
        } catch { setOtpError('Could not connect to server.'); }
        finally { setOtpLoading(null); }
    };

    const handleVerifyPhoneOtp = async () => {
        if (!phoneOtpValue) { setOtpError('Please enter the phone OTP.'); return; }
        setOtpLoading('phone'); setOtpError('');
        try {
            const phone = `${formData.countryCode}${formData.phone}`;
            const res = await fetch(BASE_URL + '/api/university/verify-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, phoneOtp: phoneOtpValue })
            });
            const j = await res.json();
            if (res.ok) { setPhoneOtpVerified(true); setOtpError(''); }
            else setOtpError(j.message || 'Invalid phone OTP.');
        } catch { setOtpError('Could not connect to server.'); }
        finally { setOtpLoading(null); }
    };

    const validateStep = () => {
        if (currentStep === 1) {
            if (!formData.universityName || !formData.email || !formData.password || !formData.phone) {
                alert('Please fill in all required fields to continue.');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                alert('Passwords do not match.');
                return false;
            }
            if (!emailOtpVerified || !phoneOtpVerified) {
                alert('Please verify both your email and phone number via OTP before proceeding.');
                return false;
            }
        }
        if (currentStep === 2) {
            if (!formData.address) {
                alert('Please provide the complete address.');
                return false;
            }
        }
        if (currentStep === 3) {
            if (!logoFile) {
                alert('University Logo is required.');
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            setCurrentStep(p => Math.min(p + 1, 4));
        }
    };

    const prevStep = () => {
        setCurrentStep(p => Math.max(p - 1, 1));
    };

    const handleSubmit = async () => {
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

        if (logoFile) data.append('logo', logoFile);

        verificationDocs.forEach(({ file, docName }) => {
            data.append('affiliationDocs', file);
            data.append('affiliationDocNames', docName);
        });

        departmentsFiles.forEach(({ file, facilityName }) => {
            data.append('departments', file);
            data.append('departmentNames', facilityName);
        });
        labsFiles.forEach(({ file, facilityName }) => {
            data.append('labs', file);
            data.append('labNames', facilityName);
        });
        sportsFiles.forEach(({ file, facilityName }) => {
            data.append('sports', file);
            data.append('sportsNames', facilityName);
        });
        auditoriumFiles.forEach(({ file, facilityName }) => {
            data.append('auditorium', file);
            data.append('auditoriumNames', facilityName);
        });

        try {
            const res = await fetch(BASE_URL + '/api/university/register', {
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
                <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-emerald-100 shadow-xl text-center animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-sm border border-emerald-100">
                        <CheckCircle2 size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted</h2>
                    <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
                        Your university details and affiliation contracts have been securely submitted. Our team will verify your documents shortly.
                    </p>
                    <p className="text-gray-500 text-[14px] leading-relaxed mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        Upon successful verification, Superadmin credentials will be issued to your email. You will then be able to access the Administration modules.
                    </p>
                    <Link to="/" className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-[15px] rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden font-body">

            {/* Sidebar (Step Indicator) */}
            <div className="w-80 bg-slate-900 text-white hidden md:flex flex-col flex-shrink-0 relative">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-blue-400 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm text-blue-400">
                        <BookOpen size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-[18px] font-bold tracking-tight">All Campus Digital</span>
                </div>

                <div className="flex-1 px-8 py-10 mt-6">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Registration Progress</h3>

                    <div className="relative">
                        {/* Vertical Connecting Line */}
                        <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-800 z-0 hidden md:block" />

                        <div className="space-y-8 relative z-10">
                            {WIZARD_STEPS.map((step, idx) => {
                                const isCompleted = currentStep > step.id;
                                const isCurrent = currentStep === step.id;

                                return (
                                    <div key={step.id} className="relative flex items-start gap-4 group">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${isCompleted ? 'bg-blue-500 border-blue-500 text-white' :
                                            isCurrent ? 'bg-slate-900 border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.3)]' :
                                                'bg-slate-900 border-slate-700 text-slate-500'
                                            }`}>
                                            {isCompleted ? <CheckCircle2 size={16} strokeWidth={3} /> : <span className="text-sm font-bold">{step.id}</span>}
                                        </div>
                                        <div className={`flex flex-col mt-1 transition-colors duration-300 ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                                            <span className={`text-[15px] font-bold ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                                                {step.title}
                                            </span>
                                            <span className="text-[12px] mt-0.5 opacity-80">{step.description}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Decorative Bottom Graphic */}
                <div className="mt-auto p-8 opacity-20">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-32">
                        <path d="M0 100 V 60 Q 25 40 50 60 T 100 60 V 100" />
                        <path d="M0 100 V 70 Q 25 50 50 70 T 100 70 V 100" />
                    </svg>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative bg-[#f8fafc] overflow-y-auto">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <BookOpen size={20} className="text-blue-600" />
                        <span className="font-bold">Registration</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">Step {currentStep} of 4</span>
                </div>

                <div className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-12 lg:p-16 flex flex-col justify-center min-h-full animate-fade-in">

                    {/* Header for Current Step */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                            {WIZARD_STEPS[currentStep - 1].icon}
                            {WIZARD_STEPS[currentStep - 1].title}
                        </h2>
                        <p className="text-slate-500 text-[15px]">
                            {currentStep === 1 && 'Institute Basic Login Information'}
                            {currentStep === 2 && "Where is your institution located and what subscription plan works best?"}
                            {currentStep === 3 && "Showcase your campus. Upload the logo and photos of key facilities."}
                            {currentStep === 4 && "Final step! Upload your affiliation documents for verification."}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">

                        {/* ── STEP 1: BASICS ── */}
                        {currentStep === 1 && (
                            <div className="space-y-5 animate-fade-in">

                                {/* Section heading */}
                                <div className="pb-2 border-b border-slate-100">
                                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Institute Basic Login Information</p>
                                </div>

                                {/* University Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-700">University Name *</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.universityName}
                                            onChange={e => setFormData({ ...formData, universityName: e.target.value })}
                                            className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[15px] transition-all"
                                            placeholder="e.g. Delhi University"
                                        />
                                    </div>
                                </div>

                                {/* Email with inline Verify link */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-700">Official Email *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => { setFormData({ ...formData, email: e.target.value }); setEmailOtpSent(false); setEmailOtpVerified(false); setEmailOtpValue(''); setEmailResendTimer(0); }}
                                            disabled={emailOtpVerified}
                                            className="w-full h-12 pl-10 pr-24 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[15px] transition-all disabled:opacity-60"
                                            placeholder="admin@university.edu"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {emailOtpVerified ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-bold text-[12px]">
                                                    <CheckCircle2 size={14} /> Verified
                                                </span>
                                            ) : otpLoading === 'email' ? (
                                                <Loader2 size={15} className="animate-spin text-blue-500" />
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleSendEmailOtp}
                                                    disabled={!formData.email}
                                                    className="text-blue-600 text-[13px] font-bold underline underline-offset-2 hover:text-blue-800 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {emailOtpSent ? 'Resend' : 'Verify'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Email OTP input — slides in after send */}
                                    {emailOtpSent && !emailOtpVerified && (
                                        <div className="space-y-1.5 animate-fade-in">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                                    <input
                                                        type="text"
                                                        maxLength={6}
                                                        autoFocus
                                                        value={emailOtpValue}
                                                        onChange={e => setEmailOtpValue(e.target.value.replace(/\D/g, ''))}
                                                        onKeyDown={e => e.key === 'Enter' && emailOtpValue.length === 6 && handleVerifyEmailOtp()}
                                                        placeholder="Enter 6-digit OTP"
                                                        className="w-full h-11 pl-9 pr-4 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[15px] font-mono tracking-widest"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyEmailOtp}
                                                    disabled={otpLoading === 'email' || emailOtpValue.length !== 6}
                                                    className="px-5 h-11 rounded-xl bg-blue-600 text-white font-bold text-[13px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 transition-all"
                                                >
                                                    {otpLoading === 'email' ? <Loader2 size={14} className="animate-spin" /> : null}
                                                    Confirm
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                <span>OTP sent to email (check server terminal)</span>
                                                {emailResendTimer > 0 ? (
                                                    <span className="text-slate-500 font-semibold ml-auto">Resend in {emailResendTimer}s</span>
                                                ) : (
                                                    <button type="button" onClick={handleSendEmailOtp} className="ml-auto text-blue-600 font-bold underline underline-offset-2 hover:text-blue-800">
                                                        Resend OTP
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Phone with inline Verify link */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-700">Phone Number *</label>
                                    <div className="flex gap-2">
                                        <div className="relative w-28 shrink-0">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                            <select
                                                value={formData.countryCode}
                                                onChange={e => { setFormData({ ...formData, countryCode: e.target.value }); setPhoneOtpSent(false); setPhoneOtpVerified(false); setPhoneOtpValue(''); setPhoneResendTimer(0); }}
                                                disabled={phoneOtpVerified}
                                                className="w-full h-12 pl-8 pr-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-[13px] appearance-none cursor-pointer disabled:opacity-60"
                                            >
                                                <option value="+91">+91 IN</option>
                                                <option value="+1">+1 US</option>
                                                <option value="+44">+44 UK</option>
                                            </select>
                                        </div>
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => { setFormData({ ...formData, phone: e.target.value }); setPhoneOtpSent(false); setPhoneOtpVerified(false); setPhoneOtpValue(''); setPhoneResendTimer(0); }}
                                                disabled={phoneOtpVerified}
                                                className="w-full h-12 pl-10 pr-24 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[15px] transition-all disabled:opacity-60"
                                                placeholder="10-digit number"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {phoneOtpVerified ? (
                                                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-[12px]">
                                                        <CheckCircle2 size={14} /> Verified
                                                    </span>
                                                ) : otpLoading === 'phone' ? (
                                                    <Loader2 size={15} className="animate-spin text-blue-500" />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleSendPhoneOtp}
                                                        disabled={formData.phone.length < 10}
                                                        className="text-blue-600 text-[13px] font-bold underline underline-offset-2 hover:text-blue-800 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {phoneOtpSent ? 'Resend' : 'Verify'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Phone OTP input — slides in after send */}
                                    {phoneOtpSent && !phoneOtpVerified && (
                                        <div className="space-y-1.5 animate-fade-in">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                                    <input
                                                        type="text"
                                                        maxLength={6}
                                                        autoFocus
                                                        value={phoneOtpValue}
                                                        onChange={e => setPhoneOtpValue(e.target.value.replace(/\D/g, ''))}
                                                        onKeyDown={e => e.key === 'Enter' && phoneOtpValue.length === 6 && handleVerifyPhoneOtp()}
                                                        placeholder="Enter 6-digit OTP"
                                                        className="w-full h-11 pl-9 pr-4 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[15px] font-mono tracking-widest"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyPhoneOtp}
                                                    disabled={otpLoading === 'phone' || phoneOtpValue.length !== 6}
                                                    className="px-5 h-11 rounded-xl bg-blue-600 text-white font-bold text-[13px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 transition-all"
                                                >
                                                    {otpLoading === 'phone' ? <Loader2 size={14} className="animate-spin" /> : null}
                                                    Confirm
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                <span>OTP sent to phone (check server terminal)</span>
                                                {phoneResendTimer > 0 ? (
                                                    <span className="text-slate-500 font-semibold ml-auto">Resend in {phoneResendTimer}s</span>
                                                ) : (
                                                    <button type="button" onClick={handleSendPhoneOtp} className="ml-auto text-blue-600 font-bold underline underline-offset-2 hover:text-blue-800">
                                                        Resend OTP
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {otpError && <p className="text-[12px] text-red-500 font-medium bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{otpError}</p>}

                                {/* Password at the bottom */}
                                <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-slate-700">Admin Password *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full h-12 pl-10 pr-11 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[15px] transition-all"
                                                placeholder="Create a strong password"
                                            />
                                            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-slate-700">Confirm Password *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className={`w-full h-12 pl-10 pr-11 bg-slate-50 border rounded-xl outline-none focus:ring-2 text-[15px] transition-all ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                                                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                                                    }`}
                                                placeholder="Re-enter your password"
                                            />
                                            <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                            <p className="text-[12px] text-red-500 font-medium">Passwords do not match</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: LOCATION & PLAN ── */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-700">Complete Address *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <textarea
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full h-24 pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[15px] transition-all resize-none"
                                            placeholder="Full street address, building number, etc."
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <label className="text-[13px] font-bold text-slate-700">Country</label>
                                        <select
                                            value={formData.country}
                                            onChange={e => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[15px] appearance-none cursor-pointer"
                                        >
                                            <option>India</option>
                                            <option>United States</option>
                                            <option>United Kingdom</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        <label className="text-[13px] font-bold text-slate-700">State / Region</label>
                                        <select
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[15px] appearance-none cursor-pointer"
                                        >
                                            {formData.country === 'India' ? (
                                                INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)
                                            ) : (
                                                <>
                                                    <option>Delhi</option>
                                                    <option>Texas</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 mt-2 border-t border-slate-100">
                                    <label className="text-[13px] font-bold text-slate-700 block mb-3">Selected Plan</label>
                                    {searchParams.get('duration') === '5year' ? (
                                        <div className="border-2 border-amber-400 bg-amber-50 p-5 rounded-xl flex items-center justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200 to-amber-500 opacity-20 rounded-bl-full" />
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white shadow-md">
                                                    <Crown size={24} className="fill-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[18px] font-black text-amber-900 capitalize tracking-tight">{formData.plan} Plan</h4>
                                                    <span className="text-[13px] font-bold text-amber-700 uppercase tracking-wider">5-Year Premium Access</span>
                                                </div>
                                            </div>
                                            <CheckCircle2 size={28} className="text-amber-500 relative z-10" />
                                        </div>
                                    ) : (
                                        <div className="border-2 border-blue-200 bg-blue-50 p-5 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700">
                                                    <Navigation size={22} />
                                                </div>
                                                <div>
                                                    <h4 className="text-[17px] font-bold text-blue-900 capitalize">{formData.plan} Plan</h4>
                                                    <span className="text-[13px] font-semibold text-blue-600 capitalize">{searchParams.get('duration') || 'Yearly'} Access</span>
                                                </div>
                                            </div>
                                            <CheckCircle2 size={28} className="text-blue-500" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: MEDIA ── */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Logo Upload */}
                                    <div className="md:col-span-2">
                                        <label className="text-[13px] font-bold text-slate-700 block mb-2">University Logo *</label>
                                        {!logoFile ? (
                                            <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                                                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2">
                                                    <Camera size={18} className="text-blue-500" />
                                                </div>
                                                <span className="text-blue-600 text-[14px] font-bold">Upload Logo Image</span>
                                                <span className="text-slate-400 text-[12px] mt-1">PNG, JPG up to 5MB</span>
                                                <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'logo')} className="hidden" />
                                            </label>
                                        ) : (
                                            <GlorifiedImagePreview file={logoFile} onRemove={() => setLogoFile(null)} title="University Logo" />
                                        )}
                                    </div>

                                    {/* Departments */}
                                    <div>
                                        <label className="text-[13px] font-bold text-slate-700 block mb-2">Departments / Blocks</label>
                                        <label className="flex items-center justify-center w-full h-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-all text-sm font-semibold text-slate-600 mb-3">
                                            + Add Photo
                                            <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'departments')} className="hidden" />
                                        </label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                            {departmentsFiles.map((item, i) => (
                                                <GlorifiedImagePreview key={i} file={item.file} title={item.facilityName} onRemove={() => setDepartmentsFiles(departmentsFiles.filter((_, idx) => idx !== i))} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Labs */}
                                    <div>
                                        <label className="text-[13px] font-bold text-slate-700 block mb-2">Laboratories</label>
                                        <label className="flex items-center justify-center w-full h-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-all text-sm font-semibold text-slate-600 mb-3">
                                            + Add Photo
                                            <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'labs')} className="hidden" />
                                        </label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                            {labsFiles.map((item, i) => (
                                                <GlorifiedImagePreview key={i} file={item.file} title={item.facilityName} onRemove={() => setLabsFiles(labsFiles.filter((_, idx) => idx !== i))} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sports */}
                                    <div>
                                        <label className="text-[13px] font-bold text-slate-700 block mb-2">Sports Facilities</label>
                                        <label className="flex items-center justify-center w-full h-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-all text-sm font-semibold text-slate-600 mb-3">
                                            + Add Photo
                                            <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'sports')} className="hidden" />
                                        </label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                            {sportsFiles.map((item, i) => (
                                                <GlorifiedImagePreview key={i} file={item.file} title={item.facilityName} onRemove={() => setSportsFiles(sportsFiles.filter((_, idx) => idx !== i))} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Auditorium */}
                                    <div>
                                        <label className="text-[13px] font-bold text-slate-700 block mb-2">Auditorium / Halls</label>
                                        <label className="flex items-center justify-center w-full h-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-all text-sm font-semibold text-slate-600 mb-3">
                                            + Add Photo
                                            <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'auditorium')} className="hidden" />
                                        </label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                            {auditoriumFiles.map((item, i) => (
                                                <GlorifiedImagePreview key={i} file={item.file} title={item.facilityName} onRemove={() => setAuditoriumFiles(auditoriumFiles.filter((_, idx) => idx !== i))} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 4: VERIFICATION ── */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-700 block">Affiliation / Certification Document *</label>
                                    <p className="text-xs text-slate-500 mb-3">Upload legal proof of institution status for manual verification by system admins.</p>

                                    <label className="flex items-center justify-center w-full h-14 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-all text-sm font-semibold text-slate-600 mb-4">
                                        + Add Document
                                        <input type="file" accept=".pdf,.zip,image/*" onChange={handleDocSelect} className="hidden" />
                                    </label>

                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                        {verificationDocs.map((doc, i) => (
                                            <div key={i} className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                        <FileText size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-[14px] font-bold text-emerald-800 truncate">{doc.docName}</p>
                                                        <p className="text-[12px] text-emerald-600 truncate max-w-[200px]">{doc.file.name}</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => setVerificationDocs(verificationDocs.filter((_, idx) => idx !== i))} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors shrink-0">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={formData.agreed}
                                                onChange={e => setFormData({ ...formData, agreed: e.target.checked })}
                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </div>
                                        <span className="text-[14px] text-slate-600 leading-relaxed">
                                            I solemnly declare that the information provided is accurate and I agree to the <a href="#" className="font-bold text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="font-bold text-blue-600 hover:underline">Privacy Policy</a> of All Campus Digital.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex items-center justify-between">
                        {currentStep > 1 ? (
                            <button
                                onClick={prevStep}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>
                        ) : <div></div>}

                        {currentStep < 4 ? (
                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.agreed || isLoading || verificationDocs.length === 0}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold transition-all ${(!formData.agreed || isLoading || verificationDocs.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                            >
                                {isLoading ? 'Submitting...' : 'Submit Registration'}
                            </button>
                        )}
                    </div>

                    {currentStep === 1 && (
                        <div className="mt-8 text-center">
                            <span className="text-[14px] text-slate-500 font-medium">
                                Already registered? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in instead</Link>
                            </span>
                        </div>
                    )}

                </div>
            </div>

            {/* Cropper Modal */}
            <ImageCropperModal
                isOpen={cropperOpen}
                onClose={() => setCropperOpen(false)}
                imageSrc={cropImageSrc}
                onCropComplete={handleCropComplete}
                fileName={cropFileName}
            />

            {/* Name Prompt Modal */}
            {namePromptOpen && pendingCropFile && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Camera size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-[16px]">
                                    Name this {
                                        activeCropField === 'departments' ? 'Department' :
                                            activeCropField === 'labs' ? 'Laboratory' :
                                                activeCropField === 'sports' ? 'Sports Facility' :
                                                    activeCropField === 'auditorium' ? 'Auditorium/Hall' : 'Facility'
                                    }
                                </h3>
                                <p className="text-slate-500 text-[13px]">Give a descriptive name for the uploaded image.</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <img
                                    src={URL.createObjectURL(pendingCropFile)}
                                    alt="Preview"
                                    className="h-16 w-24 object-cover rounded-lg border border-slate-300 shadow-sm"
                                />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cropped Image</p>
                                    <p className="text-[14px] font-semibold text-slate-700 truncate">{pendingCropFile.name}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-slate-700 mb-2">
                                    {
                                        activeCropField === 'departments' ? 'Department' :
                                            activeCropField === 'labs' ? 'Laboratory' :
                                                activeCropField === 'sports' ? 'Sports Facility' :
                                                    activeCropField === 'auditorium' ? 'Auditorium/Hall' : 'Facility'
                                    } Name *
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={facilityNameInput}
                                    onChange={e => setFacilityNameInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && facilityNameInput.trim() && handleFacilityNameConfirm()}
                                    placeholder={
                                        activeCropField === 'departments' ? 'e.g. Computer Science Block' :
                                            activeCropField === 'labs' ? 'e.g. Physics Research Lab' :
                                                activeCropField === 'sports' ? 'e.g. Olympic Swimming Pool' :
                                                    'e.g. Main Auditorium Hall'
                                    }
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-[15px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => { setNamePromptOpen(false); setPendingCropFile(null); }}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={!facilityNameInput.trim()}
                                onClick={handleFacilityNameConfirm}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Image
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Name Prompt Modal */}
            {docNamePromptOpen && pendingDocFile && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-[16px]">Name This Document</h3>
                                <p className="text-slate-500 text-[13px]">Give a descriptive name for the uploaded file.</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                                    <FileText className="text-slate-400" size={24} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selected File</p>
                                    <p className="text-[14px] font-semibold text-slate-700 truncate">{pendingDocFile.name}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-slate-700 mb-2">
                                    Document Name *
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={docNameInput}
                                    onChange={e => setDocNameInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && docNameInput.trim() && handleDocNameConfirm()}
                                    placeholder="e.g. AICTE Approval Letter"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-[15px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => { setDocNamePromptOpen(false); setPendingDocFile(null); }}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={!docNameInput.trim()}
                                onClick={handleDocNameConfirm}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup;
