import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BusinessSettings, ViewMode } from '../types';
import { LiveStatusBadge } from './LiveStatusBadge';
import {
  ShoppingBag,
  Menu as MenuIcon,
  X,
  User,
  ShieldCheck,
  Coffee,
  Globe,
  Flame,
  PhoneCall,
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  settings: BusinessSettings;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, settings }) => {
  const { language, toggleLanguage, isRTL, t } = useLanguage();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: ViewMode; labelEn: string; labelAr: string }[] = [
    { id: 'home', labelEn: 'Home', labelAr: 'الرئيسية' },
    { id: 'menu', labelEn: 'Menu', labelAr: 'المنيو' },
    { id: 'order-tracking', labelEn: 'Track Order', labelAr: 'تتبع الطلب' },
    { id: 'about', labelEn: 'About Gulf Spring', labelAr: 'عن نبع الدرعية' },
    { id: 'gallery', labelEn: 'Gallery', labelAr: 'معرض الصور' },
    { id: 'contact', labelEn: 'Contact & Location', labelAr: 'تواصل وموقعنا' },
  ];

  const handleNavClick = (view: ViewMode) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-[#e8dfd3] shadow-xs transition-colors">
        {/* Top Info Bar */}
        <div className="bg-[#2c1d11] text-[#e8dfd3] text-xs py-1.5 px-4 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                {t('Diriyah Evening Bonfire Experience', 'أجواء شبة النار وجلسات الدرعية المسائية')}
              </span>
              <span className="opacity-40">|</span>
              <span className="text-[#d5c7b3]">
                {t('Everyday 3:30 PM – 7:00 AM', 'يومياً: ٣:٣٠ عصراً – ٧:٠٠ صباحاً')}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-amber-400" />
                <span dir="ltr">{settings.phone}</span>
              </a>
              <span className="opacity-40">|</span>
              <span className="flex items-center gap-1">
                ⭐ {settings.google_rating} ({settings.review_count.toLocaleString()}{' '}
                {t('reviews', 'تقييم')})
              </span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Name */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-start group cursor-pointer focus-visible:outline-hidden"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#2c1d11] flex items-center justify-center shadow-sm border border-[#4a2e1b]/30 group-hover:scale-105 transition-transform">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={settings.name_en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Coffee className="w-6 h-6 text-amber-200" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#2c1d11] font-serif leading-none">
                  {isRTL ? settings.name_ar : settings.name_en}
                </span>
                <span className="text-xs text-[#8c6d53] font-medium mt-1">
                  {isRTL ? settings.name_en : settings.name_ar} · {t('Diriyah', 'الدرعية')}
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer relative ${
                      isActive
                        ? 'text-[#4a2e1b] font-semibold'
                        : 'text-[#6b5849] hover:text-[#2c1d11]'
                    }`}
                  >
                    {isRTL ? link.labelAr : link.labelEn}
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-3 h-0.5 bg-[#8c532b] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Status, Cart, Language, Account */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live Hours Badge (desktop) */}
              <div className="hidden sm:block">
                <LiveStatusBadge compact />
              </div>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                title="Switch Language / تغيير اللغة"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#4a2e1b] bg-[#f2eae0] hover:bg-[#e8dfd3] rounded-lg transition-colors border border-[#ded3c3] cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#8c532b]" />
                <span>{language === 'ar' ? 'English' : 'العربية'}</span>
              </button>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-[#2c1d11] hover:bg-[#f2eae0] rounded-xl transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-[#ded3c3]"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#4a2e1b]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8c532b] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Account / Admin Menu */}
              {isAdmin ? (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-[#2c1d11] text-amber-300 hover:bg-[#4a2e1b] rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('Admin Suite', 'لوحة التحكم')}</span>
                </button>
              ) : user ? (
                <button
                  onClick={() => handleNavClick('profile')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-[#f2eae0] hover:bg-[#e8dfd3] text-[#2c1d11] rounded-lg text-xs font-semibold border border-[#ded3c3] transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#8c532b]" />
                  <span className="max-w-[100px] truncate">{user.full_name}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('login')}
                  className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t('Sign In', 'تسجيل الدخول')}</span>
                </button>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-[#2c1d11] hover:bg-[#f2eae0] rounded-xl transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#fdfbf7] border-b border-[#e8dfd3] px-4 pt-2 pb-6 space-y-3 shadow-lg">
            <div className="pt-2 pb-1">
              <LiveStatusBadge />
            </div>
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full text-start px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    currentView === link.id
                      ? 'bg-[#f2eae0] text-[#4a2e1b] font-bold'
                      : 'text-[#6b5849] hover:bg-[#f7f2ea]'
                  }`}
                >
                  {isRTL ? link.labelAr : link.labelEn}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[#e8dfd3] flex flex-col gap-2">
              {isAdmin ? (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#2c1d11] text-amber-300 rounded-xl font-semibold text-sm shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('Admin Suite', 'لوحة التحكم')}</span>
                </button>
              ) : user ? (
                <button
                  onClick={() => handleNavClick('profile')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#f2eae0] text-[#2c1d11] rounded-xl font-semibold text-sm border border-[#ded3c3]"
                >
                  <User className="w-4 h-4 text-[#8c532b]" />
                  <span>
                    {t('My Account & Orders', 'حسابي وطلباتي')} ({user.full_name})
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#4a2e1b] text-white rounded-xl font-semibold text-sm shadow-xs"
                >
                  <User className="w-4 h-4" />
                  <span>{t('Customer Sign In / Sign Up', 'تسجيل الدخول / إنشاء حساب')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
