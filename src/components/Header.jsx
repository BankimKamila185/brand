"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { categoriesApi, collectionsApi } from "../lib/api";
import Logo from "./Logo";
import { ChevronRight, X } from "lucide-react";

const DEFAULT_CATEGORIES = [
  { name: "Cargo Trousers", path: "/collections/cargo-trousers-for-men" },
  { name: "Co-Ord Sets", path: "/collections/co-ord-sets" },
  { name: "Textured / Printed Casual Shirts", path: "/collections/textured-co-ord-sets" },
  { name: "Korean Pants", path: "/collections/korean-pants" },
  { name: "Linen Shirts", path: "/collections/linen-shirts" },
  { name: "Cuban Shirts", path: "/collections/cuban-shirts" },
  { name: "Crochet Shirts", path: "/collections/crochet-shirts" },
  { name: "Korean Shirts", path: "/collections/shirts" },
  { name: "Oversized T-Shirts", path: "/collections/oversized-t-shirts" },
  { name: "Parachute Cargo Trousers", path: "/collections/parachute-cargos" },
];

const DEFAULT_COLLECTIONS = [
  { name: "Retro Clothing", path: "/collections/retro-clothing" },
  { name: "Outliers K-aracter", path: "/collections/outliers-k-aracter" },
  { name: "Outliers Recommends", path: "/collections/outliers-recommends" },
];

const Header = ({ onSearch }) => {
  const { cartCount, wishlist, setCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopExpanded, setShopExpanded] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [collectionsExpanded, setCollectionsExpanded] = useState(false);
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [collectionsList, setCollectionsList] = useState(DEFAULT_COLLECTIONS);

  // Fetch live nav items from backend
  useEffect(() => {
    let isMounted = true;
    const fetchNavItems = async () => {
      try {
        const [catRes, colRes] = await Promise.allSettled([
          categoriesApi.list(),
          collectionsApi.list(),
        ]);
        if (!isMounted) return;
        if (catRes.status === "fulfilled" && catRes.value?.data?.length > 0) {
          setCategoriesList(catRes.value.data.map((c) => ({ name: c.name, path: `/collections/${c.slug}` })));
        }
        if (colRes.status === "fulfilled" && colRes.value?.data?.length > 0) {
          setCollectionsList(colRes.value.data.map((c) => ({ name: c.name, path: `/collections/${c.handle}` })));
        }
      } catch (_) {}
    };
    fetchNavItems();
    return () => { isMounted = false; };
  }, []);

  // Scroll lock for mobile menu and search overlay
  useEffect(() => {
    const isOpen = mobileMenuOpen || searchOpen;
    if (!isOpen) return undefined;
    const scrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileMenuOpen, searchOpen]);

  // Escape key closes search
  useEffect(() => {
    if (!searchOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") closeSearch(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const openSearch = () => {
    setSearchQuery("");
    if (onSearch) onSearch("");
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchQuery("");
    if (onSearch) onSearch("");
    setSearchOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/collections/all?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* ════════════════════════════════════
          MAIN HEADER  (Nav Left | Logo Center | Icons Right)
         ════════════════════════════════════ */}
      <header className="main-header">
        <div className="container-fluid">
          <div className="header-inner">

            {/* ── LEFT: Hamburger (mobile) + Desktop Nav ── */}
            <div className="header-left-zone">
              {/* Mobile hamburger */}
              <button
                className="hdr-hamburger md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>

              {/* Desktop Navigation */}
              <nav className="desktop-nav hidden md:block">
                <ul className="nav-menu">
                  {/* Shop */}
                  <li className="nav-item">
                    <Link href="/collections/all" className="nav-link" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      Shop
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1" /></svg>
                    </Link>
                    <div className="dropdown-pane">
                      <ul className="dropdown-list">
                        <li><Link href="/collections/bestsellers" className="dropdown-link">Bestseller Clothing</Link></li>
                        <li><Link href="/collections/winterwear" className="dropdown-link">Winterwear</Link></li>
                        <li><Link href="/collections/outerwear" className="dropdown-link">Outerwear</Link></li>
                        <li><Link href="/collections/whats-new" className="dropdown-link">New Arrival / Trending</Link></li>
                      </ul>
                    </div>
                  </li>

                  {/* Categories */}
                  <li className="nav-item">
                    <span className="nav-link cursor-pointer" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      Categories
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1" /></svg>
                    </span>
                    <div className="dropdown-pane">
                      <ul className="dropdown-list">
                        {categoriesList.map((cat) => (
                          <li key={cat.path}><Link href={cat.path} className="dropdown-link">{cat.name}</Link></li>
                        ))}
                      </ul>
                    </div>
                  </li>

                  {/* Collections */}
                  <li className="nav-item">
                    <span className="nav-link cursor-pointer" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      Collections
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1" /></svg>
                    </span>
                    <div className="dropdown-pane">
                      <ul className="dropdown-list">
                        {collectionsList.map((col) => (
                          <li key={col.path}><Link href={col.path} className="dropdown-link">{col.name}</Link></li>
                        ))}
                      </ul>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>

            {/* ── CENTER: Logo (always centered) ── */}
            <div className="logo-container">
              <Link href="/" className="inline-block">
                <Logo />
              </Link>
            </div>

            {/* ── RIGHT: Action Icons ── */}
            <div className="header-actions">
              {/* Search trigger */}
              <button
                className="action-btn text-black hover:opacity-70 flex items-center justify-center"
                onClick={openSearch}
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              {/* Account */}
              {user ? (
                <Link href="/profile" className="action-btn account-action text-black hover:opacity-70 flex items-center justify-center relative" aria-label="My Profile" title={`Signed in as ${user.name || user.email}`}>
                  <div className="relative">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                  </div>
                </Link>
              ) : (
                <Link href="/pages/login" className="action-btn account-action text-black hover:opacity-70 flex items-center justify-center" aria-label="Account">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>
              )}

              {/* Wishlist */}
              <Link href="/pages/wishlist" className="action-btn wishlist-action text-black hover:opacity-70 flex items-center justify-center relative" aria-label="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
              </Link>

              {/* Cart */}
              <button className="action-btn text-black hover:opacity-70 flex items-center justify-center relative" onClick={() => setCartOpen(true)} aria-label="Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ════════════════════════════════════
          SEARCH OVERLAY  (slides down from top on search icon click)
         ════════════════════════════════════ */}
      {searchOpen && (
        <>
          {/* Dark backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/40"
            style={{ animation: "searchFadeIn 0.2s ease forwards" }}
            onClick={closeSearch}
          />

          {/* Slide-down search bar */}
          <div
            className="fixed top-0 left-0 right-0 z-[9999] bg-white shadow-lg"
            style={{ animation: "searchSlideDown 0.28s cubic-bezier(0.16,1,0.3,1) forwards" }}
          >
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes searchSlideDown {
                from { transform: translateY(-100%); opacity: 0; }
                to   { transform: translateY(0);    opacity: 1; }
              }
              @keyframes searchFadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
              }
            `}} />

            {/* Inner: Logo | Search Input | Icons | Close */}
            <div className="container-fluid">
              <div className="srch-bar-inner">

                {/* Logo */}
                <Link href="/" onClick={closeSearch} className="srch-logo flex-shrink-0">
                  <Logo height={44} />
                </Link>

                {/* Wide search form */}
                <form className="srch-form" onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoFocus
                    className="srch-input"
                  />
                  <button type="submit" className="srch-submit-btn" aria-label="Search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                </form>

                {/* Right icons */}
                <div className="srch-icons flex-shrink-0">
                  {user ? (
                    <Link href="/profile" onClick={closeSearch} className="srch-icon-btn" aria-label="Profile">
                      <div className="relative">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                      </div>
                    </Link>
                  ) : (
                    <Link href="/pages/login" onClick={closeSearch} className="srch-icon-btn" aria-label="Account">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </Link>
                  )}

                  <Link href="/pages/wishlist" onClick={closeSearch} className="srch-icon-btn relative" aria-label="Wishlist">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
                  </Link>

                  <button
                    className="srch-icon-btn relative"
                    onClick={() => { closeSearch(); setCartOpen(true); }}
                    aria-label="Cart"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
                  </button>

                  {/* Close X */}
                  <button onClick={closeSearch} className="srch-close-btn" aria-label="Close search">
                    <X className="w-5 h-5" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════
          MOBILE DRAWER
         ════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[998] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {mobileMenuOpen && (
        <div
          className="fixed top-0 left-0 w-[85vw] max-w-[340px] h-full bg-white z-[999] shadow-2xl flex flex-col overflow-hidden md:hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "drawerSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards" }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes drawerSlideIn {
              from { transform: translateX(-100%); }
              to   { transform: translateX(0); }
            }
          `}} />

          {/* Drawer top */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 flex-shrink-0">
            <Logo height={40} />
            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close" className="p-2 text-neutral-600 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer nav */}
          <nav className="flex-grow overflow-y-auto px-6 py-2">
            <ul className="flex flex-col">

              <li style={{ borderBottom: "1px solid #f3f4f6" }}>
                <button onClick={() => setShopExpanded(!shopExpanded)} className="w-full flex items-center justify-between text-base font-semibold text-neutral-800 hover:text-black py-4">
                  <span>Shop</span>
                  <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${shopExpanded ? "rotate-90" : ""}`} />
                </button>
                {shopExpanded && (
                  <ul className="pl-4 pb-4 flex flex-col gap-3 text-sm font-medium text-neutral-600">
                    <li><Link href="/collections/all" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">Shop All</Link></li>
                    <li><Link href="/collections/bestsellers" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">Bestsellers</Link></li>
                    <li><Link href="/collections/whats-new" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">What&apos;s New</Link></li>
                    <li><Link href="/collections/winterwear" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">Winterwear</Link></li>
                    <li><Link href="/collections/outerwear" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">Outerwear</Link></li>
                  </ul>
                )}
              </li>

              <li style={{ borderBottom: "1px solid #f3f4f6" }}>
                <button onClick={() => setCategoriesExpanded(!categoriesExpanded)} className="w-full flex items-center justify-between text-base font-semibold text-neutral-800 hover:text-black py-4">
                  <span>Categories</span>
                  <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${categoriesExpanded ? "rotate-90" : ""}`} />
                </button>
                {categoriesExpanded && (
                  <ul className="pl-4 pb-4 flex flex-col gap-3 text-sm font-medium text-neutral-600">
                    {categoriesList.map((cat) => (
                      <li key={cat.path}><Link href={cat.path} onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">{cat.name}</Link></li>
                    ))}
                  </ul>
                )}
              </li>

              <li style={{ borderBottom: "1px solid #f3f4f6" }}>
                <button onClick={() => setCollectionsExpanded(!collectionsExpanded)} className="w-full flex items-center justify-between text-base font-semibold text-neutral-800 hover:text-black py-4">
                  <span>Collections</span>
                  <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${collectionsExpanded ? "rotate-90" : ""}`} />
                </button>
                {collectionsExpanded && (
                  <ul className="pl-4 pb-4 flex flex-col gap-3 text-sm font-medium text-neutral-600">
                    {collectionsList.map((col) => (
                      <li key={col.path}><Link href={col.path} onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">{col.name}</Link></li>
                    ))}
                  </ul>
                )}
              </li>

              <li style={{ borderBottom: "1px solid #f3f4f6" }}>
                <Link href="/pages/wishlist" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-between text-base font-semibold text-neutral-800 hover:text-black py-4">
                  Wishlist
                </Link>
              </li>

            </ul>
          </nav>

          {/* Drawer bottom: Account */}
          <div className="bg-white border-t border-neutral-100 px-6 py-6 flex-shrink-0">
            <h3 className="text-xl font-bold text-neutral-900 mb-3">My Account</h3>
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="bg-neutral-50 p-4 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Logged In</p>
                    <p className="text-xs font-bold text-neutral-800 truncate mt-1">{user.name || user.email}</p>
                  </div>
                </div>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="w-full bg-black text-white font-bold text-center py-4 rounded-sm text-[11px] tracking-widest uppercase block">My Profile</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full bg-white border border-black text-black font-bold text-center py-4 rounded-sm text-[11px] tracking-widest uppercase">Log Out</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/pages/login" onClick={() => setMobileMenuOpen(false)} className="w-full bg-black text-white font-bold text-center py-4 rounded-sm text-[11px] tracking-widest uppercase block">Log In</Link>
                <Link href="/pages/login" onClick={() => setMobileMenuOpen(false)} className="w-full bg-white border border-black text-black font-bold text-center py-4 rounded-sm text-[11px] tracking-widest uppercase block">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
