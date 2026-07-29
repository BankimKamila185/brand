"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { categoriesApi, collectionsApi } from "../lib/api";
import Logo from "./Logo";
import { ChevronRight, X, User, Heart, ShoppingBag, Search, Grid, Tag, Sparkles, LogOut } from "lucide-react";

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
  const headerRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerTop, setDrawerTop] = useState(78);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopExpanded, setShopExpanded] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [collectionsExpanded, setCollectionsExpanded] = useState(false);
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [collectionsList, setCollectionsList] = useState(DEFAULT_COLLECTIONS);

  // Dynamically calculate main header bottom edge to eliminate any gap above mobile drawer
  useEffect(() => {
    const updateTop = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setDrawerTop(rect.bottom);
        }
      }
    };
    updateTop();
    if (!mobileMenuOpen) return;
    window.addEventListener("resize", updateTop);
    window.addEventListener("scroll", updateTop);
    return () => {
      window.removeEventListener("resize", updateTop);
      window.removeEventListener("scroll", updateTop);
    };
  }, [mobileMenuOpen]);

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
      } catch (_) { }
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
                onClick={() => {
                  if (headerRef.current) {
                    setDrawerTop(headerRef.current.getBoundingClientRect().bottom);
                  }
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
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
                <Logo className="h-9 md:h-[72px]" />
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              {/* Account */}
              {user ? (
                <Link href="/profile" className="action-btn account-action text-black hover:opacity-70 flex items-center justify-center relative" aria-label="My Profile" title={`Signed in as ${user.name || user.email}`}>
                  <div className="relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                </Link>
              ) : (
                <Link href="/login" className="action-btn account-action text-black hover:opacity-70 flex items-center justify-center" aria-label="Account">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>
              )}

              {/* Wishlist */}
              <Link href="/wishlist" className="action-btn wishlist-action text-black hover:opacity-70 flex items-center justify-center relative" aria-label="Wishlist">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
              </Link>

              {/* Cart */}
              <button className="action-btn text-black hover:opacity-70 flex items-center justify-center relative" onClick={() => setCartOpen(true)} aria-label="Cart">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            className="fixed top-0 left-0 right-0 z-[9999] bg-white shadow-lg border-b border-neutral-200"
            style={{ animation: "searchSlideDown 0.28s cubic-bezier(0.16,1,0.3,1) forwards" }}
          >
            <style dangerouslySetInnerHTML={{
              __html: `
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

                {/* Mobile Top Row / Desktop Left */}
                <div className="srch-top-row flex items-center justify-between w-full md:w-auto">
                  <Link href="/" onClick={closeSearch} className="srch-logo flex-shrink-0">
                    <Logo className="h-8 md:h-11" />
                  </Link>
                  <button onClick={closeSearch} className="srch-close-btn md:hidden p-1 text-neutral-700 hover:text-black" aria-label="Close search">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Wide search form */}
                <form className="srch-form w-full md:flex-1 md:max-w-2xl md:mx-auto" onSubmit={handleSearchSubmit}>
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

                {/* Desktop right icons */}
                <div className="srch-icons hidden md:flex flex-shrink-0">
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
                    <Link href="/login" onClick={closeSearch} className="srch-icon-btn" aria-label="Account">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </Link>
                  )}

                  <Link href="/wishlist" onClick={closeSearch} className="srch-icon-btn relative" aria-label="Wishlist">
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
          MOBILE DRAWER — slides in from LEFT
         ════════════════════════════════════ */}
      {mobileMenuOpen && (
            <>
              <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes drawerSlideIn {
                  from { transform: translateX(-100%); }
                  to   { transform: translateX(0); }
                }
                @keyframes backdropFadeIn {
                  from { opacity: 0; }
                  to   { opacity: 1; }
                }
                .drawer-sub-link:hover { color: #000; }
              `}} />

              {/* Backdrop covering full screen */}
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 99998,
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  animation: "backdropFadeIn 0.25s ease forwards"
                }}
                className="md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Full-Height Drawer panel */}
              <div
                className="md:hidden"
                style={{
                  position: "fixed",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: "84vw",
                  maxWidth: "340px",
                  background: "#fff",
                  zIndex: 99999,
                  display: "flex",
                  flexDirection: "column",
                  animation: "drawerSlideIn 0.32s cubic-bezier(0.16,1,0.3,1) forwards",
                  boxShadow: "8px 0 40px rgba(0,0,0,0.2)"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* ── DRAWER HEADER ── */}
                <div
                  style={{
                    height: "64px",
                    padding: "0 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #f0f0f0",
                    flexShrink: 0
                  }}
                >
                  <Logo height={24} />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      cursor: "pointer"
                    }}
                    aria-label="Close menu"
                  >
                    <X size={18} color="#111" />
                  </button>
                </div>

            {/* ── SCROLLABLE BODY ── */}
            <div className="flex-1 overflow-y-auto flex flex-col">

              {/* Nav list */}
              <nav className="flex-1">
                <ul className="flex flex-col divide-y divide-neutral-100">

                  {/* Shop */}
                  <li>
                    <button
                      onClick={() => setShopExpanded(!shopExpanded)}
                      className="w-full flex items-center justify-between text-neutral-900 text-left transition-colors active:bg-neutral-50"
                      style={{ fontSize: "17px", fontWeight: 400, letterSpacing: "0.01em", paddingTop: "18px", paddingBottom: "18px", paddingLeft: "22px", paddingRight: "20px" }}
                    >
                      <span>Shop</span>
                      <ChevronRight
                        className="text-neutral-400 transition-transform duration-200"
                        style={{ width: "16px", height: "16px", strokeWidth: 1.5, flexShrink: 0, transform: shopExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                      />
                    </button>
                    {shopExpanded && (
                      <ul style={{ background: "#fafafa", borderTop: "1px solid #f0f0f0", paddingLeft: "22px", paddingRight: "20px", paddingBottom: "8px" }}>
                        {[
                          { label: "Shop All", href: "/collections/all" },
                          { label: "Bestsellers", href: "/collections/bestsellers" },
                          { label: "What's New", href: "/collections/whats-new" },
                          { label: "Winterwear", href: "/collections/winterwear" },
                          { label: "Outerwear", href: "/collections/outerwear" },
                        ].map((item) => (
                          <li key={item.href} style={{ borderBottom: "1px solid #f0f0f0" }} className="last:border-0">
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="drawer-sub-link block text-neutral-500 transition-colors"
                              style={{ fontSize: "14px", paddingTop: "12px", paddingBottom: "12px" }}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>

                  {/* Categories */}
                  <li>
                    <button
                      onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                      className="w-full flex items-center justify-between text-neutral-900 text-left transition-colors active:bg-neutral-50"
                      style={{ fontSize: "17px", fontWeight: 400, letterSpacing: "0.01em", paddingTop: "18px", paddingBottom: "18px", paddingLeft: "22px", paddingRight: "20px" }}
                    >
                      <span>Categories</span>
                      <ChevronRight
                        className="text-neutral-400 transition-transform duration-200"
                        style={{ width: "16px", height: "16px", strokeWidth: 1.5, flexShrink: 0, transform: categoriesExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                      />
                    </button>
                    {categoriesExpanded && (
                      <ul style={{ background: "#fafafa", borderTop: "1px solid #f0f0f0", paddingLeft: "22px", paddingRight: "20px", paddingBottom: "8px", maxHeight: "220px", overflowY: "auto" }}>
                        {categoriesList.map((cat) => (
                          <li key={cat.path} style={{ borderBottom: "1px solid #f0f0f0" }} className="last:border-0">
                            <Link
                              href={cat.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className="drawer-sub-link block text-neutral-500 transition-colors"
                              style={{ fontSize: "14px", paddingTop: "12px", paddingBottom: "12px" }}
                            >
                              {cat.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>

                  {/* Collections */}
                  <li>
                    <button
                      onClick={() => setCollectionsExpanded(!collectionsExpanded)}
                      className="w-full flex items-center justify-between text-neutral-900 text-left transition-colors active:bg-neutral-50"
                      style={{ fontSize: "17px", fontWeight: 400, letterSpacing: "0.01em", paddingTop: "18px", paddingBottom: "18px", paddingLeft: "22px", paddingRight: "20px" }}
                    >
                      <span>Collections</span>
                      <ChevronRight
                        className="text-neutral-400 transition-transform duration-200"
                        style={{ width: "16px", height: "16px", strokeWidth: 1.5, flexShrink: 0, transform: collectionsExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                      />
                    </button>
                    {collectionsExpanded && (
                      <ul style={{ background: "#fafafa", borderTop: "1px solid #f0f0f0", paddingLeft: "22px", paddingRight: "20px", paddingBottom: "8px" }}>
                        {collectionsList.map((col) => (
                          <li key={col.path} style={{ borderBottom: "1px solid #f0f0f0" }} className="last:border-0">
                            <Link
                              href={col.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className="drawer-sub-link block text-neutral-500 transition-colors"
                              style={{ fontSize: "14px", paddingTop: "12px", paddingBottom: "12px" }}
                            >
                              {col.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>

                  {/* Wishlist */}
                  <li>
                    <Link
                      href="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-between text-neutral-900 transition-colors active:bg-neutral-50"
                      style={{ fontSize: "17px", fontWeight: 400, letterSpacing: "0.01em", paddingTop: "18px", paddingBottom: "18px", paddingLeft: "22px", paddingRight: "20px", display: "flex" }}
                    >
                      <span>Wishlist</span>
                    </Link>
                  </li>

                </ul>
              </nav>

              {/* ── MY ACCOUNT (bottom) ── */}
              <div style={{ borderTop: "1px solid #f0f0f0", padding: "28px 24px 32px", background: "#fff", marginTop: "auto" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.16em", fontWeight: 700, color: "#aaa", marginBottom: "20px" }}>
                  MY ACCOUNT
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  {/* Avatar circle */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    border: "1.5px solid #e0e0e0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#fafafa", flexShrink: 0
                  }}>
                    <User style={{ width: "18px", height: "18px", strokeWidth: 1.5, color: "#555" }} />
                  </div>
                  <div style={{ lineHeight: 1.3 }}>
                    {user ? (
                      <>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#111", marginBottom: "2px" }}>
                          {user.name || "My Profile"}
                        </p>
                        <p style={{ fontSize: "12px", color: "#999" }}>{user.email || ""}</p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#111", marginBottom: "2px" }}>Guest</p>
                        <p style={{ fontSize: "12px", color: "#999" }}>Sign in to your account</p>
                      </>
                    )}
                  </div>
                </div>

                {user ? (
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    style={{
                      width: "100%", border: "1.5px solid #111", background: "#fff",
                      color: "#111", fontSize: "11px", fontWeight: 600,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      paddingTop: "14px", paddingBottom: "14px",
                      cursor: "pointer", transition: "background 0.2s, color 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#111"; }}
                  >
                    LOG OUT
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "block", width: "100%", border: "1.5px solid #111", background: "#fff",
                      color: "#111", fontSize: "11px", fontWeight: 600,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      paddingTop: "14px", paddingBottom: "14px",
                      textAlign: "center", textDecoration: "none",
                      transition: "background 0.2s, color 0.2s"
                    }}
                  >
                    LOG IN
                  </Link>
                )}
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;

