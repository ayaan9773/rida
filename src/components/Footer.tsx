import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BusinessSettings, ViewMode } from '../types';
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  ExternalLink,
  Shield,
  Coffee,
} from 'lucide-react';

interface FooterProps {
  settings: BusinessSettings;
  onNavigate: (view: ViewMode) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const { language, isRTL, t } = useLanguage();

  const handleNav = (v: ViewMode) => {
    onNavigate(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappClean = settings.whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#1f140e] text-[#e8dfd3] pt-16 pb-12 border-t border-[#3a281a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#3a281a]">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4a2e1b] flex items-center justify-center border border-amber-900/40">
                <Coffee className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-white tracking-wide">
                  {isRTL ? settings.name_ar : settings.name_en}
                </h3>
                <p className="text-xs text-[#b8a28e]">
                  {isRTL ? settings.name_en : settings.name_ar}
                </p>
              </div>
            </div>

            <p className="text-sm text-[#b8a28e] leading-relaxed">
              {isRTL
                ? 'نبع الدرعية وجهة مميزة للقهوة والشاي في الدرعية بالرياض، حيث نقدم القهوة والشاي والمأكولات في أجواء مريحة وجميلة تناسب العائلة والأصدقاء مع شبة النار والمساء الهادئ.'
                : 'Gulf Spring is a cozy cafe and tea destination in historic Diriyah, Riyadh, offering specialty coffee, authentic tea, food, and an evening bonfire atmosphere for friends and families.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-[#b8a28e]">{t('Google Rating:', 'تقييم قوقل:')}</span>
              <div className="flex items-center gap-1.5 bg-[#2c1d11] px-2.5 py-1 rounded-md border border-[#4a2e1b] text-xs">
                <span className="text-amber-400 font-bold">★ {settings.google_rating}</span>
                <span className="text-[#8c7463]">/ 5</span>
                <span className="text-[#8c7463]">({settings.review_count.toLocaleString()})</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-200/90 mb-4">
              {t('Explore Gulf Spring', 'استكشف نبع الدرعية')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('Home', 'الرئيسية')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('menu')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('Specialty Menu', 'قائمة المشروبات والحلويات')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('About Gulf Spring', 'عن نبع الدرعية وتراثها')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('gallery')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('Atmosphere Gallery', 'معرض الصور والجلسات')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('Contact & Directions', 'الموقع وساعات العمل')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('my-orders')}
                  className="hover:text-white transition-colors cursor-pointer text-amber-300"
                >
                  {t('Track Your Order', 'تتبع حالة طلبك')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Address */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-200/90 mb-4">
              {t('Location & Hours', 'الموقع ومواعيد العمل')}
            </h4>
            <ul className="space-y-3.5 text-sm text-[#d5c7b3]">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {isRTL ? settings.address_ar : settings.address_en}
                  <br />
                  <span className="text-xs text-[#9d8572]">{t('Diriyah, Riyadh, Saudi Arabia', 'الدرعية، الرياض، المملكة العربية السعودية')}</span>
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">{t('Every Day', 'يومياً طوال الأسبوع')}</span>
                  <p className="text-xs text-[#d5c7b3] mt-0.5 font-sans" dir="ltr">
                    3:30 PM – 7:00 AM
                  </p>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    {t('Evening bonfire lighting after sunset', 'شبة النار متوفرة كل ليلة')}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & WhatsApp */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-200/90 mb-4">
              {t('Direct Orders & Support', 'الطلبات المباشرة والاستفسارات')}
            </h4>
            <div className="space-y-3">
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-950/60 border border-emerald-700/40 rounded-xl hover:bg-emerald-900/60 transition-colors text-emerald-200 text-sm"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{t('Order on WhatsApp', 'اطلب عبر الواتساب')}</span>
                  <span className="text-xs font-mono" dir="ltr">
                    {settings.whatsapp}
                  </span>
                </div>
              </a>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-3 p-3 bg-[#2c1d11] border border-[#4a2e1b] rounded-xl hover:bg-[#382618] transition-colors text-[#e8dfd3] text-sm"
              >
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-[#b8a28e]">{t('Call Cafe Directly', 'الاتصال الهاتفي')}</span>
                  <span className="font-mono text-xs sm:text-sm font-medium" dir="ltr">
                    {settings.phone}
                  </span>
                </div>
              </a>

              <a
                href={settings.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-[#2c1d11] border border-[#4a2e1b] rounded-xl hover:bg-[#382618] transition-colors text-xs text-[#e8dfd3]"
              >
                <span>{t('Get Directions in Google Maps', 'فتح الاتجاهات على خرائط قوقل')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal & Admin Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8c7463]">
          <p>
            © {new Date().getFullYear()} {isRTL ? settings.name_ar : settings.name_en}. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => handleNav('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t('Privacy Policy', 'سياسة الخصوصية')}
            </button>
            <span>·</span>
            <button
              onClick={() => handleNav('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t('Terms of Service', 'الشروط والأحكام')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
