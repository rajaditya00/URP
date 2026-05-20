import { useState } from 'react';
import { ChevronRight, CheckCircle2, Lock, Unlock, AlertCircle, Search, MapPin, User, Phone, Send } from 'lucide-react';
import { semesterData, examCenters, type Subject } from '../../data/examData';

// Helper
const typeBadge = (type: Subject['type']) => {
  const map: Record<string, string> = {
    core: 'bg-blue-50 text-blue-700 border-blue-200',
    lab: 'bg-teal-50 text-teal-700 border-teal-200',
    elective: 'bg-purple-50 text-purple-700 border-purple-200',
    backlog: 'bg-red-50 text-red-700 border-red-200',
  };
  return `text-xs px-2 py-0.5 rounded border font-medium ${map[type]}`;
};

const statusBadge = (status: string) => {
  return `px-2.5 py-0.5 text-xs font-semibold rounded-sm border bg-slate-100 text-slate-600 border-slate-200`;
};

const ExamForm = ({ studentData }: { studentData?: any }) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [extraSubjects, setExtraSubjects] = useState<string[]>([]);
  const [electivePicks, setElectivePicks] = useState<Record<string, string>>({});
  const [pref1, setPref1] = useState('');
  const [pref2, setPref2] = useState('');
  const [pref3, setPref3] = useState('');
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [search3, setSearch3] = useState('');
  const [openPref, setOpenPref] = useState<number | null>(null);

  const { coreSubjects, electiveGroups, label, year, branch } = semesterData;

  const toggleExtra = (code: string) =>
    setExtraSubjects(prev => prev.includes(code) ? prev.filter(s => s !== code) : [...prev, code]);

  const availableCenters = (exclude: readonly string[], query: string) =>
    examCenters.filter(c => !exclude.includes(c.id) &&
      (query === '' || `${c.name} ${c.city} ${c.address}`.toLowerCase().includes(query.toLowerCase())));

  const selectedCenter = (id: string) => examCenters.find(c => c.id === id);

  const allElectivesPicked = electiveGroups.every(g => !!electivePicks[g.groupId]);

  const handlePrint = () => {
    window.print();
  };

  if (submitted) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
        <CheckCircle2 size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">Form Submitted Successfully!</h2>
      <p className="text-text-secondary text-sm text-center max-w-md">Your examination form is under verification. Admit card will be released once approved by the Examination Controller.</p>

      {/* Printable Area */}
      <div id="print-area" className="p-5 border border-border-color rounded-lg bg-white mt-2 w-full max-w-md text-sm space-y-2">
        <div className="text-center font-bold mb-4 pb-2 border-b">
          <h3>EMS University Examination Application</h3>
          <p className="text-xs text-text-muted">Academic Year {year}</p>
        </div>
        <div className="flex justify-between"><span className="text-text-muted">Student Name</span><span className="font-semibold">{studentData?.name || 'Rohan Mehta'}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Email</span><span className="font-semibold">{studentData?.email || 'student@college.edu'}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">PRN</span><span className="font-semibold">{studentData?.prn || '2021CSE006'}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Semester</span><span className="font-semibold">{label}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Core Subjects</span><span className="font-semibold">{coreSubjects.length}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Electives</span><span className="font-semibold">{Object.values(electivePicks).join(', ') || '—'}</span></div>
        <div className="flex justify-between"><span className="text-text-muted">Centre Pref 1</span><span className="font-semibold">{examCenters.find(c => c.id === pref1)?.name.split('—')[1]?.trim() ?? '—'}</span></div>
        <div className="flex justify-between mt-4 pt-2 border-t border-dashed"><span className="text-text-muted">Status</span><span className="font-bold text-amber-600">Pending Verification</span></div>
      </div>
      <div className="flex gap-4 mt-2 print:hidden">
        <button onClick={handlePrint} className="primary-btn">Print Application</button>
        <button onClick={() => { setSubmitted(false); setStep(1); setElectivePicks({}); setPref1(''); setPref2(''); setPref3(''); setExtraSubjects([]); }} className="secondary-btn">Fill Another Form</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto print:hidden">
      {/* Stepper */}
      <div className="flex items-center gap-3 mb-8">
        {['Student Details', 'Subjects & Electives', 'Centre Preference', 'Review & Submit'].map((lbl, i) => (
          <div key={i} className="flex items-center gap-3 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step > i + 1 ? 'bg-green-600 text-white' : step === i + 1 ? 'bg-accent-primary text-white' : 'bg-bg-secondary border border-border-color text-text-muted'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-accent-primary' : 'text-text-muted'}`}>{lbl}</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', defaultValue: studentData?.name || 'Rohan Mehta', disabled: true },
                { label: 'PRN Number', defaultValue: studentData?.prn || '2021CSE006', disabled: true },
                { label: 'Roll Number', defaultValue: studentData?.rollNo || 'A06', disabled: true },
                { label: 'Department', defaultValue: studentData?.department || 'Computer Science & Engineering', disabled: true },
                { label: 'Semester', defaultValue: label, disabled: true },
                { label: 'Academic Year', defaultValue: year, disabled: true },
                { label: 'Phone Number', defaultValue: studentData?.mobile || '', placeholder: '+91 XXXXXXXXXX' },
                { label: 'Email Address', defaultValue: studentData?.email || '', placeholder: 'your@college.edu', disabled: true },
                { label: 'Category', defaultValue: studentData?.category || 'General', disabled: true },
                { label: 'Fee Receipt No.', defaultValue: '', placeholder: 'FR-2026-XXXXX' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input defaultValue={f.defaultValue} placeholder={f.placeholder ?? ''} disabled={f.disabled}
                    className={`w-full px-3 py-2.5 border border-border-color rounded-md text-sm text-text-primary bg-white placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-colors ${f.disabled ? 'bg-slate-50 cursor-not-allowed opacity-80' : ''}`} />
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
                          placeholder={`Search by name, city…`}
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
                                  <span className="text-xs text-text-muted flex items-center gap-1"><MapPin size={10} /> {c.city}, {c.state}</span>
                                </div>
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
                  <div><span className="text-text-muted">Name:</span> <span className="font-medium text-text-primary ml-1">{studentData?.name || 'Rohan Mehta'}</span></div>
                  <div><span className="text-text-muted">PRN:</span> <span className="font-medium ml-1">{studentData?.prn || '2021CSE006'}</span></div>
                  <div><span className="text-text-muted">Branch:</span> <span className="font-medium ml-1">{studentData?.department || 'CSE'}</span></div>
                  <div><span className="text-text-muted">Year:</span> <span className="font-medium ml-1">{year}</span></div>
                </div>
              </div>

              {/* Subjects */}
              <div className="border border-border-color rounded-md overflow-hidden">
                <div className="px-4 py-3 bg-bg-secondary border-b border-border-color">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Subjects</p>
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

export default ExamForm;
