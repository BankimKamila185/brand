'use client';

import React from 'react';
import Link from 'next/link';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <div className="collection-hero">
          <h1 className="collection-hero-title">Refund Policy</h1>
        </div>
        <div className="container-fluid py-16 max-w-3xl mx-auto">
          <nav className="text-sm text-gray-500 flex gap-2 mb-10">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <span className="text-black font-semibold">Refund Policy</span>
          </nav>

          <div className="policy-content">
            <p className="text-gray-500 mb-8">Last updated: January 2024</p>

            <h2>Return Window</h2>
            <p>We accept returns within <strong>7 days</strong> of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached.</p>

            <h2>Non-Returnable Items</h2>
            <ul>
              <li>Sale items (marked as Final Sale)</li>
              <li>Items that have been washed or worn</li>
              <li>Items without original tags</li>
              <li>Customised or personalised products</li>
            </ul>

            <h2>How to Initiate a Return</h2>
            <p>Email us at <a href="mailto:hello@___HOUSEOFOUTLIERS_DOM___">hello@___HOUSEOFOUTLIERS_DOM___</a> with your order number and reason for return. Our team will respond within 24 hours with return instructions.</p>

            <h2>Refund Processing</h2>
            <p>Once we receive and inspect the returned item, refunds are processed within <strong>5–7 business days</strong> to your original payment method. You will receive a confirmation email once your refund is issued.</p>

            <h2>Exchanges</h2>
            <p>We offer free exchanges for size or colour differences, subject to availability. Please email us to arrange an exchange.</p>

            <h2>Damaged or Wrong Items</h2>
            <p>If you received a damaged, defective, or incorrect item, please contact us immediately at <a href="mailto:hello@___HOUSEOFOUTLIERS_DOM___">hello@___HOUSEOFOUTLIERS_DOM___</a> with photos. We will arrange a replacement or full refund at no extra cost.</p>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
