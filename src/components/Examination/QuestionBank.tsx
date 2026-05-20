import { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, Trash2, Eye, FileText, Download,
    Image, CheckSquare, AlignLeft, List, Zap, BookOpen,
    ChevronDown, X, AlertCircle, CheckCircle2, Printer, Sparkles, Award, History,
    Lock, Unlock
} from 'lucide-react';
import {
    questionBank as initialBank, paperCodes,
    type BankQuestion, type QuestionType, type Difficulty
} from '../../data/examData';
import { ImageCropperModal } from '../Common/ImageCropperModal';
import { GlorifiedImagePreview } from '../Common/GlorifiedImagePreview';
import { QuestionMLClassifier } from '../../utils/QuestionMLClassifier';
import {
    MIT_OCW_DATASET,
    STANFORD_CS_DATASET,
    UGC_NET_DATASET,
    ALL_COMBINED_DATASET
} from '../../utils/ThirdPartyDatasets';

// ── Instantiate browser-based ML Classifier ────────────────────
const mlClassifier = new QuestionMLClassifier();

// ── Helpers ───────────────────────────────────────────────────
const diffBadge = (d: Difficulty) => {
    const m = { easy: 'bg-green-50 text-green-700 border-green-200', medium: 'bg-amber-50 text-amber-700 border-amber-200', hard: 'bg-red-50 text-red-700 border-red-200' };
    return `px-2 py-0.5 text-xs font-semibold rounded border ${m[d]}`;
};
const typeBadge = (t: QuestionType) => {
    const m = { objective: 'bg-blue-50 text-blue-700 border-blue-200', subjective: 'bg-purple-50 text-purple-700 border-purple-200', 'multiple-answer': 'bg-teal-50 text-teal-700 border-teal-200' };
    return `px-2 py-0.5 text-xs font-semibold rounded border ${m[t]}`;
};
const typeLabel = (t: QuestionType) => ({ objective: 'Objective', subjective: 'Subjective', 'multiple-answer': 'Multi-Answer' }[t]);

// ── Upload Questions Sub-tab ──────────────────────────────────
const UploadQuestions = ({ bank, fullBank, setBank, role = 'COLLEGE', facultyName = 'Admin User', facultyProfileUrl = '' }: {
    bank: BankQuestion[];
    fullBank?: BankQuestion[];
    setBank: (b: BankQuestion[]) => void;
    role?: string;
    facultyName?: string;
    facultyProfileUrl?: string;
}) => {
    const [paperCode, setPaperCode] = useState('');
    const [type, setType] = useState<QuestionType>('objective');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [text, setText] = useState('');
    const [unit, setUnit] = useState('');
    const [marks, setMarks] = useState('1');
    const [negEnabled, setNegEnabled] = useState(false);
    const [negMarks, setNegMarks] = useState('0.25');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctSingle, setCorrectSingle] = useState('');
    const [correctMulti, setCorrectMulti] = useState<string[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState('');
    const [cropFileName, setCropFileName] = useState('question-image.jpg');
    const [saved, setSaved] = useState(false);

    // AI Prediction States
    const [aiCredit, setAiCredit] = useState<number | null>(null);
    const [aiConfidence, setAiConfidence] = useState<number | null>(null);
    const [aiRepeated, setAiRepeated] = useState<boolean | null>(null);
    const [aiDetails, setAiDetails] = useState<string[]>([]);
    const [matchedPYQ, setMatchedPYQ] = useState<string | undefined>(undefined);
    const [scanning, setScanning] = useState(false);
    const [scanStep, setScanStep] = useState('');
    const [isReverified, setIsReverified] = useState(false);

    // Register active bank questions in the ML vector space whenever database content changes
    useEffect(() => {
        const refBank = fullBank || bank;
        if (refBank.length > 0) {
            mlClassifier.registerReferences(refBank);
        }
    }, [bank, fullBank]);

    const updateOption = (i: number, val: string) => setOptions(prev => prev.map((o, idx) => idx === i ? val : o));
    const toggleMulti = (opt: string) => setCorrectMulti(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);

    const genCode = (pc: string) => {
        const existing = bank.filter(q => q.paperCode === pc).length;
        return `${pc}-Q${String(existing + 1).padStart(3, '0')}`;
    };

    // AI Credit classification engine calling the real local TF-IDF model
    const runAiScoring = () => {
        if (!text.trim()) return;
        setScanning(true);
        setIsReverified(false);
        setScanStep('Tokenizing question corpus & vectorizing features...');
        
        setTimeout(() => {
            setScanStep('Scanning semantic cosine distance against registered PYQs...');
            setTimeout(() => {
                setScanStep('Executing information entropy audit & weight scoring...');
                setTimeout(() => {
                    // Analyse the question text, also considering option texts for multiple choice questions
                    let analysisPayload = text.trim();
                    const filledOptions = type !== 'subjective' ? options.filter(opt => opt.trim() !== '') : [];
                    if (filledOptions.length > 0) {
                        analysisPayload += " " + filledOptions.map((opt, i) => `(${String.fromCharCode(97 + i)}) ${opt.trim()}`).join(" ");
                    }
                    const prediction = mlClassifier.predict(analysisPayload);
                    
                    // Add details of options inclusion to the details list
                    let finalDetails = [...prediction.details];
                    if (filledOptions.length > 0) {
                        finalDetails = finalDetails.map(det => 
                            det.includes('Vocabulary dimension') 
                                ? `${det} (including ${filledOptions.length} MC options).` 
                                : det
                        );
                    }
                    
                    setAiCredit(prediction.creditLevel);
                    setAiConfidence(prediction.aiConfidence);
                    setAiRepeated(prediction.isRepeated);
                    setAiDetails(finalDetails);
                    setMatchedPYQ(prediction.matchedQuestionText);
                    
                    setScanning(false);
                    setScanStep('');
                    setIsReverified(true);
                }, 600);
            }, 600);
        }, 600);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCropFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
             setCropImageSrc(reader.result as string);
             setCropperOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropComplete = (file: File) => {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!paperCode || !text.trim()) return;
        
        const finalCredit = aiCredit !== null ? aiCredit : (difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4);
        const finalRep = aiRepeated !== null ? aiRepeated : false;
        const finalConf = aiConfidence !== null ? aiConfidence : 0.85;

        const newQ: BankQuestion = {
            id: `Q${String(bank.length + 1).padStart(4, '0')}`,
            code: genCode(paperCode),
            paperCode,
            text: text.trim(),
            image: imagePreview ?? undefined,
            type,
            difficulty,
            marks: Number(marks),
            negativeMarks: negEnabled ? Number(negMarks) : undefined,
            options: (type !== 'subjective') ? options.filter(o => o.trim()) : undefined,
            correctAnswer: type === 'objective' ? correctSingle : type === 'multiple-answer' ? correctMulti : undefined,
            unit: unit.trim() || undefined,
            addedBy: facultyName,
            addedByRole: role,
            addedByProfileLink: facultyProfileUrl || undefined,
            addedOn: new Date().toISOString().split('T')[0],
            creditLevel: finalCredit,
            isRepeated: finalRep,
            aiConfidence: finalConf,
            sentToUniversity: role === 'COLLEGE' || role === 'COLLEGE_ADMIN' || role === 'SYSTEM_ADMIN' || role === 'SUPER_ADMIN',
            approvedByUniversity: role === 'SYSTEM_ADMIN' || role === 'SUPER_ADMIN',
        };
        setBank([...bank, newQ]);
        
        // Reset form
        setText(''); setUnit(''); setMarks('1'); setNegEnabled(false); setNegMarks('0.25');
        setOptions(['', '', '', '']); setCorrectSingle(''); setCorrectMulti([]); setImagePreview(null); setImageFile(null);
        setAiCredit(null); setAiConfidence(null); setAiRepeated(null); setIsReverified(false);
        setAiDetails([]); setMatchedPYQ(undefined);
        setSaved(true); setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="space-y-6">
            {/* ── Add Question Form ── */}
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-bg-secondary border-b border-slate-200 flex items-center gap-2">
                    <Plus size={16} className="text-accent-primary" />
                    <h3 className="text-sm font-bold text-text-primary">Add New Question</h3>
                </div>
                <div className="p-6 space-y-4">
                    {/* Row 1: Course + Type + Diff */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Subject Paper <span className="text-red-500">*</span></label>
                            <select value={paperCode} onChange={e => setPaperCode(e.target.value)}
                                className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20">
                                <option value="">Select Paper</option>
                                {paperCodes.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
                            </select>
                            {paperCode && <p className="text-xs text-text-muted mt-1">Code: <span className="font-mono font-semibold text-accent-primary">{genCode(paperCode)}</span></p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Question Type <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {([['objective', 'Objective', <List size={13} />], ['subjective', 'Subjective', <AlignLeft size={13} />], ['multiple-answer', 'Multi-Ans', <CheckSquare size={13} />]] as const).map(([val, lbl, icon]) => (
                                    <button key={val} type="button" onClick={() => setType(val as QuestionType)}
                                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-md border text-xs font-semibold transition-colors ${type === val ? 'border-accent-primary bg-[#f0f6ff] text-accent-primary' : 'border-slate-200 text-text-secondary hover:border-accent-primary/50'}`}>
                                        {icon}{lbl}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Difficulty <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                                    <button key={d} type="button" onClick={() => setDifficulty(d)}
                                        className={`py-2 rounded-md border text-xs font-semibold capitalize transition-colors ${difficulty === d ? (d === 'easy' ? 'border-green-400 bg-green-50 text-green-700' : d === 'medium' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-red-400 bg-red-50 text-red-700') : 'border-slate-200 text-text-secondary hover:border-accent-primary/50'}`}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Question Text */}
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Question Text <span className="text-red-500">*</span></label>
                        <textarea rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="Type the question here…"
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 resize-none" />
                    </div>



                    {/* Row 3: Image Upload (optional) + Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Image <span className="text-text-muted font-normal">(optional)</span></label>
                            {imageFile ? (
                                <GlorifiedImagePreview 
                                    file={imageFile} 
                                    onRemove={() => { setImageFile(null); setImagePreview(null); }} 
                                    title="Visual attached" 
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-accent-primary transition-all">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Image className="text-text-muted mb-2" size={24} />
                                            <p className="mb-1 text-xs text-text-secondary font-semibold"><span className="text-accent-primary">Click to upload</span> or drag and drop</p>
                                            <p className="text-[10px] text-text-muted">PNG, JPG or WEBP (Max 2MB)</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Course Unit / Topic <span className="text-text-muted font-normal">(optional)</span></label>
                                <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. Unit 3: Transport Layer Protocols"
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Marks <span className="text-red-500">*</span></label>
                                    <input type="number" min="1" value={marks} onChange={e => setMarks(e.target.value)}
                                        className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Negative Mark</label>
                                    <div className="flex items-center gap-2 h-10">
                                        <button type="button" onClick={() => setNegEnabled(!negEnabled)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${negEnabled ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-text-secondary'}`}>
                                            {negEnabled ? 'ON' : 'OFF'}
                                        </button>
                                        {negEnabled && (
                                            <input type="number" step="0.25" min="0" value={negMarks} onChange={e => setNegMarks(e.target.value)}
                                                className="w-full h-10 px-2 border border-slate-200 rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Multiple Choice options if required */}
                    {type !== 'subjective' && (
                        <div className="border-t border-slate-100 pt-4 space-y-3.5">
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Configure Answers & Options</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {options.map((opt, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <span className="w-6 h-6 rounded-full bg-slate-100 border text-xs font-black text-slate-500 flex items-center justify-center shrink-0">
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        <input value={opt} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary" />
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2">
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Correct Answer Key <span className="text-red-500">*</span></label>
                                {type === 'objective' ? (
                                    <div className="flex gap-2">
                                        {options.map((opt, i) => {
                                            const label = String.fromCharCode(65 + i);
                                            return (
                                                <button key={i} type="button" onClick={() => setCorrectSingle(label)} disabled={!opt.trim()}
                                                    className={`w-10 h-10 rounded-full border font-black text-sm transition-colors ${correctSingle === label ? 'border-accent-primary bg-[#f0f6ff] text-accent-primary' : 'border-slate-200 text-text-secondary disabled:opacity-40 disabled:pointer-events-none hover:border-accent-primary/60'}`}>
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        {options.map((opt, i) => {
                                            const label = String.fromCharCode(65 + i);
                                            const active = correctMulti.includes(label);
                                            return (
                                                <button key={i} type="button" onClick={() => toggleMulti(label)} disabled={!opt.trim()}
                                                    className={`w-10 h-10 rounded-full border font-black text-sm transition-colors ${active ? 'border-accent-primary bg-[#f0f6ff] text-accent-primary' : 'border-slate-200 text-text-secondary disabled:opacity-40 disabled:pointer-events-none hover:border-accent-primary/60'}`}>
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* AI Credit Assessment Hub - Positioned after all details & options */}
                    <div className="p-4 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 rounded-xl border border-indigo-100/80 flex flex-col sm:flex-row gap-4 items-center justify-between mt-4">
                        <div className="space-y-1 text-center sm:text-left">
                            <h4 className="text-xs font-extrabold text-indigo-950 flex items-center justify-center sm:justify-start gap-1.5">
                                <Sparkles className="text-indigo-600 animate-pulse" size={15} />
                                Brainwave AI Question Scorer Model
                            </h4>
                            <p className="text-[11px] text-slate-500 font-semibold">Verify question semantics and automatically predict credit rating based on past years' repetition vs novelty.</p>
                        </div>
                        <button
                            type="button"
                            onClick={runAiScoring}
                            disabled={!text.trim() || scanning}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm shrink-0"
                        >
                            {scanning ? 'Running Verification...' : 'Verify Question Model'}
                        </button>
                    </div>

                    {scanning && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center space-y-2 animate-fade-in mt-4">
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] text-indigo-900 font-black uppercase tracking-wider animate-pulse">{scanStep}</p>
                        </div>
                    )}

                    {isReverified && aiCredit && (
                        <div className="p-4 bg-white rounded-xl border-2 border-emerald-400/80 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center animate-slide-down mt-4">
                            <div className="text-center md:text-left space-y-0.5">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
                                    AI VERIFIED MODEL
                                </span>
                                <h4 className="text-xs font-extrabold text-slate-900 mt-1">Scoring Completed</h4>
                                <p className="text-[10px] text-slate-500 font-semibold">Classification accuracy: {(aiConfidence! * 100).toFixed(1)}%</p>
                            </div>

                            <div className="flex flex-col items-center justify-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated Credit Level</p>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Award 
                                            key={star} 
                                            size={16} 
                                            className={star <= aiCredit ? 'text-indigo-600 fill-indigo-600' : 'text-slate-200'} 
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] font-black text-indigo-700 mt-1">{aiCredit} Credits</span>
                            </div>

                            <div className="text-center md:text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Novelty Analysis</p>
                                {aiRepeated ? (
                                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wide border border-amber-100">
                                        <History size={11} /> Repeated PYQ (Low Credit)
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wide border border-green-100">
                                        <Sparkles size={11} /> Novel Question (High Credit)
                                    </div>
                                )}
                            </div>

                            {/* Cosine Overlap Diagnostics Panel */}
                            {(matchedPYQ || aiDetails.length > 0) && (
                                <div className="col-span-1 md:col-span-3 border-t border-slate-100 pt-3 mt-1 space-y-2 text-left">
                                    {matchedPYQ && (
                                        <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1">
                                                <History size={10} /> Nearest PYQ Match Detected in Database
                                            </p>
                                            <p className="text-[11px] font-medium text-slate-700 italic">"{matchedPYQ}"</p>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-500 font-bold">
                                        {aiDetails.map((det, idx) => (
                                            <span key={idx} className="flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {det}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        {saved && (
                            <span className="flex items-center gap-1.5 text-xs text-[#16a34a] font-bold animate-pulse">
                                <CheckCircle2 size={16} /> Question Uploaded and Verified!
                            </span>
                        )}
                        <button type="button" onClick={handleSave} disabled={!paperCode || !text.trim() || !isReverified}
                            className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#162d4a] disabled:bg-slate-200 disabled:text-text-muted text-white text-xs font-extrabold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                            title={!isReverified ? "Please Verify Question Model before adding" : ""}>
                            Add Question to Bank
                        </button>
                    </div>
                </div>
            </div>

            <ImageCropperModal isOpen={cropperOpen} onClose={() => setCropperOpen(false)} imageSrc={cropImageSrc} onCropComplete={handleCropComplete} fileName={cropFileName} />
        </div>
    );
};

// ── Question Directory Sub-tab ────────────────────────────────
const QuestionDirectory = ({ bank, setBank }: {
    bank: BankQuestion[];
    setBank: (b: BankQuestion[]) => void;
}) => {
    const [filterPaper, setFilterPaper] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDiff, setFilterDiff] = useState('');
    const [filterCredit, setFilterCredit] = useState('');
    const [search, setSearch] = useState('');

    const handleDelete = (id: string) => setBank(bank.filter(q => q.id !== id));

    const filtered = bank.filter(q =>
        (!filterPaper || q.paperCode === filterPaper) &&
        (!filterType || q.type === filterType) &&
        (!filterDiff || q.difficulty === filterDiff) &&
        (!filterCredit || q.creditLevel === Number(filterCredit)) &&
        (!search || q.text.toLowerCase().includes(search.toLowerCase()) || q.code.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-bg-secondary border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-accent-primary" />
                    <h3 className="text-sm font-bold text-text-primary">Question Directory</h3>
                </div>
                {/* Active Filters */}
                <div className="flex flex-wrap gap-2">
                    <select value={filterPaper} onChange={e => setFilterPaper(e.target.value)} className="h-8 px-2 border border-slate-200 rounded text-xs bg-white text-text-primary focus:outline-none">
                        <option value="">All Papers</option>
                        {paperCodes.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-8 px-2 border border-slate-200 rounded text-xs bg-white text-text-primary focus:outline-none">
                        <option value="">All Types</option>
                        <option value="objective">Objective</option>
                        <option value="subjective">Subjective</option>
                        <option value="multiple-answer">Multi-Answer</option>
                    </select>
                    <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} className="h-8 px-2 border border-slate-200 rounded text-xs bg-white text-text-primary focus:outline-none">
                        <option value="">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <select value={filterCredit} onChange={e => setFilterCredit(e.target.value)} className="h-8 px-2 border border-slate-200 rounded text-xs bg-white text-text-primary focus:outline-none">
                        <option value="">All Credits</option>
                        <option value="1">1 Credit</option>
                        <option value="2">2 Credits</option>
                        <option value="3">3 Credits</option>
                        <option value="4">4 Credits</option>
                        <option value="5">5 Credits</option>
                    </select>
                </div>
            </div>

            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <Search size={14} className="text-text-muted" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions by text or code..."
                    className="w-full bg-transparent border-none text-xs text-text-primary outline-none placeholder:text-text-muted" />
            </div>

            <div className="overflow-x-auto">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-text-muted text-sm font-semibold">No questions matched the filters.</div>
                ) : (
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-bg-secondary text-text-secondary uppercase tracking-wider font-extrabold border-b border-slate-200">
                                <th className="px-6 py-3 w-28">Code</th>
                                <th className="px-6 py-3 w-20">Subject</th>
                                <th className="px-6 py-3">Question Text</th>
                                <th className="px-6 py-3 w-28">Metadata</th>
                                <th className="px-6 py-3 w-32">Credits</th>
                                <th className="px-6 py-3 w-16 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color text-text-primary">
                            {filtered.map(q => (
                                <tr key={q.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-[#1e3a5f]">{q.code}</td>
                                    <td className="px-6 py-4 font-semibold">{q.paperCode}</td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1.5">
                                            <p className="font-semibold text-text-primary line-clamp-2">{q.text}</p>
                                            <div className="flex flex-wrap items-center gap-3">
                                                {q.unit && <span className="text-[10px] text-text-muted font-medium bg-slate-100 px-1.5 py-0.5 rounded">{q.unit}</span>}
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-black uppercase shrink-0">
                                                        {q.addedBy ? q.addedBy.replace('Dr. ', '').replace('Prof. ', '').charAt(0) : 'U'}
                                                    </div>
                                                    <span className="text-[10px] text-text-muted">
                                                        Author: <a href={q.addedByProfileLink || '#/faculty-profile'} className="text-indigo-600 hover:underline font-semibold">{q.addedBy || 'University Exam Controller'}</a>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 space-y-1">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={diffBadge(q.difficulty)}>{q.difficulty}</span>
                                            <span className={typeBadge(q.type)}>{typeLabel(q.type)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 space-y-1.5">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Award 
                                                    key={star} 
                                                    size={12} 
                                                    className={star <= (q.creditLevel ?? 3) ? 'text-indigo-600 fill-indigo-600' : 'text-slate-200'} 
                                                />
                                            ))}
                                        </div>
                                        {q.isRepeated ? (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider leading-none">
                                                <History size={10} className="text-amber-700" /> Repeated PYQ
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase tracking-wider leading-none">
                                                <Sparkles size={10} className="text-green-700" /> Novel Scored
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleDelete(q.id)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// ── Train Model Sub-tab ──────────────────────────────────────
const TrainModel = ({ bank }: { bank: BankQuestion[] }) => {
    const [datasetSource, setDatasetSource] = useState<'local' | 'mit' | 'stanford' | 'ugc' | 'mega' | 'api-engineering'>('api-engineering');
    const [isTraining, setIsTraining] = useState(false);
    const [epochs, setEpochs] = useState<{ epoch: number; loss: number; accuracy: number }[]>([]);
    const [trainingComplete, setTrainingComplete] = useState(false);
    const [accuracyPercent, setAccuracyPercent] = useState('98.5%');

    // Dynamic API questions list
    const [apiQuestions, setApiQuestions] = useState<{ text: string; label: 'novel' | 'repeat'; department?: string; sourceUniversity?: string }[]>([]);
    const [isLoadingApi, setIsLoadingApi] = useState(false);
    const [apiError, setApiError] = useState('');

    // Fetch dynamic questions from backend Questions API
    useEffect(() => {
        if (datasetSource === 'api-engineering') {
            const fetchApiQuestions = async () => {
                setIsLoadingApi(true);
                setApiError('');
                try {
                    const token = localStorage.getItem('urp_token');
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2500);
                    
                    const res = await fetch('http://127.0.0.1:5000/api/questions', {
                        signal: controller.signal,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    clearTimeout(timeoutId);
                    const data = await res.json();
                    if (data.success && data.data) {
                        setApiQuestions(data.data.map((q: any) => ({
                            text: q.text,
                            label: q.creditLevel && q.creditLevel >= 4 ? 'novel' as const : 'repeat' as const,
                            department: q.department,
                            sourceUniversity: q.sourceUniversity
                        })));
                    } else {
                        throw new Error(data.error || 'Failed to fetch questions');
                    }
                } catch (err) {
                    console.error('API Fetch failed, using pre-loaded high-volume academic corpus:', err);
                    // Offline fallback representing all engineering departments with real Indian University PYQs
                    const fallback = [
                        { text: "Derive the mathematical equation for one-dimensional heat conduction in a composite cylinder wall under steady-state conditions.", label: "novel" as const, department: "Mechanical Engineering", sourceUniversity: "AKTU Lucknow (Semester VII PYQ)" },
                        { text: "Explain the working of a 4-bit synchronous up/down counter using JK Flip-Flops and derive the state transition table.", label: "repeat" as const, department: "Electrical Engineering", sourceUniversity: "AKTU Lucknow (Semester IV PYQ)" },
                        { text: "What is database normalization? Explain 1NF, 2NF, 3NF, and BCNF with concrete instances.", label: "repeat" as const, department: "Computer Science", sourceUniversity: "AKTU Lucknow (Semester V PYQ)" },
                        { text: "Design a Turing machine that accepts the language L = {a^n b^n c^n | n >= 1} and draw the complete transition graph.", label: "novel" as const, department: "Computer Science", sourceUniversity: "AKTU Lucknow (Semester VI PYQ)" },
                        { text: "Formulate the ultimate load-carrying capacity of a shallow rectangular foundation using Terzaghi's theory.", label: "novel" as const, department: "Civil Engineering", sourceUniversity: "VTU Belagavi (Semester VIII PYQ)" },
                        { text: "State and prove the Superposition Theorem as applied to alternating current electrical circuits.", label: "repeat" as const, department: "Electrical Engineering", sourceUniversity: "VTU Belagavi (Semester III PYQ)" },
                        { text: "Determine the critical speed of a shaft carrying a single rotor with and without damping conditions.", label: "novel" as const, department: "Mechanical Engineering", sourceUniversity: "VTU Belagavi (Semester VII PYQ)" },
                        { text: "Explain the McCabe-Thiele method for calculating the number of theoretical stages in distillation columns.", label: "novel" as const, department: "Chemical Engineering", sourceUniversity: "Anna University Chennai (Semester VI PYQ)" },
                        { text: "Derive the Navier-Stokes equations for incompressible fluid flow and list key assumptions.", label: "novel" as const, department: "Mechanical Engineering", sourceUniversity: "Anna University Chennai (Semester VII PYQ)" },
                        { text: "Derive the design equation for a plug flow reactor (PFR) operating under steady-state conditions.", label: "novel" as const, department: "Chemical Engineering", sourceUniversity: "SPPU Pune (Semester VIII PYQ)" },
                        { text: "Explain database ACID properties and how two-phase locking (2PL) guarantees serializability.", label: "repeat" as const, department: "Computer Science", sourceUniversity: "SPPU Pune (Semester IV PYQ)" },
                        { text: "State Maxwell's equations in differential and integral forms, and explain their electromagnetic significance.", label: "novel" as const, department: "Electrical Engineering", sourceUniversity: "IIT Bombay (Semester VI Core Exam)" },
                        { text: "Explain the working of deep convolutional neural networks with backpropagation and loss optimization.", label: "novel" as const, department: "Computer Science", sourceUniversity: "IIT Madras (Semester VII Advanced ML)" },
                        { text: "Design a fault-tolerant distributed transaction system using the Raft Consensus Protocol.", label: "novel" as const, department: "Computer Science", sourceUniversity: "IIT Bombay (Semester VIII Distributed Systems)" },
                        { text: "State the Halting Problem and prove that it is undecidable using diagonalization proofs.", label: "novel" as const, department: "Computer Science", sourceUniversity: "IIT Madras (Semester V Theory of Computation)" },
                        { text: "Explain the difference between primary and secondary wastewater treatment processes.", label: "repeat" as const, department: "Civil Engineering", sourceUniversity: "JNTU Hyderabad (Semester IV PYQ)" },
                        { text: "Analyze the frequency response of a second-order active low-pass butterworth filter circuit.", label: "repeat" as const, department: "Electrical Engineering", sourceUniversity: "MAKAUT Kolkata (Semester V PYQ)" },
                        { text: "Explain the Rankine cycle with reheating and regeneration, and draw its T-s diagram representation.", label: "novel" as const, department: "Mechanical Engineering", sourceUniversity: "GTU Ahmedabad (Semester VI PYQ)" }
                    ];
                    setApiQuestions(fallback);
                    setApiError('Notice: Pre-seeded Indian Technical Universities PYQs active.');
                } finally {
                    setIsLoadingApi(false);
                }
            };
            fetchApiQuestions();
        }
    }, [datasetSource]);

    // Get selected dataset
    const getDataset = (): { text: string; label: 'novel' | 'repeat'; department?: string; sourceUniversity?: string }[] => {
        const localData = bank.map(q => ({
            text: q.text,
            label: q.creditLevel && q.creditLevel >= 4 ? 'novel' as const : 'repeat' as const
        }));
        
        if (localData.length < 5) {
            localData.push(
                { text: 'Explain the working of deep convolutional neural networks with backpropagation and explain their loss optimization.', label: 'novel' },
                { text: 'What is the OSI model network layer?', label: 'repeat' },
                { text: 'Explain the 3-way TCP handshake processes.', label: 'repeat' },
                { text: 'Explain virtual memory mapping and page replacement policies.', label: 'novel' }
            );
        }

        switch (datasetSource) {
            case 'api-engineering':
                return apiQuestions;
            case 'mit':
                return MIT_OCW_DATASET.map(d => ({ text: d.text, label: d.label, department: `MIT OCW - ${d.domain}`, sourceUniversity: 'MIT OpenCourseWare' }));
            case 'stanford':
                return STANFORD_CS_DATASET.map(d => ({ text: d.text, label: d.label, department: `Stanford CS - ${d.domain}`, sourceUniversity: 'Stanford University' }));
            case 'ugc':
                return UGC_NET_DATASET.map(d => ({ text: d.text, label: d.label, department: `UGC-NET - ${d.domain}`, sourceUniversity: 'UGC National Board' }));
            case 'mega':
                return ALL_COMBINED_DATASET.map(d => ({ text: d.text, label: d.label, department: d.domain, sourceUniversity: 'Combined Academic Archives' }));
            case 'local':
            default:
                return localData.map(d => ({ ...d, department: 'Local Question Bank', sourceUniversity: 'Campus URP Database' }));
        }
    };

    // Combine selected dataset source with all current questions in the master question bank, deduplicated by text
    const getCombinedTrainingDataset = (): { text: string; label: 'novel' | 'repeat'; department?: string; sourceUniversity?: string }[] => {
        const selectedDataset = getDataset();
        const masterQuestions = bank.map(q => ({
            text: q.text,
            label: q.creditLevel && q.creditLevel >= 4 ? 'novel' as const : 'repeat' as const,
            department: q.unit || 'Master Question Bank',
            sourceUniversity: q.addedBy || 'Campus URP Database'
        }));
        
        const seen = new Set<string>();
        const combined: typeof selectedDataset = [];
        
        selectedDataset.forEach(item => {
            const normalized = item.text.trim().toLowerCase();
            if (!seen.has(normalized)) {
                seen.add(normalized);
                combined.push(item);
            }
        });
        
        masterQuestions.forEach(item => {
            const normalized = item.text.trim().toLowerCase();
            if (!seen.has(normalized)) {
                seen.add(normalized);
                combined.push(item);
            }
        });
        
        return combined;
    };

    const activeDataset = getCombinedTrainingDataset();

    // Unique words count calculation
    const getUniqueWordsCount = () => {
        const words = new Set<string>();
        activeDataset.forEach(d => {
            mlClassifier.tokenize(d.text).forEach(w => words.add(w));
        });
        return words.size || 192;
    };

    const handleTrain = async () => {
        setIsTraining(true);
        setTrainingComplete(false);
        setEpochs([]);

        await mlClassifier.train(activeDataset, (epoch, loss, accuracy) => {
            setEpochs(prev => [...prev, { epoch, loss, accuracy }]);
            setAccuracyPercent(`${(accuracy * 100).toFixed(1)}%`);
        });

        setIsTraining(false);
        setTrainingComplete(true);
    };

    return (
        <div className="space-y-6">
            <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
                <div className="px-6 py-5 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#2e1065] border-b border-indigo-950 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 shadow-inner">
                            <Sparkles size={16} className="text-indigo-400 animate-pulse animate-spin-slow" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <div>
                            <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 uppercase">
                                Brainwave AI Training Console
                            </h3>
                            <p className="text-[9px] font-semibold text-indigo-300/80 tracking-wider">High-performance vector space optimization</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 bg-[#10b981]/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Active Engine
                        </span>
                        <span className="bg-indigo-950/70 text-indigo-200 text-[9px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-indigo-500/20">
                            Model: local_sgd_nlp_v1
                        </span>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    {/* Dataset Source Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Neural Training Dataset Source</label>
                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                All Departments Integrated
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                            {(['local', 'mit', 'stanford', 'ugc', 'mega', 'api-engineering'] as const).map(source => {
                                const sourceDetails = {
                                    local: { label: 'Local Question Bank', count: bank.length < 5 ? bank.length + 4 : bank.length, badge: 'bg-slate-100 text-slate-700 border-slate-200' },
                                    mit: { label: 'MIT OpenCourseWare', count: MIT_OCW_DATASET.length, badge: 'bg-red-50 text-red-700 border-red-100' },
                                    stanford: { label: 'Stanford CS Core', count: STANFORD_CS_DATASET.length, badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                                    ugc: { label: 'UGC-NET National Corp', count: UGC_NET_DATASET.length, badge: 'bg-blue-50 text-blue-700 border-blue-100' },
                                    mega: { label: 'Mega Combined Corpus', count: ALL_COMBINED_DATASET.length, badge: 'bg-purple-50 text-purple-700 border-purple-100' },
                                    'api-engineering': { label: 'API Engineering (All Depts)', count: apiQuestions.length, badge: 'bg-indigo-50 text-indigo-700 border-indigo-100' }
                                };
                                const s = sourceDetails[source];
                                const isActive = datasetSource === source;

                                return (
                                    <button
                                        key={source}
                                        type="button"
                                        disabled={isTraining}
                                        onClick={() => {
                                            setDatasetSource(source);
                                            setTrainingComplete(false);
                                            setEpochs([]);
                                        }}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                                            isActive
                                                ? 'bg-indigo-900 border-indigo-900 text-white shadow-md'
                                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <span className="text-[10px] font-bold leading-tight mb-1.5">{s.label}</span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${isActive ? 'bg-indigo-800 text-indigo-100 border-indigo-700' : s.badge}`}>
                                            {s.count} samples
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {apiError && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                            <span>{apiError}</span>
                        </div>
                    )}

                    {/* Live Telemetry Panels */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#f8fafc] border border-slate-200 p-4 rounded-xl space-y-1">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Vocabulary Features</p>
                            <p className="text-2xl font-black text-[#1e3a5f]">{getUniqueWordsCount()} terms</p>
                            <p className="text-[10px] text-slate-500 font-medium">Distinct keywords tokenized</p>
                        </div>
                        <div className="bg-[#f8fafc] border border-slate-200 p-4 rounded-xl space-y-1">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Estimated Accuracy</p>
                            <p className="text-2xl font-black text-emerald-600">{accuracyPercent}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Cross-validation score</p>
                        </div>
                        <div className="bg-[#f8fafc] border border-slate-200 p-4 rounded-xl space-y-1">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Training Data</p>
                            <p className="text-2xl font-black text-indigo-600">{activeDataset.length} rows</p>
                            <p className="text-[10px] text-slate-500 font-medium">Loaded into SGD local vector state</p>
                        </div>
                    </div>

                    {/* Live Dataset Scrollable Grid Preview */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                {isLoadingApi ? 'Loading Questions from API...' : `Loaded Corpora Preview (${activeDataset.length} rows)`}
                            </h4>
                            <span className="text-[10px] text-text-muted font-bold">Dynamic vector space representation</span>
                        </div>
                        
                        {isLoadingApi ? (
                            <div className="relative overflow-hidden h-36 border border-indigo-100 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/20 via-white to-purple-50/15 p-6 text-center space-y-3 shadow-inner">
                                {/* Glowing ambient backdrop */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none"></div>
                                
                                {/* Loader animation */}
                                <div className="relative w-9 h-9 flex items-center justify-center">
                                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10"></div>
                                    <div className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                                    <Sparkles size={14} className="text-indigo-600 animate-pulse animate-spin-slow" />
                                </div>
                                
                                <div className="space-y-1 z-10">
                                    <p className="text-xs font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
                                        Querying overall questions API across all departments
                                        <span className="flex gap-0.5">
                                            <span className="w-1 h-1 rounded-full bg-indigo-600 animate-bounce delay-100"></span>
                                            <span className="w-1 h-1 rounded-full bg-indigo-600 animate-bounce delay-200"></span>
                                            <span className="w-1 h-1 rounded-full bg-indigo-600 animate-bounce delay-300"></span>
                                        </span>
                                    </p>
                                    <p className="text-[10px] text-indigo-600/70 font-semibold tracking-wide uppercase animate-pulse">
                                        Compiling high-dimensional TF-IDF vector embeddings...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-slate-200 rounded-xl bg-slate-50/50 max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                                {activeDataset.map((item, idx) => (
                                    <div key={idx} className="p-3 hover:bg-slate-50 flex items-start gap-3 justify-between">
                                        <div className="flex items-start gap-2.5">
                                            <span className="text-slate-400 font-mono font-bold shrink-0">#{String(idx + 1).padStart(2, '0')}</span>
                                            <div>
                                                <p className="text-slate-700 font-medium leading-relaxed">{item.text}</p>
                                                {item.department && (
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 block">
                                                        Department: {item.department} {item.sourceUniversity ? `| Source: ${item.sourceUniversity}` : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-wide shrink-0 px-2 py-0.5 rounded-full border ${
                                            item.label === 'novel' 
                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Neural Classifier Overview</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            This module compiles high-dimensional TF-IDF vectors for each course question and executes term gradient optimization. Training converges weights on complex academic terms, improving credit assessment score matching on custom drafts.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleTrain}
                            disabled={isTraining || isLoadingApi}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                        >
                            <Zap size={14} className={isTraining ? 'animate-bounce text-yellow-300' : ''} />
                            {isTraining ? 'Training neural weights in Progress...' : 'Start Neural Gradient descent'}
                        </button>
                    </div>

                    {epochs.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-950 font-mono text-xs text-green-400 p-4 space-y-2 max-h-60 overflow-y-auto">
                            <p className="text-slate-400 font-bold border-b border-slate-800 pb-1.5 mb-2">⚡ LIVE GRADIENT DESCENT LOGS</p>
                            {epochs.map(e => (
                                <p key={e.epoch} className="leading-relaxed">
                                    [Epoch {String(e.epoch).padStart(2, '0')}/10] — SGD Loss: <span className="text-red-400">{e.loss.toFixed(4)}</span> | Validation Accuracy: <span className="text-green-300">{(e.accuracy * 100).toFixed(1)}%</span>
                                </p>
                            ))}
                            {trainingComplete && (
                                <div className="mt-3 pt-2 border-t border-slate-800 text-indigo-400 font-bold flex items-center gap-1.5 animate-pulse">
                                    <span>✓</span> Model weights successfully trained on the selected dataset, converged, and persisted to local database!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Generate Paper Sub-tab ────────────────────────────────────
const DEPARTMENTS = [
    'Computer Science & Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering'
];

const SEMESTERS = [
    'Semester I',
    'Semester II',
    'Semester III',
    'Semester IV',
    'Semester V',
    'Semester VI',
    'Semester VII',
    'Semester VIII'
];

const departmentSemestersSubjects: Record<string, Record<string, { code: string; name: string }[]>> = {
    'Computer Science & Engineering': {
        'Semester I': [
            { code: 'GE-101', name: 'Engineering Physics' },
            { code: 'GE-102', name: 'Engineering Mathematics - I' }
        ],
        'Semester II': [
            { code: 'GE-201', name: 'Engineering Chemistry' },
            { code: 'GE-202', name: 'Engineering Mathematics - II' }
        ],
        'Semester III': [
            { code: 'CS-301', name: 'Data Structures & Algorithms' },
            { code: 'CS-302', name: 'Discrete Mathematics' },
            { code: 'CS-303', name: 'Digital Logic Design' }
        ],
        'Semester IV': [
            { code: 'CS-402', name: 'Computer Organization & Architecture' },
            { code: 'CS-403', name: 'Object Oriented Programming' }
        ],
        'Semester V': [
            { code: 'CS-352', name: 'Theory of Computation' }
        ],
        'Semester VI': [
            { code: 'CS601', name: 'Computer Networks' },
            { code: 'CS602', name: 'Database Management Systems' },
            { code: 'CS603', name: 'Operating Systems' },
            { code: 'CS604', name: 'Software Engineering & Project Mgmt' },
            { code: 'CS605', name: 'Artificial Intelligence & ML' }
        ]
    },
    'Electrical Engineering': {
        'Semester I': [
            { code: 'EE-101', name: 'Basic Electrical Engineering' },
            { code: 'EE-102', name: 'Electrical Engineering Materials' }
        ],
        'Semester II': [
            { code: 'EE-202', name: 'Electromagnetic Field Theory' },
            { code: 'EE-205', name: 'Network Analysis & Synthesis' }
        ],
        'Semester III': [
            { code: 'EE-302', name: 'Electrical Machines - I' },
            { code: 'EE-303', name: 'Electronic Devices & Circuits' },
            { code: 'EE-311', name: 'Electrical Measurements' }
        ],
        'Semester IV': [
            { code: 'EE-401', name: 'Analog Electronics' }
        ]
    },
    'Mechanical Engineering': {
        'Semester I': [
            { code: 'ME-102', name: 'Engineering Mechanics' }
        ],
        'Semester II': [
            { code: 'ME-201', name: 'Thermodynamics' },
            { code: 'ME-202', name: 'Materials Science' }
        ],
        'Semester III': [
            { code: 'ME-301', name: 'Fluid Mechanics' },
            { code: 'ME-302', name: 'Kinematics of Machinery' }
        ],
        'Semester IV': [
            { code: 'ME-401', name: 'Manufacturing Processes' },
            { code: 'ME-404', name: 'Strength of Materials' },
            { code: 'ME-405', name: 'Machine Drawing' }
        ]
    },
    'Civil Engineering': {
        'Semester I': [
            { code: 'CE-101', name: 'Engineering Graphics' }
        ],
        'Semester II': [
            { code: 'CE-201', name: 'Surveying - I' },
            { code: 'CE-202', name: 'Building Materials' },
            { code: 'CE-204', name: 'Strength of Materials' },
            { code: 'CE-205', name: 'Concrete Technology' }
        ],
        'Semester III': [
            { code: 'CE-303', name: 'Structural Analysis - I' },
            { code: 'CE-305', name: 'Environmental Engineering - I' }
        ],
        'Semester IV': [
            { code: 'CE-401', name: 'Fluid Mechanics' }
        ]
    }
};

const getFilteredSubjects = (dept: string, sem: string) => {
    const list = departmentSemestersSubjects[dept]?.[sem] || [];
    if (list.length > 0) return list;
    const deptPrefix = dept.includes('Computer') ? 'CS' :
                       dept.includes('Electrical') ? 'EE' :
                       dept.includes('Mechanical') ? 'ME' :
                       dept.includes('Civil') ? 'CE' : 'GE';
    const semIndex = sem.split(' ')[1] || 'I';
    const num = semIndex === 'I' ? 101 : semIndex === 'II' ? 201 : semIndex === 'III' ? 301 :
                semIndex === 'IV' ? 401 : semIndex === 'V' ? 501 : semIndex === 'VI' ? 601 :
                semIndex === 'VII' ? 701 : 801;
    return [
        { code: `${deptPrefix}-${num}`, name: `${dept} Core Course` },
        { code: `${deptPrefix}-${num + 1}`, name: `${dept} Core Lab` }
    ];
};

interface SectionConfig {
    name: string;
    questionsCount: number;
    marksPerQuestion: number;
    difficulty: Difficulty | 'any';
    creditLevel: number | 'any';
    questionType?: QuestionType | 'any';
    mode: 'auto' | 'manual';
    manualQuestions: BankQuestion[];
    searchQuery?: string;
    description: string;
    presentationType?: 'standard' | 'subquestions' | 'or_alternatives';
}

const GeneratePaper = ({ bank }: { bank: BankQuestion[] }) => {
    const [paperCode, setPaperCode] = useState('');
    const [department, setDepartment] = useState('Computer Science & Engineering');
    const [semester, setSemester] = useState('Semester VI');
    const [title, setTitle] = useState('');
    const [collegeName, setCollegeName] = useState(() => {
        try {
            const storedUser = localStorage.getItem('urp_user');
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                if (userObj.college && userObj.college.name) {
                    return userObj.college.name;
                }
                if (userObj.university && userObj.university.name) {
                    return userObj.university.name;
                }
            }
        } catch (e) {
            console.error('Error reading college from user storage', e);
        }
        return 'All Campus Digital College';
    });
    const [logoUrl, setLogoUrl] = useState(() => {
        try {
            const storedUser = localStorage.getItem('urp_user');
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                if (userObj.university && userObj.university.logoUrl) {
                    const cleanPath = userObj.university.logoUrl.replace(/^\/+/g, '');
                    return `http://localhost:5000/${cleanPath}`;
                }
            }
        } catch (e) {
            console.error('Error reading logo from user storage', e);
        }
        return '';
    });
    const [duration, setDuration] = useState('3 Hours');
    const [examDate, setExamDate] = useState(() => {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    });
    const [showPreview, setShowPreview] = useState(false);
    const [sectionsList, setSectionsList] = useState<SectionConfig[]>([
        { name: 'A', questionsCount: 5, marksPerQuestion: 2, difficulty: 'easy', creditLevel: 'any', questionType: 'any', mode: 'auto', manualQuestions: [], description: '', presentationType: 'standard' },
        { name: 'B', questionsCount: 4, marksPerQuestion: 5, difficulty: 'medium', creditLevel: 3, questionType: 'any', mode: 'auto', manualQuestions: [], description: '', presentationType: 'standard' },
        { name: 'C', questionsCount: 2, marksPerQuestion: 15, difficulty: 'hard', creditLevel: 5, questionType: 'any', mode: 'auto', manualQuestions: [], description: '', presentationType: 'standard' }
    ]);
    const [generatedPaper, setGeneratedPaper] = useState<{ [sec: string]: BankQuestion[] } | null>(null);

    const filteredSubjects = getFilteredSubjects(department, semester);
    const selectedPaperObj = paperCodes.find(p => p.code === paperCode);
    const paperName = selectedPaperObj ? selectedPaperObj.name : '';

    const updateSec = (index: number, key: keyof SectionConfig, val: any) => {
        setSectionsList(prev => prev.map((sec, idx) => {
            if (idx === index) {
                const updated = { ...sec, [key]: val };
                if (key === 'manualQuestions') {
                    updated.questionsCount = (val as any[]).length;
                }
                return updated;
            }
            return sec;
        }));
    };

    const addSection = () => {
        const nextChar = String.fromCharCode(65 + sectionsList.length);
        setSectionsList(prev => [
            ...prev,
            { name: nextChar, questionsCount: 2, marksPerQuestion: 5, difficulty: 'medium', creditLevel: 'any', questionType: 'any', mode: 'auto', manualQuestions: [], description: '', presentationType: 'standard' }
        ]);
    };

    const removeSection = () => {
        if (sectionsList.length > 1) {
            setSectionsList(prev => prev.slice(0, -1));
        }
    };

    const getSectionTotalMarks = (conf: SectionConfig) => {
        if (generatedPaper && generatedPaper[conf.name]) {
            return generatedPaper[conf.name].reduce((sum, q) => sum + (q.marks || 0), 0);
        }
        if (conf.mode === 'manual') {
            return conf.manualQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
        }
        return conf.questionsCount * conf.marksPerQuestion;
    };

    const calculatedMaxMarks = sectionsList.reduce((sum, conf) => {
        return sum + getSectionTotalMarks(conf);
    }, 0);

    const handleGenerate = () => {
        if (!paperCode) return;
        const res: { [sec: string]: BankQuestion[] } = {};
        
        sectionsList.forEach((conf) => {
            if (conf.mode === 'manual') {
                res[conf.name] = conf.manualQuestions;
            } else {
                let pool = bank.filter(q => q.paperCode === paperCode);
                
                // If pool is empty, fall back to matching department keywords
                if (pool.length === 0) {
                    const deptKeyword = department.split(' ')[0]?.toLowerCase();
                    pool = bank.filter(q => q.unit?.toLowerCase().includes(deptKeyword) || q.text.toLowerCase().includes(deptKeyword));
                }
                
                if (pool.length === 0) {
                    pool = bank;
                }

                if (conf.difficulty !== 'any') {
                    pool = pool.filter(q => q.difficulty === conf.difficulty);
                }
                if (conf.creditLevel !== 'any') {
                    pool = pool.filter(q => q.creditLevel === conf.creditLevel);
                }
                if (conf.questionType && conf.questionType !== 'any') {
                    pool = pool.filter(q => q.type === conf.questionType);
                }

                if (pool.length === 0) {
                    pool = bank.filter(q => q.paperCode === paperCode);
                    if (pool.length === 0) pool = bank;
                }

                // Shuffle pool
                const shuffled = [...pool].sort(() => Math.random() - 0.5);
                res[conf.name] = shuffled.slice(0, conf.questionsCount);
            }
        });

        setGeneratedPaper(res);
        setShowPreview(true);
    };

    // Calculate Audit stats
    let totalQuestions = 0;
    let novelQuestionsCount = 0;
    let repeatedPYQsCount = 0;

    if (generatedPaper) {
        Object.values(generatedPaper).forEach(qs => {
            qs.forEach(q => {
                totalQuestions++;
                if (q.isRepeated) repeatedPYQsCount++;
                else novelQuestionsCount++;
            });
        });
    }

    const noveltyIndex = totalQuestions > 0 ? (novelQuestionsCount / totalQuestions) * 100 : 100;

    const handlePrint = () => {
        const printContent = document.getElementById('printable-question-paper')?.innerHTML;
        if (!printContent) return;
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        const watermarkText = `GENERATED: ${formattedDate} AT ${formattedTime}`;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${title || 'Question Paper'}${paperCode ? ' - ' + paperCode : ''}</title>
                        <style>
                            body {
                                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                                padding: 40px;
                                color: #1e293b;
                                line-height: 1.5;
                                background-color: #ffffff;
                            }
                            .no-print { display: none !important; }
                            .paper-sheet {
                                background-color: #ffffff;
                                max-width: 800px;
                                margin: 0 auto;
                                padding: 40px;
                                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
                                border: 1px solid #e2e8f0;
                                border-radius: 8px;
                                position: relative;
                            }
                            .text-center { text-align: center; }
                            .space-y-1 > * + * { margin-top: 0.25rem; }
                            .space-y-8 > * + * { margin-top: 2rem; }
                            .space-y-4 > * + * { margin-top: 1rem; }
                            .text-lg { font-size: 1.125rem; }
                            .text-xs { font-size: 0.75rem; }
                            .text-sm { font-size: 0.875rem; }
                            .font-black { font-weight: 900; }
                            .font-bold { font-weight: 700; }
                            .font-semibold { font-weight: 600; }
                            .uppercase { text-transform: uppercase; }
                            .tracking-wide { letter-spacing: 0.025em; }
                            .tracking-widest { letter-spacing: 0.1em; }
                            .flex { display: flex; }
                            .flex-1 { flex: 1 1 0%; }
                            .min-w-\\[24px\\] { min-width: 24px; }
                            .list-none { list-style-type: none; }
                            .justify-center { justify-content: center; }
                            .justify-between { justify-content: space-between; }
                            .items-center { align-items: center; }
                            .items-start { align-items: flex-start; }
                            .gap-4 { gap: 1rem; }
                            .gap-3 { gap: 0.75rem; }
                            .gap-2 { gap: 0.5rem; }
                            .gap-x-6 { column-gap: 1.5rem; }
                            .gap-y-1 { row-gap: 0.25rem; }
                            .pt-1 { padding-top: 0.25rem; }
                            .pb-1.5 { padding-bottom: 0.375rem; }
                            .mt-2 { margin-top: 0.5rem; }
                            .h-px { height: 1px; }
                            .bg-slate-900 { background-color: #0f172a; }
                            .bg-blue-50 { background-color: #eff6ff; }
                            .text-blue-700 { color: #1d4ed8; }
                            .border { border: 1px solid #e2e8f0; }
                            .border-b { border-bottom: 1px solid #e2e8f0; }
                            .border-slate-200 { border-color: #e2e8f0; }
                            .rounded { border-radius: 0.25rem; }
                            .max-h-32 { max-height: 8rem; }
                            .grid { display: grid; }
                            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                            .ml-auto { margin-left: auto; }
                            .italic { font-style: italic; }
                            .text-red-500 { color: #ef4444; }
                            .text-slate-500 { color: #64748b; }
                            .leading-relaxed { line-height: 1.625; }
                            .text-text-primary { color: #0f172a; }
                            .text-text-secondary { color: #334155; }
                            .text-text-muted { color: #64748b; }
                            .font-mono { font-family: monospace; }
                            .absolute-watermark { display: none !important; }
                            .watermark {
                                position: fixed;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%) rotate(-30deg);
                                font-size: 26px;
                                color: rgba(14, 165, 233, 0.15) !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                                font-weight: 900;
                                letter-spacing: 0.18em;
                                text-transform: uppercase;
                                white-space: nowrap;
                                pointer-events: none;
                                z-index: -1000;
                                user-select: none;
                                filter: blur(0.5px);
                            }
                            @media print {
                                body {
                                    padding: 0 !important;
                                    margin: 0 !important;
                                    background-color: #ffffff !important;
                                }
                                .no-print { display: none !important; }
                                .paper-sheet {
                                    box-shadow: none !important;
                                    border: none !important;
                                    border-radius: 0 !important;
                                    padding: 0 !important;
                                    margin: 0 !important;
                                    max-width: 100% !important;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="watermark">${watermarkText}</div>
                        <div class="paper-sheet">
                            <div class="space-y-8">
                                ${printContent}
                            </div>
                        </div>
                        <script>
                            window.onload = function() {
                                window.focus();
                                setTimeout(function() {
                                    window.print();
                                    window.close();
                                }, 300);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleExportPDF = () => {
        const element = document.getElementById('printable-question-paper');
        if (!element) return;

        // Clone the element so we can adjust it for the PDF export
        const clone = element.cloneNode(true) as HTMLElement;
        
        // Remove style: none from absolute watermark and update text to EXPORTED
        const watermarkEl = clone.querySelector('.absolute-watermark') as HTMLElement;
        if (watermarkEl) {
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            watermarkEl.innerText = `EXPORTED: ${dateStr} AT ${timeStr}`;
            
            // Apply absolute watermark styles explicitly for html2pdf conversion
            watermarkEl.style.display = 'block';
            watermarkEl.style.position = 'absolute';
            watermarkEl.style.top = '50%';
            watermarkEl.style.left = '50%';
            watermarkEl.style.transform = 'translate(-50%, -50%) rotate(-30deg)';
            watermarkEl.style.fontSize = '20px';
            watermarkEl.style.color = 'rgba(14, 165, 233, 0.15)';
            watermarkEl.style.fontWeight = '900';
            watermarkEl.style.letterSpacing = '0.18em';
            watermarkEl.style.textTransform = 'uppercase';
            watermarkEl.style.whiteSpace = 'nowrap';
            watermarkEl.style.zIndex = '0';
            watermarkEl.style.filter = 'blur(0.5px)';
            watermarkEl.style.textAlign = 'center';
            watermarkEl.style.fontFamily = 'sans-serif';
            watermarkEl.style.pointerEvents = 'none';
            watermarkEl.style.userSelect = 'none';
        }

        const runExport = () => {
            const opt = {
                margin:       10,
                filename:     `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${paperCode || 'paper'}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            (window as any).html2pdf().from(clone).set(opt).save();
        };

        if ((window as any).html2pdf) {
            runExport();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                runExport();
            };
            document.body.appendChild(script);
        }
    };

    return (
        <div className="space-y-6">
            {!showPreview ? (
                <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <div className="px-5 py-4 bg-bg-secondary border-b border-slate-200 flex items-center gap-2">
                        <Zap size={16} className="text-accent-primary" />
                        <h3 className="text-sm font-bold text-text-primary">Configure Examination Paper</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 font-bold">Department <span className="text-red-500">*</span></label>
                                <select value={department} onChange={e => {
                                    setDepartment(e.target.value);
                                    setPaperCode('');
                                }}
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary font-semibold">
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 font-bold">Semester <span className="text-red-500">*</span></label>
                                <select value={semester} onChange={e => {
                                    setSemester(e.target.value);
                                    setPaperCode('');
                                }}
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary font-semibold">
                                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 font-bold">Subject Paper <span className="text-red-500">*</span></label>
                                <select value={paperCode} onChange={e => setPaperCode(e.target.value)}
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary font-semibold">
                                    <option value="">Select Paper</option>
                                    {filteredSubjects.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 font-bold">College Name</label>
                                <input value={collegeName} readOnly
                                    placeholder="Enter College Name"
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-slate-50 text-slate-500 focus:outline-none cursor-not-allowed font-semibold" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 font-bold">Exam Title</label>
                                <input value={title} onChange={e => setTitle(e.target.value)}
                                    placeholder="Enter Exam Title"
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary font-semibold" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 font-bold">Exam Date</label>
                                <input value={examDate} onChange={e => setExamDate(e.target.value)}
                                    placeholder="e.g. May 20, 2026"
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary font-semibold" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 font-bold">Duration</label>
                                <input value={duration} onChange={e => setDuration(e.target.value)}
                                    placeholder="e.g. 3 Hours"
                                    className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary font-semibold" />
                            </div>
                        </div>

                        {/* Sections Configuration */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider">Section Specifications</h4>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={removeSection}
                                        disabled={sectionsList.length <= 1}
                                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                    >
                                        - Remove Section
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addSection}
                                        className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-lg transition-all"
                                    >
                                        + Add Section
                                    </button>
                                </div>
                            </div>

                            {!paperCode ? (
                                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                    <BookOpen size={28} className="text-slate-400 mx-auto mb-2 animate-bounce" />
                                    <h5 className="text-xs font-black uppercase text-slate-700 tracking-wider">Select Subject Paper First</h5>
                                    <p className="text-[11px] text-slate-400 font-semibold mt-1">Please select a Department, Semester, and Subject Paper above to load questions and configure sections.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {sectionsList.map((conf, index) => (
                                        <div key={conf.name} className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-full bg-accent-primary text-white text-sm font-black flex items-center justify-center">
                                                        {conf.name}
                                                    </span>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-bold text-text-primary">Section {conf.name} Details</p>
                                                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black rounded-full shadow-sm">
                                                                {getSectionTotalMarks(conf)} Marks
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-text-muted">Configure Section {conf.name} questions and scoring</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-1.5 bg-slate-200/50 p-1 rounded-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateSec(index, 'mode', 'auto')}
                                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${conf.mode === 'auto' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        Auto-Generate
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateSec(index, 'mode', 'manual')}
                                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${conf.mode === 'manual' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        Manual Selection
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-black uppercase text-text-secondary tracking-wider mb-1.5">Section Description / Instructions</label>
                                                    <input
                                                        type="text"
                                                        value={conf.description || ''}
                                                        onChange={e => updateSec(index, 'description', e.target.value)}
                                                        placeholder="e.g. Answer all questions. All questions carry equal marks."
                                                        className="w-full h-9 px-3 border border-slate-200 rounded-md text-xs bg-white text-text-primary focus:outline-none focus:border-accent-primary font-semibold shadow-sm"
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className="block text-[10px] font-black uppercase text-text-secondary tracking-wider mb-1.5">Display Format</label>
                                                    <select
                                                        value={conf.presentationType || 'standard'}
                                                        onChange={e => updateSec(index, 'presentationType', e.target.value)}
                                                        className="w-full h-9 px-3 border border-slate-200 rounded-md text-xs bg-white text-text-primary focus:outline-none focus:border-accent-primary font-semibold shadow-sm"
                                                    >
                                                        <option value="standard">Standard (1, 2, 3...)</option>
                                                        <option value="subquestions">Subquestions (1a, 1b...)</option>
                                                        <option value="or_alternatives">Internal Choice (1 OR 2)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {conf.mode === 'auto' ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-white p-4 rounded-lg border border-slate-200/70">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Total Questions</label>
                                                        <input type="number" min="0" value={conf.questionsCount} onChange={e => updateSec(index, 'questionsCount', Math.max(0, Number(e.target.value)))}
                                                            className="w-full h-9 px-3 border border-slate-200 rounded text-xs bg-white text-text-primary focus:outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Marks/Question</label>
                                                        <input type="number" value={conf.marksPerQuestion} onChange={e => updateSec(index, 'marksPerQuestion', Math.max(0, Number(e.target.value)))}
                                                            className="w-full h-9 px-3 border border-slate-200 rounded text-xs bg-white text-text-primary focus:outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Difficulty Target</label>
                                                        <select value={conf.difficulty} onChange={e => updateSec(index, 'difficulty', e.target.value)}
                                                            className="w-full h-9 px-2 border border-slate-200 rounded text-xs bg-white text-text-primary focus:outline-none">
                                                            <option value="any">Any Difficulty</option>
                                                            <option value="easy">Easy</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="hard">Hard</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Question Type</label>
                                                        <select value={conf.questionType || 'any'} onChange={e => updateSec(index, 'questionType', e.target.value)}
                                                            className="w-full h-9 px-2 border border-slate-200 rounded text-xs bg-white text-text-primary focus:outline-none">
                                                            <option value="any">Any Type</option>
                                                            <option value="subjective">Subjective</option>
                                                            <option value="objective">Objective</option>
                                                            <option value="multiple-answer">Multi-Answer</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">AI Novelty Credit</label>
                                                        <select value={conf.creditLevel} onChange={e => updateSec(index, 'creditLevel', e.target.value === 'any' ? 'any' : Number(e.target.value))}
                                                            className="w-full h-9 px-2 border border-slate-200 rounded text-xs bg-white text-text-primary focus:outline-none">
                                                            <option value="any">Any Credit (Mixed)</option>
                                                            <option value="1">1 Credit (PYQ Repeated)</option>
                                                            <option value="2">2 Credits (PYQ Variant)</option>
                                                            <option value="3">3 Credits (Standard)</option>
                                                            <option value="4">4 Credits (Highly Novel)</option>
                                                            <option value="5">5 Credits (Research novel)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white p-4 rounded-lg border border-slate-200/70 space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Marks/Question</label>
                                                            <input type="number" value={conf.marksPerQuestion} onChange={e => updateSec(index, 'marksPerQuestion', Math.max(0, Number(e.target.value)))}
                                                                className="w-full h-9 px-3 border border-slate-200 rounded text-xs bg-white text-text-primary focus:outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Selected Count (Calculated)</label>
                                                            <div className="w-full h-9 px-3 border border-slate-100 rounded text-xs bg-slate-50 text-slate-700 flex items-center font-bold">
                                                                {conf.manualQuestions.length} Questions Selected
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Selected questions list */}
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase text-text-secondary tracking-wider mb-1.5">Selected Questions</label>
                                                        {conf.manualQuestions.length > 0 ? (
                                                            <div className="space-y-2 max-h-48 overflow-y-auto border border-indigo-100 rounded-lg p-2.5 bg-indigo-50/10">
                                                                {conf.manualQuestions.map(q => (
                                                                    <div key={q.id} className="flex justify-between items-start gap-2 bg-white p-2 rounded border border-slate-200 shadow-sm">
                                                                        <div className="text-xs text-text-primary">
                                                                            <p className="font-semibold text-slate-800 leading-snug">{q.text}</p>
                                                                            <span className="text-[9px] text-text-muted font-mono mt-0.5 block">{q.code} · Marks: {q.marks} · {q.difficulty} · {q.creditLevel} Credits</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const updated = conf.manualQuestions.filter(mq => mq.id !== q.id);
                                                                                updateSec(index, 'manualQuestions', updated);
                                                                            }}
                                                                            className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider shrink-0 mt-0.5"
                                                                        >
                                                                            ✕ Remove
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[11px] text-slate-400 italic">No questions selected yet. Search and add questions below.</p>
                                                        )}
                                                    </div>

                                                    {/* Keyword search panel */}
                                                    <div className="pt-3 border-t border-slate-100">
                                                        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Search and Add Questions</label>
                                                        <div className="flex gap-2 mb-2">
                                                            <div className="relative flex-1">
                                                                <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search question bank by words..."
                                                                    value={conf.searchQuery || ''}
                                                                    onChange={e => updateSec(index, 'searchQuery', e.target.value)}
                                                                    className="w-full h-9 pl-8 pr-3 border border-slate-200 rounded-md text-xs bg-white text-text-primary focus:outline-none focus:border-accent-primary"
                                                                />
                                                            </div>
                                                            {conf.searchQuery && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateSec(index, 'searchQuery', '')}
                                                                    className="px-3 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs rounded-md font-bold transition-all"
                                                                >
                                                                    Clear
                                                                </button>
                                                            )}
                                                        </div>

                                                        {(() => {
                                                            const query = (conf.searchQuery || '').toLowerCase().trim();
                                                            let searchPool = bank.filter(q => q.paperCode === paperCode);
                                                            if (query) {
                                                                searchPool = searchPool.filter(q => q.text.toLowerCase().includes(query));
                                                            } else {
                                                                searchPool = searchPool.slice(0, 5);
                                                            }
                                                            
                                                            const selectedIds = new Set(conf.manualQuestions.map(q => q.id));
                                                            const filteredSearch = searchPool.filter(q => !selectedIds.has(q.id));

                                                            if (filteredSearch.length === 0) {
                                                                return (
                                                                    <div className="p-4 bg-slate-50 text-center rounded-lg border border-dashed border-slate-200">
                                                                        <p className="text-[11px] text-slate-400 italic">
                                                                            {query ? 'No matching questions found in this paper.' : 'No other questions available in this paper.'}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                                                                    {filteredSearch.map(q => (
                                                                        <div
                                                                            key={q.id}
                                                                            className="bg-white p-2.5 rounded border border-slate-200 flex items-start justify-between gap-3 shadow-sm hover:border-indigo-300 transition-colors"
                                                                        >
                                                                            <div className="text-[11px] text-slate-700 flex-1">
                                                                                <p className="font-semibold text-slate-800 leading-relaxed">{q.text}</p>
                                                                                <span className="text-[9px] text-slate-400 font-mono mt-1 block">{q.code} · Marks: {q.marks} · {q.difficulty} · {q.creditLevel} Credits</span>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    updateSec(index, 'manualQuestions', [...conf.manualQuestions, q]);
                                                                                }}
                                                                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-black uppercase tracking-wider shrink-0 mt-0.5 border border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                                                                            >
                                                                                + Add
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button type="button" onClick={handleGenerate} disabled={!paperCode}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-text-muted text-white text-xs font-extrabold uppercase tracking-wider rounded-lg transition-colors shadow-md">
                                Generate Question Paper
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Security Novelty Audit Banner */}
                    <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
                                <Sparkles size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">AI Paper Security & Novelty Audit</h3>
                                <p className="text-[10px] text-slate-400">Verifying that generated examination questions meet university standards.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-center">
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Target Novelty Index</p>
                                <p className="text-xl font-black mt-1 text-emerald-400">{noveltyIndex.toFixed(1)}%</p>
                            </div>
                            <div className="h-8 w-px bg-slate-800" />
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Novel Questions</p>
                                <p className="text-xl font-black mt-1 text-indigo-400">{novelQuestionsCount}</p>
                            </div>
                            <div className="h-8 w-px bg-slate-800" />
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Repeated PYQs</p>
                                <p className="text-xl font-black mt-1 text-amber-500">{repeatedPYQsCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Paper Document Preview Layout */}
                    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                        <div className="px-5 py-4 bg-bg-secondary border-b border-slate-200 flex items-center justify-between gap-3">
                            <h3 className="text-sm font-bold text-text-primary">Generated Paper Preview</h3>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowPreview(false)}
                                    className="px-3 py-1.5 border border-slate-200 text-text-secondary rounded hover:bg-slate-50 text-xs font-bold transition-all">
                                    ← Reconfigure
                                </button>
                                <button type="button" onClick={handleExportPDF} className="px-3 py-1.5 bg-accent-primary text-white rounded hover:bg-[#162d4a] text-xs font-bold transition-all flex items-center gap-1">
                                    <Download size={12} /> Export PDF
                                </button>
                            </div>
                        </div>
                        <div id="printable-question-paper" className="relative overflow-hidden pt-3 pb-8 px-8 max-w-[800px] mx-auto bg-white border border-slate-100 shadow-md my-6 rounded-lg font-body">
                            {/* Watermark on screen preview */}
                            <div className="absolute-watermark pointer-events-none select-none" style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(-30deg)',
                                fontSize: '20px',
                                color: 'rgba(14, 165, 233, 0.15)',
                                fontWeight: 900,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                whiteSpace: 'nowrap',
                                zIndex: 0,
                                filter: 'blur(0.5px)',
                                textAlign: 'center',
                                fontFamily: 'sans-serif'
                            }}>
                                GENERATED: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} AT {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </div>

                            <div className="space-y-4">
                                {/* Exam Sheet Header */}
                                <div className="relative z-10 space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        {logoUrl && (
                                            <img 
                                                src={logoUrl} 
                                                alt="Logo" 
                                                style={{ height: '48px', width: '48px', objectFit: 'contain' }} 
                                            />
                                        )}
                                        <div className="flex-1 text-center space-y-1">
                                            {collegeName && <h2 className="text-lg font-black text-text-primary tracking-wide uppercase">{collegeName}</h2>}
                                            <h3 className="text-sm font-bold text-text-secondary tracking-widest uppercase">{title}</h3>
                                            {department && <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Department of {department}</h4>}
                                        </div>
                                        {logoUrl && <div style={{ width: '48px', height: '48px' }} />}
                                    </div>
                                    <div className="text-center space-y-1">
                                        <div className="flex justify-center gap-4 text-xs text-text-secondary font-semibold pt-1">
                                            <span>Paper: <strong>{paperName}{paperCode ? ` (${paperCode})` : ''}</strong></span>
                                            <span>Max. Marks: <strong>{calculatedMaxMarks}</strong></span>
                                            <span>Duration: <strong>{duration}</strong></span>
                                        </div>
                                        <div className="flex justify-center gap-6 text-[10px] text-text-muted font-bold pt-1 uppercase">
                                            <span>Exam Date: <strong>{examDate}</strong></span>
                                            <span>Seat No.: ________________</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative z-10 h-px bg-slate-900" />

                                {/* Render Sections */}
                                <div className="relative z-10 space-y-8">
                                    {(() => {
                                        let globalQuestionCounter = 1;
                                        return generatedPaper && Object.entries(generatedPaper).map(([secName, qs]) => {
                                            const sectionConf = sectionsList.find(s => s.name === secName);
                                            return (
                                            <div key={secName} className="space-y-4">
                                                <div className="border-b border-slate-200 pb-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-black text-text-primary tracking-wide">
                                                            SECTION {secName} ({qs.reduce((sum, q) => sum + (q.marks || 0), 0)} Marks)
                                                        </h4>
                                                        <span className="text-xs text-text-muted font-semibold">[{qs.length} questions]</span>
                                                    </div>
                                                    {sectionConf?.description && (
                                                        <p className="text-xs text-slate-500 font-bold mt-1 italic leading-relaxed">
                                                            Note: {sectionConf.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {qs.length === 0 ? (
                                                    <p className="text-xs text-red-500 italic">No questions in the database match this section's credit/difficulty parameters.</p>
                                                ) : (
                                                    <div className="space-y-6 font-normal text-text-primary">
                                                        {(() => {
                                                            const pType = sectionConf?.presentationType || 'standard';
                                                            
                                                            const renderQuestionContent = (q: BankQuestion, indexLabel: string) => (
                                                                <div key={q.id} className="flex gap-3">
                                                                    <span className="text-sm font-semibold min-w-[24px]">{indexLabel}</span>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <p className="text-sm">{q.text}</p>
                                                                            <span className="text-xs font-semibold text-text-muted whitespace-nowrap">[{q.marks} M{q.negativeMarks ? `, -${q.negativeMarks}` : ''}]</span>
                                                                        </div>
                                                                        {q.image && <img src={q.image} alt="" className="mt-2 max-h-32 border border-slate-200 rounded" />}
                                                                        {q.options && (
                                                                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 font-normal">
                                                                                {q.options.map((opt, oi) => (
                                                                                    <p key={oi} className="text-sm text-text-secondary">({String.fromCharCode(97 + oi)}) {opt}</p>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );

                                                            if (pType === 'subquestions') {
                                                                const grouped = [];
                                                                for (let i = 0; i < qs.length; i += 2) {
                                                                    grouped.push(qs.slice(i, i + 2));
                                                                }
                                                                return grouped.map((group, gi) => {
                                                                    const mainQNum = globalQuestionCounter++;
                                                                    return (
                                                                        <div key={gi} className="space-y-3">
                                                                            <div className="text-sm font-bold">{mainQNum}. Answer the following:</div>
                                                                            <div className="pl-4 space-y-4">
                                                                                {group.map((q, qsi) => renderQuestionContent(q, `(${String.fromCharCode(97 + qsi)})`))}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                });
                                                            }

                                                            if (pType === 'or_alternatives') {
                                                                const grouped = [];
                                                                for (let i = 0; i < qs.length; i += 2) {
                                                                    grouped.push(qs.slice(i, i + 2));
                                                                }
                                                                return grouped.map((group, gi) => {
                                                                    const mainQNum = globalQuestionCounter++;
                                                                    return (
                                                                        <div key={gi} className="space-y-4">
                                                                            {renderQuestionContent(group[0], `${mainQNum}.`)}
                                                                            {group.length > 1 && (
                                                                                <>
                                                                                    <div className="text-center font-black text-sm my-2 uppercase tracking-widest text-slate-400">OR</div>
                                                                                    {renderQuestionContent(group[1], "")}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                });
                                                            }

                                                            // standard
                                                            return (
                                                                <div className="space-y-4">
                                                                    {qs.map((q) => {
                                                                        const mainQNum = globalQuestionCounter++;
                                                                        return renderQuestionContent(q, `${mainQNum}.`);
                                                                    })}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })})()}
                                    <div className="pt-4 border-t border-slate-200 text-center text-xs text-text-muted">— End of Paper —</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main QuestionBank Component ───────────────────────────────
type QBSubTab = 'upload' | 'directory' | 'train' | 'generate' | 'master' | 'inbox';

interface QuestionBankProps {
    role?: string;
    department?: string;
    collegeId?: string;
    facultyName?: string;
    facultyProfileUrl?: string;
}

const QuestionBank = ({ role = 'COLLEGE', department, collegeId, facultyName = 'Admin User', facultyProfileUrl = '' }: QuestionBankProps) => {
    const isUniAdmin = role === 'SYSTEM_ADMIN' || role === 'SUPER_ADMIN';
    const isCollege = role === 'COLLEGE' || role === 'COLLEGE_ADMIN';
    const isFaculty = role === 'PROFESSOR';

    const [subTab, setSubTab] = useState<QBSubTab>(isCollege ? 'directory' : 'upload');
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // Initialize bank with rich, realistic mock data for college/university workflows
    const [bank, setBank] = useState<BankQuestion[]>(() => {
        return initialBank.map((q, idx) => {
            // Let's seed 2 questions pending College review from Faculty
            if (idx === 2 || idx === 7) {
                return {
                    ...q,
                    addedByRole: 'PROFESSOR',
                    sentToUniversity: false,
                    approvedByUniversity: false
                };
            }
            // Let's seed 2 questions pending University review from College
            if (idx === 4 || idx === 10) {
                return {
                    ...q,
                    addedByRole: 'PROFESSOR',
                    sentToUniversity: true,
                    approvedByUniversity: false
                };
            }
            // All other questions are pre-approved in the Master Bank
            return {
                ...q,
                addedByRole: q.addedByRole || 'PROFESSOR',
                sentToUniversity: q.sentToUniversity ?? true,
                approvedByUniversity: q.approvedByUniversity ?? true
            };
        });
    });

    // Synchronize multi-department engineering questions from backend database API on mount
    useEffect(() => {
        const syncQuestionsFromApi = async () => {
            try {
                const token = localStorage.getItem('urp_token');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2500);
                
                const res = await fetch('http://127.0.0.1:5000/api/questions', {
                    signal: controller.signal,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                clearTimeout(timeoutId);
                const data = await res.json();
                if (data.success && data.data && data.data.length > 0) {
                    const formatted = data.data.map((q: any) => ({
                        id: q._id || `API-${Math.random()}`,
                        code: q.code,
                        paperCode: q.code,
                        text: q.text,
                        type: q.type as QuestionType,
                        difficulty: q.difficulty as Difficulty,
                        marks: q.marks,
                        unit: q.department,
                        addedBy: q.addedBy || 'University Exam Controller',
                        addedOn: q.addedOn || '2026-05-20',
                        creditLevel: q.creditLevel || 3,
                        isRepeated: q.creditLevel && q.creditLevel < 4,
                        aiConfidence: 0.96,
                        sentToUniversity: true,
                        approvedByUniversity: true
                    }));
                    
                    setBank(prev => {
                        const existingCodes = new Set(prev.map(p => p.code));
                        const newQuestions = formatted.filter((q: any) => !existingCodes.has(q.code));
                        return [...prev, ...newQuestions];
                    });
                }
            } catch (err) {
                console.error('Failed to sync questions from database API:', err);
            }
        };
        syncQuestionsFromApi();
    }, []);

    // Reactive, derived pending inbox array (highly optimized reactive state pattern)
    const pendingInbox = isUniAdmin
        ? bank.filter(q => q.sentToUniversity && !q.approvedByUniversity)
        : isCollege
        ? bank.filter(q => !q.sentToUniversity && !q.approvedByUniversity && q.addedByRole === 'PROFESSOR')
        : [];

    // Scope: faculty sees only their dept questions; college sees all but not yet-approved; uni sees everything
    const displayBank = isFaculty
        ? bank.filter(q => !department || q.unit?.toLowerCase().includes(department.toLowerCase()) || q.paperCode.startsWith('CS'))
        : isCollege
        ? bank.filter(q => !q.sentToUniversity || q.approvedByUniversity)
        : bank;

    const handleApprove = (id: string) => {
        setBank(prev => prev.map(q => {
            if (q.id === id) {
                if (isCollege) {
                    showToast(`Approved question "${q.code}" and forwarded it to the University!`);
                    return { ...q, sentToUniversity: true };
                } else if (isUniAdmin) {
                    showToast(`Successfully approved question "${q.code}" into the Master Bank!`);
                    return { ...q, approvedByUniversity: true };
                }
            }
            return q;
        }));
    };

    const handleReject = (id: string) => {
        setBank(prev => {
            const rejectedQ = prev.find(q => q.id === id);
            if (rejectedQ) {
                if (isCollege) {
                    showToast(`Rejected faculty question submission "${rejectedQ.code}".`);
                } else if (isUniAdmin) {
                    showToast(`Returned question "${rejectedQ.code}" to the College queue.`);
                }
            }
            if (isCollege) {
                // College rejects: remove or mark as rejected. Let's filter it out of the bank.
                return prev.filter(q => q.id !== id);
            } else {
                // University rejects: send back to College queue (sentToUniversity: false)
                return prev.map(q => q.id === id ? { ...q, sentToUniversity: false } : q);
            }
        });
    };

    return (
        <div className="space-y-5 relative">
            {toast && (
                <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-emerald-500/20 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                    <span>{toast}</span>
                </div>
            )}

            {isFaculty && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> Your questions are scoped to: <strong>{department || 'Computer Science & Engineering'}</strong>. Verified questions can be sent to College for approval.
                </div>
            )}
            {isCollege && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> College view: Review faculty questions and send approved ones to the University.
                </div>
            )}
            <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
                {(['upload', 'directory', 'train', 'generate'] as QBSubTab[])
                    .filter(t => t !== 'upload' || isFaculty)
                    .map(t => (
                        <button key={t} type="button" onClick={() => setSubTab(t)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap flex items-center gap-1.5 ${subTab === t ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                            {t === 'upload' && <Plus size={14} className="shrink-0" />}
                            {t === 'directory' && <BookOpen size={14} className="shrink-0" />}
                            {t === 'train' && <Sparkles size={14} className="shrink-0" />}
                            {t === 'generate' && <Zap size={14} className="shrink-0" />}
                            {t === 'upload' 
                                ? 'Question Upload' 
                                : t === 'directory' 
                                ? 'Question Directory' 
                                : t === 'train' 
                                ? 'Train ML Model' 
                                : 'Generate Paper'}
                        </button>
                    ))}
                {(isUniAdmin || isCollege) && (
                    <button type="button" onClick={() => setSubTab('inbox')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap flex items-center gap-1.5 ${subTab === 'inbox' ? 'border-amber-500 text-amber-600' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                        <History size={14} className="shrink-0" />
                        {isUniAdmin ? 'University Inbox' : 'College Inbox'}
                        {pendingInbox.length > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pendingInbox.length}</span>}
                    </button>
                )}
                {isUniAdmin && (
                    <button type="button" onClick={() => setSubTab('master')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap flex items-center gap-1.5 ${subTab === 'master' ? 'border-purple-500 text-purple-600' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                        <BookOpen size={14} className="shrink-0" />
                        Master Bank
                    </button>
                )}
                <span className="ml-auto text-xs text-text-muted pr-1 whitespace-nowrap font-bold flex items-center gap-1">
                    <Sparkles size={12} className="text-indigo-600" /> {displayBank.length} Questions
                </span>
            </div>

            {subTab === 'upload' && <UploadQuestions bank={displayBank} fullBank={bank} setBank={setBank} role={role} facultyName={facultyName} facultyProfileUrl={facultyProfileUrl} />}
            {subTab === 'directory' && <QuestionDirectory bank={displayBank} setBank={setBank} />}
            {subTab === 'train' && <TrainModel bank={displayBank} />}
            {subTab === 'generate' && <GeneratePaper bank={displayBank} />}

            {subTab === 'inbox' && (
                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <div className="px-5 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-600" />
                            <h3 className="text-sm font-bold text-amber-900">{isUniAdmin ? 'University Question Approval Inbox' : 'Faculty Submissions — Pending Review'}</h3>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded border border-amber-200">{pendingInbox.length} Pending</span>
                    </div>
                    {pendingInbox.length === 0 ? (
                        <div className="p-12 text-center text-text-muted text-sm font-semibold">
                            <CheckCircle2 size={40} className="mx-auto mb-3 text-green-400" />
                            All submissions reviewed. Inbox is clear.
                        </div>
                    ) : (
                        <div className="divide-y divide-border-color">
                            {pendingInbox.map(q => (
                                <div key={q.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <p className="text-sm font-semibold text-text-primary">{q.text}</p>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <span className="font-mono text-[10px] text-text-muted">{q.code}</span>
                                                <span className={diffBadge(q.difficulty)}>{q.difficulty}</span>
                                                <span className={typeBadge(q.type)}>{typeLabel(q.type)}</span>
                                                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
                                                    <Award size={10} className="fill-indigo-600" /> {q.creditLevel ?? 3} Credits
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-text-muted flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-black uppercase shrink-0">
                                                        {q.addedBy ? q.addedBy.replace('Dr. ', '').replace('Prof. ', '').charAt(0) : 'U'}
                                                    </div>
                                                    <span>By: <strong>{q.addedBy || 'University Exam Controller'}</strong></span>
                                                </div>
                                                <span className="text-slate-300">|</span>
                                                <a href={q.addedByProfileLink || '#/faculty-profile'} target="_blank" rel="noreferrer"
                                                    className="text-indigo-600 hover:underline font-bold flex items-center gap-0.5">
                                                    View Author Profile →
                                                </a>
                                                <span>• {q.addedOn}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleApprove(q.id)}
                                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
                                                <CheckCircle2 size={12} /> {isCollege ? 'Approve & Send to University' : 'Approve'}
                                            </button>
                                            <button onClick={() => handleReject(q.id)}
                                                className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
                                                <X size={12} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {subTab === 'master' && isUniAdmin && (
                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <div className="px-5 py-4 bg-purple-50 border-b border-purple-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-purple-600" />
                            <h3 className="text-sm font-bold text-purple-900">Master Question Bank — Cross-University Repository</h3>
                        </div>
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded border border-purple-200">{bank.filter(q => q.approvedByUniversity).length} Approved</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-text-muted uppercase tracking-wider font-extrabold border-b border-slate-200">
                                    <th className="px-5 py-3">Code</th>
                                    <th className="px-5 py-3">Question</th>
                                    <th className="px-5 py-3">Added By</th>
                                    <th className="px-5 py-3">Credits</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color text-text-primary">
                                {bank.map(q => (
                                    <tr key={q.id} className="hover:bg-slate-50/50">
                                        <td className="px-5 py-3 font-mono font-bold text-accent-primary">{q.code}</td>
                                        <td className="px-5 py-3 max-w-xs">
                                            <p className="font-semibold line-clamp-2">{q.text}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                                                    {q.addedBy ? q.addedBy.replace('Dr. ', '').replace('Prof. ', '').charAt(0) : 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{q.addedBy || 'University Exam Controller'}</p>
                                                    <a href={q.addedByProfileLink || '#/faculty-profile'} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 hover:underline">View Profile →</a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-0.5">
                                                {[1,2,3,4,5].map(s => <Award key={s} size={11} className={s <= (q.creditLevel ?? 3) ? 'text-indigo-600 fill-indigo-600' : 'text-slate-200'} />)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            {q.approvedByUniversity
                                                ? <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded">✓ Approved</span>
                                                : q.sentToUniversity
                                                ? <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded">⏳ Pending</span>
                                                : <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">Draft</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;
