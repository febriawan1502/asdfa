
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { OutboundTransaction, Material } from '../types';
import { Printer, Edit, Check, X, AlertCircle, Search, Filter, AlertTriangle, Clipboard, FileCode } from 'lucide-react';
import TransactionDocument from './TransactionDocument';

interface OutboundMonitoringProps {
  onRefresh: () => void;
}

const OutboundMonitoring: React.FC<OutboundMonitoringProps> = ({ onRefresh }) => {
  const [transactions, setTransactions] = useState<OutboundTransaction[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  
  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<'tug9' | 'reservation' | 'k7' | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [selectedTx, setSelectedTx] = useState<OutboundTransaction[] | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    request: '',
    tug9: '',
    recipient: '',
    date: '',
    material: '',
    k7: '',
    reservation: '',
    onlyEmptyTug9: false
  });

  const loadData = () => {
    setTransactions(db.getOutboundTransactions());
    setMaterials(db.getMaterials());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveEdit = (id: string) => {
    if (editField === 'tug9') {
      db.updateTug9Number(id, editValue);
    } else if (editField === 'reservation') {
      db.updateOutboundTransaction(id, { reservation_number: editValue });
    } else if (editField === 'k7') {
      db.updateOutboundTransaction(id, { k7_number: editValue });
    }
    setEditingId(null);
    setEditField(null);
    setEditValue('');
    loadData();
    onRefresh();
  };

  const filteredData = transactions.filter(tx => {
    const material = materials.find(m => m.id === tx.material_id);
    const materialMatch = material 
      ? (material.material_name.toLowerCase().includes(filters.material.toLowerCase()) || 
         material.material_number.toLowerCase().includes(filters.material.toLowerCase()))
      : true;

    const tug9Match = filters.onlyEmptyTug9 ? !tx.tug9_number : true;

    return tx.request_number.toLowerCase().includes(filters.request.toLowerCase()) &&
           (tx.tug9_number || '').toLowerCase().includes(filters.tug9.toLowerCase()) &&
           (tx.k7_number || '').toLowerCase().includes(filters.k7.toLowerCase()) &&
           (tx.reservation_number || '').toLowerCase().includes(filters.reservation.toLowerCase()) &&
           tx.recipient_name.toLowerCase().includes(filters.recipient.toLowerCase()) &&
           tx.date.includes(filters.date) &&
           materialMatch &&
           tug9Match;
  });

  const handlePrint = (requestNumber: string) => {
    const group = transactions.filter(t => t.request_number === requestNumber);
    setSelectedTx(group);
  };

  const startEdit = (id: string, field: 'tug9' | 'reservation' | 'k7', value: string) => {
    setEditingId(id);
    setEditField(field);
    setEditValue(value);
  };

  return (
    <div className="space-y-6">
      {/* Filtering Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
           <AlertTriangle className={`w-4 h-4 ${filters.onlyEmptyTug9 ? 'text-rose-500' : 'text-slate-400'}`} />
           <span className="text-xs font-bold text-slate-600">Belum TUG9:</span>
           <button 
            onClick={() => setFilters({...filters, onlyEmptyTug9: !filters.onlyEmptyTug9})}
            className={`w-10 h-5 rounded-full relative transition-all ${filters.onlyEmptyTug9 ? 'bg-rose-500' : 'bg-slate-300'}`}
           >
             <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${filters.onlyEmptyTug9 ? 'left-6' : 'left-1'}`}></div>
           </button>
        </div>
        
        <button 
          onClick={() => setFilters({ request: '', tug9: '', recipient: '', date: '', material: '', k7: '', reservation: '', onlyEmptyTug9: false })}
          className="text-xs font-bold text-blue-600 hover:underline px-2"
        >
          Reset Filter
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4">
                   <div className="flex flex-col gap-2">
                     <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Tgl Keluar</span>
                     <input 
                      type="date" 
                      className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={filters.date}
                      onChange={e => setFilters({...filters, date: e.target.value})}
                     />
                   </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                     <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Material</span>
                     <input 
                      type="text" 
                      placeholder="Cari Material..."
                      className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={filters.material}
                      onChange={e => setFilters({...filters, material: e.target.value})}
                     />
                   </div>
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest text-center">Volume</th>
                <th className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                     <span className="text-xs font-black uppercase text-slate-500 tracking-widest">No. K7 / Permintaan</span>
                     <input 
                      type="text" 
                      placeholder="Cari K7..."
                      className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={filters.k7}
                      onChange={e => setFilters({...filters, k7: e.target.value})}
                     />
                   </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                     <span className="text-xs font-black uppercase text-slate-500 tracking-widest">No. Reservasi</span>
                     <input 
                      type="text" 
                      placeholder="Cari Reservasi..."
                      className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={filters.reservation}
                      onChange={e => setFilters({...filters, reservation: e.target.value})}
                     />
                   </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                     <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Nomor TUG9</span>
                     <input 
                      type="text" 
                      placeholder="Cari TUG9..."
                      className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={filters.tug9}
                      onChange={e => setFilters({...filters, tug9: e.target.value})}
                     />
                   </div>
                </th>
                <th className="px-6 py-4">
                   <div className="flex flex-col gap-2">
                     <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Peruntukan</span>
                     <span className="text-[9px] text-slate-400 italic">Project Info</span>
                   </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                     <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Penerima</span>
                     <input 
                      type="text" 
                      placeholder="Nama..."
                      className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={filters.recipient}
                      onChange={e => setFilters({...filters, recipient: e.target.value})}
                     />
                   </div>
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((tx) => {
                const material = materials.find(m => m.id === tx.material_id);
                const isEditingTug9 = editingId === tx.id && editField === 'tug9';
                const isEditingReserv = editingId === tx.id && editField === 'reservation';
                const isEditingK7 = editingId === tx.id && editField === 'k7';
                const hasTug9 = !!tx.tug9_number;

                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {new Date(tx.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-bold text-slate-700 leading-tight">{material?.material_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{material?.material_number}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-black text-slate-900 text-base">{tx.volume_out}</span>
                      <span className="text-[10px] ml-1 text-slate-400 font-bold uppercase">{material?.unit}</span>
                    </td>
                    
                    {/* K7 Column */}
                    <td className="px-6 py-4">
                      {isEditingK7 ? (
                        <input 
                          autoFocus
                          className="text-xs p-1.5 border-2 border-indigo-500 rounded bg-white w-28 font-bold text-slate-900"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveEdit(tx.id)}
                          onBlur={() => handleSaveEdit(tx.id)}
                        />
                      ) : (
                        <div 
                          onClick={() => startEdit(tx.id, 'k7', tx.k7_number || '')}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-indigo-600"
                        >
                          <FileCode className="w-3 h-3 opacity-40" />
                          {tx.k7_number}
                        </div>
                      )}
                    </td>

                    {/* Reservation Column */}
                    <td className="px-6 py-4">
                      {isEditingReserv ? (
                        <input 
                          autoFocus
                          className="text-xs p-1.5 border-2 border-indigo-500 rounded bg-white w-28 font-bold text-slate-900"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveEdit(tx.id)}
                          onBlur={() => handleSaveEdit(tx.id)}
                        />
                      ) : (
                        <div 
                          onClick={() => startEdit(tx.id, 'reservation', tx.reservation_number)}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-indigo-600"
                        >
                          <Clipboard className="w-3 h-3 opacity-40" />
                          {tx.reservation_number}
                        </div>
                      )}
                    </td>

                    {/* TUG9 Column */}
                    <td className="px-6 py-4">
                      {isEditingTug9 ? (
                        <input 
                          autoFocus
                          className="text-xs p-1.5 border-2 border-blue-500 rounded bg-white w-28 font-bold text-slate-900"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveEdit(tx.id)}
                          onBlur={() => handleSaveEdit(tx.id)}
                        />
                      ) : (
                        <div 
                          onClick={() => startEdit(tx.id, 'tug9', tx.tug9_number || '')}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-all ${
                            hasTug9 
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100' 
                            : 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm animate-pulse'
                          }`}
                        >
                          {!hasTug9 && <AlertCircle className="w-3.5 h-3.5" />}
                          <span className="text-xs">{tx.tug9_number || 'Edit TUG9'}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-slate-500 max-w-[200px] truncate" title={tx.purpose}>
                      {tx.purpose}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 uppercase truncate max-w-[150px]" title={tx.recipient_name}>
                      {tx.recipient_name}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                       <button 
                        onClick={() => handlePrint(tx.request_number)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Reprint Surat Jalan"
                       >
                         <Printer className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="p-20 text-center text-slate-400">
             <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
             <p className="font-medium">Data transaksi tidak ditemukan.</p>
          </div>
        )}
      </div>

      {selectedTx && (
        <TransactionDocument 
          transactions={selectedTx}
          materials={materials}
          onClose={() => setSelectedTx(null)}
        />
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default OutboundMonitoring;
