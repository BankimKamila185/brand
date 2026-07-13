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
  const [shopExpanded, setShopExpanded] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [collectionsExpanded, setCollectionsExpanded] = useState(false);

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
    <header className={`main-header ${mobileMenuOpen ? '!z-[9999]' : ''}`}>
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
            className="fixed top-0 left-0 w-full md:w-[340px] h-[100dvh] bg-white z-[1000] shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
          >
            {/* Header: Exact replica of the main header but with close icon */}
            <div className="px-6 h-16 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
              {/* Left Close Button (replaces Hamburger) */}
              <button
                className="text-2xl text-black hover:opacity-75 focus:outline-none flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{ padding: "8px 0" }}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Centered Logo */}
              <Link
                href="/"
                className="flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Logo height={28} />
              </Link>

              {/* Right Utilities */}
              <div className="flex items-center gap-4">
                <button
                  className="text-black hover:opacity-75 focus:outline-none"
                  onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
                <button
                  className="text-black hover:opacity-75 focus:outline-none relative"
                  onClick={() => { setCartOpen(true); setMobileMenuOpen(false); }}
                  aria-label="Cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  {cartCount > 0 && (
                    <span className="badge-count">{cartCount}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Navigation Links Accordion */}
            <nav className="flex-1 overflow-y-auto px-6 py-2 select-none">
              <ul className="flex flex-col gap-3">
                
                {/* Accordion 1: Shop */}
                <li>
                  <button
                    onClick={() => setShopExpanded(!shopExpanded)}
                    className="w-full flex items-center justify-between py-3 text-sm font-semibold text-neutral-800 hover:text-black transition-colors"
                  >
                    <span>Shop</span>
                    <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${shopExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  {shopExpanded && (
                    <ul className="pl-4 pr-2 py-1 flex flex-col gap-3 text-xs font-medium text-neutral-600 border-l border-neutral-100 ml-2">
                      <li>
                        <Link href="/collections/all" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1">
                          Shop All
                        </Link>
                      </li>
                      <li>
                        <Link href="/collections/bestsellers" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1">
                          Bestsellers
                        </Link>
                      </li>
                      <li>
                        <Link href="/collections/whats-new" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1">
                          What&apos;s New
                        </Link>
                      </li>
                      <li>
                        <Link href="/collections/winterwear" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1">
                          Winterwear
                        </Link>
                      </li>
                      <li>
                        <Link href="/collections/outerwear" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1">
                          Outerwear
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Accordion 2: Categories */}
                <li>
                  <button
                    onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                    className="w-full flex items-center justify-between py-3 text-sm font-semibold text-neutral-800 hover:text-black transition-colors"
                  >
                    <span>Categories</span>
                    <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${categoriesExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  {categoriesExpanded && (
                    <ul className="pl-4 pr-2 py-1 flex flex-col gap-3 text-xs font-medium text-neutral-600 border-l border-neutral-100 ml-2">
                      {[
                        { name: "Cargo Trousers", path: "/collections/cargo-trousers-for-men" },
                        { name: "Co-ord Sets", path: "/collections/co-ord-sets" },
                        { name: "Textured Co-ord Sets", path: "/collections/textured-co-ord-sets" },
                        { name: "Korean Pants", path: "/collections/korean-pants" },
                        { name: "Linen Shirts", path: "/collections/linen-shirts" },
                        { name: "Cuban Shirts", path: "/collections/cuban-shirts" },
                        { name: "Crochet Shirts", path: "/collections/crochet-shirts" },
                        { name: "Shirts", path: "/collections/shirts" },
                        { name: "Oversized T-Shirts", path: "/collections/oversized-t-shirts" },
                        { name: "Parachute Cargos", path: "/collections/parachute-cargos" },
                      ].map((cat) => (
                        <li key={cat.path}>
                          <Link href={cat.path} onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1">
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Accordion 3: Collections */}
                <li>
                  <button
                    onClick={() => setCollectionsExpanded(!collectionsExpanded)}
                    className="w-full flex items-center justify-between py-3 text-sm font-semibold text-neutral-800 hover:text-black transition-colors"
                  >
                    <span>Collections</span>
                    <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${collectionsExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  {collectionsExpanded && (
                    <ul className="pl-4 pr-2 py-1 flex flex-col gap-3 text-xs font-medium text-neutral-600 border-l border-neutral-100 ml-2">
                      <li>
                        <Link href="/collections/retro-clothing" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1">
                          Retro Clothing
                        </Link>
                      </li>
                      <li>
                        <Link href="/collections/outliers-k-aracter" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1">
                          Outliers K-aracter
                        </Link>
                      </li>
                      <li>
                        <Link href="/collections/outliers-recommends" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1">
                          Outliers Recommends
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Wishlist Link */}
                <li>
                  <Link
                    href="/pages/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between py-3 text-sm font-semibold text-neutral-800 hover:text-black transition-colors"
                  >
                    Wishlist
                  </Link>
                </li>

              </ul>
            </nav>

            {/* Bottom Section: My Account with Log In & Register buttons */}
            <div className="p-6 bg-white border-t border-neutral-100 flex flex-col gap-3 pb-16 flex-shrink-0">
              <h3 className="text-lg font-bold text-neutral-900 ml-1">My Account</h3>
              
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="bg-neutral-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-neutral-400 font-bold leading-none uppercase">Logged In</p>
                      <p className="text-xs font-bold text-neutral-800 truncate mt-1">{user.name || user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full bg-white hover:bg-neutral-50 text-black border border-neutral-800 font-bold py-3.5 rounded-md text-xs uppercase tracking-wider text-center block transition-all cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/pages/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 rounded-md text-xs uppercase tracking-wider text-center block transition-all cursor-pointer"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/pages/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-white hover:bg-neutral-50 text-black border border-black font-bold py-3.5 rounded-md text-xs uppercase tracking-wider text-center block transition-all cursor-pointer"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
