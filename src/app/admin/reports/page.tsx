'use client';

import React from 'react';
import { FileSpreadsheet, Download, FileText, BarChart } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    { title: 'Gross Sales Report', desc: 'Detailed summary of gross and net store orders and revenue trends.', type: 'CSV' },
    { title: 'GST Tax Returns (CGST / SGST)', desc: 'Reconciled GST taxation records grouped by state delivery coordinates.', type: 'XLSX' },
    { title: 'Valuation & Stock Assets', desc: 'Remaining warehouse units matched with supply vendor unit costs.', type: 'PDF' }
  ];

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Reports</h1>
        <p className="text-xs text-[#71717A] mt-2">Export financial calculations, tax sheets, and inventory values.</p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {reports.map((rep, idx) => (
          <div key={idx} className="admin-glass p-8 flex flex-col justify-between group border border-white/5 hover:border-white/16 transition-all duration-300 min-h-[220px]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-center text-[#71717A] group-hover:text-white transition-all duration-300">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:underline leading-snug">{rep.title}</h3>
                <p className="text-xs text-[#A1A1AA] mt-3 leading-relaxed">{rep.desc}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs mt-8">
              <span className="font-mono text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Format: {rep.type}</span>
              <button
                onClick={() => alert(`Downloading ${rep.title}...`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black hover:bg-[#E4E4E7] text-xs font-bold rounded-full transition-all shadow-lg"
              >
                <Download size={13} />
                <span>Export</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
