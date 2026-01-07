
import React from 'react';
import { Material, TransactionHistoryItem } from '../types';
import { db } from '../db';
import { X, ArrowDownRight, ArrowUpRight, Calendar, Info, Hash } from 'lucide-react';

interface MaterialHistoryProps {
  material: Material;
  onClose: () => void;
}

const MaterialHistory: React.FC<MaterialHistoryProps> = ({ material, onClose }) => {
  const history = db.getMaterialHistory(material.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="font-bold text-xl text-slate-800">Transaction History</h2>
            <div className="flex gap-4 mt-1">
              <p className="text-xs font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{material.material_number}</p>
              <p className="text-xs font-bold text-blue-600">{material.material_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:shadow rounded-full transition-all text-slate-400 hover:text-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Info className="w-12 h-12 opacity-20" />
              <p className="font-medium">No transactions recorded for this material.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <div className="col-span-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-3 flex items-center gap-1"><Hash className="w-3 h-3" /> Reference</div>
                <div className="col-span-3 flex items-center gap-1"><Info className="w-3 h-3" /> Details</div>
                <div className="col-span-2 text-right">Volume</div>
              </div>
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-xl border transition-all hover:shadow-md ${
                    item.type === 'IN' 
                      ? 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50' 
                      : 'bg-rose-50/30 border-rose-100 hover:bg-rose-50'
                  }`}
                >
                  <div className="col-span-2 text-sm font-medium text-slate-600">
                    {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      item.type === 'IN' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.type === 'IN' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.type === 'IN' ? 'Inbound' : 'Outbound'}
                    </span>
                  </div>
                  <div className="col-span-3 text-sm font-mono font-medium text-slate-700">
                    {item.reference}
                  </div>
                  <div className="col-span-3 text-sm text-slate-600 truncate">
                    {item.info}
                  </div>
                  <div className={`col-span-2 text-right text-sm font-black ${
                    item.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {item.type === 'IN' ? '+' : '-'}{item.volume.toLocaleString()} <span className="text-[10px] font-bold uppercase opacity-60 ml-1">{material.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
          <p className="text-xs text-slate-400 font-medium">Total recorded entries: {history.length}</p>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Current Balance</p>
              <p className="text-lg font-black text-slate-800">{material.current_stock.toLocaleString()} {material.unit}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialHistory;
