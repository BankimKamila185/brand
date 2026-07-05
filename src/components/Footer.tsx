'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert('Subscribed successfully!');
      setEmail('');
    }
  };

  return (
    <>
      <style>{`
        .site-footer {
          background-color: #050505;
          color: #ffffff;
          padding-top: 70px;
          font-family: inherit;
        }

        .footer-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 2fr;
          gap: 60px;
          margin-bottom: 70px;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
        }

        .footer-heading {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #ffffff;
          letter-spacing: 0.02em;
        }

        .footer-text {
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 16px;
          color: #c9c9c9;
        }

        .footer-link-underline {
          text-decoration: underline;
          text-underline-offset: 4px;
          color: #c9c9c9;
          transition: color 0.2s;
        }
        
        .footer-link-underline:hover {
          color: #ffffff;
        }

        .footer-socials {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }

        .social-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #ffffff;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .social-circle:hover {
          transform: scale(1.05);
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-links a {
          font-size: 14px;
          color: #c9c9c9;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: #ffffff;
        }

        .newsletter-heading {
          font-size: 26px;
          font-weight: 500;
          margin-bottom: 24px;
          color: #ffffff;
        }

        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 400px;
        }

        .input-group {
          display: flex;
          align-items: center;
          background: #ffffff;
          border-radius: 6px;
          padding: 14px 20px;
        }

        .input-icon {
          margin-right: 12px;
          color: #666;
          display: flex;
          align-items: center;
        }

        .input-group input {
          border: none;
          background: transparent;
          width: 100%;
          font-size: 14px;
          color: #000000;
          outline: none;
        }

        .input-group input::placeholder {
          color: #888888;
        }

        .subscribe-btn {
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 6px;
          padding: 16px 24px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.05em;
          cursor: pointer;
          align-self: flex-start;
          transition: opacity 0.2s;
        }

        .subscribe-btn:hover {
          opacity: 0.9;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 24px 0;
        }

        .bottom-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #888888;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 50px;
          }
        }

        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .bottom-flex {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
      
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Column 1: Our store */}
            <div className="footer-col">
              <h4 className="footer-heading">Our store</h4>
              <p className="footer-text">
                Timing: 10 AM - 6 PM (IST)<br/>
                Monday to Friday
              </p>
              <p className="footer-text" style={{ marginTop: '20px' }}>
                <a href="tel:+919900975154" className="footer-link-underline">+919900975154</a>
              </p>
              <p className="footer-text">
                <a href="mailto:support@___HOUSEOFOUTLIERS_DOM___" className="footer-link-underline">support@___HOUSEOFOUTLIERS_DOM___</a>
              </p>
              <div className="footer-socials">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="Instagram">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="social-circle" aria-label="WhatsApp">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Useful Links */}
            <div className="footer-col">
              <h4 className="footer-heading">Useful Links</h4>
              <ul className="footer-links">
                <li><Link href="/policies/refund-policy">Return / Exchange</Link></li>
                <li><Link href="/policies/shipping-policy">Shipping Policy</Link></li>
                <li><Link href="#">Rewards Program</Link></li>
                <li><Link href="#">Track Order</Link></li>
                <li><Link href="/policies/privacy-policy">Privacy Policy</Link></li>
                <li><Link href="/policies/terms-of-service">Terms of Service</Link></li>
                <li><Link href="/pages/contact">Contact Us</Link></li>
                <li><Link href="#">Blogs</Link></li>
              </ul>
            </div>

            {/* Column 3: Trending */}
            <div className="footer-col">
              <h4 className="footer-heading">Trending</h4>
              <ul className="footer-links">
                <li><Link href="/collections/cargo-trousers-for-men">Baggy Cargo Trousers</Link></li>
                <li><Link href="/collections/shirts">Shirts</Link></li>
                <li><Link href="/collections/co-ord-sets">Co-ord Set</Link></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="footer-col newsletter-col">
              <h3 className="newsletter-heading">Join the Outliers Club</h3>
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <div className="input-group">
                  <span className="input-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </span>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <button type="submit" className="subscribe-btn">SUBSCRIBE NOW</button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-container bottom-flex">
            <p>©2026 House of Outliers Fashion Private Limited</p>
            <p>Developed by Syscodes</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
