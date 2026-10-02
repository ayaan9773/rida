import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BusinessSettings } from '../types';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppStickyProps {
  settings: BusinessSettings;
}

export const WhatsAppSticky: React.FC<WhatsAppStickyProps> = ({ settings }) => {
  const { language, isRTL, t } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(true);

  const cleanNumber = settings.whatsapp.replace(/[^0-9]/g, '');
  const greeting = language === 'ar'
    ? encodeURIComponent('السلام عليكم نبع الدرعيه، أود الاستفسار أو تقديم طلب')
    : encodeURIComponent('Hello Gulf Spring, I would like to inquire or place an order');

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${greeting}`;

  return (
    <div
      className={`fixed bottom-6 z-40 flex items-end gap-2.5 ${
        isRTL ? 'left-4 sm:left-6 flex-row-reverse' : 'right-4 sm:right-6'
      }`}
    >
      {/* Speech bubble tooltip */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-[#1f140e] text-white text-xs py-2 px-3.5 rounded-2xl shadow-xl border border-amber-900/40 animate-fade-in max-w-xs">
          <span>
            {t('Quick Order & Inquiries via WhatsApp', 'اطلب مباشرة عبر الواتساب')}
          </span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-stone-400 hover:text-white p-0.5"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 focus-visible:outline-hidden"
        aria-label="Order on WhatsApp"
        title={t('Order on WhatsApp: +966 55 707 0172', 'اطلب عبر الواتساب: ٠٥٥٧٠٧٠١٧٢')}
      >
        {/* Glow rings */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping opacity-75" />
        <MessageCircle className="w-7 h-7 relative z-10" />

        {/* Small notification dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full" />
      </a>
    </div>
  );
};
