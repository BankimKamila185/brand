'use client';

import React, { useState } from 'react';
import { FolderKanban, Plus, Image as ImageIcon, Edit2, Trash2 } from 'lucide-react';
import { MOCK_COLLECTIONS } from '../mockData';

export default function CollectionsPage() {
  const [collections, setCollections] = useState(MOCK_COLLECTIONS);

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Collections</h1>
          <p className="text-xs text-[#71717A] mt-2">Organize streetwear drops and seasonal collections.</p>
        </div>
        <button
          onClick={() => alert('Feature coming soon: create new collection')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-lg hover:scale-105"
        >
          <Plus size={14} />
          <span>Add Collection</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        {collections.map(col => (
          <div key={col.id} className="admin-glass overflow-hidden flex flex-col justify-between group border border-white/5 hover:border-white/16 transition-all duration-300">
            <div className="h-40 bg-[#121212] flex items-center justify-center border-b border-white/5 relative">
              <ImageIcon size={24} className="text-white/10 group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#090909]/80 border border-white/5 text-[9px] font-bold text-[#A1A1AA]">
                Sort Order: {col.sortOrder}
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div>
                <h3 className="font-bold text-sm text-white group-hover:underline leading-snug">{col.name}</h3>
                <p className="text-[10px] text-[#71717A] font-mono mt-1">Handle: {col.handle}</p>
                <p className="text-xs text-[#A1A1AA] mt-3 line-clamp-2 leading-relaxed">{col.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-white/10 bg-white/5 text-white">
                  Active
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl bg-[#121212] border border-white/5 hover:border-white/20 text-[#A1A1AA] hover:text-white transition-all">
                    <Edit2 size={13} />
                  </button>
                  <button className="p-2 rounded-xl bg-[#121212] border border-white/5 hover:border-red-500/30 text-[#A1A1AA] hover:text-red-450 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
