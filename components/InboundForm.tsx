
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Material, InboundSource } from '../types';
import { Save, CheckCircle2, Plus, Trash2, PackageSearch } from 'lucide-react';

interface LineItem {
  material_id: string;
  material_number: string;
  material_name: string;
  unit: string;
  volume_in: number;
}

const InboundForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [success, setSuccess] = useState(false);
  
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [currentVolume, setCurrentVolume] = useState<number>(0);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    contract_number: '',
    source: 'Kontrak UID' as InboundSource
  });

  useEffect(() => {
    setMaterials(db.getMaterials());
  }, []);

  const addItem = () => {
    const mat = materials.find(m => m.id === selectedMaterialId);
    if (!mat || currentVolume <= 0) return;

    if (items.some(i => i.material_id === mat.id)) {
      alert("Material already in list.");
      return;
    }

    setItems([...items, {
      material_id: mat.id,
      material_number: mat.material_number,
      material_name: mat.material_name,
      unit: mat.unit,
      volume_in: currentVolume
    }]);

    setSelectedMaterialId('');
    setCurrentVolume(0);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.material_id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !formData.contract_number) return;

    db.saveInboundBatch(
      formData,
      items.map(i => ({ material_id: i.material_id, volume_in: i.volume_in }))
    );

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onComplete();
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-600 px-8 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-xl tracking-tight">Penerimaan Material Baru</h2>
          <p className="text-blue-200 text-xs font-medium">Batch Inbound Processing • UP3 Cirebon</p>
        </div>
        {success && <div className="flex items-center gap-2 text-white bg-blue-500/50 px-4 py-2 rounded-full border border-white/20 animate-pulse"><CheckCircle2 className="w-4 h-4" /> Berhasil Disimpan</div>}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tanggal</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold text-slate-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">No. Kontrak / Referensi</label>
            <input
              type="text"
              required
              placeholder="Contoh: 001/PJ/2024"
              value={formData.contract_number}
              onChange={e => setFormData({ ...formData, contract_number: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sumber Pengadaan</label>
            <select
              value={formData.source}
              onChange={e => setFormData({ ...formData, source: e.target.value as InboundSource })}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold text-slate-900 cursor-pointer"
            >
              <option value="Kontrak UID">Kontrak UID</option>
              <option value="Kontrak UP3">Kontrak UP3</option>
              <option value="STO">STO</option>
              <option value="Lain-Lain">Lain-Lain</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
            <PackageSearch className="w-4 h-4 text-blue-600" />
            Input Baris Material
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-blue-50/30 p-6 rounded-2xl border border-blue-100 border-dashed">
            <div className="md:col-span-7 space-y-1.5">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Cari Material</label>
              <select
                value={selectedMaterialId}
                onChange={e => setSelectedMaterialId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold text-slate-900"
              >
                <option value="">-- Pilih Material dari Katalog --</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.material_number} | {m.material_name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Volume</label>
              <input
                type="number"
                min="1"
                value={currentVolume || ''}
                onChange={e => setCurrentVolume(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-black text-slate-900"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={addItem}
                disabled={!selectedMaterialId || currentVolume <= 0}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
              >
                <Plus className="w-4 h-4" /> TAMBAH
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Daftar Item ({items.length})</h3>
            <p className="text-[10px] font-bold text-slate-400 italic">*Klik sampah untuk menghapus baris</p>
          </div>
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-slate-50/30">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Material</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-right">Volume</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Satuan</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-slate-400 font-medium">Belum ada item yang ditambahkan ke daftar inbound ini.</td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.material_id} className="hover:bg-white transition-colors bg-white/40">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{item.material_name}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{item.material_number}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-blue-600 text-lg">{item.volume_in.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-bold uppercase">{item.unit}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.material_id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-[0.99] transition-all shadow-2xl shadow-blue-200 disabled:opacity-50 disabled:grayscale"
            disabled={items.length === 0 || !formData.contract_number}
          >
            <Save className="w-6 h-6" />
            POSTING {items.length} TRANSAKSI MASUK
          </button>
        </div>
      </form>
    </div>
  );
};

export default InboundForm;
