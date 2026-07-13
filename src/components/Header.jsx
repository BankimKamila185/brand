"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { ChevronRight, Mail, LogOut, User, Heart, X } from "lucide-react";

const Header = ({ onSearch }) => {
  const { cartCount, wishlist, setCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <header className="main-header">
      <div className="container-fluid">
        <div className="header-inner">
          {/* Mobile Menu Toggle - shown on mobile, hidden on desktop via CSS */}
          <button
            className="mobile-menu-btn md:hidden text-2xl text-black hover:opacity-75 focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            style={{ padding: "8px 0" }}
          >
            {/* Hamburger Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Left Navigation (Desktop) - hidden on mobile, shown on desktop via CSS */}
          <nav className="desktop-nav hidden md:block">
            <ul className="nav-menu">
              <li className="nav-item">
                <Link
                  href="/collections/all"
                  className="nav-link flex flex-row items-center gap-1.5"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Shop
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </Link>
                <div className="dropdown-pane">
                  <ul className="dropdown-list">
                    <li>
                      <Link
                        href="/collections/bestsellers"
                        className="dropdown-link"
                      >
                        Bestseller Clothing
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/winterwear"
                        className="dropdown-link"
                      >
                        Winterwear
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/outerwear"
                        className="dropdown-link"
                      >
                        Outerwear
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/whats-new"
                        className="dropdown-link"
                      >
                        New Arrival / Trending Clothes
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              <li className="nav-item">
                <span
                  className="nav-link cursor-pointer flex flex-row items-center gap-1.5"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Categories
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </span>
                <div className="dropdown-pane">
                  <ul className="dropdown-list">
                    <li>
                      <Link
                        href="/collections/cargo-trousers-for-men"
                        className="dropdown-link"
                      >
                        Cargo Trousers
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/co-ord-sets"
                        className="dropdown-link"
                      >
                        Co-Ord Sets
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/textured-co-ord-sets"
                        className="dropdown-link"
                      >
                        Textured / Printed Casual Shirts
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/korean-pants"
                        className="dropdown-link"
                      >
                        Korean Pants
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/linen-shirts"
                        className="dropdown-link"
                      >
                        Linen Shirts
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/cuban-shirts"
                        className="dropdown-link"
                      >
                        Cuban Shirts
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/crochet-shirts"
                        className="dropdown-link"
                      >
                        Crochet Shirts
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/shirts"
                        className="dropdown-link"
                      >
                        Korean Shirts
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/oversized-t-shirts"
                        className="dropdown-link"
                      >
                        Oversized T-Shirts
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/parachute-cargos"
                        className="dropdown-link"
                      >
                        Parachute Cargo Trousers
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              <li className="nav-item">
                <span
                  className="nav-link cursor-pointer flex flex-row items-center gap-1.5"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Collections
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </span>
                <div className="dropdown-pane">
                  <ul className="dropdown-list">
                    <li>
                      <Link
                        href="/collections/retro-clothing"
                        className="dropdown-link"
                      >
                        Retro Clothing
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/outliers-k-aracter"
                        className="dropdown-link"
                      >
                        Outliers K-aracter
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/collections/outliers-recommends"
                        className="dropdown-link"
                      >
                        Outliers Recommends
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          {/* Centered Logo */}
          <div
            className={`logo-container flex items-center justify-center ${searchOpen ? "hidden sm:flex" : ""}`}
          >
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
          </div>

          {/* Action Icons (Right) */}
          <div className="header-actions">
            {/* Search Input and Button */}
            <div className="relative flex items-center">
              {searchOpen && (
                <input
                  type="text"
                  placeholder="Search streetwear..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="border border-black rounded-full px-4 py-1 text-xs mr-2 w-36 md:w-44 outline-none"
                  autoFocus
                />
              )}
              <button
                className="action-btn text-black hover:opacity-70 flex items-center justify-center"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                {/* Search SVG */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>

            {/* Profile / Account */}
            {user ? (
              <button
                className="action-btn text-black hover:opacity-70 hidden sm:flex items-center justify-center relative group"
                onClick={() => {
                  if (
                    window.confirm(
                      `Logged in as ${user.name || user.email}. Do you want to sign out?`,
                    )
                  ) {
                    logout();
                  }
                }}
                aria-label="Account"
                title={`Signed in as ${user.name || user.email}. Click to sign out.`}
              >
                {/* User Profile SVG (active/green dot style) */}
                <div className="relative">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                </div>
              </button>
            ) : (
              <Link
                href="/pages/login"
                className="action-btn text-black hover:opacity-70 hidden sm:flex items-center justify-center"
                aria-label="Account"
              >
                {/* User Profile SVG */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              href="/pages/wishlist"
              className="action-btn text-black hover:opacity-70 flex items-center justify-center"
              aria-label="Wishlist"
            >
              {/* Heart SVG */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlist.length > 0 && (
                <span className="badge-count">{wishlist.length}</span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              className="action-btn text-black hover:opacity-70 flex items-center justify-center"
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
            >
              {/* Shopping Bag SVG */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartCount > 0 && (
                <span className="badge-count">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[999] backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        >
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes drawerSlideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}} />
          <div
            className="fixed top-0 left-0 w-[85vw] max-w-[340px] h-full bg-white z-[1000] shadow-2xl flex flex-col rounded-r-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
          >
            {/* Header: Logo & Elegant Close button */}
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <Logo height={28} />
              <button
                className="w-9 h-9 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Section for App Vibe */}
            <div className="px-6 py-5 bg-neutral-50 border-b border-neutral-100 flex flex-col gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-neutral-400 font-bold leading-none uppercase tracking-wider">Welcome back,</p>
                    <p className="text-sm font-bold text-neutral-900 truncate mt-1.5">{user.name || user.email}</p>
                  </div>
                  <button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="p-2 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/pages/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 rounded-full border border-neutral-300 text-center text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/pages/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 rounded-full bg-black text-white text-center text-xs font-bold hover:bg-neutral-800 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="flex flex-col gap-1">
                
                {/* Main Link: Shop All */}
                <li>
                  <Link
                    href="/collections/all"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3.5 border-b border-neutral-50 text-sm font-extrabold uppercase tracking-wide text-neutral-900 hover:text-neutral-500 transition-colors"
                  >
                    <span>Shop All</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </Link>
                </li>

                {/* Main Link: Bestsellers */}
                <li>
                  <Link
                    href="/collections/bestsellers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3.5 border-b border-neutral-50 text-sm font-extrabold uppercase tracking-wide text-neutral-900 hover:text-neutral-500 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      Bestsellers
                      <span className="px-2 py-0.5 rounded bg-red-500 text-[8px] font-extrabold text-white tracking-widest uppercase">Hot</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </Link>
                </li>

                {/* Categories Section Header */}
                <li className="mt-4">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest mb-2 pl-1 select-none">
                    Categories
                  </div>
                  <ul className="flex flex-col gap-1 pl-1">
                    {[
                      { name: "Cargo Trousers", path: "/collections/cargo-trousers-for-men" },
                      { name: "Co-ord Sets", path: "/collections/co-ord-sets" },
                      { name: "Crochet Shirts", path: "/collections/crochet-shirts", badge: "New" },
                      { name: "Cuban Shirts", path: "/collections/cuban-shirts" },
                      { name: "Oversized T-Shirts", path: "/collections/oversized-t-shirts" },
                    ].map((cat) => (
                      <li key={cat.path}>
                        <Link
                          href={cat.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-2.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            {cat.name}
                            {cat.badge && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500 text-[8px] font-bold text-white tracking-widest uppercase">{cat.badge}</span>
                            )}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>

                {/* Separator */}
                <li className="my-3 border-t border-neutral-100"></li>

                {/* Wishlist Link */}
                <li>
                  <Link
                    href="/pages/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-black transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-neutral-400" />
                      Wishlist ({wishlist.length})
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                  </Link>
                </li>

                {/* Contact Us Link */}
                <li>
                  <Link
                    href="/pages/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-black transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      Contact Us
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                  </Link>
                </li>

              </ul>
            </nav>

            {/* Footer inside mobile menu */}
            <div className="p-6 bg-neutral-50 border-t border-neutral-100 flex flex-col gap-4 select-none">
              <div className="flex gap-4 items-center justify-center">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-neutral-200 text-neutral-500 hover:text-black hover:border-black transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a 
                  href="mailto:support@tevar.com" 
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-neutral-200 text-neutral-500 hover:text-black hover:border-black transition-all"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
              <p className="text-[10px] text-center text-neutral-400 font-semibold tracking-wider uppercase">
                &copy; {new Date().getFullYear()} Tevar Studio
              </p>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
