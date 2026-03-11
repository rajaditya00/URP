import { useState } from 'react';
import {
  Calendar, CheckCircle2, AlertCircle, FileText, Download, FilePen,
  ClipboardList, Award, MapPin, User, BookOpen, ChevronRight,
  Clock, Building, Search, Filter, Plus, Eye, Send, Printer,
  Lock, Unlock, Info, Phone, Layers
} from 'lucide-react';
import { StatCard } from '../components/UI/Card';
import {
  semesterData, examCenters, admitCardStudents, resultData, schedule,
  type Subject
} from '../data/examData';
import QuestionBank from '../components/Examination/QuestionBank';

// ── Types ─────────────────────────────────────────────────────
type Tab = 'overview' | 'form' | 'admitcards' | 'manage' | 'questionbank';

// ── Helper ────────────────────────────────────────────────────
const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    Completed: 'bg-green-50 text-green-700 border-green-200',
    Postponed: 'bg-red-50 text-red-700 border-red-200',
    Pending: 'bg-slate-100 text-slate-600 border-slate-200',
    Approved: 'bg-blue-50 text-blue-700 border-blue-200',
    Released: 'bg-green-50 text-green-700 border-green-200',
    Pass: 'bg-green-50 text-green-700 border-green-200',
    Distinction: 'bg-purple-50 text-purple-700 border-purple-200',
    ATKT: 'bg-red-50 text-red-700 border-red-200',
    Fail: 'bg-red-100 text-red-800 border-red-300',
  };
  return `px-2.5 py-0.5 text-xs font-semibold rounded-sm border ${map[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`;
};

const typeBadge = (type: Subject['type']) => {
  const map: Record<string, string> = {
    core: 'bg-blue-50 text-blue-700 border-blue-200',
    lab: 'bg-teal-50 text-teal-700 border-teal-200',
    elective: 'bg-purple-50 text-purple-700 border-purple-200',
    backlog: 'bg-red-50 text-red-700 border-red-200',
  };
  return `text-xs px-2 py-0.5 rounded border font-medium ${map[type]}`;
};

// ── Overview ──────────────────────────────────────────────────
const Overview = ({ setTab }: { setTab: (t: Tab) => void }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard title="Forms Submitted" value="4,821" icon={<FilePen size={20} />} trend="98% of enrolled" trendUp={true} />
      <StatCard title="Upcoming Exams" value="12" icon={<Calendar size={20} />} trend="Next 7 days" trendUp={true} />
      <StatCard title="Admit Cards Released" value="4,650" icon={<CheckCircle2 size={20} />} trend="171 pending" trendUp={false} />
      <StatCard title="Results Pending" value="3" icon={<AlertCircle size={20} />} trend="Under evaluation" trendUp={false} />
    </div>

    {/* Info banner */}
    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
      <Info size={16} className="mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-semibold">Semester VI (Even) · 2025-26</span> — Exam form submission open until <span className="font-semibold">Oct 15, 2026</span>. Late submission with penalty till Oct 20.
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[
        { tab: 'form' as Tab, icon: <FilePen size={22} className="text-accent-primary" />, title: 'Exam Form Submission', desc: 'Fill semester exam form. Core subjects auto-assigned by university; pick your elective papers.' },
        { tab: 'admitcards' as Tab, icon: <ClipboardList size={22} className="text-accent-primary" />, title: 'Admit Card Management', desc: 'Verify, approve and release admit cards to students with center allotments.' },
        { tab: 'manage' as Tab, icon: <Award size={22} className="text-accent-primary" />, title: 'Results & Schedule', desc: 'Publish results, enter marks, manage exam timetable and venue assignments.' },
        { tab: 'questionbank' as Tab, icon: <Layers size={22} className="text-accent-primary" />, title: 'Question Bank & Papers', desc: 'Upload questions with type, difficulty & marking. Generate and print question papers from the bank.' },
      ].map(card => (
        <button key={card.tab} onClick={() => setTab(card.tab)}
          className="text-left p-6 border border-border-color rounded-lg bg-white hover:border-accent-primary hover:shadow-sm transition-all group flex items-start gap-5">
          <div className="w-11 h-11 rounded-md bg-[#f0f6ff] border border-[#dbeafe] flex items-center justify-center flex-shrink-0">
            {card.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary mb-1">{card.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{card.desc}</p>
          </div>
          <ChevronRight size={16} className="text-text-muted group-hover:text-accent-primary flex-shrink-0 mt-1 transition-colors" />
        </button>
      ))}
    </div>

    <div className="border border-border-color rounded-lg bg-white">
      <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Upcoming Exam Schedule</h3>
        <span className="text-xs text-text-muted">Fall 2026 · Sem VI</span>
      </div>
      <div className="divide-y divide-border-color">
        {schedule.slice(0, 5).map((item, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">{item.course}</p>
              <p className="text-xs text-text-muted mt-0.5">{item.date} · {item.time} · {item.venue} · <span className="italic">Invigilator: {item.invigilator}</span></p>
            </div>
            <span className={statusBadge(item.status)}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Exam Form ─────────────────────────────────────────────────
const ExamForm = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [extraSubjects, setExtraSubjects] = useState<string[]>([]);
  // elective picks: groupId → subjectCode
  const [electivePicks, setElectivePicks] = useState<Record<string, string>>({});
  // center preferences
  const [pref1, setPref1] = useState('');
  const [pref2, setPref2] = useState('');
  const [pref3, setPref3] = useState('');
  // search queries for each combobox
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [search3, setSearch3] = useState('');
  // which dropdown is open (1 | 2 | 3 | null)
  const [openPref, setOpenPref] = useState<number | null>(null);

  const { coreSubjects, electiveGroups, label, year, branch } = semesterData;

  const toggleExtra = (code: string) =>
    setExtraSubjects(prev => prev.includes(code) ? prev.filter(s => s !== code) : [...prev, code]);

  const availableCenters = (exclude: readonly string[], query: string) =>
    examCenters.filter(c => !exclude.includes(c.id) &&
      (query === '' || `${c.name} ${c.city} ${c.address}`.toLowerCase().includes(query.toLowerCase())));

  const selectedCenter = (id: string) => examCenters.find(c => c.id === id);

  const allElectivesPicked = electiveGroups.every(g => !!electivePicks[g.groupId]);

  if (submitted) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
        <CheckCircle2 size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">Form Submitted Successfully!</h2>
      <p className="text-text-secondary text-sm text-center max-w-md">Your examination form is under verification. Admit card will be released once approved by the Examination Controller.</p>
      <div className="p-5 border border-border-color rounded-lg bg-white mt-2 w-full max-w-md text-sm space-y-2">
        <div className="flex justify-between"><span className="text-text-muted">PRN</span><span className="font-semibold">2021CSE006</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Semester</span><span className="font-semibold">{label}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Core Subjects</span><span className="font-semibold">{coreSubjects.length}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Electives</span><span className="font-semibold">{Object.values(electivePicks).join(', ') || '—'}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Centre Pref 1</span><span className="font-semibold">{examCenters.find(c => c.id === pref1)?.name.split('—')[1]?.trim() ?? '—'}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Status</span><span className={statusBadge('Pending')}>Pending Verification</span></div>
      </div>
      <button onClick={() => { setSubmitted(false); setStep(1); setElectivePicks({}); setPref1(''); setPref2(''); setPref3(''); setExtraSubjects([]); }} className="primary-btn mt-2">Fill Another Form</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center gap-3 mb-8">
        {['Student Details', 'Subjects & Electives', 'Centre Preference', 'Review & Submit'].map((label, i) => (
          <div key={i} className="flex items-center gap-3 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step > i + 1 ? 'bg-green-600 text-white' : step === i + 1 ? 'bg-accent-primary text-white' : 'bg-bg-secondary border border-border-color text-text-muted'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-accent-primary' : 'text-text-muted'}`}>{label}</span>
            {i < 3 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-green-500' : 'bg-border-color'}`} />}
          </div>
        ))}
      </div>

      <div className="border border-border-color rounded-lg bg-white p-6">

        {/* Step 1: Student Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-1">Student Details</h2>
              <p className="text-sm text-text-secondary">Information pre-filled from your academic record. Verify before proceeding.</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border border-border-color rounded-md text-sm">
              <Info size={14} className="text-accent-primary flex-shrink-0" />
              <span className="text-text-secondary"><strong>Branch:</strong> {branch} &nbsp;·&nbsp; <strong>Semester:</strong> {semesterData.label} &nbsp;·&nbsp; <strong>Year:</strong> {year}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', defaultValue: 'Rohan Mehta' },
                { label: 'PRN Number', defaultValue: '2021CSE006' },
                { label: 'Roll Number', defaultValue: 'A06' },
                { label: 'Department', defaultValue: 'Computer Science & Engineering' },
                { label: 'Semester', defaultValue: 'VI (Sixth)' },
                { label: 'Academic Year', defaultValue: '2025-26' },
                { label: 'Phone Number', defaultValue: '', placeholder: '+91 XXXXXXXXXX' },
                { label: 'Email Address', defaultValue: '', placeholder: 'your@college.edu' },
                { label: 'Category', defaultValue: 'General' },
                { label: 'Fee Receipt No.', defaultValue: '', placeholder: 'FR-2026-XXXXX' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input defaultValue={f.defaultValue} placeholder={f.placeholder ?? ''}
                    className="w-full px-3 py-2.5 border border-border-color rounded-md text-sm text-text-primary bg-white placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-colors" />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setStep(2)} className="primary-btn">Next: Subjects & Electives <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 2: Subjects & Electives */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-1">Subjects & Electives</h2>
              <p className="text-sm text-text-secondary">Core subjects are pre-assigned by the university. Choose one from each elective group.</p>
            </div>

            {/* University-assigned core subjects */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={14} className="text-text-muted" />
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">University Assigned — Core Subjects</h3>
              </div>
              <div className="space-y-2">
                {coreSubjects.map(sub => (
                  <div key={sub.code} className="flex items-center gap-4 p-3.5 border border-blue-200 rounded-md bg-blue-50/50">
                    <div className="w-5 h-5 rounded flex items-center justify-center bg-accent-primary border border-accent-primary flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{sub.name}</p>
                      <p className="text-xs text-text-muted">{sub.code} · {sub.credits} Credits · Max: {sub.maxMarks} marks</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={typeBadge(sub.type)}>{sub.type.toUpperCase()}</span>
                      <span className="text-xs text-text-muted flex items-center gap-1"><Lock size={10} /> Auto</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elective groups */}
            {electiveGroups.map(group => (
              <div key={group.groupId}>
                <div className="flex items-center gap-2 mb-3">
                  <Unlock size={14} className="text-purple-600" />
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{group.groupName}</h3>
                  <span className="text-xs text-purple-600 font-medium">· Choose {group.pickCount}</span>
                </div>
                <div className="space-y-2">
                  {group.options.map(opt => {
                    const picked = electivePicks[group.groupId] === opt.code;
                    return (
                      <label key={opt.code} className={`flex items-center gap-4 p-3.5 border rounded-md cursor-pointer transition-all ${picked ? 'border-purple-400 bg-purple-50' : 'border-border-color bg-white hover:border-purple-300'}`}>
                        <input type="radio" name={`elective-${group.groupId}`} className="w-4 h-4 accent-purple-600"
                          checked={picked}
                          onChange={() => setElectivePicks(prev => ({ ...prev, [group.groupId]: opt.code }))} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text-primary">{opt.name}</p>
                          <p className="text-xs text-text-muted">{opt.code} · {opt.credits} Credits · Max: {opt.maxMarks} marks</p>
                        </div>
                        <span className={typeBadge('elective')}>ELECTIVE</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Optional backlog */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-amber-600" />
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Backlog / Ex-Student Papers</h3>
                <span className="text-xs text-amber-600 font-medium">· Optional</span>
              </div>
              <div className="space-y-2">
                {[
                  { code: 'CS501', name: 'Theory of Computation', credits: 3, sem: 5 },
                  { code: 'CS502', name: 'Computer Graphics', credits: 3, sem: 5 },
                ].map(b => (
                  <label key={b.code} className={`flex items-center gap-4 p-3.5 border rounded-md cursor-pointer transition-all ${extraSubjects.includes(b.code) ? 'border-amber-400 bg-amber-50' : 'border-border-color bg-white hover:border-amber-300'}`}>
                    <input type="checkbox" className="w-4 h-4 accent-amber-600"
                      checked={extraSubjects.includes(b.code)}
                      onChange={() => toggleExtra(b.code)} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{b.name}</p>
                      <p className="text-xs text-text-muted">{b.code} · Sem {b.sem} backlog · {b.credits} Credits</p>
                    </div>
                    <span className={typeBadge('backlog')}>BACKLOG</span>
                  </label>
                ))}
              </div>
            </div>

            {!allElectivesPicked && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Please select one elective from each group before proceeding.
              </p>
            )}

            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(1)} className="secondary-btn">Back</button>
              <button onClick={() => setStep(3)} disabled={!allElectivesPicked} className="primary-btn disabled:opacity-50 disabled:cursor-not-allowed">
                Next: Centre Preference <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Centre Preferences */}
        {step === 3 && (
          <div className="space-y-6" onClick={() => setOpenPref(null)}>
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-1">Examination Centre Preference</h2>
              <p className="text-sm text-text-secondary">Type to search and select your preferred centres in order. Final allotment is at the discretion of the Examination Controller.</p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              <p>Each preference must be a different centre. Allotment depends on seat availability and category reservation.</p>
            </div>

            {([
              { pref: 1, label: '1st Preference', value: pref1, set: setPref1, clear: () => { setPref1(''); setSearch1(''); }, search: search1, setSearch: setSearch1, exclude: [pref2, pref3], star: true },
              { pref: 2, label: '2nd Preference', value: pref2, set: setPref2, clear: () => { setPref2(''); setSearch2(''); }, search: search2, setSearch: setSearch2, exclude: [pref1, pref3], star: false },
              { pref: 3, label: '3rd Preference', value: pref3, set: setPref3, clear: () => { setPref3(''); setSearch3(''); }, search: search3, setSearch: setSearch3, exclude: [pref1, pref2], star: false },
            ] as const).map(({ pref, label, value, set, clear, search, setSearch, exclude, star }) => {
              const chosen = selectedCenter(value);
              const results = availableCenters(exclude, search);
              const isOpen = openPref === pref;
              return (
                <div key={pref}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${value ? 'bg-green-600 text-white' : pref === 1 ? 'bg-accent-primary text-white' : 'bg-bg-secondary border border-border-color text-text-muted'
                      }`}>{value ? '✓' : pref}</div>
                    <span className="text-sm font-semibold text-text-primary">{label}{star && <span className="text-red-500 ml-0.5">*</span>}</span>
                    {value && <span className="text-xs text-green-600 font-medium">Selected</span>}
                  </div>

                  {/* Selected pill */}
                  {chosen && (
                    <div className="flex items-center gap-3 p-3 mb-2 border border-green-300 bg-green-50 rounded-md">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">{chosen.name}</p>
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5"><MapPin size={10} /> {chosen.city} · Cap: {chosen.capacity}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); clear(); }}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium">
                        ✕ Change
                      </button>
                    </div>
                  )}

                  {/* Search input + dropdown */}
                  {!chosen && (
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <div className={`flex items-center border rounded-md px-3 py-2.5 bg-white transition-colors ${isOpen ? 'border-accent-primary ring-2 ring-accent-primary/20' : 'border-border-color hover:border-accent-primary/50'
                        }`}>
                        <Search size={14} className="text-text-muted mr-2 flex-shrink-0" />
                        <input
                          className="flex-1 text-sm outline-none bg-transparent text-text-primary placeholder:text-text-muted"
                          placeholder={`Search by name, city… (e.g. "Hall A", "Pune", "Lab")`}
                          value={search}
                          onFocus={() => setOpenPref(pref)}
                          onChange={e => { setSearch(e.target.value); setOpenPref(pref); }}
                        />
                        {search && (
                          <button onClick={() => setSearch('')} className="text-text-muted hover:text-text-primary ml-1">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                          </button>
                        )}
                      </div>

                      {/* Dropdown results */}
                      {isOpen && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-border-color rounded-md shadow-lg max-h-72 overflow-y-auto">
                          {results.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-text-muted">
                              No centres match <span className="font-medium text-text-primary">"{search}"</span>
                            </div>
                          ) : (
                            results.map(c => (
                              <button
                                key={c.id}
                                className="w-full text-left px-4 py-3 hover:bg-[#f0f6ff] transition-colors border-b border-border-color last:border-0 group"
                                onClick={() => { set(c.id); setSearch(''); setOpenPref(null); }}
                              >
                                <p className="text-sm font-semibold text-text-primary group-hover:text-accent-primary">{c.name}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                                  <span className="text-xs text-text-muted flex items-center gap-1"><MapPin size={10} /> {c.city}, {c.state} – {c.pincode}</span>
                                  <span className="text-xs text-text-muted flex items-center gap-1"><User size={10} /> Cap: {c.capacity}</span>
                                  <span className="text-xs text-text-muted flex items-center gap-1"><Phone size={10} /> {c.phone}</span>
                                </div>
                                <p className="text-xs text-text-muted mt-0.5">Contact: {c.contactPerson}</p>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(2)} className="secondary-btn">Back</button>
              <button onClick={() => setStep(4)} disabled={!pref1} className="primary-btn disabled:opacity-50">
                Review Application <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-6">Review & Submit</h2>
            <div className="space-y-5">

              {/* Student info */}
              <div className="border border-border-color rounded-md overflow-hidden">
                <div className="px-4 py-3 bg-bg-secondary border-b border-border-color">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Student Information</p>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-text-muted">Name:</span> <span className="font-medium text-text-primary ml-1">Rohan Mehta</span></div>
                  <div><span className="text-text-muted">PRN:</span> <span className="font-medium ml-1">2021CSE006</span></div>
                  <div><span className="text-text-muted">Branch:</span> <span className="font-medium ml-1">CSE · Sem VI</span></div>
                  <div><span className="text-text-muted">Year:</span> <span className="font-medium ml-1">2025-26</span></div>
                </div>
              </div>

              {/* Subjects */}
              <div className="border border-border-color rounded-md overflow-hidden">
                <div className="px-4 py-3 bg-bg-secondary border-b border-border-color">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Subjects ({coreSubjects.length + electiveGroups.length + extraSubjects.length} total)</p>
                </div>
                <div className="px-4 py-3 space-y-1.5">
                  {coreSubjects.map(s => (
                    <div key={s.code} className="flex justify-between text-sm">
                      <span className="text-text-primary">{s.name}</span>
                      <span className={typeBadge(s.type)}>{s.type.toUpperCase()}</span>
                    </div>
                  ))}
                  {electiveGroups.map(g => {
                    const picked = g.options.find(o => o.code === electivePicks[g.groupId]);
                    return picked ? (
                      <div key={g.groupId} className="flex justify-between text-sm">
                        <span className="text-text-primary">{picked.name}</span>
                        <span className={typeBadge('elective')}>ELECTIVE</span>
                      </div>
                    ) : null;
                  })}
                  {extraSubjects.map(code => (
                    <div key={code} className="flex justify-between text-sm">
                      <span className="text-text-primary">{code}</span>
                      <span className={typeBadge('backlog')}>BACKLOG</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Centre preferences */}
              <div className="border border-border-color rounded-md overflow-hidden">
                <div className="px-4 py-3 bg-bg-secondary border-b border-border-color">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Examination Centre Preferences</p>
                </div>
                <div className="px-4 py-3 space-y-2 text-sm">
                  {[pref1, pref2, pref3].map((id, idx) => {
                    const c = examCenters.find(x => x.id === id);
                    if (!c) return null;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-accent-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                        <span className="text-text-primary font-medium">{c.name}</span>
                        <span className="text-text-muted text-xs flex items-center gap-1"><MapPin size={10} /> {c.city}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <p>By submitting, you confirm all information is accurate. Center allotment is at the discretion of the Examination Controller and cannot be changed after submission.</p>
              </div>
            </div>
            <div className="flex justify-between pt-6">
              <button onClick={() => setStep(3)} className="secondary-btn">Back</button>
              <button onClick={() => setSubmitted(true)} className="primary-btn">
                <Send size={16} /> Submit Exam Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Admit Cards ───────────────────────────────────────────────
const AdmitCards = () => {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? admitCardStudents : admitCardStudents.filter(s => s.status === filter);
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          {['All', 'Pending', 'Approved', 'Released'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${filter === f ? 'bg-accent-primary text-white border-accent-primary' : 'bg-white text-text-secondary border-border-color hover:border-accent-primary'}`}>{f}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="flex items-center border border-border-color rounded-md px-3 py-2 bg-white w-60">
            <Search size={14} className="text-text-muted mr-2" />
            <input className="text-sm outline-none w-full" placeholder="Search student..." />
          </div>
          <button className="secondary-btn !py-2 !px-3"><Filter size={14} /></button>
        </div>
      </div>

      <div className="border border-border-color rounded-lg bg-white overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-bg-secondary border-b border-border-color">
              {['Student', 'PRN / Roll', 'Dept / Sem', 'Category', 'Centre Pref 1', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {filtered.map(stu => (
              <tr key={stu.id} className="hover:bg-bg-secondary transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{stu.name.charAt(0)}</div>
                    <span className="text-sm font-semibold text-text-primary">{stu.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-text-secondary">
                  <p className="font-mono">{stu.prn}</p>
                  <p className="text-xs text-text-muted">Roll: {stu.rollNo}</p>
                </td>
                <td className="px-5 py-4 text-sm text-text-secondary">{stu.dept} · Sem {stu.sem}</td>
                <td className="px-5 py-4 text-sm text-text-secondary">{stu.category}</td>
                <td className="px-5 py-4 text-sm text-text-secondary">
                  <p>{examCenters.find(c => c.id === stu.centerPref1)?.name.split('—')[1]?.trim() ?? stu.center}</p>
                  <p className="text-xs text-text-muted">Pref 2: {examCenters.find(c => c.id === stu.centerPref2)?.city ?? '—'} · Pref 3: {examCenters.find(c => c.id === stu.centerPref3)?.city ?? '—'}</p>
                </td>
                <td className="px-5 py-4"><span className={statusBadge(stu.status)}>{stu.status}</span></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {stu.status === 'Pending' && <button className="text-xs px-3 py-1.5 rounded border border-accent-primary text-accent-primary hover:bg-[#f0f6ff] transition-colors font-semibold">Approve</button>}
                    {stu.status === 'Approved' && <button className="text-xs px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold flex items-center gap-1"><Send size={12} /> Release</button>}
                    {stu.status === 'Released' && <button className="text-xs px-3 py-1.5 rounded border border-border-color text-text-secondary hover:bg-bg-secondary transition-colors font-semibold flex items-center gap-1"><Printer size={12} /> Print</button>}
                    <button className="text-xs px-3 py-1.5 rounded border border-border-color text-text-secondary hover:bg-bg-secondary transition-colors flex items-center gap-1"><Eye size={12} /> View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="border border-border-color rounded-lg bg-white p-5 text-center">
          <p className="text-2xl font-bold text-text-primary">4,821</p>
          <p className="text-sm text-text-muted mt-1">Total Forms</p>
        </div>
        <div className="border border-green-200 rounded-lg bg-green-50 p-5 text-center">
          <p className="text-2xl font-bold text-green-700">4,650</p>
          <p className="text-sm text-green-600 mt-1">Released</p>
        </div>
        <div className="border border-amber-200 rounded-lg bg-amber-50 p-5 text-center">
          <p className="text-2xl font-bold text-amber-700">171</p>
          <p className="text-sm text-amber-600 mt-1">Pending / Under Review</p>
        </div>
      </div>
    </div>
  );
};

// ── Manage: Results + Schedule ────────────────────────────────
type ManageSubTab = 'results' | 'schedule';

const Manage = () => {
  const [subTab, setSubTab] = useState<ManageSubTab>('results');
  const [published, setPublished] = useState(false);
  const allSubjects = [
    ...semesterData.coreSubjects,
    { code: 'CS651', name: 'Cloud Computing', credits: 3, type: 'elective' as const, maxMarks: 75, isUniversityAssigned: false },
  ];

  return (
    <div className="space-y-5">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-border-color">
        {(['results', 'schedule'] as ManageSubTab[]).map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${subTab === t ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
            {t === 'results' ? '📊 Results' : '📅 Exam Schedule'}
          </button>
        ))}
      </div>

      {subTab === 'results' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Semester VI — CSE Results (2025-26)</h3>
              <p className="text-sm text-text-muted">Enter marks and publish results to students.</p>
            </div>
            <div className="flex gap-3">
              <button className="secondary-btn !py-2"><Download size={14} /> Export</button>
              {!published
                ? <button onClick={() => setPublished(true)} className="primary-btn !py-2"><Send size={14} /> Publish Results</button>
                : <span className={statusBadge('Released') + ' !text-sm !px-4 !py-2'}>✓ Published</span>
              }
            </div>
          </div>

          {published && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
              <CheckCircle2 size={18} /> Results published. Students can now view their scorecards in the Student Portal.
            </div>
          )}

          <div className="border border-border-color rounded-lg bg-white overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-bg-secondary border-b border-border-color">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">Student</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">PRN</th>
                  {allSubjects.map(s => (
                    <th key={s.code} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted text-center">{s.code}</th>
                  ))}
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted text-center">SGPA</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {resultData.map(stu => (
                  <tr key={stu.id} className="hover:bg-bg-secondary transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{stu.name.charAt(0)}</div>
                        <span className="text-sm font-medium text-text-primary whitespace-nowrap">{stu.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-text-muted font-mono">{stu.prn}</td>
                    {allSubjects.map(s => {
                      const m = stu.marks[s.code];
                      const threshold = s.maxMarks * 0.4;
                      return (
                        <td key={s.code} className="px-4 py-4 text-center">
                          <input defaultValue={m ?? '—'}
                            className={`w-14 text-center text-sm border rounded px-2 py-1 focus:outline-none focus:border-accent-primary transition-colors ${m !== undefined && m < threshold ? 'bg-red-50 border-red-200 text-red-700' : 'border-border-color text-text-primary'}`} />
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-center font-bold text-text-primary">{stu.sgpa ?? '—'}</td>
                    <td className="px-4 py-4"><span className={statusBadge(stu.status)}>{stu.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Distinction', count: 1, color: 'purple' },
              { label: 'Pass', count: 2, color: 'green' },
              { label: 'ATKT', count: 1, color: 'red' },
              { label: 'Fail', count: 0, color: 'slate' },
            ].map(r => (
              <div key={r.label} className={`border rounded-lg p-4 text-center bg-${r.color}-50 border-${r.color}-200`}>
                <p className={`text-2xl font-bold text-${r.color}-700`}>{r.count}</p>
                <p className={`text-xs text-${r.color}-600 mt-1 font-medium`}>{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'schedule' && (
        <div className="space-y-5">
          <div className="flex justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Exam Schedule — Fall 2026</h3>
              <p className="text-sm text-text-muted">B.Tech Semester VI · All Branches</p>
            </div>
            <div className="flex gap-3">
              <button className="secondary-btn !py-2"><Download size={14} /> Download PDF</button>
              <button className="primary-btn !py-2"><Plus size={14} /> Add Exam</button>
            </div>
          </div>

          <div className="border border-border-color rounded-lg bg-white overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-secondary border-b border-border-color">
                  {['Course / Paper', 'Date', 'Time', 'Venue / Room', 'Invigilator', 'Students', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {schedule.map((exam, i) => (
                  <tr key={i} className="hover:bg-bg-secondary transition-colors">
                    <td className="px-5 py-4"><p className="text-sm font-semibold text-text-primary">{exam.course}</p></td>
                    <td className="px-5 py-4"><p className="text-sm text-text-primary font-medium">{exam.date}</p></td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs text-text-secondary border border-border-color px-2 py-1 rounded bg-bg-secondary">
                        <Clock size={11} /> {exam.time}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-text-secondary flex items-center gap-1"><Building size={11} /> {exam.venue}</p>
                      <p className="text-xs text-text-muted">{exam.room}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">{exam.invigilator}</td>
                    <td className="px-5 py-4 text-sm text-text-secondary">{exam.students}</td>
                    <td className="px-5 py-4"><span className={statusBadge(exam.status)}>{exam.status}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 border border-border-color rounded text-text-secondary hover:bg-bg-secondary transition-colors"><Eye size={12} /></button>
                        <button className="text-xs px-2 py-1 border border-border-color rounded text-text-secondary hover:bg-bg-secondary transition-colors"><FilePen size={12} /></button>
                      </div>
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

// ── Main Page ─────────────────────────────────────────────────
const Examination = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BookOpen size={16} /> },
    { id: 'form', label: 'Exam Form', icon: <FilePen size={16} /> },
    { id: 'admitcards', label: 'Admit Cards', icon: <ClipboardList size={16} /> },
    { id: 'manage', label: 'Results & Schedule', icon: <Award size={16} /> },
    { id: 'questionbank', label: 'Question Bank', icon: <Layers size={16} /> },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-border-color">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Examination Control Center</h1>
          <p className="text-sm text-text-secondary">Manage exam forms, admit cards, schedules and result publishing.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="secondary-btn !py-2 !text-xs"><FileText size={14} /> Reports</button>
          <button className="primary-btn !py-2 !text-xs"><Plus size={14} /> New Exam Cycle</button>
        </div>
      </div>

      <div className="flex items-center border-b border-border-color gap-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.id
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-highlight'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <Overview setTab={setActiveTab} />}
      {activeTab === 'form' && <ExamForm />}
      {activeTab === 'admitcards' && <AdmitCards />}
      {activeTab === 'manage' && <Manage />}
      {activeTab === 'questionbank' && <QuestionBank />}
    </div>
  );
};

export default Examination;