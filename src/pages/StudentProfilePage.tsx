import BASE_URL from '../config/api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';

interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  rollNo: string;
  registrationNo: string;
  department: string;
  semester: string;
  programme: string;
  address: string;
  fatherName: string;
  motherName: string;
  gender: string;
  dob: string;
  casteCategory: string;
  mobile: string;
  aadharNo: string;
  status: string;
  college?: { name: string };
  university?: { name: string };
  createdAt?: string;
}

const Row = ({ label, value }: { label: string; value?: string }) => (
  <tr className="border-b border-slate-200">
    <td className="py-2 pr-4 text-xs font-bold text-slate-600 whitespace-nowrap w-52 align-top">{label}</td>
    <td className="py-2 pr-2 text-slate-500 text-xs w-4">:</td>
    <td className="py-2 text-xs text-slate-800 font-semibold">{value || '—'}</td>
  </tr>
);

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('urp_token');
        const res = await fetch(`{BASE_URL}/api/members/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Student not found');
        const data = await res.json();
        setStudent(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load student.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-slate-500 font-semibold animate-pulse">Loading student profile...</div>
    </div>
  );

  if (error || !student) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-100">
      <p className="text-red-500 font-bold">{error || 'Student not found'}</p>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl">
        <ArrowLeft size={16} /> Go Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      {/* Top Action Bar — hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#162d4a] transition-all shadow-md"
        >
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* Printable Profile Card */}
      <div className="max-w-4xl mx-auto my-8 print:my-0 print:max-w-none bg-white shadow-xl print:shadow-none rounded-2xl print:rounded-none overflow-hidden">

        {/* Header */}
        <div className="border-b-2 border-slate-800 px-10 pt-8 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-base font-extrabold text-[#1e3a5f] uppercase tracking-wide">
                {student.university?.name || 'University Name'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{student.college?.name || 'College Name'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold text-slate-700">Student Registration Profile</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Academic Year: {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        <div className="px-10 py-6 space-y-6">

          {/* Academic Details */}
          <section>
            <h2 className="text-[11px] font-extrabold text-white bg-[#1e3a5f] px-3 py-1.5 rounded mb-3 uppercase tracking-widest">Academic Details</h2>
            <table className="w-full">
              <tbody>
                <Row label="College" value={student.college?.name} />
                <Row label="University" value={student.university?.name} />
                <Row label="Programme / Course" value={student.programme || student.department} />
                <Row label="Branch Name" value={student.department} />
                <Row label="Current Semester" value={student.semester} />
                <Row label="Category of Examinee" value={student.casteCategory || '—'} />
                <Row label="Register No." value={student.registrationNo} />
                <Row label="College Roll No." value={student.rollNo} />
              </tbody>
            </table>
          </section>

          {/* General / Personal Details */}
          <section>
            <h2 className="text-[11px] font-extrabold text-white bg-[#1e3a5f] px-3 py-1.5 rounded mb-3 uppercase tracking-widest">Personal Details</h2>
            <div className="flex gap-6 items-start">
              <table className="flex-1">
                <tbody>
                  <Row label="Full Name" value={student.name} />
                  <Row label="Father's Name" value={student.fatherName} />
                  <Row label="Mother's Name" value={student.motherName} />
                  <Row label="Gender" value={student.gender} />
                  <Row label="Date of Birth (DD-MM-YYYY)" value={student.dob} />
                  <Row label="Caste Category" value={student.casteCategory} />
                  <Row label="Mobile No." value={student.mobile} />
                  <Row label="Email Address" value={student.email} />
                  <Row label="Aadhar No." value={student.aadharNo} />
                  <Row label="Residential / Permanent Address" value={student.address} />
                </tbody>
              </table>
              {/* Photo placeholder */}
              <div className="w-28 h-32 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-slate-300 shrink-0 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-extrabold text-slate-400 border border-slate-200">
                  {student.name.charAt(0)}
                </div>
                <p className="text-[9px] mt-1 text-slate-300">Photo</p>
              </div>
            </div>
          </section>

          {/* Status */}
          <section>
            <h2 className="text-[11px] font-extrabold text-white bg-[#1e3a5f] px-3 py-1.5 rounded mb-3 uppercase tracking-widest">Enrollment Status</h2>
            <table className="w-full">
              <tbody>
                <Row label="Enrollment Date" value={student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN') : '—'} />
                <Row label="Student Status" value={student.status || 'Active'} />
              </tbody>
            </table>
          </section>

          {/* Declaration + Signature */}
          <section className="mt-6">
            <p className="text-[10px] text-slate-600 leading-relaxed border border-slate-200 rounded p-3 bg-slate-50">
              I hereby solemnly affirm that all the information provided above is true and correct to the best of my knowledge and belief.
              I have read and accepted all instructions and regulations of the institution.
            </p>
            <div className="flex justify-between mt-8 text-[11px] text-slate-600">
              <div>
                <p>Place: ___________________</p>
                <p className="mt-2">Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="mb-6">Student's Signature</p>
                <p>____________________________</p>
              </div>
            </div>
          </section>

          {/* Principal's Certificate */}
          <section className="border-t-2 border-slate-200 pt-5 mt-4">
            <h3 className="text-xs font-extrabold text-slate-800 text-center mb-3 uppercase tracking-widest">Principal's Certificate</h3>
            <p className="text-[10px] text-slate-600 leading-relaxed text-center">
              Certified that the applicant has fully complied with all conditions and provisions prescribed in concerned ordinance, rules & regulations.
              The student is hereby enrolled and admitted to the institution's academic program.
            </p>
            <div className="flex justify-between mt-8 text-[11px] text-slate-600">
              <div>
                <p>Place: ___________________</p>
                <p className="mt-2">Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="mb-6">Principal's Signature & Stamp</p>
                <p>____________________________</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-4 flex justify-between text-[10px] text-slate-400">
            <span>Printed Date: {new Date().toLocaleString('en-IN')}</span>
            <span>Page No: 1 / 1</span>
          </div>
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
