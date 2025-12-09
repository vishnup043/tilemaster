
import React, { useState } from 'react';
import { Tile, StockType } from '../types';
import { generateMarketingDescription } from '../services/geminiService';
import { Plus, Trash2, Edit2, Loader2, Sparkles, Search, Package, Tag, Ruler } from 'lucide-react';

interface StockManagerProps {
  tiles: Tile[];
  setTiles: React.Dispatch<React.SetStateAction<Tile[]>>;
}

export const StockManager: React.FC<StockManagerProps> = ({ tiles, setTiles }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Tile>>({
    name: '',
    type: StockType.CERAMIC,
    size: '',
    price: 0,
    stockQuantity: 0,
    description: '',
    imageUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`
  });

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.type || !formData.size) {
      alert("Please fill in Name, Type, and Size first.");
      return;
    }
    setIsGenerating(true);
    const desc = await generateMarketingDescription(formData.name, formData.type as StockType, formData.size);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTile: Tile = {
      id: Date.now().toString(),
      name: formData.name!,
      type: formData.type as StockType,
      size: formData.size!,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      description: formData.description || '',
      imageUrl: formData.imageUrl!
    };
    setTiles([...tiles, newTile]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      type: StockType.CERAMIC,
      size: '',
      price: 0,
      stockQuantity: 0,
      description: '',
      imageUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`
    });
  };

  const handleDelete = (id: string) => {
    if(confirm('Are you sure you want to delete this item?')) {
      setTiles(tiles.filter(t => t.id !== id));
    }
  };

  const filteredTiles = tiles.filter(tile => 
    tile.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tile.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-10 bg-slate-50/95 backdrop-blur py-2">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Inventory</h2>
        <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search tiles..." 
                    className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full shadow-sm text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95 duration-100 shrink-0"
            >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Tile</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTiles.map(tile => (
          <div key={tile.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img src={tile.imageUrl} alt={tile.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm border border-white/50">
                {tile.type}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-800 truncate pr-2">{tile.name}</h3>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-sm">${tile.price}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[2.5em] leading-relaxed">{tile.description}</p>
              
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                <span className="bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                    <Ruler size={10} /> {tile.size}
                </span>
                <span className={`px-2 py-1 rounded-md flex items-center gap-1 ${tile.stockQuantity < 50 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Package size={10} />
                  {tile.stockQuantity} in stock
                </span>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-50">
                 <button onClick={() => handleDelete(tile.id)} className="flex-1 flex items-center justify-center gap-1.5 text-red-500 hover:bg-red-50 py-2 rounded-lg transition text-xs font-medium">
                    <Trash2 size={14} /> Delete
                 </button>
                 <button className="flex-1 flex items-center justify-center gap-1.5 text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg transition text-xs font-medium">
                    <Edit2 size={14} /> Edit
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTiles.length === 0 && (
          <div className="text-center py-20 opacity-50">
              <Package size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No tiles found matching your search.</p>
          </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 py-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur sticky top-0 z-10">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Tag size={20} className="text-indigo-600"/> Add New Tile</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200/50 rounded-lg transition"><Trash2 className="rotate-45" size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Product Name</label>
                  <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm font-medium" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Material Type</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm"
                        value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as StockType})}>
                        {Object.values(StockType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Size (e.g. 60x60cm)</label>
                  <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm" 
                    value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Price per Unit ($)</label>
                  <input required type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm" 
                    value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Initial Stock</label>
                  <input required type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm" 
                    value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Image URL</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm" 
                    value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider ml-1">Description</label>
                    <button 
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm active:scale-95"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={10} /> : <Sparkles size={10} />}
                        {isGenerating ? 'GENERATING...' : 'AI GENERATE'}
                    </button>
                </div>
                <textarea 
                    className="w-full p-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition resize-none"
                    rows={3}
                    placeholder="Enter description manually or use AI..."
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition text-sm font-bold active:scale-95 duration-100">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
