import React, { useState } from 'react';
import { Menu, MessageSquare, ShieldCheck, User, X } from 'lucide-react';
import { UserProfile } from '../types/botanical';

interface NavbarProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenAdminDrawer: () => void;
  onOpenAccountModal: () => void;
  onOpenConciergeChat: () => void;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isDetailView: boolean;
  onBackToStorefront: () => void;
}

const NAV_ITEMS = [
  { id: 'catalog', label: 'Our Collection' },
  { id: 'services', label: 'Care Services' },
  { id: 'faq', label: 'Care FAQ' },
  { id: 'conservatory', label: 'Conservatory' },
];

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateSection,
  onOpenAdminDrawer,
  onOpenAccountModal,
  onOpenConciergeChat,
  userProfile,
  isAdmin,
  isDetailView,
  onBackToStorefront,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleLinkClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (isDetailView) {
      onBackToStorefront();
      setTimeout(() => onNavigateSection(sectionId), 50);
    } else {
      onNavigateSection(sectionId);
    }
  };

  const firstName = userProfile?.displayName?.split(' ')[0] || 'Account';

  return (
    <header className="sticky top-0 z-30 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-[#E8E5DF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        {/* Zone 1: Brand Logo */}
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            if (isDetailView) {
              onBackToStorefront();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          aria-label="Farmers Friend Home"
          className="inline-flex items-center shrink-0 min-w-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2E5A44] rounded-sm"
        >
          {!logoError ? (
            <img
              src="/assets/aistudio/logo_10d5cff1.png"
              alt="Farmers Friend — One Stop Botanical Solution"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-9 sm:h-11 max-w-[160px] sm:max-w-none w-auto object-contain"
            />
          ) : (
            <span className="font-display text-xl font-medium tracking-tight text-[#15422E] whitespace-nowrap">
              Farmers Friend
            </span>
          )}
        </button>

        {/* Zone 2: 4 Single-Line Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-5 lg:gap-8 text-sm font-medium text-[#5A685F]"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleLinkClick(item.id)}
              className="relative py-1 text-[#5A685F] hover:text-[#2E5A44] transition-colors whitespace-nowrap shrink-0 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-[#2E5A44] hover:after:w-full after:transition-all after:duration-200 focus-visible:outline-2 focus-visible:outline-[#2E5A44] rounded-sm"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Auth & Studio Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Login / Account Trigger (visible cleanly on mobile & desktop) */}
          <button
            type="button"
            onClick={onOpenAccountModal}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg border border-[#E8E5DF] bg-white hover:border-[#2E5A44] text-xs sm:text-sm font-medium text-[#222222] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E5A44]"
          >
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={firstName}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            ) : (
              <User className="w-4 h-4 text-[#2E5A44] shrink-0" />
            )}
            <span className="max-w-[125px] truncate">
              {userProfile ? (
                firstName
              ) : (
                <>
                  <span className="sm:hidden">Login</span>
                  <span className="hidden sm:inline">Login / Register</span>
                </>
              )}
            </span>
          </button>

          {/* Primary Studio / Concierge CTA on Desktop */}
          {isAdmin ? (
            <button
              type="button"
              onClick={onOpenAdminDrawer}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E5A44]"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Admin Panel</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenConciergeChat}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E5A44]"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Concierge Chat</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E8E5DF] bg-white text-[#222222] cursor-pointer shrink-0"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E5DF] bg-white px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLinkClick(item.id)}
                className="text-left py-2.5 px-2 text-sm font-medium text-[#222222] hover:text-[#2E5A44] rounded-lg hover:bg-[#F9F8F6] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-2 border-t border-[#E8E5DF] grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConciergeChat();
              }}
              className="w-full py-2.5 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium text-[#2E5A44] border border-[#2E5A44] bg-white hover:bg-[#F9F8F6] rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Showroom Concierge Chat</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminDrawer();
                }}
                className="w-full py-3 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] rounded-lg transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
