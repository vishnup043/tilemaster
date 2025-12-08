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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Reminder Alert Section */}
        {meetingsTomorrow.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-pulse">
                <BellRing className="text-amber-600 mt-1" size={20} />
                <div>
                    <h3 className="font-bold text-amber-800">Upcoming Meeting Reminder</h3>
                    <p className="text-amber-700 text-sm">
                        You have meetings scheduled for tomorrow ({new Date(Date.now() + 86400000).toLocaleDateString()}) with:
                    </p>
                    <ul className="list-disc list-inside text-sm text-amber-700 mt-1 font-medium">
                        {meetingsTomorrow.map(c => (
                            <li key={c.id}>
                                {c.name} <span className="opacity-75 font-normal">- {c.meetingInfo || 'Business Meeting'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {/* Replaced Inventory Value with Total Volume Sold */}
        <StatCard 
          title="Total Volume Sold" 
          value={`${totalVolumeSold.toLocaleString()} sqm`} 
          icon={Layers} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Total Tiles in Stock" 
          value={totalStockItems.toLocaleString()} 
          icon={Package} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Customers" 
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
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Inventory Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataByType}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {dataByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-md text-white">
                <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="text-yellow-300" />
                    <h3 className="text-lg font-bold">AI Business Insight</h3>
                </div>
                <p className="text-indigo-100 text-lg leading-relaxed italic">
                    "{insight}"
                </p>
                <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-sm text-indigo-200">
                        Generated by Gemini 2.5 Flash based on your real-time metrics.
                    </p>
                </div>
            </div>

            {/* Quick Stats for Meetings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-100 pb-3">
                    <CalendarClock size={20} className="text-indigo-600" />
                    <h3 className="font-bold">My Schedule</h3>
                 </div>
                 
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
                                <div key={customer.id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className={`text-center px-2 py-1 rounded min-w-[50px] ${isToday ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                            <div className="text-[10px] font-bold uppercase">{meetingDateObj.toLocaleString('default', { month: 'short' })}</div>
                                            <div className="text-lg font-bold leading-none">{meetingDateObj.getDate()}</div>
                                        </div>
                                        <div className="overflow-hidden">
                                            {/* Priority: Show Meeting Info first as requested */}
                                            <p className="text-sm font-bold text-slate-800 truncate" title={customer.meetingInfo}>{customer.meetingInfo || 'Business Meeting'}</p>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <span className="font-medium text-indigo-600 truncate">{customer.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isToday && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold ml-2">TODAY</span>}
                                </div>
                            );
                        })}
                        {upcomingMeetings.length > 5 && (
                            <p className="text-xs text-center text-slate-400 pt-2">+ {upcomingMeetings.length - 5} more meetings</p>
                        )}
                    </div>
                 ) : (
                    <div className="text-center py-6 text-slate-400">
                        <p className="text-sm">No upcoming meetings scheduled.</p>
                        <p className="text-xs text-slate-300 mt-1">Check your "Meeting Status" in Customers.</p>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};