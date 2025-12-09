
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, Briefcase, Menu, X, LogOut, Database, Loader2, AlertTriangle, Copy, Check, Camera, Save, UserCog, Lock, WifiOff, RefreshCw, Bell, Home } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { StockManager } from './components/StockManager';
import { CustomerManager } from './components/CustomerManager';
import { EmployeeManager } from './components/EmployeeManager';
import { Login } from './components/Login';
import { Tile, Customer, Employee, ViewState, AppNotification } from './types';
import { DB } from './services/db';
import { isSupabaseConfigured } from './services/supabase';

function App() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  // Sidebar state removed as we use persistent bottom nav for mobile now
  const [isLoading, setIsLoading] = useState(true);
  const [showDbSetup, setShowDbSetup] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({ avatarUrl: '', password: '' });

  // Notification State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Data State
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load Initial Data (Async)
  useEffect(() => {
    const loadData = async () => {
      // 1. Health Check for Supabase
      if (isSupabaseConfigured) {
          const status = await DB.checkHealth();
          
          if (status === 'CONNECTION_ERROR') {
              setConnectionError(true);
              setIsLoading(false);
              return;
          }

          if (status === 'MISSING_TABLES') {
              setShowDbSetup(true);
              setIsLoading(false);
              return; // Stop loading if DB is not ready
          }
      }

      // 2. Load Data
      try {
        const [loadedTiles, loadedCustomers, loadedEmployees] = await Promise.all([
          DB.loadTiles([]),
          DB.loadCustomers([]),
          DB.loadEmployees([])
        ]);
        
        // Strictly use database values. If empty, the app starts empty.
        setEmployees(loadedEmployees);
        setTiles(loadedTiles);
        setCustomers(loadedCustomers);

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Database Sync: Automatically save changes whenever state updates
  useEffect(() => { if (!isLoading && !showDbSetup && !connectionError) DB.saveTiles(tiles); }, [tiles, isLoading, showDbSetup, connectionError]);
  useEffect(() => { if (!isLoading && !showDbSetup && !connectionError) DB.saveCustomers(customers); }, [customers, isLoading, showDbSetup, connectionError]);
  useEffect(() => { if (!isLoading && !showDbSetup && !connectionError) DB.saveEmployees(employees); }, [employees, isLoading, showDbSetup, connectionError]);

  // Sync profile form data when modal opens
  useEffect(() => {
    if (isProfileOpen && currentUser) {
        setProfileData({
            avatarUrl: currentUser.avatarUrl || '',
            password: currentUser.password || ''
        });
    }
  }, [isProfileOpen, currentUser]);

  // Helper to determine if user has admin privileges
  const isAdmin = (user: Employee) => {
    return user.role.toLowerCase().includes('admin') || user.role.toLowerCase().includes('manager');
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (currentView) {
      case 'DASHBOARD': return <Dashboard tiles={tiles} customers={customers} employees={employees} currentUser={currentUser} />;
      case 'INVENTORY': return <StockManager tiles={tiles} setTiles={setTiles} />;
      case 'CUSTOMERS': return <CustomerManager customers={customers} setCustomers={setCustomers} currentUser={currentUser} employees={employees} />;
      case 'EMPLOYEES': return <EmployeeManager employees={employees} setEmployees={setEmployees} />;
      default: return <Dashboard tiles={tiles} customers={customers} employees={employees} currentUser={currentUser} />;
    }
  };

  const handleLogin = (user: Employee) => {
    setCurrentUser(user);
    // Reset view to dashboard on login
    setCurrentView('DASHBOARD');
  };

  const handleRegister = (newUser: Employee) => {
    setEmployees(prev => [...prev, newUser]);
    handleLogin(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      
      const updatedUser = { 
          ...currentUser, 
          avatarUrl: profileData.avatarUrl,
          password: profileData.password
      };
      
      setCurrentUser(updatedUser);
      setEmployees(prev => prev.map(emp => emp.id === currentUser.id ? updatedUser : emp));
      setIsProfileOpen(false);
  };

  const handleMarkRead = (notificationId: string) => {
      if (!currentUser) return;
      
      const updatedNotifications = (currentUser.notifications || []).map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
      );
      
      const updatedUser = { ...currentUser, notifications: updatedNotifications };
      setCurrentUser(updatedUser);
      setEmployees(prev => prev.map(emp => emp.id === currentUser.id ? updatedUser : emp));
  };

  // derived state for notifications
  const userNotifications = currentUser?.notifications || [];
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  // Derive upcoming meeting notification
  const getNextMeeting = () => {
      if (!currentUser) return null;
      
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const upcoming = customers
        .filter(c => c.assignedTo === currentUser.id && c.meetingDate && c.meetingDate >= todayStr)
        .sort((a, b) => (a.meetingDate! > b.meetingDate!) ? 1 : -1);
      
      return upcoming.length > 0 ? upcoming[0] : null;
  };

  const nextMeeting = getNextMeeting();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-indigo-600 gap-4">
        <Loader2 size={48} className="animate-spin" />
        <p className="font-medium text-slate-500">Connecting to database...</p>
      </div>
    );
  }

  // Connection Error Screen
  if (connectionError) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-slate-100 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <WifiOff size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Connection Failed</h2>
                  <p className="text-slate-500 mb-6">
                      We could not connect to the Supabase database. This usually indicates a network issue or firewall restriction.
                  </p>
                  <button 
                      onClick={() => window.location.reload()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                      <RefreshCw size={20} />
                      Retry Connection
                  </button>
              </div>
          </div>
      );
  }

  // Database Setup Modal (Shown if tables missing)
  if (showDbSetup) {
      const SQL_CODE = `
-- Run this in your Supabase SQL Editor to create the required tables

create table if not exists tiles (
  id text primary key,
  json_data jsonb
);

create table if not exists customers (
  id text primary key,
  json_data jsonb
);

create table if not exists employees (
  id text primary key,
  json_data jsonb
);

-- Enable Row Level Security (RLS) but allow public access for this demo app
alter table tiles enable row level security;
alter table customers enable row level security;
alter table employees enable row level security;

-- Drop existing policies to avoid "already exists" errors when re-running
drop policy if exists "Public Access Tiles" on tiles;
drop policy if exists "Public Access Customers" on customers;
drop policy if exists "Public Access Employees" on employees;

create policy "Public Access Tiles" on tiles for all using (true);
create policy "Public Access Customers" on customers for all using (true);
create policy "Public Access Employees" on employees for all using (true);
      `;

      return (
          <div className="h-screen w-full flex items-center justify-center bg-slate-100 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
                  <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-start gap-4">
                      <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                          <AlertTriangle size={32} />
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold text-amber-900">Database Setup Required</h2>
                          <p className="text-amber-800 mt-1">We connected to your Supabase project, but the required tables were not found.</p>
                      </div>
                  </div>
                  <div className="p-6">
                      <p className="text-slate-600 mb-4 text-sm">
                          Please go to your <a href="https://supabase.com/dashboard/project/wmjjusbgqgiwcznnbbqq/sql" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium">Supabase SQL Editor</a> and run the following code to initialize your database:
                      </p>
                      
                      <div className="relative bg-slate-900 rounded-lg p-4 mb-6 group">
                          <pre className="text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap h-64 overflow-y-auto">
                              {SQL_CODE}
                          </pre>
                          <button 
                            onClick={() => navigator.clipboard.writeText(SQL_CODE)}
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded transition backdrop-blur-sm"
                            title="Copy to Clipboard"
                          >
                              <Copy size={16} />
                          </button>
                      </div>

                      <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                      >
                          <Check size={20} />
                          I've Run the SQL - Refresh App
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (!currentUser) {
    return <Login employees={employees} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const NavItem = ({ view, icon: Icon, label, requiredRole }: { view: ViewState, icon: any, label: string, requiredRole?: string }) => {
    // Basic permission check
    if (requiredRole === 'admin' && !isAdmin(currentUser)) {
        return null;
    }

    const isActive = currentView === view;

    return (
        <button
        onClick={() => { setCurrentView(view); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
        </button>
    );
  };

  const MobileNavItem = ({ view, icon: Icon, label, requiredRole }: { view: ViewState, icon: any, label: string, requiredRole?: string }) => {
      if (requiredRole === 'admin' && !isAdmin(currentUser)) return null;
      
      const isActive = currentView === view;
      
      return (
          <button 
            onClick={() => setCurrentView(view)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition duration-200 flex-1 ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <Icon size={24} className={isActive ? 'fill-current' : ''} />
              <span className="text-[10px] font-bold mt-1">{label}</span>
          </button>
      )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white shadow-none transition-all duration-300">
        <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="font-bold text-xl text-white">T</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">TileMaster</h1>
            </div>
        </div>

        <nav className="px-4 space-y-2 mt-6 flex-1">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="INVENTORY" icon={Package} label="Inventory" />
          <NavItem view="CUSTOMERS" icon={Users} label="Customers" />
          <NavItem view="EMPLOYEES" icon={Briefcase} label="Team" requiredRole="admin" />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className={`mb-4 px-4 flex items-center gap-2 text-xs font-medium ${isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                <Database size={12} />
                <span>{isSupabaseConfigured ? 'Database Connected' : 'Local Storage'}</span>
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition px-4 py-3 w-full"
            >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 shadow-sm z-20 sticky top-0">
          <div className="lg:hidden flex items-center gap-2 text-slate-800 font-bold text-lg">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">TM</div>
             TileMaster
          </div>
          
          <div className="ml-auto flex items-center gap-4 md:gap-6">
              {/* Notification Bell */}
              <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition relative"
                  >
                      <Bell size={20} />
                      {(unreadCount > 0 || nextMeeting) && (
                          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                      )}
                  </button>

                  {isNotificationsOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                        <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/60 z-20 overflow-hidden animate-fade-in origin-top-right ring-1 ring-slate-900/5 mx-2">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center backdrop-blur-xl">
                                <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                                <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                                {/* Upcoming Meeting Notification */}
                                {nextMeeting && (
                                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 shrink-0 mt-0.5 shadow-sm">
                                                <Users size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-1">Upcoming Meeting</p>
                                                <p className="text-sm font-semibold text-indigo-900 mb-0.5">{nextMeeting.meetingInfo || 'Meeting Scheduled'}</p>
                                                <p className="text-xs text-indigo-600 font-medium">
                                                    {nextMeeting.name} • {nextMeeting.meetingDate}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Admin Messages */}
                                {userNotifications.length > 0 ? (
                                    userNotifications.slice().reverse().map(note => (
                                        <div 
                                            key={note.id} 
                                            onClick={() => handleMarkRead(note.id)}
                                            className={`p-3 rounded-xl border cursor-pointer transition ${note.isRead ? 'bg-white border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${note.sender === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {note.sender}
                                                </span>
                                                {!note.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-indigo-100"></span>}
                                            </div>
                                            <p className="text-sm text-slate-700 mb-2 leading-relaxed">{note.message}</p>
                                            <p className="text-[10px] text-slate-400 text-right font-medium">{new Date(note.date).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    !nextMeeting && (
                                        <div className="text-center py-8 text-slate-400 text-sm">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Bell size={20} className="text-slate-300"/>
                                            </div>
                                            No notifications
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                      </>
                  )}
              </div>

              {/* User Profile */}
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 pl-2 pr-1 py-1.5 rounded-full border border-transparent hover:border-slate-200 transition group"
                onClick={() => setIsProfileOpen(true)}
                title="Manage Profile"
              >
                <div className="hidden sm:block text-right pr-1">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{currentUser.name}</p>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{currentUser.role}</p>
                </div>
                <div className="relative">
                    {currentUser.avatarUrl ? (
                        <img 
                            src={currentUser.avatarUrl} 
                            alt={currentUser.name} 
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:shadow transition" 
                        />
                    ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm uppercase text-sm">
                            {currentUser.name.slice(0, 2)}
                        </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-1 border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity scale-75 sm:scale-100">
                        <UserCog size={12} className="text-indigo-600" />
                    </div>
                </div>
              </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 md:p-8 bg-slate-50/50 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </div>
        
        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 pb-safe z-40 shadow-xl-up">
           <MobileNavItem view="DASHBOARD" icon={LayoutDashboard} label="Home" />
           <MobileNavItem view="INVENTORY" icon={Package} label="Stock" />
           <MobileNavItem view="CUSTOMERS" icon={Users} label="Clients" />
           <MobileNavItem view="EMPLOYEES" icon={Briefcase} label="Team" requiredRole="admin" />
        </nav>
      </main>

      {/* Profile Management Modal */}
      {isProfileOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden mx-4">
                  <div className="bg-slate-50/80 backdrop-blur-xl px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <UserCog size={20} className="text-indigo-600"/> My Profile
                      </h3>
                      <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-200/50 rounded-lg">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="p-6">
                      <div className="text-center mb-8">
                          <div className="w-24 h-24 bg-indigo-50 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl relative group ring-1 ring-slate-100">
                              {profileData.avatarUrl ? (
                                  <img src={profileData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                  <span className="text-3xl font-bold text-indigo-600">{currentUser.name.slice(0,2).toUpperCase()}</span>
                              )}
                          </div>
                          <h4 className="font-bold text-xl text-slate-800">{currentUser.name}</h4>
                          <span className="inline-block mt-1 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">{currentUser.role}</span>
                      </div>

                      <div className="space-y-5">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Profile Picture</label>
                              <div className="relative group">
                                  <Camera className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                  <input 
                                      type="text" 
                                      placeholder="https://example.com/my-photo.jpg" 
                                      className="pl-9 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition" 
                                      value={profileData.avatarUrl}
                                      onChange={(e) => setProfileData({...profileData, avatarUrl: e.target.value})}
                                  />
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Paste a URL to an image to update your avatar.</p>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Change Password</label>
                              <div className="relative group">
                                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                  <input 
                                      type="text" 
                                      placeholder="New password" 
                                      className="pl-9 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition font-mono" 
                                      value={profileData.password}
                                      onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                                  />
                              </div>
                          </div>
                          
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                              <label className="block text-xs font-medium text-slate-500">Email Address</label>
                              <div className="text-sm text-slate-700 font-semibold">{currentUser.email}</div>
                          </div>
                      </div>

                      <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
                          <button 
                              type="button"
                              onClick={handleLogout}
                              className="px-5 py-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition text-sm font-semibold flex items-center gap-2"
                          >
                              <LogOut size={16} /> Sign Out
                          </button>
                          
                          <div className="flex gap-3">
                              <button 
                                  type="button"
                                  onClick={() => setIsProfileOpen(false)}
                                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition text-sm font-semibold"
                              >
                                  Cancel
                              </button>
                              <button 
                                  type="submit"
                                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition text-sm font-bold flex items-center gap-2 active:scale-95 duration-100"
                              >
                                  <Save size={16} /> Save
                              </button>
                          </div>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

export default App;
