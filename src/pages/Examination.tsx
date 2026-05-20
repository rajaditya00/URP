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
import ExamForm from '../components/Examination/ExamForm';

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

// ── Exam Form component moved to src/components/Examination/ExamForm.tsx ──
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