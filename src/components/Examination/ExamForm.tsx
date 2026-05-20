import { useState } from 'react';
import { 
  ChevronRight, CheckCircle2, Lock, Unlock, AlertCircle, 
  Search, MapPin, User, Phone, Send, Mail, BookOpen, 
  Calendar, Hash, Award, FileText, Printer, ArrowLeft, 
  RefreshCw, Check 
} from 'lucide-react';
import { semesterData, examCenters, type Subject } from '../../data/examData';

// Helper
const typeBadge = (type: Subject['type']) => {
  const map: Record<string, string> = {
    core: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    lab: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    elective: 'bg-purple-50 text-purple-700 border-purple-100',
    backlog: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return `text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${map[type]}`;
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

  const { coreSubjects, electiveGroups, label, year } = semesterData;

  const availableCenters = (exclude: readonly string[], query: string) =>
    examCenters.filter(c => !exclude.includes(c.id) &&
      (query === '' || `${c.name} ${c.city} ${c.address}`.toLowerCase().includes(query.toLowerCase())));

  const selectedCenter = (id: string) => examCenters.find(c => c.id === id);

  const allElectivesPicked = electiveGroups.every(g => !!electivePicks[g.groupId]);

  const handlePrint = () => {
    window.print();
  };

  if (submitted) return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="relative w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-md">
        <CheckCircle2 size={40} className="text-emerald-500 animate-pulse" />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Form Submitted Successfully!</h2>
        <p className="text-slate-500 text-sm max-w-sm leading-relaxed mx-auto">
          Your examination form is registered under verification. The admit card will generate once approved.
        </p>
      </div>

      {/* Printable Area - Premium Invoice-style Card */}
      <div id="print-area" className="p-6 border border-slate-200/80 rounded-2xl bg-white w-full shadow-lg text-sm space-y-4 font-body">
        <div className="text-center border-b border-slate-100 pb-4 mb-4">
          <h3 className="font-black text-slate-800 uppercase tracking-wider">EMS EXAMINATION APPLICATION</h3>
          <p className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-widest mt-1">Academic Year {year}</p>
        </div>
        
        <div className="space-y-2.5">
          <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Student Name</span><span className="font-bold text-slate-800">{studentData?.name || 'Student Demo User'}</span></div>
          <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Email Address</span><span className="font-bold text-slate-800">{studentData?.email || 'student@cet.edu'}</span></div>
          <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">PRN Number</span><span className="font-mono font-bold text-slate-800">{studentData?.prn || '2021CSE006'}</span></div>
          <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Semester</span><span className="font-bold text-slate-800">{label}</span></div>
          <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Core Subjects</span><span className="font-bold text-slate-800">{coreSubjects.length} Pre-assigned</span></div>
          <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Elective Pick(s)</span><span className="font-bold text-indigo-600">{Object.values(electivePicks).join(', ') || '—'}</span></div>
          <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Centre Pref 1</span><span className="font-bold text-slate-800">{examCenters.find(c => c.id === pref1)?.name.split('—')[1]?.trim() ?? '—'}</span></div>
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-slate-200">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Verification Status</span>
            <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-200 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Pending Approval
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-4 print:hidden">
        <button onClick={handlePrint} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10">
          <Printer size={14} /> Print Application
        </button>
        <button onClick={() => { setSubmitted(false); setStep(1); setElectivePicks({}); setPref1(''); setPref2(''); setPref3(''); setExtraSubjects([]); }} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm">
          <RefreshCw size={14} /> Fill Another Form
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto print:hidden space-y-8 animate-fade-in">
      {/* Stepper Card */}
      <div className="border border-slate-200/80 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-tight text-slate-800">Exam Enrollment Form</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Step {step} of 4</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap flex-1 md:justify-end max-w-2xl">
            {['Student Details', 'Subjects & Electives', 'Centre Preference', 'Review & Submit'].map((lbl, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black tracking-wider transition-all duration-300 ${
                  step > i + 1 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : step === i + 1 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-110' 
                      : 'bg-slate-50 border border-slate-200 text-slate-400'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${step === i + 1 ? 'text-indigo-600' : 'text-slate-400'}`}>{lbl}</span>
                {i < 3 && <ChevronRight size={10} className="text-slate-300 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
        {/* Step 1: Student Details */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Student Details</h2>
              <p className="text-xs text-slate-400 font-semibold tracking-wide">Information pre-filled from your academic record. Verify before proceeding.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Full Name', defaultValue: studentData?.name || 'Student Demo User', disabled: true, icon: User },
                { label: 'PRN Number', defaultValue: studentData?.prn || '2021CSE006', disabled: true, icon: Hash },
                { label: 'Roll Number', defaultValue: studentData?.rollNo || 'A06', disabled: true, icon: Hash },
                { label: 'Department', defaultValue: studentData?.department || 'Computer Science & Engineering', disabled: true, icon: BookOpen },
                { label: 'Semester', defaultValue: label, disabled: true, icon: Calendar },
                { label: 'Academic Year', defaultValue: year, disabled: true, icon: Calendar },
                { label: 'Phone Number', defaultValue: studentData?.mobile || '', placeholder: '+91 XXXXXXXXXX', disabled: false, icon: Phone },
                { label: 'Email Address', defaultValue: studentData?.email || 'student@cet.edu', disabled: true, icon: Mail },
                { label: 'Category', defaultValue: studentData?.category || 'General', disabled: true, icon: Award },
                { label: 'Fee Receipt No.', defaultValue: '', placeholder: 'FR-2026-XXXXX', disabled: false, icon: FileText },
              ].map(f => {
                const IconComponent = f.icon;
                return (
                  <div key={f.label} className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">{f.label}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <IconComponent size={14} className={f.disabled ? 'text-slate-300' : 'text-slate-400'} />
                      </div>
                      <input 
                        defaultValue={f.defaultValue} 
                        placeholder={f.placeholder ?? ''} 
                        disabled={f.disabled}
                        className={`w-full pl-9 pr-10 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold ${
                          f.disabled 
                            ? 'bg-slate-50/80 cursor-not-allowed text-slate-500 border-slate-100' 
                            : 'hover:border-slate-300'
                        }`} 
                      />
                      {f.disabled && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-300">
                          <Lock size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10">
                Next: Subjects & Electives <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Subjects & Electives */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Subjects & Electives</h2>
              <p className="text-xs text-slate-400 font-semibold tracking-wide">Core subjects are pre-assigned by the university. Choose one from each elective group.</p>
            </div>

            {/* University-assigned core subjects */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Lock size={14} className="text-indigo-500 animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-900/80">University Assigned · Core Subjects</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {coreSubjects.map(sub => (
                  <div key={sub.code} className="flex items-center gap-4 p-4 border border-indigo-100/70 rounded-xl bg-gradient-to-r from-indigo-50/30 to-white hover:border-indigo-200 transition-all">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center bg-indigo-600 text-white shadow-inner flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-slate-800 leading-snug">{sub.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{sub.code} · {sub.credits} Credits · Max: {sub.maxMarks} marks</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={typeBadge(sub.type)}>{sub.type}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"><Lock size={9} /> Auto</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elective groups */}
            {electiveGroups.map(group => (
              <div key={group.groupId} className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Unlock size={14} className="text-purple-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-900/80">{group.groupName}</h3>
                  <span className="text-[10px] bg-purple-50 text-purple-600 font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-purple-100">Choose {group.pickCount}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {group.options.map(opt => {
                    const picked = electivePicks[group.groupId] === opt.code;
                    return (
                      <label 
                        key={opt.code} 
                        className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                          picked 
                            ? 'border-purple-300 bg-purple-50/20 ring-4 ring-purple-50' 
                            : 'border-slate-200 bg-white hover:border-purple-200 hover:bg-slate-50/30'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name={`elective-${group.groupId}`} 
                          className="w-4.5 h-4.5 text-purple-600 accent-purple-600 cursor-pointer focus:ring-purple-400"
                          checked={picked}
                          onChange={() => setElectivePicks(prev => ({ ...prev, [group.groupId]: opt.code }))} 
                        />
                        <div className="flex-1">
                          <p className="text-sm font-extrabold text-slate-800 leading-snug">{opt.name}</p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{opt.code} · {opt.credits} Credits · Max: {opt.maxMarks} marks</p>
                        </div>
                        <span className={typeBadge('elective')}>ELECTIVE</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {!allElectivesPicked && (
              <div className="flex items-start gap-2.5 p-4 bg-amber-50 border border-amber-200/60 rounded-xl text-[11px] font-bold text-amber-800/90 shadow-inner">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <p>Please select one elective from each group before proceeding to the next step.</p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all">
                <ArrowLeft size={14} /> Back
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={!allElectivesPicked} 
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md disabled:shadow-none"
              >
                Next: Centre Preference <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Centre Preferences */}
        {step === 3 && (
          <div className="p-8 space-y-6" onClick={() => setOpenPref(null)}>
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Examination Centre Preference</h2>
              <p className="text-xs text-slate-400 font-semibold tracking-wide">Type to search and select your preferred centres in order. Final allotment is subject to seat capacity availability.</p>
            </div>

            <div className="space-y-4">
              {([
                { pref: 1, label: '1st Preference', value: pref1, set: setPref1, clear: () => { setPref1(''); setSearch1(''); }, search: search1, setSearch: setSearch1, exclude: [pref2, pref3], star: true },
                { pref: 2, label: '2nd Preference', value: pref2, set: setPref2, clear: () => { setPref2(''); setSearch2(''); }, search: search2, setSearch: setSearch2, exclude: [pref1, pref3], star: false },
                { pref: 3, label: '3rd Preference', value: pref3, set: setPref3, clear: () => { setPref3(''); setSearch3(''); }, search: search3, setSearch: setSearch3, exclude: [pref1, pref2], star: false },
              ] as const).map(({ pref, label, value, set, clear, search, setSearch, exclude, star }) => {
                const chosen = selectedCenter(value);
                const results = availableCenters(exclude, search);
                const isOpen = openPref === pref;
                return (
                  <div key={pref} className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                        value 
                          ? 'bg-emerald-500 text-white' 
                          : pref === 1 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-100 border border-slate-200 text-slate-500'
                      }`}>
                        {value ? '✓' : pref}
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">{label}{star && <span className="text-red-500 ml-0.5">*</span>}</span>
                    </div>

                    {/* Selected pill */}
                    {chosen && (
                      <div className="flex items-center gap-4 p-4 border border-emerald-200 bg-emerald-50/20 rounded-xl animate-fade-in shadow-inner">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <MapPin size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-extrabold text-slate-800 leading-snug">{chosen.name}</p>
                          <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5"><MapPin size={10} /> {chosen.city} · Capacity: {chosen.capacity} seats</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); clear(); }}
                          className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50/50 transition-colors"
                        >
                          ✕ Change
                        </button>
                      </div>
                    )}

                    {/* Search input + dropdown */}
                    {!chosen && (
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <div className={`flex items-center border rounded-xl px-3.5 py-3 bg-white transition-all ${
                          isOpen 
                            ? 'border-indigo-600 ring-4 ring-indigo-50' 
                            : 'border-slate-200 hover:border-indigo-500/50'
                        }`}>
                          <Search size={14} className="text-slate-400 mr-2 flex-shrink-0" />
                          <input
                            className="flex-1 text-sm outline-none bg-transparent text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-normal"
                            placeholder={`Search examination centres...`}
                            value={search}
                            onFocus={() => setOpenPref(pref)}
                            onChange={e => { setSearch(e.target.value); setOpenPref(pref); }}
                          />
                          {search && (
                            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 ml-1">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                            </button>
                          )}
                        </div>

                        {/* Dropdown results */}
                        {isOpen && (
                          <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100 overflow-hidden animate-fade-in">
                            {results.length === 0 ? (
                              <div className="px-4 py-8 text-center text-xs font-bold text-slate-400">
                                No centres match <span className="font-extrabold text-indigo-600">"{search}"</span>
                              </div>
                            ) : (
                              results.map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  className="w-full text-left px-5 py-3.5 hover:bg-indigo-50/50 transition-colors flex items-start gap-3 group"
                                  onClick={() => { set(c.id); setSearch(''); setOpenPref(null); }}
                                >
                                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all flex-shrink-0 mt-0.5">
                                    <MapPin size={14} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors leading-snug">{c.name}</p>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                      {c.city}, {c.state} · Capacity: {c.capacity}
                                    </span>
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
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all">
                <ArrowLeft size={14} /> Back
              </button>
              <button 
                onClick={() => setStep(4)} 
                disabled={!pref1} 
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md disabled:shadow-none"
              >
                Review Application <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Review & Submit</h2>
              <p className="text-xs text-slate-400 font-semibold tracking-wide">Review all details before finalizing. Verification will begin immediately upon submission.</p>
            </div>

            <div className="space-y-4">
              {/* Student info */}
              <div className="border border-slate-200/75 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Student Profile Information</p>
                </div>
                <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between sm:justify-start gap-2"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Name:</span> <span className="font-extrabold text-slate-800 ml-1">{studentData?.name || 'Student Demo User'}</span></div>
                  <div className="flex justify-between sm:justify-start gap-2"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">PRN:</span> <span className="font-mono font-bold text-slate-800 ml-1">{studentData?.prn || '2021CSE006'}</span></div>
                  <div className="flex justify-between sm:justify-start gap-2"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Branch:</span> <span className="font-extrabold text-slate-800 ml-1">{studentData?.department || 'Computer Science & Engineering'}</span></div>
                  <div className="flex justify-between sm:justify-start gap-2"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Academic Year:</span> <span className="font-extrabold text-slate-800 ml-1">{year}</span></div>
                </div>
              </div>

              {/* Subjects */}
              <div className="border border-slate-200/75 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Selected Subject Syllabus (Exam Course)</p>
                </div>
                <div className="px-5 py-4 divide-y divide-slate-100 space-y-3">
                  {coreSubjects.map(s => (
                    <div key={s.code} className="flex justify-between items-center text-xs pt-3 first:pt-0">
                      <span className="font-extrabold text-slate-700">{s.name} <span className="text-[10px] text-slate-400 font-mono font-bold ml-1">{s.code}</span></span>
                      <span className={typeBadge(s.type)}>{s.type}</span>
                    </div>
                  ))}
                  {electiveGroups.map(g => {
                    const picked = g.options.find(o => o.code === electivePicks[g.groupId]);
                    return picked ? (
                      <div key={g.groupId} className="flex justify-between items-center text-xs pt-3">
                        <span className="font-extrabold text-slate-700">{picked.name} <span className="text-[10px] text-slate-400 font-mono font-bold ml-1">{picked.code}</span></span>
                        <span className={typeBadge('elective')}>ELECTIVE</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4.5 bg-amber-50 border border-amber-200/60 rounded-2xl text-[11px] font-bold text-amber-800/90 shadow-inner">
                <AlertCircle size={18} className="mt-0.5 text-amber-600 flex-shrink-0" />
                <p className="leading-relaxed">By submitting, you certify all entered details match your records. University allotment of exam centres is final and cannot be modified after confirmation.</p>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button onClick={() => setStep(3)} className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setSubmitted(true)} className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/10">
                <Send size={14} /> Submit Exam Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamForm;
