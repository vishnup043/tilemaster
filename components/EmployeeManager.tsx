
import React, { useState } from 'react';
import { Employee, AppNotification } from '../types';
import { Plus, Trash2, UserCheck, Clock, Shield, Key, Edit2, AlertTriangle, BellRing, Send, X } from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, setEmployees }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({ status: 'Active' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Notification Modal State
  const [notifyId, setNotifyId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState('');

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
        setEditingId(employee.id);
        setFormData({ ...employee });
    } else {
        setEditingId(null);
        setFormData({ status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
        setEmployees(employees.map(emp => 
            emp.id === editingId ? { ...emp, ...formData } as Employee : emp
        ));
    } else {
        setEmployees(prev => [...prev, { 
            ...formData, 
            id: Date.now().toString(), 
            joinDate: new Date().toLocaleDateString(),
            notifications: []
        } as Employee]);
    }
    
    setIsModalOpen(false);
    setFormData({ status: 'Active' });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
      setDeleteId(id);
  }

  const confirmDelete = () => {
      if (deleteId) {
        setEmployees(prev => prev.filter(e => e.id !== deleteId));
        setDeleteId(null);
      }
  }

  const handleSendNotification = (e: React.FormEvent) => {
      e.preventDefault();
      if (!notifyId || !notificationMsg.trim()) return;

      const newNotification: AppNotification = {
          id: Date.now().toString(),
          message: notificationMsg,
          date: new Date().toISOString(),
          isRead: false,
          sender: 'Admin'
      };

      setEmployees(prev => prev.map(emp => {
          if (emp.id === notifyId) {
              return {
                  ...emp,
                  notifications: [newNotification, ...(emp.notifications || [])]
              };
          }
          return emp;
      }));

      setNotifyId(null);
      setNotificationMsg('');
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Active': return 'bg-green-100 text-green-700';
          case 'On Leave': return 'bg-amber-100 text-amber-700';
          case 'Terminated': return 'bg-red-100 text-red-700';
          default: return 'bg-slate-100 text-slate-700';
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center sticky top-0 z-10 bg-slate-50/95 backdrop-blur py-2">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Team</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95 duration-100"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Employee</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(employee => (
          <div key={employee.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                        {employee.avatarUrl ? (
                            <img 
                                src={employee.avatarUrl} 
                                alt={employee.name} 
                                className="w-16 h-16 rounded-full object-cover border-4 border-slate-50 shadow-sm"
                            />
                        ) : (
                            <div className="bg-slate-100 p-3 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-sm">
                                <UserCheck className="text-slate-500" size={28} />
                            </div>
                        )}
                         <span className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${employee.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(employee.status)}`}>
                        {employee.status}
                    </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800">{employee.name}</h3>
                <p className="text-indigo-600 text-sm font-semibold mb-2">{employee.role}</p>
                <p className="text-slate-500 text-sm mb-5 truncate" title={employee.email}>{employee.email}</p>
                
                {employee.username ? (
                    <div className="mb-5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 mb-1 font-bold uppercase tracking-wide">
                            <Shield size={10} /> Login Enabled
                        </div>
                        <div className="text-xs text-slate-500 truncate font-medium">
                            Username: <span className="font-mono text-slate-700 bg-white px-1 py-0.5 rounded border border-slate-200 ml-1">{employee.username}</span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-5 bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200 text-center">
                        <p className="text-xs text-slate-400">No login credentials assigned</p>
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-5 font-medium">
                    <Clock size={12} /> Joined {employee.joinDate}
                </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t border-slate-50">
                <button 
                    onClick={() => setNotifyId(employee.id)} 
                    className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition flex items-center justify-center active:scale-95"
                    title="Send Notification"
                >
                    <BellRing size={18} />
                </button>
                <button 
                    onClick={() => handleOpenModal(employee)} 
                    className="flex-1 h-10 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-2 text-sm font-medium active:scale-95"
                >
                    <Edit2 size={16} /> Edit
                </button>
                <button 
                    onClick={() => handleDelete(employee.id)} 
                    className="w-10 h-10 border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition flex items-center justify-center active:scale-95"
                >
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto mx-4">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-800">
                  {editingId ? 'Edit Employee' : 'Register Employee'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200/50 rounded-lg transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Full Name</label>
                <input required placeholder="e.g. Sarah Connor" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm font-medium" 
                    value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Role / Position</label>
                <input required placeholder="e.g. Sales Representative" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm" 
                    value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Email Address</label>
                <input required type="email" placeholder="sarah@example.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm" 
                    value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Status</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                  </select>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Key size={16} className="text-indigo-500"/> System Login Credentials
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Username</label>
                        <input 
                            placeholder="Create a username" 
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition" 
                            value={formData.username || ''} 
                            onChange={e => setFormData({...formData, username: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Password</label>
                        <input 
                            type="text" 
                            placeholder={editingId ? "Enter new password to update" : "Create a password"} 
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition font-mono" 
                            value={formData.password || ''} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                        />
                         {editingId && <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Current password is hidden for security.</p>}
                    </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition text-sm font-bold active:scale-95 duration-100">
                    {editingId ? 'Save Changes' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {notifyId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden mx-4">
                <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><BellRing size={18}/> Send Notification</h3>
                    <button onClick={() => setNotifyId(null)} className="text-indigo-200 hover:text-white p-1 hover:bg-indigo-500 rounded-lg transition"><X size={20}/></button>
                </div>
                <form onSubmit={handleSendNotification} className="p-6">
                    <p className="text-sm text-slate-500 mb-4">
                        Send a direct message to <span className="font-bold text-slate-800">{employees.find(e => e.id === notifyId)?.name}</span>.
                    </p>
                    <textarea 
                        required
                        placeholder="Type your message here..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm min-h-[100px] mb-4 transition resize-none"
                        value={notificationMsg}
                        onChange={(e) => setNotificationMsg(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setNotifyId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition text-sm font-medium">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition text-sm font-bold flex items-center gap-2 active:scale-95 duration-100">
                            <Send size={14} /> Send Message
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">Remove Employee?</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    Are you sure you want to remove this employee? They will lose access to the system immediately.
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
                        Remove
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
