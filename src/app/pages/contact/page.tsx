'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AnnouncementBar from '../../../components/AnnouncementBar';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import CartDrawer from '../../../components/CartDrawer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <div className="collection-hero">
          <h1 className="collection-hero-title">Contact Us</h1>
          <p className="collection-hero-count">We'd love to hear from you</p>
        </div>

        <div className="container-fluid py-16">
          <nav className="text-sm text-gray-500 flex gap-2 mb-10">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <span className="text-black font-semibold">Contact</span>
          </nav>

          <div className="contact-layout">
            {/* Info side */}
            <div className="contact-info-col">
              <h2 className="text-3xl font-black uppercase mb-6">Get In Touch</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Have a question about your order, sizing, or anything else? 
                Our team is happy to help. Reach out and we'll respond within 24 hours.
              </p>

              <div className="contact-info-item">
                <span className="contact-info-icon">📧</span>
                <div>
                  <div className="font-bold text-sm uppercase mb-1">Email</div>
                  <a href="mailto:hello@houseofkoala.com" className="text-gray-600 hover:text-black">hello@houseofkoala.com</a>
                </div>
              </div>

              <div className="contact-info-item">
                <span className="contact-info-icon">📱</span>
                <div>
                  <div className="font-bold text-sm uppercase mb-1">WhatsApp</div>
                  <a href="https://wa.me/919999999999" className="text-gray-600 hover:text-black">+91 99999 99999</a>
                </div>
              </div>

              <div className="contact-info-item">
                <span className="contact-info-icon">🕐</span>
                <div>
                  <div className="font-bold text-sm uppercase mb-1">Working Hours</div>
                  <p className="text-gray-600">Mon – Sat: 10am – 7pm IST</p>
                </div>
              </div>

              <div className="mt-8">
                <div className="font-bold text-sm uppercase mb-4">Follow Us</div>
                <div className="flex gap-4">
                  <a href="https://instagram.com/houseofkoala" target="_blank" rel="noopener noreferrer" className="contact-social-link">Instagram</a>
                  <a href="https://facebook.com/houseofkoala" target="_blank" rel="noopener noreferrer" className="contact-social-link">Facebook</a>
                </div>
              </div>
            </div>

            {/* Form side */}
            <div className="contact-form-col">
              {submitted ? (
                <div className="text-center py-16 px-8 border border-gray-200 rounded-lg">
                  <span className="text-6xl block mb-4">✉️</span>
                  <h3 className="text-2xl font-black uppercase mb-3 text-green-600">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for reaching out. We'll reply within 24 hours.</p>
                  <button
                    className="mt-6 text-sm font-bold underline"
                    onClick={() => setSubmitted(false)}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <h3 className="text-xl font-black uppercase mb-6">Send Us a Message</h3>

                  <div className="form-field">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Subject</label>
                    <select
                      className="form-input"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    >
                      <option value="">Select a topic</option>
                      <option value="order">Order Query</option>
                      <option value="returns">Returns &amp; Exchanges</option>
                      <option value="sizing">Sizing Help</option>
                      <option value="wholesale">Wholesale Enquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Message</label>
                    <textarea
                      required
                      className="form-input"
                      rows={5}
                      placeholder="Tell us how we can help..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="form-submit-btn">
                    Send Message →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
