'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Logo from './Logo';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { cartCount, wishlist, setCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
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
            style={{ padding: '8px 0' }}
          >
            {/* Hamburger Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Left Navigation (Desktop) - hidden on mobile, shown on desktop via CSS */}
          <nav className="desktop-nav hidden md:block">
            <ul className="nav-menu">
              <li className="nav-item">
                <Link href="/collections/all" className="nav-link flex flex-row items-center gap-1.5" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                  Shop
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </Link>
                <div className="dropdown-pane">
                  <ul className="dropdown-list">
                    <li><Link href="/collections/bestsellers" className="dropdown-link">Bestseller Clothing</Link></li>
                    <li><Link href="/collections/winterwear" className="dropdown-link">Winterwear</Link></li>
                    <li><Link href="/collections/outerwear" className="dropdown-link">Outerwear</Link></li>
                    <li><Link href="/collections/whats-new" className="dropdown-link">New Arrival / Trending Clothes</Link></li>
                  </ul>
                </div>
              </li>

              <li className="nav-item">
                <span className="nav-link cursor-pointer flex flex-row items-center gap-1.5" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                  Categories
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </span>
                <div className="dropdown-pane">
                  <ul className="dropdown-list">
                    <li><Link href="/collections/cargo-trousers-for-men" className="dropdown-link">Cargo Trousers</Link></li>
                    <li><Link href="/collections/co-ord-sets" className="dropdown-link">Co-Ord Sets</Link></li>
                    <li><Link href="/collections/textured-co-ord-sets" className="dropdown-link">Textured / Printed Casual Shirts</Link></li>
                    <li><Link href="/collections/korean-pants" className="dropdown-link">Korean Pants</Link></li>
                    <li><Link href="/collections/linen-shirts" className="dropdown-link">Linen Shirts</Link></li>
                    <li><Link href="/collections/cuban-shirts" className="dropdown-link">Cuban Shirts</Link></li>
                    <li><Link href="/collections/crochet-shirts" className="dropdown-link">Crochet Shirts</Link></li>
                    <li><Link href="/collections/shirts" className="dropdown-link">Korean Shirts</Link></li>
                    <li><Link href="/collections/oversized-t-shirts" className="dropdown-link">Oversized T-Shirts</Link></li>
                    <li><Link href="/collections/parachute-cargos" className="dropdown-link">Parachute Cargo Trousers</Link></li>
                  </ul>
                </div>
              </li>

              <li className="nav-item">
                <span className="nav-link cursor-pointer flex flex-row items-center gap-1.5" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                  Collections
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </span>
                <div className="dropdown-pane">
                  <ul className="dropdown-list">
                    <li><Link href="/collections/retro-clothing" className="dropdown-link">Retro Clothing</Link></li>
                    <li><Link href="/collections/outliers-k-aracter" className="dropdown-link">Outliers K-aracter</Link></li>
                    <li><Link href="/collections/outliers-recommends" className="dropdown-link">Outliers Recommends</Link></li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          {/* Centered Logo */}
          <div className={`logo-container flex items-center justify-center ${searchOpen ? 'hidden sm:flex' : ''}`}>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>

            {/* Profile / Account (Mock) */}
            <button
              className="action-btn text-black hover:opacity-70 hidden sm:flex items-center justify-center"
              onClick={() => alert("Profile / Account option coming soon!")}
              aria-label="Account"
            >
              {/* User Profile SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            {/* Wishlist */}
            <Link href="/pages/wishlist" className="action-btn text-black hover:opacity-70 flex items-center justify-center" aria-label="Wishlist">
              {/* Heart SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          className="fixed inset-0 bg-black/50 z-[999] backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="fixed top-0 left-0 w-80 h-full bg-white z-[1000] p-6 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <Logo height={32} />
              <button className="text-2xl text-black hover:opacity-70" onClick={() => setMobileMenuOpen(false)}>✕</button>
            </div>

            <nav className="flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-6 text-base font-black uppercase tracking-wider">
                <li>
                  <Link href="/collections/all" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
                </li>
                <li>
                  <Link href="/collections/bestsellers" onClick={() => setMobileMenuOpen(false)}>Bestsellers</Link>
                </li>
                <li>
                  <div className="border-b border-gray-150 pb-2 mb-2 font-black text-gray-400 text-xs">Categories</div>
                  <ul className="pl-4 flex flex-col gap-4 text-sm font-bold capitalize text-gray-700">
                    <li><Link href="/collections/cargo-trousers-for-men" onClick={() => setMobileMenuOpen(false)}>Cargo Trousers</Link></li>
                    <li><Link href="/collections/co-ord-sets" onClick={() => setMobileMenuOpen(false)}>Co-ord Sets</Link></li>
                    <li><Link href="/collections/crochet-shirts" onClick={() => setMobileMenuOpen(false)}>Crochet Shirts</Link></li>
                    <li><Link href="/collections/cuban-shirts" onClick={() => setMobileMenuOpen(false)}>Cuban Shirts</Link></li>
                    <li><Link href="/collections/oversized-t-shirts" onClick={() => setMobileMenuOpen(false)}>Oversized T-Shirts</Link></li>
                  </ul>
                </li>
                <li>
                  <Link href="/pages/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist ({wishlist.length})</Link>
                </li>
                <li>
                  <Link href="/pages/contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
