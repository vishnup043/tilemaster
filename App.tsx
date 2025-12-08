import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, Briefcase, Menu, X, LogOut, Database, Loader2, AlertTriangle, Copy, Check } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { StockManager } from './components/StockManager';
import { CustomerManager } from './components/CustomerManager';
import { EmployeeManager } from './components/EmployeeManager';
import { Login } from './components/Login';
import { Tile, Customer, Employee, ViewState, StockType } from './types';
import { DB } from './services/db';
import { isSupabaseConfigured } from './services/supabase';

// Initial Mock Data (Seed Data for new Database)
const INITIAL_TILES: Tile[] = [
  { id: '1', name: 'Carrara White', type: StockType.MARBLE, size: '60x60cm', price: 45, stockQuantity: 120, description: 'Elegant Italian marble with soft grey veining.', imageUrl: 'https://picsum.photos/400/400?random=1' },
  { id: '2', name: 'Urban Concrete', type: StockType.PORCELAIN, size: '80x80cm', price: 32, stockQuantity: 400, description: 'Modern industrial look suitable for high traffic.', imageUrl: 'https://picsum.photos/400/400?random=2' },
  { id: '3', name: 'Royal Blue Mosaic', type: StockType.MOSAIC, size: '30x30cm', price: 28, stockQuantity: 85, description: 'Vibrant blue glass mosaic for pool or bathroom features.', imageUrl: 'https://picsum.photos/400/400?random=3' },
  { id: '4', name: 'Oak Wood Plank', type: StockType.WOOD_LOOK, size: '20x120cm', price: 38, stockQuantity: 250, description: 'Warm wood texture with the durability of ceramic.', imageUrl: 'https://picsum.photos/400/400?random=4' },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Alice Smith', role: 'Sales Manager (Admin)', email: 'alice@tilemaster.com', status: 'Active', joinDate: '2023-01-15', username: 'alice.admin', password: 'password123' },
  { id: '2', name: 'Bob Jones', role: 'Warehouse Lead', email: 'bob@tilemaster.com', status: 'Active', joinDate: '2023-03-22' },
  { id: '3', name: 'Sarah Connor', role: 'Sales Executive', email: 'sarah@tilemaster.com', status: 'Active', joinDate: '2023-06-10', username: 'sarah.sales', password: 'sales123' },
];

// Helper to get local YYYY-MM-DD
const getLocalToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getLocalTomorrow = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Mock Customers with Assignments
const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'John Doe Construction', email: 'john@doeconst.com', phone: '555-0123', address: '123 Builder Lane, Metro City', totalSpent: 15400, purchasedVolume: 1200, assignedTo: '1', meetingDate: getLocalToday(), meetingInfo: 'Discuss Q4 Bulk Order' },
  { id: '2', name: 'Sarah Interiors', email: 'sarah@design.com', phone: '555-9876', address: '45 Design Ave, Arts District', totalSpent: 8200, purchasedVolume: 450, assignedTo: '3', meetingDate: getLocalTomorrow(), meetingInfo: 'Contract Renewal' }, 
];

function App() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDbSetup, setShowDbSetup] = useState(false);
  
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
          if (status === 'MISSING_TABLES') {
              setShowDbSetup(true);
              setIsLoading(false);
              return; // Stop loading if DB is not ready
          }
      }

      // 2. Load Data
      try {
        const [loadedTiles, loadedCustomers, loadedEmployees] = await Promise.all([
          DB.loadTiles(INITIAL_TILES),
          DB.loadCustomers(INITIAL_CUSTOMERS),
          DB.loadEmployees(INITIAL_EMPLOYEES)
        ]);
        
        setTiles(loadedTiles);
        setCustomers(loadedCustomers);
        setEmployees(loadedEmployees);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Database Sync: Automatically save changes whenever state updates
  useEffect(() => { if (!isLoading && !showDbSetup) DB.saveTiles(tiles); }, [tiles, isLoading, showDbSetup]);
  useEffect(() => { if (!isLoading && !showDbSetup) DB.saveCustomers(customers); }, [customers, isLoading, showDbSetup]);
  useEffect(() => { if (!isLoading && !showDbSetup) DB.saveEmployees(employees); }, [employees, isLoading, showDbSetup]);

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
    setIsSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-indigo-600 gap-4">
        <Loader2 size={48} className="animate-spin" />
        <p className="font-medium text-slate-500">Connecting to database...</p>
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

    return (
        <button
        onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            currentView === view 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
        </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-xl">T</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">TileMaster</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
                <X size={24} />
            </button>
        </div>

        <nav className="px-4 space-y-2 mt-4">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="INVENTORY" icon={Package} label="Inventory" />
          <NavItem view="CUSTOMERS" icon={Users} label="Customers" />
          <NavItem view="EMPLOYEES" icon={Briefcase} label="Employees" requiredRole="admin" />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
            <div className={`mb-4 px-4 flex items-center gap-2 text-xs ${isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                <Database size={12} />
                <span>{isSupabaseConfigured ? 'Supabase Database' : 'Local Storage Mode'}</span>
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 text-slate-400 hover:text-white transition px-4 py-2 w-full"
            >
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 uppercase">
                {currentUser.name.slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;