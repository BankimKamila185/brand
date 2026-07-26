"use client";

import React, { useState } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact-page">
      <AnnouncementBar />
      <Header />
      <main className="contact-main">
        <section className="contact-hero">
          <div className="contact-shell">
            <p className="contact-eyebrow">Customer care</p>
            <h1>Contact us</h1>
            <p>Questions about an order, sizing, or returns? Our team is here to help.</p>
          </div>
        </section>

        <div className="contact-shell contact-content">
          <nav className="contact-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Contact</span>
          </nav>

          <div className="contact-layout">
            {/* Info side */}
            <div className="contact-info-col">
              <p className="contact-eyebrow">We&apos;re here to help</p>
              <h2>Get in touch</h2>
              <p className="contact-intro">
                Have a question about your order, sizing, or anything else? Our
                team is happy to help. Reach out and we&apos;ll respond within 24
                hours.
              </p>

              <div className="contact-info-item">
                <span className="contact-info-icon">✉</span>
                <div>
                  <div className="contact-info-label">Email</div>
                  <a
                    href="mailto:support@theoutliersstudio.com"
                  >
                    support@theoutliersstudio.com
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <span className="contact-info-icon">⌕</span>
                <div>
                  <div className="contact-info-label">
                    WhatsApp
                  </div>
                  <a
                    href="https://wa.me/917304406772"
                  >
                    +91 73044 06772
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <span className="contact-info-icon">◷</span>
                <div>
                  <div className="contact-info-label">
                    Working Hours
                  </div>
                  <p>Mon – Sat: 10am – 7pm IST</p>
                </div>
              </div>

              <div className="contact-socials">
                <div className="contact-info-label">
                  Follow Us
                </div>
                <div className="contact-social-links">
                  <a
                    href="https://instagram.com/houseofoutliers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-link"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://facebook.com/houseofoutliers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-link"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            {/* Form side */}
            <div className="contact-form-col">
              {submitted ? (
                <div className="contact-success">
                  <span className="contact-success-icon">✉</span>
                  <h3>
                    Message Sent!
                  </h3>
                  <p>
                    Thank you for reaching out. We&apos;ll reply within 24 hours.
                  </p>
                  <button
                    className="contact-reset-button"
                    onClick={() => setSubmitted(false)}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <h3 className="contact-form-title">
                    Send Us a Message
                  </h3>

                  <div className="form-field">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
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
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Subject</label>
                    <select
                      className="form-input"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
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
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
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
