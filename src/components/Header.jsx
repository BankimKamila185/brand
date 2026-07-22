"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { categoriesApi, collectionsApi } from "../lib/api";
import Logo from "./Logo";
import { ChevronRight, Mail, LogOut, User, Heart, X } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [collectionsExpanded, setCollectionsExpanded] = useState(false);
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [collectionsList, setCollectionsList] = useState(DEFAULT_COLLECTIONS);

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
          const liveCats = catRes.value.data.map((cat) => ({
            name: cat.name,
            path: `/collections/${cat.slug}`,
          }));
          setCategoriesList(liveCats);
        }

        if (colRes.status === "fulfilled" && colRes.value?.data?.length > 0) {
          const liveCols = colRes.value.data.map((col) => ({
            name: col.name,
            path: `/collections/${col.handle}`,
          }));
          setCollectionsList(liveCols);
        }
      } catch (err) {
        // Fallback to static defaults if backend offline
      }
    };

    fetchNavItems();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen && !searchOpen) return undefined;

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [mobileMenuOpen, searchOpen]);

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

  useEffect(() => {
    if (!searchOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        clearSearch();
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  return (
    <header className={`main-header ${mobileMenuOpen || searchOpen ? '!z-[9999]' : ''}`}>
      <div className="container-fluid">
        <div className="header-inner">
          {/* Mobile Menu Toggle - shown on mobile, hidden on desktop via CSS */}
          <button
            className="mobile-menu-btn md:hidden text-black hover:opacity-75 focus:outline-none flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              /* Hamburger Icon */
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
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
                    {categoriesList.map((cat) => (
                      <li key={cat.path}>
                        <Link href={cat.path} className="dropdown-link">
                          {cat.name}
                        </Link>
                      </li>
                    ))}
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
                    {collectionsList.map((col) => (
                      <li key={col.path}>
                        <Link href={col.path} className="dropdown-link">
                          {col.name}
                        </Link>
                      </li>
                    ))}
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
            {/* Search Trigger Button */}
            <div className="mobile-search relative flex items-center">
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
              <Link
                href="/profile"
                className="action-btn account-action text-black hover:opacity-70 flex items-center justify-center relative group"
                aria-label="My Profile"
                title={`Signed in as ${user.name || user.email}. View profile.`}
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
              </Link>

            ) : (
              <Link
                href="/pages/login"
                className="action-btn account-action text-black hover:opacity-70 flex items-center justify-center"
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
              className="action-btn wishlist-action text-black hover:opacity-70 flex items-center justify-center"
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

      {/* Mobile Drawer Backdrop Overlay (starts below the header) */}
      {mobileMenuOpen && (
        <div
          className="absolute top-full left-0 w-screen h-[calc(100dvh-var(--header-h))] bg-black/60 z-[998] backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Navigation (positioned below the header) */}
      {mobileMenuOpen && (
        <div
          className="absolute top-full left-0 w-[85vw] max-w-[340px] h-[calc(100dvh-var(--header-h))] bg-white z-[999] shadow-2xl flex flex-col overflow-hidden md:hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: "drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes drawerSlideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}} />

          {/* Navigation Links Accordion */}
          <nav 
            className="flex-grow overflow-y-auto select-none"
            style={{
              paddingLeft: '28px',
              paddingRight: '28px',
              paddingTop: '20px',
              paddingBottom: '20px',
              minHeight: '0'
            }}
          >
            <ul className="flex flex-col">
              
              {/* Accordion 1: Shop */}
              <li style={{ borderBottom: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => setShopExpanded(!shopExpanded)}
                  className="w-full flex items-center justify-between text-base font-semibold text-neutral-800 hover:text-black transition-colors"
                  style={{ paddingTop: '18px', paddingBottom: '18px' }}
                >
                  <span>Shop</span>
                  <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${shopExpanded ? 'rotate-90' : ''}`} />
                </button>
                {shopExpanded && (
                  <ul className="pl-4 pr-2 pb-4 flex flex-col gap-3 text-sm font-medium text-neutral-600">
                    <li>
                      <Link href="/collections/all" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">
                        Shop All
                      </Link>
                    </li>
                    <li>
                      <Link href="/collections/bestsellers" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">
                        Bestsellers
                      </Link>
                    </li>
                    <li>
                      <Link href="/collections/whats-new" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">
                        What&apos;s New
                      </Link>
                    </li>
                    <li>
                      <Link href="/collections/winterwear" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">
                        Winterwear
                      </Link>
                    </li>
                    <li>
                      <Link href="/collections/outerwear" onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">
                        Outerwear
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Accordion 2: Categories */}
              <li style={{ borderBottom: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="w-full flex items-center justify-between text-base font-semibold text-neutral-800 hover:text-black transition-colors"
                  style={{ paddingTop: '18px', paddingBottom: '18px' }}
                >
                  <span>Categories</span>
                  <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${categoriesExpanded ? 'rotate-90' : ''}`} />
                </button>
                {categoriesExpanded && (
                  <ul className="pl-4 pr-2 pb-4 flex flex-col gap-3 text-sm font-medium text-neutral-600">
                    {categoriesList.map((cat) => (
                      <li key={cat.path}>
                        <Link href={cat.path} onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {/* Accordion 3: Collections */}
              <li style={{ borderBottom: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => setCollectionsExpanded(!collectionsExpanded)}
                  className="w-full flex items-center justify-between text-base font-semibold text-neutral-800 hover:text-black transition-colors"
                  style={{ paddingTop: '18px', paddingBottom: '18px' }}
                >
                  <span>Collections</span>
                  <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${collectionsExpanded ? 'rotate-90' : ''}`} />
                </button>
                {collectionsExpanded && (
                  <ul className="pl-4 pr-2 pb-4 flex flex-col gap-3 text-sm font-medium text-neutral-600">
                    {collectionsList.map((col) => (
                      <li key={col.path}>
                        <Link href={col.path} onClick={() => setMobileMenuOpen(false)} className="hover:text-black block py-1.5">
                          {col.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {/* Wishlist Link */}
              <li style={{ borderBottom: '1px solid #f3f4f6' }}>
                <Link
                  href="/pages/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between text-base font-semibold text-neutral-800 hover:text-black transition-colors"
                  style={{ paddingTop: '18px', paddingBottom: '18px' }}
                >
                  Wishlist
                </Link>
              </li>

            </ul>
          </nav>

          {/* Bottom Section: My Account with Log In & Register buttons */}
          <div 
            className="bg-white border-t border-neutral-100 flex flex-col gap-3 flex-shrink-0"
            style={{
              paddingLeft: '28px',
              paddingRight: '28px',
              paddingTop: '24px',
              paddingBottom: '40px'
            }}
          >
            <h3 className="text-xl font-bold text-neutral-900" style={{ marginBottom: '8px' }}>My Account</h3>
            
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
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-center block transition-all cursor-pointer"
                  style={{
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#ffffff'
                  }}
                >
                  My Profile
                </Link>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full bg-white hover:bg-neutral-50 text-black border border-neutral-800 font-bold text-center block transition-all cursor-pointer"
                  style={{
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#000000'
                  }}
                >
                  Log Out
                </button>
              </div>

            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/pages/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-center block transition-all cursor-pointer"
                  style={{
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#ffffff'
                  }}
                >
                  Log In
                </Link>
                <Link
                  href="/pages/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-white hover:bg-neutral-50 text-black border border-black font-bold text-center block transition-all cursor-pointer"
                  style={{
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#000000'
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Top Slide-Down Search Bar Overlay */}
      {searchOpen && (
        <>
          {/* Dark backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-300"
            onClick={() => {
              clearSearch();
              setSearchOpen(false);
            }}
          />

          {/* Search Popup Header Bar */}
          <div
            className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-neutral-200 shadow-md py-3 px-4 md:px-10 flex items-center justify-between gap-4 md:gap-8"
            style={{
              animation: "searchPopDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes searchPopDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}} />

            {/* Left: Brand Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" onClick={() => setSearchOpen(false)}>
                <Logo height={32} />
              </Link>
            </div>

            {/* Middle: Wide Search Bar */}
            <form
              className="flex-1 max-w-2xl relative flex items-center"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/collections/all?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
            >
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
                  className="w-full border border-neutral-400 rounded-md py-2 px-4 pr-10 text-sm md:text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-3 text-neutral-600 hover:text-black transition-colors"
                  aria-label="Search"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right: Account, Wishlist, Cart, Close X */}
            <div className="flex items-center gap-3 md:gap-5 flex-shrink-0 text-black">
              {/* Account */}
              {user ? (
                <Link
                  href="/profile"
                  onClick={() => setSearchOpen(false)}
                  className="hover:opacity-70 relative flex items-center justify-center"
                  aria-label="My Profile"
                >
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                </Link>
              ) : (
                <Link
                  href="/pages/login"
                  onClick={() => setSearchOpen(false)}
                  className="hover:opacity-70 flex items-center justify-center"
                  aria-label="Account"
                >
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>
              )}

              {/* Wishlist */}
              <Link
                href="/pages/wishlist"
                onClick={() => setSearchOpen(false)}
                className="hover:opacity-70 relative flex items-center justify-center"
                aria-label="Wishlist"
              >
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
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlist.length > 0 && (
                  <span className="badge-count">{wishlist.length}</span>
                )}
              </Link>

              {/* Cart */}
              <button
                className="hover:opacity-70 relative flex items-center justify-center"
                onClick={() => {
                  setSearchOpen(false);
                  setCartOpen(true);
                }}
                aria-label="Cart"
              >
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
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span className="badge-count">{cartCount}</span>
                )}
              </button>

              {/* Close Button X */}
              <button
                type="button"
                onClick={() => {
                  clearSearch();
                  setSearchOpen(false);
                }}
                className="hover:opacity-75 text-neutral-600 hover:text-black transition-colors ml-1 p-1"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
