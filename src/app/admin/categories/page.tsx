'use client';

import React, { useState } from 'react';
import { Plus, Tag, Edit2, Trash2 } from 'lucide-react';
import { MOCK_CATEGORIES } from '../mockData';

export default function CategoriesPage() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Categories</h1>
          <p className="text-xs text-[#71717A] mt-2">Configure catalog departments and product classifications.</p>
        </div>
        <button
          onClick={() => alert('Feature coming soon: create new category')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-lg hover:scale-105"
        >
          <Plus size={14} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        {categories.map(cat => (
          <div key={cat.id} className="admin-glass p-6 flex flex-col justify-between group border border-white/5 hover:border-white/16 transition-all duration-300 min-h-[220px]">
            <div className="space-y-5">
              <div className="w-10 h-10 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-center text-[#71717A] group-hover:text-white transition-all duration-300">
                <Tag size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:underline leading-snug">{cat.name}</h3>
                <p className="text-[10px] text-[#71717A] font-mono mt-1">Slug: {cat.slug}</p>
                <p className="text-xs text-[#A1A1AA] mt-3 line-clamp-2 leading-relaxed">{cat.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs mt-8">
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
        ))}
      </div>
    </div>
  );
}
