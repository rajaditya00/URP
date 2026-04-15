import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Briefcase } from 'lucide-react';

const AuthModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'STUDENT'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const url = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/signup';
    
    try {
       const res = await fetch(url, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(formData)
       });
       const data = await res.json();
       
       if (!res.ok) {
          setError(data.msg || 'Authentication failed');
          return;
       }
       
       login(data.token, data.user);
       onClose();
    } catch (err) {
       setError('Server error connecting to authentication endpoint.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-bg-primary w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-border-color">
         <div className="p-6 text-center border-b border-border-color relative bg-bg-secondary/30">
            <button onClick={onClose} className="absolute right-4 top-4 p-2 text-text-muted hover:bg-bg-secondary rounded-full transition-colors"><X size={18} /></button>
            <div className="w-12 h-12 bg-accent-primary rounded-xl mx-auto flex items-center justify-center mb-4 shadow-glow">
              <Lock className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-sm text-text-secondary mt-1">Authenticate to access the URP Platform</p>
         </div>

         <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center font-semibold">{error}</div>}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-text-muted" size={16} />
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-border-color rounded-lg text-sm bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50" placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Select Role</label>
                  <div className="relative">
                     <Briefcase className="absolute left-3 top-2.5 text-text-muted" size={16} />
                     <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-border-color rounded-lg text-sm bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 appearance-none">
                        <option value="STUDENT">Student</option>
                        <option value="PROFESSOR">Professor / Faculty / Instructor</option>
                        <option value="COLLEGE">College Administrator</option>
                        <option value="UNIVERSITY">University Administrator</option>
                     </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-text-muted" size={16} />
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-border-color rounded-lg text-sm bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50" placeholder="user@university.edu" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-text-muted" size={16} />
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-border-color rounded-lg text-sm bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 mt-2 bg-accent-primary text-white font-bold rounded-lg shadow-sm hover:bg-accent-secondary transition-colors">
               {isLogin ? 'Sign In' : 'Register Account'}
            </button>

            <div className="text-center mt-6">
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm font-semibold text-accent-primary hover:text-accent-secondary transition-colors">
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
         </form>
      </div>
    </div>
  );
};

export default AuthModal;
