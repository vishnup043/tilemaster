
import React, { useState } from 'react';
import { Customer, Employee } from '../types';
import { Plus, Trash2, Mail, Phone, MapPin, User as UserIcon, Edit2, Calendar, FileText, AlertTriangle, ChevronRight } from 'lucide-react';

interface CustomerManagerProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  currentUser: Employee;
  employees: Employee[];
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, setCustomers, currentUser, employees }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-fill Date Logic: 
    // If user entered Meeting Info but forgot the Date, default it to Today so it shows in Dashboard.
    let finalMeetingDate = newCustomer.meetingDate;
    if (newCustomer.meetingInfo && newCustomer.meetingInfo.trim() !== '' && !finalMeetingDate) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        finalMeetingDate = `${year}-${month}-${day}`;
    }

    if (editingId) {
        // Update existing customer
        setCustomers(prev => prev.map(c => 
            c.id === editingId ? { ...c, ...newCustomer, meetingDate: finalMeetingDate } as Customer : c
        ));
    } else {
        // Create new customer
        const customerToAdd: Customer = {
            id: Date.now().toString(),
            name: newCustomer.name!,
            email: newCustomer.email!,
            phone: newCustomer.phone!,
            address: newCustomer.address!,
            totalSpent: Number(newCustomer.totalSpent) || 0,
            purchasedVolume: Number(newCustomer.purchasedVolume) || 0,
            meetingDate: finalMeetingDate, 
            meetingInfo: newCustomer.meetingInfo,
            assignedTo: currentUser.id // Auto-assign to current user
        };
        setCustomers(prev => [...prev, customerToAdd]);
    }
    
    setIsModalOpen(false);
    setNewCustomer({});
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setCustomers(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleEdit = (customer: Customer) => {
      setEditingId(customer.id);
      setNewCustomer({ ...customer });
      setIsModalOpen(true);
  };

  const openNewModal = () => {
      setEditingId(null);
      
      // Default meeting date to today in local time to ensure it shows in Dashboard immediately
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      setNewCustomer({
          meetingDate: todayStr
      });
      setIsModalOpen(true);
  }

  // Card component for Mobile View
  const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => {
    const assignedEmployee = employees.find(e => e.id === customer.assignedTo);
    const isMine = customer.assignedTo === currentUser.id;

    return (
        <div className="p-4 bg-white border-b border-slate-100 last:border-0 hover:bg-slate-50 transition active:bg-slate-100">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-slate-800 text-base">{customer.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin size={10} /> {customer.address}
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-emerald-600">${customer.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{customer.purchasedVolume ? `${customer.purchasedVolume.toLocaleString()} sqm` : '-'}</p>
                </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-slate-600 mb-3 pl-1 border-l-2 border-slate-100">
                <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400"/> {customer.email}
                </div>
                <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400"/> {customer.phone}
                </div>
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                <div>
                    {customer.meetingDate ? (
                        <div className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium">
                            <Calendar size={12} /> {customer.meetingDate}
                        </div>
                    ) : (
                        <span className="text-xs text-slate-400 italic pl-1">No meetings</span>
                    )}
                </div>
                <div className="flex gap-1">
                     <button onClick={() => handleEdit(customer)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg active:scale-95 transition">
                        <Edit2 size={16} />
                     </button>
                     <button onClick={() => setDeleteId(customer.id)} className="p-2 text-red-600 bg-red-50 rounded-lg active:scale-95 transition">
                        <Trash2 size={16} />
                     </button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center sticky top-0 z-10 bg-slate-50/95 backdrop-blur py-2">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Customers</h2>
        <button 
          onClick={openNewModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95 duration-100"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Customer</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Mobile List View (Block on mobile, hidden on Desktop) */}
        <div className="md:hidden divide-y divide-slate-100">
             {customers.length > 0 ? (
                 customers.map(customer => <CustomerCard key={customer.id} customer={customer} />)
             ) : (
                 <div className="p-8 text-center text-slate-400 text-sm">
                    No customers found. Tap "Add" to start.
                 </div>
             )}
        </div>

        {/* Desktop Table View (Hidden on mobile, Block on Desktop) */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold pl-6">Customer Details</th>
                <th className="p-4 font-semibold">Volume (sqm)</th>
                <th className="p-4 font-semibold">Total Value</th>
                <th className="p-4 font-semibold">Meeting Status</th>
                <th className="p-4 font-semibold">Assignment</th>
                <th className="p-4 font-semibold text-right pr-6">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {customers.map(customer => {
                    const assignedEmployee = employees.find(e => e.id === customer.assignedTo);
                    const isMine = customer.assignedTo === currentUser.id;

                    return (
                        <tr key={customer.id} className="hover:bg-slate-50 transition group">
                        <td className="p-4 pl-6">
                            <h3 className="font-bold text-slate-800">{customer.name}</h3>
                            <div className="flex flex-col text-xs text-slate-500 gap-1 mt-1">
                                <div className="flex items-center gap-2">
                                    <Mail size={12} className="text-slate-400"/> {customer.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={12} className="text-slate-400"/> {customer.phone}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-slate-400"/> {customer.address}
                                </div>
                            </div>
                        </td>
                        <td className="p-4 text-slate-700 font-medium text-sm">
                            {customer.purchasedVolume ? `${customer.purchasedVolume.toLocaleString()} sqm` : '-'}
                        </td>
                        <td className="p-4 text-emerald-600 font-bold text-sm">
                            ${customer.totalSpent.toLocaleString()}
                        </td>
                        <td className="p-4">
                            {customer.meetingDate ? (
                                <div className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg inline-block border border-indigo-100">
                                    <div className="flex items-center gap-2 text-xs font-bold mb-0.5">
                                        <Calendar size={12} /> {customer.meetingDate}
                                    </div>
                                    <div className="text-[10px] opacity-80 max-w-[150px] truncate" title={customer.meetingInfo}>
                                        {customer.meetingInfo || 'No agenda set'}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-slate-400 text-xs italic">No meetings scheduled</span>
                            )}
                        </td>
                        <td className="p-4">
                            {isMine ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">
                                    <UserIcon size={10} /> You
                                </span>
                            ) : (
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                    {assignedEmployee ? assignedEmployee.name : 'Unassigned'}
                                </span>
                            )}
                        </td>
                        <td className="p-4 text-right pr-6">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" onClick={() => handleEdit(customer)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition" title="Edit Customer">
                                    <Edit2 size={18} />
                                </button>
                                <button type="button" onClick={() => setDeleteId(customer.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete Customer">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
            {customers.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    No customers found. Add your first customer to get started.
                </div>
            )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto mx-4">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200/50 rounded-lg transition"><ChevronRight className="rotate-90" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Company / Customer Name</label>
                <input required type="text" placeholder="e.g. Acme Corp" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm font-medium" 
                  value={newCustomer.name || ''} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Email</label>
                    <input required type="email" placeholder="contact@company.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm" 
                    value={newCustomer.email || ''} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Phone</label>
                    <input required type="tel" placeholder="+1 (555) 000-0000" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm" 
                    value={newCustomer.phone || ''} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Address</label>
                <input required type="text" placeholder="123 Business Rd, City" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm" 
                  value={newCustomer.address || ''} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Total Spent ($)</label>
                    <input required type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm font-mono" 
                    value={newCustomer.totalSpent || ''} onChange={e => setNewCustomer({...newCustomer, totalSpent: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Volume (sqm)</label>
                    <input type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm font-mono" 
                    value={newCustomer.purchasedVolume || ''} onChange={e => setNewCustomer({...newCustomer, purchasedVolume: Number(e.target.value)})} />
                  </div>
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                  <div className="flex items-center gap-2 mb-3 text-indigo-900 font-bold text-sm">
                      <Calendar size={16} className="text-indigo-600"/> Schedule Meeting
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-indigo-800 mb-1.5 ml-1">Date</label>
                        <input type="date" className="w-full p-2.5 bg-white border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition" 
                            value={newCustomer.meetingDate || ''} onChange={e => setNewCustomer({...newCustomer, meetingDate: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-indigo-800 mb-1.5 ml-1">Meeting Info / Status</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400" />
                            <input 
                                type="text" 
                                placeholder="e.g. Discuss Q4 Contract" 
                                className="pl-9 w-full p-2.5 bg-white border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition"
                                value={newCustomer.meetingInfo || ''} 
                                onChange={e => setNewCustomer({...newCustomer, meetingInfo: e.target.value})} 
                            />
                        </div>
                      </div>
                  </div>
              </div>

              {!editingId && (
                  <div className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-lg flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      This customer will be automatically assigned to you.
                  </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition text-sm font-bold active:scale-95 duration-100">
                    {editingId ? 'Save Changes' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center mx-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 shadow-sm">
                    <AlertTriangle size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Customer?</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    Are you sure you want to remove this customer? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setDeleteId(null)}
                        className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition font-bold text-sm active:scale-95 duration-100"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
