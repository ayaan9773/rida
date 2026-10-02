import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BusinessSettings, Category, Product, ViewMode, CustomerReview } from '../types';
import { getCustomerReviews } from '../lib/storage';
import { ProductCard } from '../components/ProductCard';
import { LiveStatusBadge } from '../components/LiveStatusBadge';
import {
  Coffee,
  Flame,
  Moon,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  Star,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface HomePageProps {
  settings: BusinessSettings;
  products: Product[];
  categories: Category[];
  onNavigate: (view: ViewMode) => void;
  onOpenProductDetails: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  products,
  categories,
  onNavigate,
  onOpenProductDetails,
  onInstantOrder,
}) => {
  const { language, isRTL, t } = useLanguage();
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);

  useEffect(() => {
    getCustomerReviews().then(setCustomerReviews).catch(() => {});
  }, []);

  const featuredProducts = products.filter((p) => p.is_featured && p.is_available);
  const cleanPhone = settings.whatsapp.replace(/[^0-9]/g, '');

  const highlights = [
    {
      icon: <Coffee className="w-6 h-6 text-amber-700" />,
      titleEn: 'Specialty Coffee',
      titleAr: 'قهوة مختصة',
      descEn: 'Artisan single-origin V60, balanced espresso, Spanish latte and velvety flat whites.',
      descAr: 'محاصيل إثيوبية وكولومبية فاخرة، تقطير V60، دبل شوت إسبريسو وسبانش لاتيه غني.',
    },
    {
      icon: <span className="text-2xl">🍵</span>,
      titleEn: 'Tea & Karak',
      titleAr: 'الشاي والكرك',
      descEn: 'Authentic fire-brewed Karak pots infused with saffron and Moroccan spearmint tea.',
      descAr: 'براريد كرك مطبوخة بالهيل والزعفران، وشاي مغربي منعش بالنعناع الفريش.',
    },
    {
      icon: <span className="text-2xl">🥐</span>,
      titleEn: 'Food & Desserts',
      titleAr: 'مأكولات وحلويات',
      descEn: 'Warm Diriyah date pudding, royal saffron milk cakes, and freshly baked savory pastries.',
      descAr: 'بودينغ التمر الدافئ مع الآيسكريم، كيك الزعفران الملكي، وكرواسون الحلوم المشوي.',
    },
    {
      icon: <Flame className="w-6 h-6 text-orange-600 animate-pulse" />,
      titleEn: 'Bonfire Experience',
      titleAr: 'شبة النار التراثية',
      descEn: 'Traditional firewood pit and marshmallow roasting under the clear desert evening sky.',
      descAr: 'جلسات الحطب الحية وشواء المارشميلو حول شبة النار في ليالي الدرعية الهادئة.',
    },
    {
      icon: <Moon className="w-6 h-6 text-indigo-700" />,
      titleEn: 'Evening Atmosphere',
      titleAr: 'أجواء ليلية ساحرة',
      descEn: 'Open all night until 7:00 AM. Cozy ambient lighting, warmth, and friendly gatherings.',
      descAr: 'مفتوح طوال الليل حتى السابعة صباحاً. إضاءات فوانيس مريحة وجلسات ممتعة.',
    },
    {
      icon: <span className="text-2xl">🌿</span>,
      titleEn: 'Outdoor Seating',
      titleAr: 'جلسات خارجية رحبة',
      descEn: 'Spacious outdoor patio with traditional rugs, desert breezes, and private corners.',
      descAr: 'فناء خارجي رحب بإطلالة مميزة ونسيم الدرعية العليل وجلسات عائلية مريحة.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION - Mobile Responsive & Compact */}
      {settings.show_hero && (
        <section className="relative min-h-[55vh] sm:min-h-[75vh] flex items-center justify-center overflow-hidden bg-[#1f140e] text-white">
          {/* Background Image with warm overlay */}
          <div className="absolute inset-0">
            <img
              src={settings.hero_image_url}
              alt="Gulf Spring Diriyah Cafe"
              className="w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Multi-layer warm gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f140e] via-[#1f140e]/60 to-black/40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-black/70" />
          </div>

          {/* Floating Subtle Ambient Elements */}
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-orange-700/10 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Content Box */}
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center z-10 space-y-4 sm:space-y-6">
            {/* Live Open Status Pill */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-medium shadow-lg">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>{t('Diriyah, Riyadh', 'الدرعية، الرياض')}</span>
                <span className="opacity-40">·</span>
                <LiveStatusBadge compact />
              </div>
            </div>

            {/* Arabic Primary Brand Title */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif drop-shadow-md text-[#faf5ee]">
                {isRTL ? settings.hero_title_ar : settings.hero_title_en}
              </h1>
              <p className="text-lg sm:text-2xl font-light text-amber-200/90 font-serif">
                {isRTL ? settings.hero_title_en : settings.hero_title_ar}
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-[#e8dfd3] max-w-xl mx-auto font-light leading-relaxed drop-shadow-sm">
              {isRTL ? settings.hero_subtitle_ar : settings.hero_subtitle_en}
            </p>

            {/* 4 Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto">
              {/* 1. View Menu */}
              <button
                onClick={() => onNavigate('menu')}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#4a2e1b] hover:bg-[#362113] text-[#faf5ee] rounded-xl font-bold text-xs sm:text-sm border border-amber-700/40 shadow-xl hover:scale-105 transition-all cursor-pointer"
              >
                <span>{t('View Menu', 'تصفح المنيو')}</span>
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              {/* 2. Track Order */}
              <button
                onClick={() => onNavigate('order-tracking')}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#faf7f2]/10 hover:bg-[#faf7f2]/20 text-amber-200 rounded-xl font-bold text-xs sm:text-sm border border-amber-500/30 backdrop-blur-xs transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>{t('Track Order', 'تتبع الطلب')}</span>
              </button>

              {/* 3. WhatsApp Direct */}
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xl transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('WhatsApp', 'واتساب')}</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 2. HIGHLIGHTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-[#8c532b] uppercase tracking-wider bg-[#f2eae0] px-3 py-1 rounded-full">
            {t('The Gulf Spring Experience', 'تجربة نبع الدرعية')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#2c1d11]">
            {t('Where Tradition Meets Specialty Coffee', 'حيث أصالة التراث تلتقي بالقهوة المختصة')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs hover:border-[#8c532b]/40 transition-all space-y-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#f2eae0] flex items-center justify-center group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold font-serif text-[#2c1d11]">
                {isRTL ? item.titleAr : item.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-[#8c7463] leading-relaxed">
                {isRTL ? item.descAr : item.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#8c532b] uppercase tracking-wider">
                {t('Barista Specials', 'ترشيحات الباريستا')}
              </span>
              <h2 className="text-3xl font-bold font-serif text-[#2c1d11]">
                {isRTL ? 'المشروبات والحلويات الأكثر طلباً' : 'Featured Menu Favorites'}
              </h2>
            </div>

            <button
              onClick={() => onNavigate('menu')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8c532b] hover:text-[#4a2e1b] cursor-pointer"
            >
              <span>{t('View Full Menu', 'استعرض المنيو كاملًا')}</span>
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={onOpenProductDetails}
                onInstantOrder={onInstantOrder}
                whatsappNumber={settings.whatsapp}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. SPECIAL EXPERIENCE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#2c1d11] text-white p-8 sm:p-14 border border-amber-900/40">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1600&q=80"
              alt="Night backdrop"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>{t('Evening Bonfire & Tea Platter', 'شبة النار والمارشميلو مع براد الشاي')}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-serif leading-tight">
              {isRTL
                ? 'جلسات الحطب والمساء.. تجربة لا تُنسى في الدرعية'
                : 'Firewood Bonfire & Cozy Nights.. An Unforgettable Diriyah Night'}
            </h2>

            <p className="text-sm sm:text-base text-[#e8dfd3] leading-relaxed">
              {isRTL
                ? 'استمتع بدفء النار وأصوات الحطب مع براد شاي كرك ساخن وشواء المارشميلو بين يديك. جلساتنا الخارجية في نبع الدرعية مصممة لتمنحك ولأحبائك أجواء هادئة تسلب تعب اليوم.'
                : 'Enjoy the warmth of genuine firewood embers, hot Karak tea, and toasted marshmallows under the Riyadh night sky. Our outdoor patio in Gulf Spring is crafted for peaceful moments and cherished conversations.'}
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('menu')}
                className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                {t('Order Bonfire Gathering Set (SAR 68)', 'اطلب بكج شبة النار (٦٨ ر.س)')}
              </button>
              <button
                onClick={() => onNavigate('gallery')}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm border border-white/20 transition-colors cursor-pointer"
              >
                {t('View Photo Gallery', 'شاهد صور الجلسات')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REVIEWS SUMMARY & CUSTOMER TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e8dfd3] shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pb-8 border-b border-[#f2eae0]">
            {/* Rating Score */}
            <div className="text-center md:text-start space-y-2 border-b md:border-b-0 md:border-e border-[#e8dfd3] pb-6 md:pb-0 md:pe-8">
              <span className="text-xs font-bold text-[#8c532b] uppercase tracking-wider">
                {t('Google Reviews Summary', 'ملخص تقييمات قوقل')}
              </span>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-5xl font-black text-[#2c1d11] font-serif">
                  {settings.google_rating}
                </span>
                <span className="text-xl text-[#8c7463]">/ 5</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500">
                {'★'.repeat(Math.round(settings.google_rating))}
                <span className="text-stone-300">★</span>
              </div>
              <p className="text-xs text-[#8c7463]">
                {t('Based on', 'بناءً على')}{' '}
                <span className="font-bold text-[#2c1d11]">
                  {settings.review_count.toLocaleString()}
                </span>{' '}
                {t('verified reviews on Google Maps', 'تقييم موثق على خرائط قوقل')}
              </p>
            </div>

            {/* Authentic rating highlights */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-[#2c1d11] font-serif">
                {isRTL
                  ? 'ما يفضله زوار نبع الدرعيه:'
                  : 'What guests appreciate at Gulf Spring:'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#6b5849]">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#faf7f2] border border-[#e8dfd3]">
                  <span className="text-amber-600 font-bold text-base mt-[-2px]">✔</span>
                  <span>
                    {isRTL
                      ? 'جلسات الحطب الخارجية وشبة النار في الأجواء الشتوية'
                      : 'Outdoor bonfire seating and firewood warmth in cooler evenings'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#faf7f2] border border-[#e8dfd3]">
                  <span className="text-amber-600 font-bold text-base mt-[-2px]">✔</span>
                  <span>
                    {isRTL
                      ? 'شاي الكرك الموزون والشاي المغربي بالنعناع على الجمر'
                      : 'Flavorful traditional Karak tea and fire-brewed Moroccan mint'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#faf7f2] border border-[#e8dfd3]">
                  <span className="text-amber-600 font-bold text-base mt-[-2px]">✔</span>
                  <span>
                    {isRTL
                      ? 'ساعات عمل استثنائية طوال الليل حتى السابعة صباحاً'
                      : 'Convenient opening hours all night through 7:00 AM'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#faf7f2] border border-[#e8dfd3]">
                  <span className="text-amber-600 font-bold text-base mt-[-2px]">✔</span>
                  <span>
                    {isRTL
                      ? 'موقع مميز وسهل الوصول في محافظة الدرعية التاريخية'
                      : 'Prime location and easy access in historic Diriyah'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Submitted from Dashboard */}
          <div className="pt-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#2c1d11]">
                  {t('Verified Customer Testimonials', 'آراء وتقييمات العملاء الموثقة')}
                </h3>
                <p className="text-xs text-[#8c7463]">
                  {t('Submitted directly from our valued guests', 'تمت كتابتها وإرسالها مباشرة من زوارنا الكرام')}
                </p>
              </div>

              <button
                onClick={() => onNavigate('profile')}
                className="px-4 py-2 bg-[#f2eae0] hover:bg-[#e8dfd3] text-[#4a2e1b] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t('★ Rate Us From Your Account', '★ أضف تقييمك من حسابك')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customerReviews.slice(0, 3).map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl bg-[#faf7f2] border border-[#e8dfd3] space-y-3 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#2c1d11]">{rev.customer_name}</span>
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>
                  {rev.favorite_item && (
                    <span className="inline-block text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                      {rev.favorite_item}
                    </span>
                  )}
                  <p className="text-xs text-[#6b5849] leading-relaxed">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
