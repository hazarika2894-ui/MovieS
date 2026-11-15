import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { User } from 'firebase/auth';
import { CinemaIndustry } from '../types/cinema';

export type ActiveView = 'catalog' | 'watchlist';

interface HeaderProps {
  activeView: ActiveView;
  activeIndustry: 'All' | CinemaIndustry;
  user: User | null;
  authLoading: boolean;
  onSelectCatalog: (industry: 'All' | CinemaIndustry) => void;
  onSelectWatchlist: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  activeIndustry,
  user,
  authLoading,
  onSelectCatalog,
  onSelectWatchlist,
  onSignIn,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    label: string;
    active: boolean;
    onClick: () => void;
  }[] = [
    {
      label: 'Catalog',
      active: activeView === 'catalog' && activeIndustry === 'All',
      onClick: () => onSelectCatalog('All'),
    },
    {
      label: 'Hollywood',
      active: activeView === 'catalog' && activeIndustry === 'Hollywood',
      onClick: () => onSelectCatalog('Hollywood'),
    },
    {
      label: 'Bollywood',
      active: activeView === 'catalog' && activeIndustry === 'Bollywood',
      onClick: () => onSelectCatalog('Bollywood'),
    },
    {
      label: 'South Cinema',
      active: activeView === 'catalog' && activeIndustry === 'South Cinema',
      onClick: () => onSelectCatalog('South Cinema'),
    },
    {
      label: 'Watchlist',
      active: activeView === 'watchlist',
      onClick: onSelectWatchlist,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070709]/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-8 px-4 sm:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectCatalog('All')}
          className="font-display text-xl font-bold tracking-tight text-zinc-50 hover:text-[#F2B705] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded-sm"
        >
          ReelHouse
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`relative py-1 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded-sm ${
                item.active
                  ? 'text-zinc-50'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {item.label}
              <span
                className={`absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[#F2B705] transition-transform duration-200 origin-left ${
                  item.active ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {authLoading ? (
            <span className="text-xs text-zinc-400 whitespace-nowrap shrink-0 px-3 py-2">
              Loading...
            </span>
          ) : user ? (
            <button
              type="button"
              onClick={onSignOut}
              className="px-4 py-2 text-xs font-semibold text-zinc-100 bg-[#141419] border border-white/15 rounded-lg hover:border-[#F2B705]/60 hover:text-[#F2B705] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
            >
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="px-4 py-2 text-xs font-semibold text-[#070709] bg-[#F2B705] rounded-lg hover:bg-[#f7c52b] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070709]"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-zinc-300 hover:text-zinc-50 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0B0F] px-4 py-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.onClick();
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-white/10 text-[#F2B705]'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
