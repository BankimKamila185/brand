"use client";

import React from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <div className="collection-hero">
          <h1 className="collection-hero-title">Privacy Policy</h1>
        </div>
        <div className="container-fluid py-16 max-w-3xl mx-auto">
          <nav className="text-sm text-gray-500 flex gap-2 mb-10">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">Privacy Policy</span>
          </nav>

          <div className="policy-content">
            <p className="text-gray-500 mb-8">Last updated: January 2024</p>

            <h2>1. Information We Collect</h2>
            <p>
              When you visit House of Outliers, we collect information including
              your name, email address, shipping address, phone number, and
              payment details to process your orders.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>We use your personal data to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Send order confirmation and shipping updates</li>
              <li>Respond to customer service requests</li>
              <li>Send promotional emails (you may opt out at any time)</li>
              <li>Improve our website and services</li>
            </ul>

            <h2>3. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share data with trusted service providers (payment
              gateways, shipping partners) solely for processing your orders.
            </p>

            <h2>4. Cookies</h2>
            <p>
              We use cookies to enhance your browsing experience, maintain your
              cart session, and analyze site traffic. You may disable cookies in
              your browser settings, though this may affect site functionality.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your
              personal information. All payment transactions are encrypted using
              SSL technology.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal data
              at any time. Contact us at{" "}
              <a href="mailto:hello@___HOUSEOFOUTLIERS_DOM___">
                hello@___HOUSEOFOUTLIERS_DOM___
              </a>{" "}
              to exercise these rights.
            </p>

            <h2>7. Contact</h2>
            <p>
              For any privacy-related queries, please contact our team at{" "}
              <a href="mailto:hello@___HOUSEOFOUTLIERS_DOM___">
                hello@___HOUSEOFOUTLIERS_DOM___
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
