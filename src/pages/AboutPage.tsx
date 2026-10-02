import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BusinessSettings, ViewMode } from '../types';
import { Flame, Coffee, Heart, Clock, MapPin, Sparkles } from 'lucide-react';

interface AboutPageProps {
  settings: BusinessSettings;
  onNavigate: (view: ViewMode) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onNavigate }) => {
  const { isRTL, t } = useLanguage();

  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2eae0] text-[#8c532b] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('Our Story & Philosophy', 'قصة نبع الدرعية وهويتنا')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#2c1d11] font-serif max-w-3xl mx-auto leading-tight">
          {isRTL
            ? 'نبع الدرعيه.. حيث تلتقي القهوة الأصيلة بدفء الجلسات'
            : 'Gulf Spring.. Where Authentic Tea & Coffee Meet Cozy Moments'}
        </h1>
        <p className="text-sm sm:text-lg text-[#6b5849] max-w-2xl mx-auto leading-relaxed">
          {isRTL
            ? 'نبع الدرعيه وجهة مميزة للقهوة والشاي في الدرعية بالرياض، حيث نقدم القهوة والشاي والمأكولات في أجواء مريحة وجميلة تناسب العائلة والأصدقاء.'
            : 'Gulf Spring is a cozy cafe and tea destination in Diriyah, Riyadh, offering coffee, tea, food and a relaxing atmosphere for friends, families and evening visitors.'}
        </p>
      </section>

      {/* Main Narrative with Photography */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-4/3 bg-[#f2eae0]">
            <img
              src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80"
              alt="Diriyah Cafe at Night"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
              <div className="text-white space-y-1">
                <p className="text-xs uppercase tracking-widest font-bold text-amber-300">
                  {t('Historic Diriyah', 'الدرعية التاريخية')}
                </p>
                <p className="text-lg font-serif font-bold">
                  {isRTL ? 'ليالي هادئة في أحضان الدرعية' : 'Quiet starlit evenings in historic Diriyah'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-[#4a2e1b]">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#2c1d11]">
              {isRTL
                ? 'أصالة الضيافة في العاصمة التاريخية'
                : 'Authentic Hospitality in the Heart of Diriyah'}
            </h2>
            <p className="text-sm sm:text-base text-[#6b5849] leading-relaxed">
              {isRTL
                ? 'تأسس نبع الدرعيه ليكون مكاناً دافئاً يجمع محبي الشاي والكرك وعشاق القهوة المختصة والقهوة السعودية في مكان واحد. حرصنا على توفير مساحة هادئة بجلسات خارجية مفتوحة وشبة نار تقليدية تُشعل كل ليلة لتعيد إحياء ليالي السمر العائلية وسهرات الأصدقاء.'
                : 'Gulf Spring was created to be a warm gathering place that unites lovers of traditional Karak tea, Saudi Khawlani coffee, and modern espresso creations. We dedicated our spacious outdoor patio and authentic firewood pit to rekindling the cherished tradition of evening conversations under the open sky.'}
            </p>
            <p className="text-sm sm:text-base text-[#6b5849] leading-relaxed">
              {isRTL
                ? 'نستقبلكم يومياً من الساعة ٣:٣٠ عصراً وحتى السابعة صباحاً، لنوفر لكم ملاذاً مثالياً للاسترخاء بعد يوم عمل، أو قضاء وقت مميز في عطلة نهاية الأسبوع.'
                : 'We welcome guests every day from 3:30 PM until 7:00 AM, providing an ideal haven to unwind after a busy day, catch up with dear friends, or savor late-night refreshments.'}
            </p>

            <div className="pt-2 flex gap-4">
              <button
                onClick={() => onNavigate('menu')}
                className="px-6 py-3 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                {t('Explore Menu', 'استعرض المنيو')}
              </button>
              <button
                onClick={() => onNavigate('gallery')}
                className="px-6 py-3 bg-[#f2eae0] hover:bg-[#e8dfd3] text-[#4a2e1b] rounded-xl text-sm font-bold border border-[#ded3c3] transition-all cursor-pointer"
              >
                {t('View Cafe Gallery', 'معرض الصور')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars: Tea & Coffee, Bonfire, Hours */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl p-8 border border-[#e8dfd3] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#faf5ee] border border-[#ded3c3] flex items-center justify-center text-[#8c532b]">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#2c1d11]">
              {t('Specialty & Traditional Brews', 'المشروبات المختصة والأصيلة')}
            </h3>
            <p className="text-xs sm:text-sm text-[#6b5849] leading-relaxed">
              {isRTL
                ? 'من حبوب البن المحمصة بعناية لطريقة V60 والإسبريسو، إلى براريد شاي الكرك بالهيل والزعفران ودلال القهوة السعودية مع التمر الفاخر.'
                : 'From carefully sourced single-origin beans for V60 pour-overs to saffron-scented Karak teapots and traditional Saudi coffee with Sukari dates.'}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl p-8 border border-[#e8dfd3] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#faf5ee] border border-[#ded3c3] flex items-center justify-center text-orange-600">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#2c1d11]">
              {t('The Bonfire Experience', 'شبة النار وسحر الشتاء')}
            </h3>
            <p className="text-xs sm:text-sm text-[#6b5849] leading-relaxed">
              {isRTL
                ? 'نوقد الحطب في الفناء الخارجي كل ليلة، لنمنحكم دفء الجلسات التراثية وتجربة شواء المارشميلو ومشاركة الأحاديث العفوية.'
                : 'Firewood logs are lit in our outdoor fire pit every evening, creating a cozy ambiance with marshmallow roasting sets and campfire hospitality.'}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-3xl p-8 border border-[#e8dfd3] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#faf5ee] border border-[#ded3c3] flex items-center justify-center text-emerald-700">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#2c1d11]">
              {t('Night Hours: 3:30 PM to 7:00 AM', 'أوقات المساء والصباح الباكر')}
            </h3>
            <p className="text-xs sm:text-sm text-[#6b5849] leading-relaxed">
              {isRTL
                ? 'أبوابنا مفتوحة طوال الليل وحتى ساعات الفجر الأولى، لتلائم جدولك في أي وقت ترغب فيه بفنجان قهوة أو براد شاي منعش.'
                : 'Open seven days a week from 3:30 PM through sunrise at 7:00 AM to fit your late-night gatherings and early morning cravings.'}
            </p>
          </div>
        </div>
      </section>

      {/* Address & Contact Summary Card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f7f2ea] rounded-3xl p-8 border border-[#ded3c3] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#4a2e1b] text-white flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6 text-amber-300" />
          </div>
          <h3 className="text-xl font-bold font-serif text-[#2c1d11]">
            {isRTL ? settings.name_ar : settings.name_en}
          </h3>
          <p className="text-sm text-[#6b5849]">
            {isRTL ? settings.address_ar : settings.address_en}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <a
              href={settings.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              {t('Open Google Maps', 'فتح خرائط قوقل')}
            </a>
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 bg-white text-[#4a2e1b] rounded-xl text-xs font-bold border border-[#ded3c3] hover:bg-stone-50 transition-all"
            >
              {t('Contact & Hours', 'ساعات العمل والتواصل')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
