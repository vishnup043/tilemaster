import React, { useState } from 'react';
import { Employee } from '../types';
import { Lock, User, ArrowRight, AlertCircle, ShieldCheck, Briefcase, UserPlus, Mail, ChevronLeft, LayoutGrid, Users } from 'lucide-react';

interface LoginProps {
  employees: Employee[];
  onLogin: (user: Employee) => void;
  onRegister: (user: Employee) => void;
}

type LoginMode = 'ADMIN' | 'EMPLOYEE';
type ViewState = 'LANDING' | 'LOGIN' | 'REGISTER';

export const Login: React.FC<LoginProps> = ({ employees, onLogin, onRegister }) => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [loginMode, setLoginMode] = useState<LoginMode>('EMPLOYEE');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Sales Executive');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleModeSelect = (mode: LoginMode) => {
    setLoginMode(mode);
    setView('LOGIN');
    setError('');
    setUsername('');
    setPassword('');
    // Reset register defaults based on mode
    if (mode === 'ADMIN') {
        setRegRole('Manager (Admin)');
    } else {
        setRegRole('Sales Executive');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Find user with matching credentials
    const user = employees.find(
      emp => emp.username === username && emp.password === password && emp.status === 'Active'
    );

    if (!user) {
      setError('Invalid username or password, or account is inactive.');
      return;
    }

    // Check if the user has the correct privileges for the selected portal
    const isAdminRole = user.role.toLowerCase().includes('admin') || user.role.toLowerCase().includes('manager');

    if (loginMode === 'ADMIN') {
        if (!isAdminRole) {
            setError('Access Denied: You do not have administrator privileges.');
            return;
        }
    } else {
       // Strict separation: Admins use Admin Portal
       if (isAdminRole) {
           setError('Administrator accounts must use the Admin Portal.');
           return;
       }
    }

    onLogin(user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (employees.some(e => e.username === regUsername)) {
      setError('Username already taken.');
      return;
    }

    const newUser: Employee = {
      id: Date.now().toString(),
      name: regName,
      email: regEmail,
      role: regRole,
      status: 'Active',
      joinDate: new Date().toLocaleDateString(),
      username: regUsername,
      password: regPassword
    };

    onRegister(newUser);
  };

  // UI Render Functions
  // Note: Defined as functions returning JSX (not components) to prevent input focus loss during re-renders
  
  const renderBackButton = (onClick?: () => void) => (
    <button 
      onClick={onClick || (() => { setView('LANDING'); setError(''); })}
      className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition z-10"
      title="Back"
      type="button"
    >
      <ChevronLeft size={24} />
    </button>
  );

  const renderLandingPage = () => (
    <div className="w-full max-w-4xl animate-fade-in p-6">
       <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-6">
            <LayoutGrid className="text-white h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">TileMaster CRM</h1>
          <p className="text-slate-400 text-lg">Select your portal to access the system</p>
       </div>

       <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Admin Card */}
          <button 
            onClick={() => handleModeSelect('ADMIN')}
            className="group relative bg-slate-800 hover:bg-slate-700 p-8 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all duration-300 text-left shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
             <div className="bg-indigo-900/50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <ShieldCheck className="text-indigo-300 group-hover:text-white h-7 w-7" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Admin Portal</h2>
             <p className="text-slate-400 text-sm leading-relaxed">
               Secure access for Managers and Administrators to oversee inventory, staff, and system settings.
             </p>
             <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
               <ArrowRight size={20} />
             </div>
          </button>

          {/* Employee Card */}
          <button 
            onClick={() => handleModeSelect('EMPLOYEE')}
            className="group relative bg-white hover:bg-slate-50 p-8 rounded-2xl border border-white hover:border-indigo-300 transition-all duration-300 text-left shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
             <div className="bg-slate-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                <Users className="text-slate-600 group-hover:text-indigo-600 h-7 w-7" />
             </div>
             <h2 className="text-xl font-bold text-slate-800 mb-2">Employee Workspace</h2>
             <p className="text-slate-500 text-sm leading-relaxed">
               Dashboard for Sales Executives and Staff to manage customers, orders, and view stock.
             </p>
             <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">
               <ArrowRight size={20} />
             </div>
          </button>
       </div>
    </div>
  );

  const renderLoginForm = () => (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in">
        {renderBackButton()}
        <div className={`p-8 pt-12 text-center ${loginMode === 'ADMIN' ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'}`}>
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl mx-auto flex items-center justify-center mb-4">
             {loginMode === 'ADMIN' ? <ShieldCheck size={32} /> : <Briefcase size={32} />}
          </div>
          <h2 className="text-2xl font-bold mb-1">{loginMode === 'ADMIN' ? 'Administrator' : 'Employee'} Login</h2>
          <p className="opacity-80 text-sm">Sign in to your dashboard</p>
        </div>

        <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2 animate-pulse">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                required
                                className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder={loginMode === 'ADMIN' ? "admin.user" : "employee.user"}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${
                        loginMode === 'ADMIN' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    Sign In
                    <ArrowRight size={18} />
                </button>

                <div className="text-center mt-6 pt-6 border-t border-slate-100 flex flex-col gap-4">
                    {loginMode === 'ADMIN' && (
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <button 
                                type="button" 
                                onClick={() => { setView('REGISTER'); setError(''); }}
                                className="font-semibold hover:underline text-slate-800"
                            >
                                Register as Admin
                            </button>
                        </p>
                    )}

                    <div className="text-xs text-slate-400">
                        Demo Credentials: <span className="font-mono bg-slate-100 px-1 rounded">
                            {loginMode === 'ADMIN' ? 'alice.admin' : 'sarah.sales'}
                        </span> / <span className="font-mono bg-slate-100 px-1 rounded">
                            {loginMode === 'ADMIN' ? 'password123' : 'sales123'}
                        </span>
                    </div>
                </div>
            </form>
        </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in">
        {renderBackButton(() => setView('LOGIN'))}
        <div className={`p-8 pt-12 text-center bg-slate-800 text-white`}>
             <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl mx-auto flex items-center justify-center mb-4">
                 <UserPlus size={32} />
             </div>
             <h2 className="text-2xl font-bold mb-1">Admin Registration</h2>
             <p className="opacity-80 text-sm">
                 Create a new administrator account
             </p>
        </div>

        <div className="p-8">
            <form onSubmit={handleRegister} className="space-y-4">
                 {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Personal Details</label>
                   <div className="grid grid-cols-1 gap-3">
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input required type="text" placeholder="Full Name" className="pl-9 w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          value={regName} onChange={e => setRegName(e.target.value)} />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input required type="email" placeholder="Email Address" className="pl-9 w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                      </div>
                      
                      <div className="w-full p-2 border border-slate-300 bg-slate-50 text-slate-500 rounded text-sm italic">
                            Role: Manager (Admin)
                      </div>
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Security</label>
                   <div className="space-y-3">
                      <input required type="text" placeholder="Choose Username" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          value={regUsername} onChange={e => setRegUsername(e.target.value)} />
                      <input required type="password" placeholder="Password" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                      <input required type="password" placeholder="Confirm Password" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} />
                   </div>
                </div>

                <button type="submit" className="w-full py-3 text-white rounded-lg font-semibold transition shadow-md mt-2 bg-slate-800 hover:bg-slate-900">
                  Complete Registration
                </button>
            </form>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        {view === 'LANDING' && renderLandingPage()}
        {view === 'LOGIN' && renderLoginForm()}
        {view === 'REGISTER' && renderRegisterForm()}
    </div>
  );
};