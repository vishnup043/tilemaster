import React, { useState } from 'react';
import { Tile, StockType } from '../types';
import { generateMarketingDescription } from '../services/geminiService';
import { Plus, Trash2, Edit2, Loader2, Sparkles, Search } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
        <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search tiles..." 
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
            <Plus size={18} />
            Add New Tile
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTiles.map(tile => (
          <div key={tile.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="relative h-48 overflow-hidden">
              <img src={tile.imageUrl} alt={tile.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm">
                {tile.type}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-800 truncate pr-2">{tile.name}</h3>
                <span className="text-emerald-600 font-bold">${tile.price}</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2 min-h-[2.5em]">{tile.description}</p>
              
              <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                <span className="bg-slate-100 px-2 py-1 rounded">{tile.size}</span>
                <span className={`px-2 py-1 rounded ${tile.stockQuantity < 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {tile.stockQuantity} in stock
                </span>
              </div>

              <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100">
                 <button onClick={() => handleDelete(tile.id)} className="flex-1 flex items-center justify-center gap-1 text-red-500 hover:bg-red-50 py-2 rounded transition">
                    <Trash2 size={16} /> <span className="text-xs">Delete</span>
                 </button>
                 {/* Placeholder for edit functionality */}
                 <button className="flex-1 flex items-center justify-center gap-1 text-indigo-500 hover:bg-indigo-50 py-2 rounded transition">
                    <Edit2 size={16} /> <span className="text-xs">Edit</span>
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Add New Tile Stock</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input required type="text" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Material Type</label>
                    <select className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as StockType})}>
                        {Object.values(StockType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Size (e.g. 60x60cm)</label>
                  <input required type="text" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price per Unit ($)</label>
                  <input required type="number" min="0" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                  <input required type="number" min="0" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-indigo-900">Description</label>
                    <button 
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                        {isGenerating ? 'Generating...' : 'Auto-Generate with AI'}
                    </button>
                </div>
                <textarea 
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    rows={3}
                    placeholder="Enter description manually or use AI..."
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};