'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { MOCK_REVIEWS, DashboardReview } from '../mockData';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<DashboardReview[]>(MOCK_REVIEWS);

  // Approve review
  const handleApprove = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
    alert('Review approved for site display.');
  };

  // Delete review
  const handleDelete = (id: string) => {
    if (confirm('Delete this product review?')) {
      setReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Reviews</h1>
        <p className="text-xs text-[#71717A] mt-2">Moderate product feedback and star ratings logs.</p>
      </div>

      {/* List */}
      <div className="space-y-6">
        {reviews.map((rev) => (
          <div key={rev.id} className="admin-glass p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 text-xs border border-white/5 hover:border-white/16 transition-all duration-300">
            <div className="space-y-3.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-white text-sm">{rev.customerName}</span>
                <span className="text-[10px] text-[#71717A] font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                  rev.approved ? 'border-white/10 bg-white/5 text-white' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                }`}>
                  {rev.approved ? 'Approved' : 'Pending Moderation'}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] font-medium">Product: <strong className="text-white font-semibold">{rev.productName}</strong></p>
              <div className="flex text-zinc-700">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} fill={i < rev.rating ? "#FFFFFF" : "none"} className={i < rev.rating ? "text-white" : "text-zinc-700"} />
                ))}
              </div>
              <p className="font-bold text-white text-sm mt-3">{rev.title}</p>
              <p className="text-[#A1A1AA] leading-relaxed text-xs">{rev.body}</p>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              {!rev.approved && (
                <button
                  onClick={() => handleApprove(rev.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-lg"
                >
                  <CheckCircle size={13} />
                  <span>Approve</span>
                </button>
              )}
              <button
                onClick={() => handleDelete(rev.id)}
                className="flex items-center gap-1.5 px-4 py-2 border border-white/5 hover:border-red-500/30 bg-transparent text-[#A1A1AA] hover:text-red-400 rounded-full transition-all"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
