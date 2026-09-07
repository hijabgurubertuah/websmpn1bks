import React, { useState, useEffect, useRef } from 'react';
import { SchoolConfig, NavMenu } from '../../types';
import { Menu, X, ChevronDown, School, ShieldCheck, Settings, Search, GraduationCap } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  config: SchoolConfig;
  onOpenAdmin: () => void;
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ config, onOpenAdmin, onSearchClick }) => {
  const { identity, navMenus } = config;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    setOpenDropdownId(null);
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const activeMenus = navMenus.filter((m) => m.enabled);

  return (
    <nav
      id="main-navbar"
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200'
          : 'bg-white border-b border-slate-100 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <a
            href="#beranda"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#beranda');
            }}
            className="flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              {identity.logoUrl ? (
                <img
                  src={identity.logoUrl}
                  alt={identity.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <School className="w-7 h-7 text-blue-700" />
              )}
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                {identity.name}
              </span>
              <span className="text-xs text-slate-500 font-medium line-clamp-1 max-w-[280px] sm:max-w-md">
                {identity.tagline}
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div ref={dropdownRef} className="hidden lg:flex items-center gap-1 xl:gap-2">
            {activeMenus.map((menu) => {
              const isDropdownOpen = openDropdownId === menu.id;

              if (menu.isDropdown && menu.dropdownItems && menu.dropdownItems.length > 0) {
                return (
                  <div
                    key={menu.id}
                    className="relative"
                    onMouseEnter={() => setOpenDropdownId(menu.id)}
                    onMouseLeave={() => setOpenDropdownId(null)}
                  >
                    <button
                      type="button"
                      id={`menu-${menu.id}`}
                      onClick={() => setOpenDropdownId(isDropdownOpen ? null : menu.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                        isDropdownOpen
                          ? 'text-blue-700 bg-blue-50/80'
                          : 'text-slate-700 hover:text-blue-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{menu.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180 text-blue-700' : 'text-slate-400'
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu Container */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {menu.dropdownItems.map((subItem) => (
                          <a
                            key={subItem.id}
                            href={subItem.path}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavClick(subItem.path);
                            }}
                            className="block px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer"
                          >
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                              {subItem.label}
                            </div>
                            {subItem.description && (
                              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {subItem.description}
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  key={menu.id}
                  id={`menu-${menu.id}`}
                  href={menu.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(menu.path);
                  }}
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {menu.label}
                </a>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* PWA In-App Install Button */}
            <PWAInstallButton />

            <a
              href="#berita"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#berita');
              }}
              className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Cari Berita & Pengumuman"
            >
              <Search className="w-5 h-5" />
            </a>

            {/* Dynamic PPDB Button if enabled */}
            {config.ppdb?.enabled !== false && (
              <a
                href={config.ppdb?.buttonLink || '#berita'}
                target={config.ppdb?.openInNewTab ? '_blank' : undefined}
                rel={config.ppdb?.openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  const link = config.ppdb?.buttonLink || '#berita';
                  if (link.startsWith('#')) {
                    e.preventDefault();
                    handleNavClick(link);
                  }
                }}
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{config.ppdb?.buttonLabel || 'Info PPDB 2026'}</span>
              </a>
            )}

            {/* The single, unified admin panel button with gear icon */}
            <button
              id="btn-admin-gear"
              onClick={onOpenAdmin}
              className="p-2.5 border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-white text-slate-600 hover:text-blue-600 rounded-xl transition-all cursor-pointer shadow-xs group"
              title="Panel Pengelola Admin CMS (Dilindungi Password)"
              aria-label="Panel Admin"
            >
              <Settings className="w-5 h-5 text-slate-600 group-hover:text-blue-600 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Mobile Right Action Area */}
          <div className="flex lg:hidden items-center gap-2">
            <PWAInstallButton />

            {/* The single, unified admin panel button with gear icon for mobile */}
            <button
              id="btn-admin-gear-mobile"
              onClick={onOpenAdmin}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Panel Admin"
              aria-label="Panel Admin"
            >
              <Settings className="w-5 h-5 text-slate-700 hover:text-blue-600" />
            </button>

            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-3 duration-200">
          {activeMenus.map((menu) => {
            const isDropdownOpen = openDropdownId === menu.id;

            if (menu.isDropdown && menu.dropdownItems && menu.dropdownItems.length > 0) {
              return (
                <div key={menu.id} className="border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId(isDropdownOpen ? null : menu.id)}
                    className="flex items-center justify-between w-full py-2 text-base font-semibold text-slate-800"
                  >
                    <span>{menu.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="pl-4 space-y-2 mt-1 bg-slate-50 rounded-lg p-2">
                      {menu.dropdownItems.map((subItem) => (
                        <a
                          key={subItem.id}
                          href={subItem.path}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(subItem.path);
                          }}
                          className="block py-1.5 text-sm text-slate-600 hover:text-blue-700 font-medium"
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <a
                key={menu.id}
                href={menu.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(menu.path);
                }}
                className="block py-2 text-base font-semibold text-slate-800 hover:text-blue-700 border-b border-slate-100"
              >
                {menu.label}
              </a>
            );
          })}

          {config.ppdb?.enabled !== false && (
            <div className="pt-3 space-y-2">
              <a
                href={config.ppdb?.buttonLink || '#berita'}
                target={config.ppdb?.openInNewTab ? '_blank' : undefined}
                rel={config.ppdb?.openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  const link = config.ppdb?.buttonLink || '#berita';
                  if (link.startsWith('#')) {
                    e.preventDefault();
                    handleNavClick(link);
                  }
                }}
                className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white font-bold py-3 rounded-lg text-center text-sm"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{config.ppdb?.buttonLabel || 'Info PPDB 2026/2027'}</span>
              </a>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
