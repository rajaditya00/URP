import BASE_URL from '../config/api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, ShieldAlert, Mail, UserCircle } from 'lucide-react';

interface MemberProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  rollNo?: string;
  registrationNo?: string;
  department?: string;
  semester?: string;
  programme?: string;
  address?: string;
  fatherName?: string;
  motherName?: string;
  gender?: string;
  dob?: string;
  casteCategory?: string;
  mobile?: string;
  aadharNo?: string;
  status?: string;
  position?: string;
  specialRole?: string;
  mustChangePassword?: boolean;
  college?: { name: string };
  university?: { name: string };
  mentor?: { name: string; email: string; department?: string; position?: string };
  createdAt?: string;
}

const Row = ({ label, value }: { label: string; value?: string }) => (
  <tr className="border-b border-slate-200">
    <td className="py-2 pr-4 text-xs font-bold text-slate-600 whitespace-nowrap w-52 align-top">{label}</td>
    <td className="py-2 pr-2 text-slate-500 text-xs w-4">:</td>
    <td className="py-2 text-xs text-slate-800 font-semibold">{value || '—'}</td>
  </tr>
);

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const token = localStorage.getItem('urp_token');
        const res = await fetch(`${BASE_URL}/api/members/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Member not found');
        const data = await res.json();
        setMember(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load member profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-[#1e3a5f] font-bold animate-pulse flex items-center gap-2">
        <UserCircle className="animate-spin" /> Loading full profile...
      </div>
    </div>
  );

  if (error || !member) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-100">
      <p className="text-red-500 font-bold">{error || 'Member not found'}</p>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl">
        <ArrowLeft size={16} /> Go Back
      </button>
    </div>
  );

  const isStudent = member.role === 'STUDENT';

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white pb-12">
      {/* Top Action Bar — hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate('/college-admin/dashboard')}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#162d4a] transition-all shadow-md"
          >
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Profile Card */}
      <div className="max-w-4xl mx-auto my-8 print:my-0 print:max-w-none bg-white shadow-xl print:shadow-none rounded-2xl print:rounded-none overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="border-b-2 border-slate-800 px-10 pt-8 pb-5 bg-slate-50/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1e3a5f] text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                {member.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-lg font-black text-[#1e3a5f] uppercase tracking-tight">
                  {member.university?.name || 'University Name'}
                </h1>
                <p className="text-sm font-bold text-slate-600">{member.college?.name || 'College Name'}</p>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase tracking-widest">{member.role}</span>
                  {member.status && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase tracking-widest">{member.status}</span>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Member Official Record</p>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5 tracking-widest uppercase">System Reference: {member._id.slice(-8).toUpperCase()}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase">Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="px-10 py-8 space-y-8">

          {/* Login Credentials Section - HIGHLIGHTED */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-black text-amber-800 uppercase tracking-widest">Official Login Credentials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-amber-200 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest mb-0.5">Login Email / Username</p>
                  <p className="text-sm font-black text-slate-800 break-all">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-amber-200 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest mb-0.5">Password Status</p>
                  <p className="text-sm font-black text-slate-800">
                    {member.mustChangePassword ? 'Temporary Password Issued' : 'User-defined Password Active'}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] font-bold text-amber-700/60 uppercase tracking-widest text-center border-t border-amber-200 pt-3">
              Note: Credentials are private. Initial passwords are sent via registered email only.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Academic / Professional Details */}
            <section>
              <h2 className="text-[11px] font-black text-white bg-[#1e3a5f] px-3 py-1.5 rounded-lg mb-4 uppercase tracking-widest shadow-sm inline-block">
                {isStudent ? 'Academic Information' : 'Professional Record'}
              </h2>
              <table className="w-full">
                <tbody>
                  <Row label="Department" value={member.department} />
                  {isStudent ? (
                    <>
                      <Row label="Programme / Course" value={member.programme} />
                      <Row label="Current Semester" value={member.semester} />
                      <Row label="College Roll No." value={member.rollNo} />
                      <Row label="Univ Reg. No." value={member.registrationNo} />
                      <Row label="Assigned Mentor" value={member.mentor ? `${member.mentor.name} (${member.mentor.position || 'Professor'} - ${member.mentor.department || 'Faculty'})` : 'Not Allotted'} />
                    </>
                  ) : (
                    <>
                      <Row label="Designation" value={member.position} />
                      <Row label="Administrative Role" value={member.specialRole} />
                      <Row label="Employee Status" value={member.status || 'Active'} />
                    </>
                  )}
                  <Row label="Joined On" value={member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-IN') : '—'} />
                </tbody>
              </table>
            </section>

            {/* Personal Details */}
            <section>
              <h2 className="text-[11px] font-black text-white bg-[#1e3a5f] px-3 py-1.5 rounded-lg mb-4 uppercase tracking-widest shadow-sm inline-block">Personal Details</h2>
              <table className="w-full">
                <tbody>
                  <Row label="Full Name" value={member.name} />
                  <Row label="Father's Name" value={member.fatherName} />
                  <Row label="Mother's Name" value={member.motherName} />
                  <Row label="Gender" value={member.gender} />
                  <Row label="Date of Birth" value={member.dob} />
                  <Row label="Contact Number" value={member.mobile} />
                  <Row label="Aadhar Card No." value={member.aadharNo} />
                  <Row label="Category" value={member.casteCategory} />
                </tbody>
              </table>
            </section>
          </div>

          {/* Address Section */}
          <section>
            <h2 className="text-[11px] font-black text-white bg-[#1e3a5f] px-3 py-1.5 rounded-lg mb-4 uppercase tracking-widest shadow-sm inline-block">Contact & Address</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-700 leading-relaxed">{member.address || 'No residential address provided in records.'}</p>
            </div>
          </section>

          {/* Declaration */}
          <section className="pt-8 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-12 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              <div className="space-y-16">
                <p>Authorized Signature & Seal</p>
                <div className="border-t border-slate-300 w-48"></div>
              </div>
              <div className="space-y-16 text-right">
                <p>Member Signature</p>
                <div className="border-t border-slate-300 w-48 ml-auto"></div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Banner */}
        <div className="bg-slate-900 py-3 px-10 flex justify-between items-center text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">
          <span>All Campus Digital · Institutional Profile Management System</span>
          <span>Security Level: Classified</span>
        </div>
      </div>
    </div>
  );
}
