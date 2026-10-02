import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Clock } from 'lucide-react';

export const LiveStatusBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkOpenStatus = () => {
      // Saudi Arabia Time is UTC+3
      const now = new Date();
      // Use local or calculate UTC+3
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentDec = hours + minutes / 60;

      // Gulf Spring is open every day from 15:30 (3:30 PM) through midnight to 07:00 (7:00 AM)
      // Open: currentDec >= 15.5 OR currentDec < 7.0
      const open = currentDec >= 15.5 || currentDec < 7.0;
      setIsOpen(open);
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isOpen
            ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-800 border border-amber-500/20'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
        />
        <span>{isOpen ? (isAr ? 'مفتوح الآن' : 'Open Now') : (isAr ? 'يفتح ٣:٣٠ م' : 'Opens 3:30 PM')}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
        isOpen
          ? 'bg-emerald-900/10 text-emerald-900 border border-emerald-800/20 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'bg-amber-900/10 text-amber-900 border border-amber-800/20 dark:bg-amber-950/40 dark:text-amber-300'
      }`}
    >
      <Clock className="w-4 h-4 opacity-80" />
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isOpen ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
        }`}
      />
      <span>
        {isOpen
          ? isAr
            ? 'مفتوح الآن · يغلق عند ٧:٠٠ صباحاً'
            : 'Open Now · Closes at 7:00 AM'
          : isAr
          ? 'مغلق حالياً · يفتح اليوم عند ٣:٣٠ عصراً'
          : 'Closed Now · Opens at 3:30 PM'}
      </span>
    </div>
  );
};
