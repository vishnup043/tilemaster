
import React, { useEffect, useState } from 'react';
import { Tile, Customer, Employee, StockType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateBusinessInsight } from '../services/geminiService';
import { TrendingUp, Users, Package, DollarSign, Sparkles, BellRing, CalendarClock, Layers, ArrowRight } from 'lucide-react';

interface DashboardProps {
  tiles: Tile[];
  customers: Customer[];
  employees: Employee[];
  currentUser: Employee;
}

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ tiles, customers, employees, currentUser }) => {
  const [insight, setInsight] = useState<string>("Loading AI insights...");
  const [upcomingMeetings, setUpcomingMeetings] = useState<Customer[]>([]);

  // Calculate metrics
  const totalStockValue = tiles.reduce((acc, tile) => acc + (tile.price * tile.stockQuantity), 0);
  const totalStockItems = tiles.reduce((acc, tile) => acc + tile.stockQuantity, 0);
  
  // New Metric: Total Volume Sold based on customer data
  const totalVolumeSold = customers.reduce((acc, c) => acc + (c.purchasedVolume || 0), 0);

  // Check role
  const isAdmin = currentUser.role.toLowerCase().includes('admin') || currentUser.role.toLowerCase().includes('manager');

  // Group tiles by type for chart
  const dataByType = Object.values(StockType).map(type => {
    return {
      name: type,
      value: tiles.filter(t => t.type === type).reduce((acc, t) => acc + t.stockQuantity, 0)
    };
  });

  const topCategory = dataByType.sort((a, b) => b.value - a.value)[0]?.name || 'N/A';

  useEffect(() => {
    let mounted = true;
    const fetchInsight = async () => {
      // We still use stock value for AI insights even if not displayed on main card
      const result = await generateBusinessInsight(totalStockValue, tiles.length, topCategory);
      if (mounted) setInsight(result);
    };
    fetchInsight();

    // Check for meetings scheduled for Today onwards
    const checkSchedule = () => {
        // Use local date generation to ensure it matches the HTML Date Input (YYYY-MM-DD)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const meetings = customers
            .filter(c => {
                 // Check if assigned to user and has a meeting date
                 if (c.assignedTo !== currentUser.id || !c.meetingDate) return false;
                 // String comparison works for ISO format dates (YYYY-MM-DD)
                 return c.meetingDate >= todayStr;
            })
            .sort((a, b) => (a.meetingDate! > b.meetingDate!) ? 1 : -1);

        if (mounted) setUpcomingMeetings(meetings);
    };
    checkSchedule();

    return () => { mounted = false; };
  }, [totalStockValue, tiles.length, topCategory, customers, currentUser]);

  // Derived state for the "Tomorrow" alert
  const meetingsTomorrow = upcomingMeetings.filter(c => {
      const now = new Date();
      now.setDate(now.getDate() + 1); // Add one day
      
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const tomorrowStr = `${year}-${month}-${day}`;
      
      return c.meetingDate === tomorrowStr;
  });

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition duration-300">
      <div className={`p-3.5 rounded-xl ${color} text-white shadow-sm`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Reminder Alert Section */}
        {meetingsTomorrow.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5 flex items-start gap-4 shadow-sm animate-pulse ring-1 ring-amber-100">
                <div className="bg-amber-100 p-2 rounded-full text-amber-600 mt-0.5">
                    <BellRing size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-amber-900 text-base">Upcoming Meeting Reminder</h3>
                    <p className="text-amber-800 text-sm mt-0.5">
                        You have meetings scheduled for tomorrow ({new Date(Date.now() + 86400000).toLocaleDateString()}) with:
                    </p>
                    <ul className="space-y-1 mt-2">
                        {meetingsTomorrow.map(c => (
                            <li key={c.id} className="text-sm text-amber-900 bg-amber-100/50 px-2 py-1 rounded inline-block mr-2 border border-amber-200/50">
                                <span className="font-bold">{c.name}</span> <span className="opacity-75">- {c.meetingInfo || 'Business Meeting'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 md:gap-6`}>
        <StatCard 
          title="Volume Sold" 
          value={`${totalVolumeSold.toLocaleString()} sqm`} 
          icon={Layers} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Stock Items" 
          value={totalStockItems.toLocaleString()} 
          icon={Package} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Customers" 
          value={customers.length} 
          icon={Users} 
          color="bg-indigo-500" 
        />
        {/* Conditionally render Team Members only for Admins */}
        {isAdmin && (
            <StatCard 
            title="Team Members" 
            value={employees.length} 
            icon={TrendingUp} 
            color="bg-amber-500" 
            />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Package size={20} className="text-slate-400"/> Inventory Distribution
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataByType}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {dataByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={100} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                            <Sparkles className="text-yellow-300" size={18} />
                        </div>
                        <h3 className="text-base font-bold tracking-wide uppercase text-indigo-100">AI Insight</h3>
                    </div>
                    <p className="text-white text-lg font-medium leading-relaxed">
                        "{insight}"
                    </p>
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-xs text-indigo-200 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Live analysis by Gemini 2.5 Flash
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats for Meetings */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full max-h-[400px] flex flex-col">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-4">
                     <div className="flex items-center gap-2 text-slate-800">
                        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                             <CalendarClock size={20} />
                        </div>
                        <h3 className="font-bold text-base">My Schedule</h3>
                     </div>
                     <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{upcomingMeetings.length}</span>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                     {upcomingMeetings.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingMeetings.slice(0, 5).map(customer => {
                                // Use local date for display logic comparison
                                const now = new Date();
                                const year = now.getFullYear();
                                const month = String(now.getMonth() + 1).padStart(2, '0');
                                const day = String(now.getDate()).padStart(2, '0');
                                const todayStr = `${year}-${month}-${day}`;
                                
                                const isToday = customer.meetingDate === todayStr;
                                
                                // Parse the date carefully to avoid timezone shifts in display
                                const [mYear, mMonth, mDay] = customer.meetingDate!.split('-').map(Number);
                                const meetingDateObj = new Date(mYear, mMonth - 1, mDay);
                                
                                return (
                                    <div key={customer.id} className="flex items-center justify-between group p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition duration-200">
                                        <div className="flex items-center gap-3">
                                            <div className={`text-center px-2.5 py-1.5 rounded-lg min-w-[50px] shadow-sm border ${isToday ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                                <div className={`text-[9px] font-bold uppercase tracking-wider ${isToday ? 'text-indigo-200' : 'text-slate-400'}`}>{meetingDateObj.toLocaleString('default', { month: 'short' })}</div>
                                                <div className="text-lg font-bold leading-none mt-0.5">{meetingDateObj.getDate()}</div>
                                            </div>
                                            <div className="overflow-hidden">
                                                {/* Priority: Show Meeting Info first as requested */}
                                                <p className="text-sm font-bold text-slate-800 truncate" title={customer.meetingInfo}>{customer.meetingInfo || 'Business Meeting'}</p>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                    <span className="font-medium text-indigo-600 truncate bg-indigo-50 px-1.5 py-0.5 rounded">{customer.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {isToday && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold ml-2 shadow-sm">TODAY</span>}
                                    </div>
                                );
                            })}
                            {upcomingMeetings.length > 5 && (
                                <button className="w-full py-2 text-xs text-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition font-medium">
                                    View {upcomingMeetings.length - 5} more meetings...
                                </button>
                            )}
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <CalendarClock size={24} className="text-slate-300"/>
                            </div>
                            <p className="text-sm font-medium text-slate-500">No meetings upcoming</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Schedule meetings in the Customers tab to see them here.</p>
                        </div>
                     )}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};
