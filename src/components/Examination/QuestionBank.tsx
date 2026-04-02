import { useState } from 'react';
import {
    Plus, Search, Filter, Trash2, Eye, FileText, Download,
    Image, CheckSquare, AlignLeft, List, Zap, BookOpen,
    ChevronDown, X, AlertCircle, CheckCircle2, Printer
} from 'lucide-react';
import {
    questionBank as initialBank, paperCodes,
    type BankQuestion, type QuestionType, type Difficulty
} from '../../data/examData';

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
const UploadQuestions = ({ bank, setBank }: { bank: BankQuestion[]; setBank: (b: BankQuestion[]) => void }) => {
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
    const [saved, setSaved] = useState(false);

    // Filters
    const [filterPaper, setFilterPaper] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDiff, setFilterDiff] = useState('');
    const [search, setSearch] = useState('');

    const updateOption = (i: number, val: string) => setOptions(prev => prev.map((o, idx) => idx === i ? val : o));
    const toggleMulti = (opt: string) => setCorrectMulti(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);

    const genCode = (pc: string) => {
        const existing = bank.filter(q => q.paperCode === pc).length;
        return `${pc}-Q${String(existing + 1).padStart(3, '0')}`;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!paperCode || !text.trim()) return;
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
            addedBy: 'Admin User',
            addedOn: new Date().toISOString().split('T')[0],
        };
        setBank([...bank, newQ]);
        // reset
        setText(''); setUnit(''); setMarks('1'); setNegEnabled(false); setNegMarks('0.25');
        setOptions(['', '', '', '']); setCorrectSingle(''); setCorrectMulti([]); setImagePreview(null);
        setSaved(true); setTimeout(() => setSaved(false), 2500);
    };

    const handleDelete = (id: string) => setBank(bank.filter(q => q.id !== id));

    const filtered = bank.filter(q =>
        (!filterPaper || q.paperCode === filterPaper) &&
        (!filterType || q.type === filterType) &&
        (!filterDiff || q.difficulty === filterDiff) &&
        (!search || q.text.toLowerCase().includes(search.toLowerCase()) || q.code.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* ── Add Question Form ── */}
            <div className="border border-border-color rounded-lg bg-white overflow-hidden">
                <div className="px-5 py-4 bg-bg-secondary border-b border-border-color flex items-center gap-2">
                    <Plus size={16} className="text-accent-primary" />
                    <h3 className="text-sm font-bold text-text-primary">Add New Question</h3>
                </div>
                <div className="p-5 space-y-5">

                    {/* Row 1: Paper code + Type + Difficulty */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Paper Code <span className="text-red-500">*</span></label>
                            <select value={paperCode} onChange={e => setPaperCode(e.target.value)}
                                className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm bg-white text-text-primary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20">
                                <option value="">Select paper…</option>
                                {paperCodes.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
                            </select>
                            {paperCode && <p className="text-xs text-text-muted mt-1">Code: <span className="font-mono font-semibold text-accent-primary">{genCode(paperCode)}</span></p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Question Type <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {([['objective', 'Objective', <List size={13} />], ['subjective', 'Subjective', <AlignLeft size={13} />], ['multiple-answer', 'Multi-Ans', <CheckSquare size={13} />]] as const).map(([val, lbl, icon]) => (
                                    <button key={val} onClick={() => setType(val as QuestionType)}
                                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-md border text-xs font-semibold transition-colors ${type === val ? 'border-accent-primary bg-[#f0f6ff] text-accent-primary' : 'border-border-color text-text-secondary hover:border-accent-primary/50'}`}>
                                        {icon}{lbl}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Difficulty <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                                    <button key={d} onClick={() => setDifficulty(d)}
                                        className={`py-2 rounded-md border text-xs font-semibold capitalize transition-colors ${difficulty === d ? (d === 'easy' ? 'border-green-400 bg-green-50 text-green-700' : d === 'medium' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-red-400 bg-red-50 text-red-700') : 'border-border-color text-text-secondary hover:border-accent-primary/50'}`}>
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
                            className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 resize-none" />
                    </div>

                    {/* Row 3: Image Upload (optional) + Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Image <span className="text-text-muted font-normal">(optional)</span></label>
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Question visual" className="w-full h-32 object-contain border border-border-color rounded-md bg-bg-secondary" />
                                    <button onClick={() => setImagePreview(null)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={12} /></button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border-color rounded-md cursor-pointer hover:border-accent-primary/50 transition-colors bg-bg-secondary">
                                    <Image size={20} className="text-text-muted mb-1" />
                                    <span className="text-xs text-text-muted">Click to upload image</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Unit / Topic <span className="text-text-muted font-normal">(optional)</span></label>
                            <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. TCP/IP, Normalization…"
                                className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm bg-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20" />
                        </div>
                    </div>

                    {/* Row 4: Options (for objective / multiple-answer) */}
                    {type !== 'subjective' && (
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                Options &nbsp;<span className="text-text-muted font-normal">(mark correct answer{type === 'multiple-answer' ? 's' : ''})</span>
                            </label>
                            <div className="space-y-2">
                                {options.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {type === 'objective' ? (
                                            <input type="radio" name="correct" className="w-4 h-4 accent-[#1d72b8]"
                                                checked={correctSingle === opt && opt !== ''}
                                                onChange={() => setCorrectSingle(opt)} />
                                        ) : (
                                            <input type="checkbox" className="w-4 h-4 accent-[#1d72b8]"
                                                checked={correctMulti.includes(opt)}
                                                onChange={() => toggleMulti(opt)} />
                                        )}
                                        <span className="w-6 h-6 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center text-xs font-bold text-text-muted flex-shrink-0">
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        <input value={opt} onChange={e => updateOption(i, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            className="flex-1 px-3 py-2 border border-border-color rounded-md text-sm bg-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                                {type === 'objective' ? <><List size={11} /> Select the radio button next to the correct option.</> : <><CheckSquare size={11} /> Check all correct options.</>}
                            </p>
                        </div>
                    )}

                    {/* Row 5: Marks + Negative Marks */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Marks <span className="text-red-500">*</span></label>
                            <input type="number" min="0.5" step="0.5" value={marks} onChange={e => setMarks(e.target.value)}
                                className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm bg-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20" />
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Negative Marks</label>
                                <input type="number" min="0" step="0.25" value={negMarks} onChange={e => setNegMarks(e.target.value)}
                                    disabled={!negEnabled}
                                    className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm bg-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 disabled:opacity-40 disabled:cursor-not-allowed" />
                            </div>
                            <button onClick={() => setNegEnabled(!negEnabled)}
                                className={`mb-0.5 px-3 py-2.5 rounded-md border text-xs font-semibold transition-colors ${negEnabled ? 'bg-red-50 border-red-300 text-red-700' : 'bg-bg-secondary border-border-color text-text-secondary'}`}>
                                {negEnabled ? 'On' : 'Off'}
                            </button>
                        </div>
                    </div>

                    {/* Save button */}
                    <div className="flex items-center gap-4 pt-2 border-t border-border-color">
                        <button onClick={handleSave} disabled={!paperCode || !text.trim()}
                            className="primary-btn disabled:opacity-50 disabled:cursor-not-allowed">
                            <Plus size={16} /> Save to Question Bank
                        </button>
                        {saved && (
                            <span className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
                                <CheckCircle2 size={16} /> Question saved!
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Question Bank Table ── */}
            <div className="border border-border-color rounded-lg bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-border-color flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-accent-primary" />
                        <h3 className="text-sm font-bold text-text-primary">Question Bank</h3>
                        <span className="text-xs text-text-muted bg-bg-secondary border border-border-color px-2 py-0.5 rounded-full">{filtered.length} / {bank.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Search */}
                        <div className="flex items-center border border-border-color rounded-md px-3 py-1.5 bg-white gap-2">
                            <Search size={13} className="text-text-muted" />
                            <input className="text-sm outline-none w-36" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        {/* Filters */}
                        <select value={filterPaper} onChange={e => setFilterPaper(e.target.value)}
                            className="px-3 py-1.5 border border-border-color rounded-md text-xs text-text-secondary bg-white focus:outline-none">
                            <option value="">All Papers</option>
                            {paperCodes.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
                        </select>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)}
                            className="px-3 py-1.5 border border-border-color rounded-md text-xs text-text-secondary bg-white focus:outline-none">
                            <option value="">All Types</option>
                            <option value="objective">Objective</option>
                            <option value="subjective">Subjective</option>
                            <option value="multiple-answer">Multi-Answer</option>
                        </select>
                        <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}
                            className="px-3 py-1.5 border border-border-color rounded-md text-xs text-text-secondary bg-white focus:outline-none">
                            <option value="">All Levels</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-bg-secondary border-b border-border-color">
                                {['Code', 'Question', 'Type', 'Difficulty', 'Marks', 'Neg.', 'Unit', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-text-muted">No questions found.</td></tr>
                            ) : filtered.map(q => (
                                <tr key={q.id} className="hover:bg-bg-secondary transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs font-semibold text-accent-primary">{q.code}</span>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs">
                                        <p className="text-sm text-text-primary line-clamp-2">{q.text}</p>
                                        {q.image && <span className="text-xs text-purple-600 flex items-center gap-1 mt-0.5"><Image size={10} /> Has image</span>}
                                    </td>
                                    <td className="px-4 py-3"><span className={typeBadge(q.type)}>{typeLabel(q.type)}</span></td>
                                    <td className="px-4 py-3"><span className={diffBadge(q.difficulty)}>{q.difficulty}</span></td>
                                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">{q.marks}</td>
                                    <td className="px-4 py-3 text-sm text-red-600">{q.negativeMarks ? `-${q.negativeMarks}` : '—'}</td>
                                    <td className="px-4 py-3 text-xs text-text-muted">{q.unit ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <button className="p-1.5 rounded border border-border-color text-text-muted hover:bg-bg-secondary transition-colors"><Eye size={13} /></button>
                                            <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ── Generate Paper Sub-tab ────────────────────────────────────
const GeneratePaper = ({ bank }: { bank: BankQuestion[] }) => {
    const [selPaper, setSelPaper] = useState('');
    const [totalMarks, setTotalMarks] = useState('100');
    const [duration, setDuration] = useState('3');
    const [institute, setInstitute] = useState('CampusCore University');
    const [examTitle, setExamTitle] = useState('');
    const [sectConfig, setSectConfig] = useState<{ type: QuestionType; diff: Difficulty | ''; count: string }[]>([
        { type: 'objective', diff: 'easy', count: '10' },
        { type: 'multiple-answer', diff: 'medium', count: '5' },
        { type: 'subjective', diff: 'hard', count: '3' },
    ]);
    const [generated, setGenerated] = useState<BankQuestion[][]>([]);
    const [showPaper, setShowPaper] = useState(false);

    const addSection = () => setSectConfig(prev => [...prev, { type: 'objective', diff: '', count: '5' }]);
    const updateSect = (i: number, key: string, val: string) =>
        setSectConfig(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
    const removeSection = (i: number) => setSectConfig(prev => prev.filter((_, idx) => idx !== i));

    const handleGenerate = () => {
        const paperQs = bank.filter(q => q.paperCode === selPaper);
        const sections = sectConfig.map(cfg => {
            const pool = paperQs.filter(q => q.type === cfg.type && (!cfg.diff || q.difficulty === cfg.diff));
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, Number(cfg.count));
        });
        setGenerated(sections);
        setShowPaper(true);
    };

    const sectionLabels = ['A', 'B', 'C', 'D', 'E'];

    return (
        <div className="space-y-6">
            {!showPaper ? (
                <>
                    {/* Config Panel */}
                    <div className="border border-border-color rounded-lg bg-white overflow-hidden">
                        <div className="px-5 py-4 bg-bg-secondary border-b border-border-color flex items-center gap-2">
                            <Zap size={16} className="text-accent-primary" />
                            <h3 className="text-sm font-bold text-text-primary">Paper Configuration</h3>
                        </div>
                        <div className="p-5 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Institute Name</label>
                                    <input value={institute} onChange={e => setInstitute(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm bg-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Exam / Paper Title</label>
                                    <input value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder="e.g. Mid-Sem Examination 2026"
                                        className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm bg-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Paper Code <span className="text-red-500">*</span></label>
                                    <select value={selPaper} onChange={e => setSelPaper(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm bg-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20">
                                        <option value="">Select paper…</option>
                                        {paperCodes.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
                                    </select>
                                    {selPaper && <p className="text-xs text-text-muted mt-1">{bank.filter(q => q.paperCode === selPaper).length} questions in bank for {selPaper}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Total Marks</label>
                                        <input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm bg-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Duration (hrs)</label>
                                        <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm bg-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20" />
                                    </div>
                                </div>
                            </div>

                            {/* Sections */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Sections</label>
                                    <button onClick={addSection} className="text-xs px-3 py-1.5 rounded border border-accent-primary text-accent-primary hover:bg-[#f0f6ff] font-semibold flex items-center gap-1 transition-colors">
                                        <Plus size={12} /> Add Section
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {sectConfig.map((s, i) => (
                                        <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 border border-border-color rounded-md bg-bg-secondary">
                                            <span className="col-span-1 text-xs font-bold text-text-muted text-center">§{sectionLabels[i] ?? i + 1}</span>
                                            <select value={s.type} onChange={e => updateSect(i, 'type', e.target.value)}
                                                className="col-span-4 px-2 py-1.5 border border-border-color rounded text-xs bg-white focus:outline-none focus:border-accent-primary">
                                                <option value="objective">Objective</option>
                                                <option value="subjective">Subjective</option>
                                                <option value="multiple-answer">Multi-Answer</option>
                                            </select>
                                            <select value={s.diff} onChange={e => updateSect(i, 'diff', e.target.value)}
                                                className="col-span-3 px-2 py-1.5 border border-border-color rounded text-xs bg-white focus:outline-none focus:border-accent-primary">
                                                <option value="">Any Level</option>
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                            </select>
                                            <div className="col-span-3 flex items-center gap-1">
                                                <input type="number" min="1" value={s.count} onChange={e => updateSect(i, 'count', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-border-color rounded text-xs bg-white focus:outline-none focus:border-accent-primary" />
                                                <span className="text-xs text-text-muted whitespace-nowrap">Qs</span>
                                            </div>
                                            <button onClick={() => removeSection(i)} className="col-span-1 flex justify-center text-text-muted hover:text-red-500 transition-colors"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border-color">
                                <button onClick={handleGenerate} disabled={!selPaper}
                                    className="primary-btn disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Zap size={16} /> Generate Question Paper
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* ── Generated Paper Preview ── */
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-text-primary">Generated Paper Preview</h3>
                        <div className="flex gap-3">
                            <button onClick={() => setShowPaper(false)} className="secondary-btn !py-2 text-xs">← Reconfigure</button>
                            <button className="secondary-btn !py-2 text-xs flex items-center gap-1.5"><Download size={14} /> Export PDF</button>
                            <button className="primary-btn !py-2 text-xs flex items-center gap-1.5"><Printer size={14} /> Print</button>
                        </div>
                    </div>
                    <div className="border border-border-color rounded-lg bg-white p-8 space-y-8">
                        {/* Header */}
                        <div className="text-center space-y-1 pb-6 border-b-2 border-text-primary">
                            <p className="text-base font-bold text-text-primary uppercase tracking-wide">{institute}</p>
                            <p className="text-sm text-text-secondary">{examTitle || 'End Semester Examination'}</p>
                            <div className="flex justify-center gap-8 mt-3 text-sm">
                                <span><strong>Paper Code:</strong> {selPaper}</span>
                                <span><strong>Max. Marks:</strong> {totalMarks}</span>
                                <span><strong>Duration:</strong> {duration} Hours</span>
                            </div>
                            <p className="text-xs text-text-muted mt-2">Date: ___________  &nbsp;&nbsp; Seat No.: ___________</p>
                        </div>
                        {/* Sections */}
                        {generated.map((qs, si) => (
                            <div key={si} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold uppercase text-text-primary">Section {sectionLabels[si] ?? si + 1}</h4>
                                    {qs[0] && <><span className={typeBadge(qs[0].type)}>{typeLabel(qs[0].type)}</span><span className={diffBadge(qs[0].difficulty)}>{qs[0].difficulty}</span></>}
                                    <span className="text-xs text-text-muted ml-auto">[{qs.length} question{qs.length !== 1 ? 's' : ''}]</span>
                                </div>
                                {qs.length === 0 ? (
                                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">Not enough questions in bank for this section.</p>
                                ) : (
                                    <ol className="space-y-4 list-none">
                                        {qs.map((q, qi) => (
                                            <li key={q.id} className="flex gap-3">
                                                <span className="text-sm font-semibold text-text-primary min-w-[24px]">{qi + 1}.</span>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm text-text-primary">{q.text}</p>
                                                        <span className="text-xs font-semibold text-text-muted whitespace-nowrap">[{q.marks} M{q.negativeMarks ? `, -${q.negativeMarks}` : ''}]</span>
                                                    </div>
                                                    {q.image && <img src={q.image} alt="" className="mt-2 max-h-32 border border-border-color rounded" />}
                                                    {q.options && (
                                                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                                                            {q.options.map((opt, oi) => (
                                                                <p key={oi} className="text-sm text-text-secondary">({String.fromCharCode(97 + oi)}) {opt}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-text-muted mt-1 font-mono">{q.code}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </div>
                        ))}
                        <div className="pt-4 border-t border-border-color text-center text-xs text-text-muted">— End of Paper —</div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main QuestionBank Component ───────────────────────────────
type QBSubTab = 'upload' | 'generate';

const QuestionBank = () => {
    const [subTab, setSubTab] = useState<QBSubTab>('upload');
    const [bank, setBank] = useState<BankQuestion[]>(initialBank);

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-1 border-b border-border-color">
                {([['upload', '📝 Upload Questions'], ['generate', '⚡ Generate Paper']] as [QBSubTab, string][]).map(([t, lbl]) => (
                    <button key={t} onClick={() => setSubTab(t)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${subTab === t ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                        {lbl}
                    </button>
                ))}
                <span className="ml-auto text-xs text-text-muted pr-1">{bank.length} questions in bank</span>
            </div>
            {subTab === 'upload' && <UploadQuestions bank={bank} setBank={setBank} />}
            {subTab === 'generate' && <GeneratePaper bank={bank} />}
        </div>
    );
};

export default QuestionBank;
