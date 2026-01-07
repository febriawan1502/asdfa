
import React from 'react';
import { Material, OutboundTransaction } from '../types';
import { Printer, X } from 'lucide-react';

interface TransactionDocumentProps {
  transactions: OutboundTransaction[];
  materials: Material[];
  onClose: () => void;
}

const TransactionDocument: React.FC<TransactionDocumentProps> = ({ transactions, materials, onClose }) => {
  const firstTx = transactions[0];
  if (!firstTx) return null;

  const getRomanMonth = (date: Date) => {
    const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return roman[date.getMonth()];
  };

  const docDate = new Date(firstTx.date);
  const refFormatted = `${firstTx.request_number}/LOG.CRB/${getRomanMonth(docDate)}/${docDate.getFullYear()}`;
  
  // High-reliability logo link
  const plnLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Logo_PLN.svg/1200px-Logo_PLN.svg.png";

  const handlePrintNewWindow = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      alert("Popup blocked! Please allow popups to print.");
      return;
    }

    const tableRows = transactions.map((tx, idx) => {
      const material = materials.find(m => m.id === tx.material_id);
      return `
        <tr style="border-bottom: 1.5px solid #000;">
          <td style="padding: 4px 8px; font-weight: 900; text-align: center; border-right: 1.5px solid #000; font-size: 12px;">${idx + 1}</td>
          <td style="padding: 4px 8px; font-family: 'JetBrains Mono', monospace; border-right: 1.5px solid #000; font-size: 10px;">${material?.material_number || 'N/A'}</td>
          <td style="padding: 4px 8px; font-weight: 700; text-transform: uppercase; border-right: 1.5px solid #000; font-size: 11px; line-height: 1.1;">${material?.material_name || 'N/A'}</td>
          <td style="padding: 4px 8px; text-align: right; font-weight: 900; font-size: 16px; border-right: 1.5px solid #000;">${tx.volume_out.toLocaleString()}</td>
          <td style="padding: 4px 8px; font-weight: 700; color: #000; font-size: 12px; text-align: center;">${material?.unit}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Jalan - ${firstTx.request_number}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          @page { size: A4; margin: 1cm; }
          body { 
            font-family: 'Inter', sans-serif; 
            background: white; 
            color: black; 
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          .info-label { font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.02em; width: 160px; text-transform: uppercase; flex-shrink: 0; }
          .info-value { font-size: 14px; font-weight: 900; text-transform: uppercase; }
          @media print {
            .no-print { display: none; }
            img { display: block !important; visibility: visible !important; }
          }
        </style>
      </head>
      <body onload="setTimeout(() => { window.print(); }, 1500)">
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-4">
              <img src="${plnLogoUrl}" alt="PLN" class="h-16 w-auto object-contain" />
              <div>
                <h1 class="text-4xl font-black uppercase tracking-tighter leading-none" style="letter-spacing: -0.04em;">SURAT JALAN</h1>
                <p class="text-black font-bold text-lg mt-0.5">GUDANG PLN UP3 CIREBON</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[9px] uppercase font-black text-gray-400 mb-0.5 tracking-widest">NOMOR DOKUMEN</p>
              <div class="border-2 border-black bg-white px-4 py-1.5 rounded-lg inline-block">
                <span class="text-lg font-black tracking-tight">${refFormatted}</span>
              </div>
              <p class="text-[11px] text-black mt-1 font-black">${docDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div class="h-1.5 bg-black mb-6"></div>

          <!-- Details -->
          <div class="space-y-3 mb-6">
            <div class="flex items-baseline">
              <span class="info-label">PENERIMA</span>
              <span class="info-value">: ${firstTx.recipient_name}</span>
            </div>
            <div class="flex items-baseline">
              <span class="info-label">UNTUK PROYEK</span>
              <span class="info-value">: ${firstTx.purpose}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-baseline flex-1">
                <span class="info-label">K7 / RESERVASI</span>
                <span class="info-value">: ${firstTx.k7_number} / ${firstTx.reservation_number || '-'}</span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="info-label w-auto">NOMOR TUG9</span>
                <span class="info-value">: ${firstTx.tug9_number || 'BELUM TERBIT'}</span>
              </div>
            </div>
            <div class="flex items-baseline">
              <span class="info-label">PENGEMUDI / KENDARAAN</span>
              <span class="info-value">: ${firstTx.driver_name || '-'} / ${firstTx.vehicle_type || ''} (${firstTx.license_plate || '-'})</span>
            </div>
          </div>

          <!-- Table -->
          <table class="w-full border-collapse" style="border: 2px solid #000;">
            <thead>
              <tr class="bg-white border-b-2 border-black">
                <th class="py-1.5 px-3 text-left text-[9px] font-black uppercase text-gray-500 border-r-2 border-black w-10">NO</th>
                <th class="py-1.5 px-3 text-left text-[9px] font-black uppercase text-gray-500 border-r-2 border-black w-32">NOMOR MATERIAL</th>
                <th class="py-1.5 px-3 text-left text-[9px] font-black uppercase text-gray-500 border-r-2 border-black">URAIAN MATERIAL</th>
                <th class="py-1.5 px-3 text-right text-[9px] font-black uppercase text-gray-500 border-r-2 border-black w-24">VOLUME</th>
                <th class="py-1.5 px-3 text-center text-[9px] font-black uppercase text-gray-500 w-20">SATUAN</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <!-- Signatures -->
          <div class="flex justify-between text-center mt-16 px-10">
            <div class="space-y-20 w-64">
              <p class="text-[10px] font-black uppercase tracking-widest">PETUGAS GUDANG</p>
              <div class="border-t-2 border-black pt-2">
                <p class="text-sm font-black">( ........................................ )</p>
              </div>
            </div>
            <div class="space-y-20 w-64">
              <p class="text-[10px] font-black uppercase tracking-widest">PENERIMA BARANG</p>
              <div class="border-t-2 border-black pt-2">
                <p class="text-sm font-black">( ........................................ )</p>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="mt-24 border-t border-dashed border-gray-300 pt-6">
            <p class="text-[10px] text-gray-400 text-center uppercase font-black tracking-[0.4em]">
              DOKUMEN INI DIHASILKAN OLEH SISTEM WM-PRO • PLN UP3 CIREBON
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-md no-print">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-white z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-xl text-slate-900 uppercase tracking-tight">Pratinjau Surat Jalan</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">A4 High Density Format (Fits 20+ Items)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrintNewWindow}
              className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <Printer className="w-5 h-5" />
              CETAK SEKARANG
            </button>
            <button
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-12 bg-slate-100/50">
          <div className="bg-white shadow-2xl rounded-sm p-12 max-w-[850px] mx-auto border border-slate-200 text-black">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-6">
                <img src={plnLogoUrl} alt="PLN" className="h-16 w-auto object-contain" />
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-black">SURAT JALAN</h1>
                  <p className="text-black font-bold text-lg mt-0.5">GUDANG PLN UP3 CIREBON</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-black text-slate-400 mb-0.5 tracking-widest">NOMOR DOKUMEN</p>
                <div className="border-2 border-black bg-white px-4 py-1 rounded-lg inline-block">
                  <span className="text-lg font-black tracking-tight text-black">{refFormatted}</span>
                </div>
                <p className="text-[10px] text-black mt-1 font-black">{docDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="h-1.5 bg-black mb-6"></div>

            {/* Document Info Section */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center">
                <span className="w-40 text-[10px] uppercase font-black text-slate-400 tracking-widest">PENERIMA</span>
                <span className="text-sm font-black text-black uppercase">: {firstTx.recipient_name}</span>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-[10px] uppercase font-black text-slate-400 tracking-widest">UNTUK PROYEK</span>
                <span className="text-sm font-black text-black">: {firstTx.purpose}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <span className="w-40 text-[10px] uppercase font-black text-slate-400 tracking-widest">K7 / RESERVASI</span>
                  <span className="text-sm font-black text-black">: {firstTx.k7_number} / {firstTx.reservation_number || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">NOMOR TUG9</span>
                  <span className="text-sm font-black text-black">: {firstTx.tug9_number || 'BELUM TERBIT'}</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-[10px] uppercase font-black text-slate-400 tracking-widest">PENGEMUDI / KENDARAAN</span>
                <span className="text-sm font-black text-black uppercase">: {firstTx.driver_name || '-'} / {firstTx.vehicle_type || ''} ({firstTx.license_plate || '-'})</span>
              </div>
            </div>

            {/* Table Section */}
            <table className="w-full border-collapse" style={{ border: '2px solid #000' }}>
              <thead>
                <tr className="bg-slate-50 border-b-2 border-black">
                  <th className="py-1 px-3 text-left text-[9px] font-black uppercase text-slate-400 border-r-2 border-black w-10">NO</th>
                  <th className="py-1 px-3 text-left text-[9px] font-black uppercase text-slate-400 border-r-2 border-black w-32">NOMOR MATERIAL</th>
                  <th className="py-1 px-3 text-left text-[9px] font-black uppercase text-slate-400 border-r-2 border-black">URAIAN MATERIAL</th>
                  <th className="py-1 px-3 text-right text-[9px] font-black uppercase text-slate-400 border-r-2 border-black w-24">VOLUME</th>
                  <th className="py-1 px-3 text-center text-[9px] font-black uppercase text-slate-400 w-20">SATUAN</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => {
                  const material = materials.find(m => m.id === tx.material_id);
                  return (
                    <tr key={tx.id} className="border-b-2 border-black">
                      <td className="py-1.5 px-3 text-xs font-black text-center border-r-2 border-black">{idx + 1}</td>
                      <td className="py-1.5 px-3 text-[10px] font-mono font-bold border-r-2 border-black">{material?.material_number || 'N/A'}</td>
                      <td className="py-1.5 px-3 text-xs font-black uppercase border-r-2 border-black leading-tight">{material?.material_name || 'N/A'}</td>
                      <td className="py-1.5 px-3 text-sm text-right font-black text-black border-r-2 border-black">{tx.volume_out.toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-xs font-bold text-center text-slate-600">{material?.unit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-between text-center mt-12 px-8">
              <div className="space-y-16 w-56">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">PETUGAS GUDANG</p>
                <div className="border-t-2 border-black pt-2">
                  <p className="text-xs font-black text-black">( ........................................ )</p>
                </div>
              </div>
              <div className="space-y-16 w-56">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">PENERIMA BARANG</p>
                <div className="border-t-2 border-black pt-2">
                  <p className="text-xs font-black text-black uppercase">( ........................................ )</p>
                </div>
              </div>
            </div>
            
            <div className="mt-20 border-t border-dashed border-slate-200 pt-6">
              <p className="text-[10px] text-slate-400 text-center uppercase font-black tracking-[0.4em]">
                DOKUMEN INI DIHASILKAN OLEH SISTEM WM-PRO • PLN UP3 CIREBON
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDocument;
