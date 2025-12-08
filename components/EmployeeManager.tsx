import React, { useState } from 'react';
import { Employee } from '../types';
import { Plus, Trash2, UserCheck, Clock, Shield, Key, Edit2 } from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, setEmployees }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({ status: 'Active' });
  const [editingId, setEditingId] = useState<string | null>(null);

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
        setEmployees([...employees, { 
            ...formData, 
            id: Date.now().toString(), 
            joinDate: new Date().toLocaleDateString() 
        } as Employee]);
    }
    
    setIsModalOpen(false);
    setFormData({ status: 'Active' });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
      if (confirm('Are you sure you want to remove this employee?')) {
        setEmployees(employees.filter(e => e.id !== id));
      }
  }

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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Team Management</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(employee => (
          <div key={employee.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between group">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-100 p-3 rounded-full">
                        <UserCheck className="text-slate-600" size={24} />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(employee.status)}`}>
                        {employee.status}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{employee.name}</h3>
                <p className="text-indigo-600 text-sm font-medium mb-2">{employee.role}</p>
                <p className="text-slate-500 text-sm mb-4">{employee.email}</p>
                
                {employee.username ? (
                    <div className="mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                            <Shield size={12} className="text-indigo-500"/>
                            <span className="font-semibold">Login Enabled</span>
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                            Username: <span className="font-mono text-slate-700">{employee.username}</span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 bg-slate-50 p-2 rounded-lg border border-dashed border-slate-300 text-center">
                        <p className="text-xs text-slate-400">No login credentials assigned.</p>
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <Clock size={12} /> Joined: {employee.joinDate}
                </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button 
                    onClick={() => handleOpenModal(employee)} 
                    className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition flex items-center justify-center gap-2"
                >
                    <Edit2 size={16} /> Edit
                </button>
                <button 
                    onClick={() => handleDelete(employee.id)} 
                    className="w-10 py-2 border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition flex items-center justify-center"
                >
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                  {editingId ? 'Edit Employee Details' : 'Register New Employee'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required placeholder="e.g. Sarah Connor" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role / Position</label>
                <input required placeholder="e.g. Sales Representative" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input required type="email" placeholder="sarah@example.com" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
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
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
                        <input 
                            placeholder="Create a username" 
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                            value={formData.username || ''} 
                            onChange={e => setFormData({...formData, username: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                        <input 
                            type="text" 
                            placeholder={editingId ? "Enter new password to update" : "Create a password"} 
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                            value={formData.password || ''} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                        />
                         {editingId && <p className="text-[10px] text-slate-400 mt-1">Current password is hidden. Overwrite to change.</p>}
                    </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition">
                    {editingId ? 'Save Changes' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};