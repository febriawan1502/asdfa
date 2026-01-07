
import React, { useState } from 'react';
import { Material } from '../types';
import { History, Package, AlertTriangle, Download } from 'lucide-react';
import MaterialHistory from './MaterialHistory';

interface StockTableProps {
  materials: Material[];
}

const StockTable: React.FC<StockTableProps> = ({ materials }) => {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const exportToExcel = () => {
    const headers = ['Material Number', 'Material Name', 'Unit', 'Stock Level'];
    const rows = materials.map(m => [
      m.material_number,
      m.material_name,
      m.unit,
      m.current_stock.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Stock_Materials_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Items</p>
            <p className="text-2xl font-black text-slate-800">{materials.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Units</p>
            <p className="text-2xl font-black text-slate-800">{materials.reduce((acc, curr) => acc + curr.current_stock, 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Warning</p>
            <p className="text-2xl font-black text-slate-800">{materials.filter(m => m.current_stock < 20).length}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-700">Stock Inventory List</h3>
        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest">Material Number</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest">Material Name</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest">Unit</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest">Stock Level</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded group-hover:bg-white group-hover:shadow-sm transition-all">
                    {material.material_number}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-800">{material.material_name}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs font-medium text-slate-500 uppercase">{material.unit}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          material.current_stock < 20 ? 'bg-rose-500' : material.current_stock < 100 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (material.current_stock / 1000) * 100)}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-black ${
                      material.current_stock < 20 ? 'text-rose-600' : 'text-slate-700'
                    }`}>
                      {material.current_stock.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button
                    onClick={() => setSelectedMaterial(material)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 shadow-sm transition-all active:scale-95"
                  >
                    <History className="w-3.5 h-3.5" />
                    View History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMaterial && (
        <MaterialHistory
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </div>
  );
};

export default StockTable;
