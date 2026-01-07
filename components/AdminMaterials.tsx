
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import { Material } from '../types';
import { Plus, Edit2, Trash2, Upload, X, Save, CheckCircle2, AlertCircle, FileSpreadsheet, Info, QrCode, Printer } from 'lucide-react';

interface AdminMaterialsProps {
  onComplete: () => void;
}

const AdminMaterials: React.FC<AdminMaterialsProps> = ({ onComplete }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [previewMaterials, setPreviewMaterials] = useState<Omit<Material, 'id'>[]>([]);
  const [qrLabel, setQrLabel] = useState<Material | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    material_number: '',
    material_name: '',
    unit: '',
    current_stock: 0
  });

  const loadMaterials = () => {
    setMaterials(db.getMaterials());
    onComplete();
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const openAddModal = () => {
    setEditingMaterial(null);
    setFormData({ material_number: '', material_name: '', unit: '', current_stock: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (m: Material) => {
    setEditingMaterial(m);
    setFormData({
      material_number: m.material_number,
      material_name: m.material_name,
      unit: m.unit,
      current_stock: m.current_stock
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus material ini?')) {
      db.deleteMaterial(id);
      loadMaterials();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      db.updateMaterial(editingMaterial.id, formData);
    } else {
      db.addMaterial(formData);
    }
    setIsModalOpen(false);
    loadMaterials();
  };

  const parseCSVLine = (text: string) => {
    const re_valid = /^\s*(?:'[^']*'|"[^"]*"|[^;]*)(?:\s*;\s*(?:'[^']*'|"[^"]*"|[^;]*))*\s*$/;
    const re_value = /(?!\s*$)\s*(?:'([^']*)'|"([^"]*)"|([^;]*))(?:\s*;\s*|$)/g;
    
    if (!re_valid.test(text)) return null;
    const a = [];
    text.replace(re_value, function(m0, m1, m2, m3) {
      if (m1 !== undefined) a.push(m1);
      else if (m2 !== undefined) a.push(m2);
      else if (m3 !== undefined) a.push(m3.trim());
      return '';
    });
    return a;
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      const newItems: Omit<Material, 'id'>[] = [];

      lines.forEach((line) => {
        const row = parseCSVLine(line);
        if (row && row.length >= 2) {
          const number = row[0];
          const name = row[1];
          const unit = row[2] || 'BH';
          const stock = parseInt(row[3]) || 0;
          
          if (number && name) {
            newItems.push({
              material_number: number,
              material_name: name,
              unit: unit,
              current_stock: stock
            });
          }
        }
      });

      if (newItems.length > 0) {
        setPreviewMaterials(newItems);
      } else {
        alert('Format CSV tidak valid atau file kosong. Pastikan menggunakan pemisah titik koma (;)');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmBatchImport = () => {
    db.batchAddMaterials(previewMaterials);
    setPreviewMaterials([]);
    loadMaterials();
    alert(`Berhasil mengimpor ${previewMaterials.length} material.`);
  };

  const printLabel = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Master Data Material</h3>
          <p className="text-sm text-slate-500">Kelola katalog barang dan level stok dasar.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all border border-slate-200 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Batch Upload CSV
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Tambah Material
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCsvUpload}
            accept=".csv, .txt"
            className="hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest">Material Number</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest">Description</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest">Unit</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest">Stock</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {m.material_number}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                  {m.material_name}
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">{m.unit}</td>
                <td className="px-6 py-4 font-black text-slate-700 text-sm">{m.current_stock.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setQrLabel(m)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Cetak Label QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QR Label Modal */}
      {qrLabel && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 no-print backdrop-blur-md">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-slate-800">QR Label Preview</h3>
                <button onClick={() => setQrLabel(null)} className="p-2 rounded-full hover:bg-slate-100"><X className="w-5 h-5"/></button>
              </div>
              
              <div id="printable-area" className="p-6 border-2 border-slate-900 rounded-2xl inline-block bg-white text-slate-900">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-blue-600">PLN UP3 CIREBON</p>
                    <p className="text-xs font-black tracking-tighter">MATERIAL HISTORY TAG</p>
                  </div>
                  
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '?materialId=' + qrLabel.id)}`} 
                    alt="QR Code" 
                    className="w-32 h-32 border border-slate-100"
                  />
                  
                  <div className="text-center">
                    <p className="font-mono text-sm font-bold bg-slate-900 text-white px-2 py-0.5 rounded mb-1">{qrLabel.material_number}</p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase max-w-[150px] leading-tight">{qrLabel.material_name}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={printLabel}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                <Printer className="w-5 h-5"/> CETAK LABEL
              </button>
           </div>
        </div>
      )}

      {/* CSV Preview Modal */}
      {previewMaterials.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 tracking-tight">Konfirmasi Impor Batch</h3>
                  <p className="text-sm text-blue-600 font-medium">Terdeteksi {previewMaterials.length} baris material baru.</p>
                </div>
              </div>
              <button onClick={() => setPreviewMaterials([])} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Pastikan data di bawah ini sudah benar. Material dengan Nomor Material yang sama akan ditambahkan sebagai entri baru (duplikat jika tidak hati-hati).
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-500">Nomor Material</th>
                      <th className="px-4 py-3 font-bold text-slate-500">Deskripsi</th>
                      <th className="px-4 py-3 font-bold text-slate-500">Unit</th>
                      <th className="px-4 py-3 font-bold text-slate-500 text-right">Stok Awal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewMaterials.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{m.material_number}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{m.material_name}</td>
                        <td className="px-4 py-3">{m.unit}</td>
                        <td className="px-4 py-3 text-right font-bold">{m.current_stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setPreviewMaterials([])}
                className="px-6 py-3 text-slate-600 font-bold hover:bg-white rounded-xl transition-all"
              >
                Batalkan
              </button>
              <button
                onClick={confirmBatchImport}
                className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Ya, Simpan Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {editingMaterial ? 'Edit Material' : 'Registrasi Material Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Number</label>
                <input
                  type="text"
                  required
                  value={formData.material_number}
                  onChange={e => setFormData({ ...formData, material_number: e.target.value })}
                  placeholder="Contoh: 000000002190502"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Material</label>
                <textarea
                  required
                  rows={3}
                  value={formData.material_name}
                  onChange={e => setFormData({ ...formData, material_name: e.target.value })}
                  placeholder="Masukkan nama atau deskripsi barang..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Contoh: BH, SET, M"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok Awal</label>
                  <input
                    type="number"
                    required
                    value={formData.current_stock || ''}
                    onChange={e => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  {editingMaterial ? 'Perbarui Material' : 'Simpan Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaterials;
