import React, { useState } from 'react';

export default function Header({ cartCount = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-slate-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo - Left Side */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0B3C5D] to-[#1a6496] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-black tracking-tight">
                <span className="text-[#0B3C5D]">ATELI</span>
                <span className="text-[#FF5722]">MARKET</span>
              </span>
              <span className="block text-[10px] font-medium text-slate-400 -mt-0.5">Smart Shopping</span>
            </div>
          </a>

          {/* Search Bar - Center (Full width on mobile) */}
          <div className="flex-1 min-w-[120px] max-w-md order-3 md:order-2 w-full md:w-auto mt-2 md:mt-0">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search shops, groceries, products..." 
                className="w-full px-5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-full focus:outline-none focus:border-[#0B3C5D] focus:bg-white focus:shadow-lg text-sm transition-all duration-300"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Desktop Buttons & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0 order-2 md:order-3">
            
            {/* Desktop Navigation - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-3">
              <a href="#shops" className="text-sm font-medium text-slate-600 hover:text-[#FF5722] transition-colors px-3 py-2 hover:bg-slate-50 rounded-lg">
                Shops
              </a>
              <a href="#categories" className="text-sm font-medium text-slate-600 hover:text-[#FF5722] transition-colors px-3 py-2 hover:bg-slate-50 rounded-lg">
                Categories
              </a>
            </div>

            {/* Cart Button */}
            <a href="#cart" className="relative p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-all duration-200 border border-slate-200 hover:border-[#0B3C5D] group flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-600 group-hover:text-[#0B3C5D] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5722] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                  {cartCount}
                </span>
              )}
            </a>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-200 border border-slate-200 hover:border-[#0B3C5D]"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-100 space-y-2 animate-slideDown">
            <a href="#shops" className="block px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg font-medium text-slate-700 hover:text-[#0B3C5D] transition-colors">
              🏪 Shops
            </a>
            <a href="#categories" className="block px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg font-medium text-slate-700 hover:text-[#0B3C5D] transition-colors">
              📂 Categories
            </a>
            <a href="#cart" className="block px-4 py-3 bg-[#FF5722]/10 hover:bg-[#FF5722]/20 rounded-lg font-medium text-[#FF5722] transition-colors flex items-center justify-between">
              <span>🛒 My Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#FF5722] text-white text-xs font-bold px-3 py-1 rounded-full">
                  {cartCount} items
                </span>
              )}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
