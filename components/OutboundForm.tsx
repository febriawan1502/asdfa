
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import { Material, OutboundTransaction, VehicleType } from '../types';
import { FileText, Save, CheckCircle2, Plus, Trash2, PackageSearch, Clipboard, Hash, User, Truck, CreditCard, FileCode, Search, ChevronDown } from 'lucide-react';
import TransactionDocument from './TransactionDocument';

interface LineItem {
  material_id: string;
  material_number: string;
  material_name: string;
  unit: string;
  volume_out: number;
  available_stock: number;
}

const OutboundForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [success, setSuccess] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [lastTransactions, setLastTransactions] = useState<OutboundTransaction[]>([]);
  
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [materialSearch, setMaterialSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentVolume, setCurrentVolume] = useState<number>(0);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    purpose: '',
    recipient_name: '',
    reservation_number: '',
    k7_number: '',
    tug9_number: '',
    driver_name: '',
    vehicle_type: 'Pickup' as VehicleType,
    license_plate: ''
  });

  useEffect(() => {
    setMaterials(db.getMaterials());

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMaterials = materials.filter(m => 
    m.material_name.toLowerCase().includes(materialSearch.toLowerCase()) ||
    m.material_number.toLowerCase().includes(materialSearch.toLowerCase())
  );

  const selectMaterial = (mat: Material) => {
    setSelectedMaterial(mat);
    setMaterialSearch(`${mat.material_number} - ${mat.material_name}`);
    setIsDropdownOpen(false);
  };

  const addItem = () => {
    if (!selectedMaterial || currentVolume <= 0) return;

    if (items.some(i => i.material_id === selectedMaterial.id)) {
      alert("Material sudah ada di list.");
      return;
    }

    if (currentVolume > selectedMaterial.current_stock) {
      alert(`Stok tidak cukup! Hanya tersedia ${selectedMaterial.current_stock}.`);
      return;
    }

    setItems([...items, {
      material_id: selectedMaterial.id,
      material_number: selectedMaterial.material_number,
      material_name: selectedMaterial.material_name,
      unit: selectedMaterial.unit,
      volume_out: currentVolume,
      available_stock: selectedMaterial.current_stock
    }]);

    setSelectedMaterial(null);
    setMaterialSearch('');
    setCurrentVolume(0);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.material_id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !formData.reservation_number || !formData.k7_number || !formData.recipient_name || !formData.purpose) {
      alert("Mohon lengkapi data wajib: Tanggal, Penerima, No K7, No Reservasi, dan Proyek.");
      return;
    }

    const txs = db.saveOutboundBatch(
      formData as any,
      items.map(i => ({ material_id: i.material_id, volume_out: i.volume_out }))
    );

    setLastTransactions(txs as any);
    setSuccess(true);
  };

  const resetAndComplete = () => {
    setSuccess(false);
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 no-print">
      <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-xl tracking-tight uppercase">Penerbitan Surat Jalan</h2>
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest">Gudang PLN UP3 Cirebon</p>
        </div>
        {success && <div className="flex items-center gap-2 text-white bg-indigo-500/50 px-4 py-2 rounded-full border border-white/20 animate-pulse font-black text-xs uppercase tracking-widest"><CheckCircle2 className="w-4 h-4" /> Posted</div>}
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tanggal</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Penerima Barang</label>
              <input
                type="text"
                required
                placeholder="Nama Vendor / Unit"
                value={formData.recipient_name}
                onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 shadow-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nomor K7 / Permintaan (Wajib)</label>
              <div className="relative">
                <FileCode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input
                  type="text"
                  required
                  placeholder="No. K7 / Permintaan"
                  value={formData.k7_number}
                  onChange={e => setFormData({ ...formData, k7_number: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nomor Reservasi (Wajib)</label>
              <div className="relative">
                <Clipboard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input
                  type="text"
                  required
                  placeholder="No. Reservasi / RS"
                  value={formData.reservation_number}
                  onChange={e => setFormData({ ...formData, reservation_number: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nomor TUG9 (Opsional)</label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input
                  type="text"
                  placeholder="No. TUG9 (Jika ada)"
                  value={formData.tug9_number}
                  onChange={e => setFormData({ ...formData, tug9_number: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Untuk Proyek / Peruntukan</label>
              <input
                type="text"
                required
                placeholder="Masukkan detail pengerjaan atau proyek..."
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Pengemudi</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input
                  type="text"
                  placeholder="Nama pengemudi"
                  value={formData.driver_name}
                  onChange={e => setFormData({ ...formData, driver_name: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kendaraan</label>
              <div className="relative">
                <Truck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <select
                  value={formData.vehicle_type}
                  onChange={e => setFormData({ ...formData, vehicle_type: e.target.value as VehicleType })}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 shadow-sm appearance-none"
                >
                  <option value="Pickup">Pickup</option>
                  <option value="Minibus">Minibus</option>
                  <option value="Truck">Truck</option>
                  <option value="Motor">Motor</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nomor Polisi</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input
                  type="text"
                  placeholder="Contoh: E 1234 ABC"
                  value={formData.license_plate}
                  onChange={e => setFormData({ ...formData, license_plate: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <PackageSearch className="w-4 h-4 text-indigo-600" />
              Item Material Yang Dikeluarkan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100 border-dashed">
              <div className="md:col-span-7 space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Cari Material (Normalisasi/Nama)</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input
                    type="text"
                    value={materialSearch}
                    onChange={(e) => {
                      setMaterialSearch(e.target.value);
                      setIsDropdownOpen(true);
                      if (!e.target.value) setSelectedMaterial(null);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Ketik kode normalisasi atau nama material..."
                    className="w-full pl-10 pr-10 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900"
                  />
                  <ChevronDown className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isDropdownOpen && filteredMaterials.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                    {filteredMaterials.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => selectMaterial(m)}
                        className="w-full text-left px-5 py-3 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0 group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-indigo-600 font-mono tracking-wider">{m.material_number}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${m.current_stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            Stok: {m.current_stock} {m.unit}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1 uppercase group-hover:text-indigo-700 transition-colors">{m.material_name}</p>
                      </button>
                    ))}
                  </div>
                )}
                {isDropdownOpen && filteredMaterials.length === 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-center text-slate-400 text-xs italic">
                    Material tidak ditemukan.
                  </div>
                )}
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Volume</label>
                <input
                  type="number"
                  min="1"
                  value={currentVolume || ''}
                  onChange={e => setCurrentVolume(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-black text-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!selectedMaterial || currentVolume <= 0}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200"
                >
                  <Plus className="w-4 h-4" /> TAMBAH
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight px-1">Ringkasan Baris Surat Jalan ({items.length})</h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty Keluar</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Satuan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-400 italic">Daftar item masih kosong. Silakan tambahkan barang di atas.</td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.material_id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 uppercase leading-tight">{item.material_name}</p>
                          <p className="text-[10px] font-mono text-indigo-600 font-black">{item.material_number}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-black text-indigo-600 text-lg">{item.volume_out.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-bold uppercase tracking-wider">{item.unit}</td>
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
              className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50"
              disabled={items.length === 0}
            >
              <Save className="w-6 h-6" />
              KONFIRMASI & LIHAT SURAT JALAN
            </button>
          </div>
        </form>
      ) : (
        <div className="p-16 text-center space-y-8 animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-100 border-4 border-white">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">TRANSAKSI BERHASIL</h3>
            <p className="text-slate-500 mt-2 font-medium">Stok material telah diperbarui di database.</p>
          </div>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <button
              onClick={() => setShowDoc(true)}
              className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              <FileText className="w-6 h-6" />
              LIHAT SURAT JALAN
            </button>
            <button
              onClick={resetAndComplete}
              className="py-4 text-slate-400 font-bold hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
            >
              KEMBALI KE MONITORING
            </button>
          </div>
        </div>
      )}

      {showDoc && lastTransactions.length > 0 && (
        <TransactionDocument
          transactions={lastTransactions}
          materials={materials}
          onClose={() => setShowDoc(false)}
        />
      )}
    </div>
  );
};

export default OutboundForm;
