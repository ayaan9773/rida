import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BusinessSettings, Category, Product, ViewMode } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, Flame, Coffee, Sparkles } from 'lucide-react';

interface MenuPageProps {
  products: Product[];
  categories: Category[];
  settings: BusinessSettings;
  onOpenDetails: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  onNavigate: (view: ViewMode) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  products,
  categories,
  settings,
  onOpenDetails,
  onInstantOrder,
}) => {
  const { language, isRTL, t } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);

  const activeCategories = categories.filter((c) => c.is_active);

  const filteredProducts = products.filter((p) => {
    if (!p.is_available) return false;
    if (selectedCategoryId !== 'all' && p.category_id !== selectedCategoryId) return false;
    if (onlyFeatured && !p.is_featured) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = p.name_en.toLowerCase().includes(q) || p.description_en.toLowerCase().includes(q);
      const matchAr = p.name_ar.toLowerCase().includes(q) || p.description_ar.toLowerCase().includes(q);
      return matchEn || matchAr;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2eae0] text-[#8c532b] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('Gulf Spring Signature Menu', 'قائمة نبع الدرعية المميزة')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#2c1d11] font-serif">
          {isRTL ? 'قائمة القهوة، الشاي والحلويات' : 'Coffee, Tea & Desserts Menu'}
        </h1>
        <p className="text-xs sm:text-base text-[#6b5849] leading-relaxed">
          {isRTL
            ? 'تذوق النكهات الأصيلة المحضرة بعناية من الشاي والكرك على الجمر والقهوة السعودية المختصة، مع أشهى حلويات الدرعية والمأكولات الخفيفة.'
            : 'Explore our handcrafted selection of specialty coffees, fire-brewed karak tea pots, traditional Saudi blends, and fresh artisanal desserts.'}
        </p>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              'Search coffee, tea, desserts, date pudding...',
              'ابحث عن قهوة، كرك، شاي، بودينغ تمر، حلويات...'
            )}
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-[#ded3c3] text-sm text-[#2c1d11] focus:outline-hidden focus:border-[#8c532b] focus:ring-2 focus:ring-[#8c532b]/20 shadow-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-xs text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-center">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-[#4a2e1b] text-white shadow-md'
                : 'bg-white text-[#6b5849] border border-[#ded3c3] hover:bg-[#faf7f2]'
            }`}
          >
            {t('All Items', 'الكل')} ({products.filter((p) => p.is_available).length})
          </button>

          {activeCategories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id && p.is_available).length;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4a2e1b] text-white shadow-md'
                    : 'bg-white text-[#6b5849] border border-[#ded3c3] hover:bg-[#faf7f2]'
                }`}
              >
                <span>{isRTL ? cat.name_ar : cat.name_en}</span>
                <span className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setOnlyFeatured(!onlyFeatured)}
            className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
              onlyFeatured
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
            }`}
          >
            <span>★ {t('Popular Only', 'المميزة فقط')}</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#ded3c3] p-8 space-y-3">
          <Coffee className="w-12 h-12 text-[#8c6d53] mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-[#2c1d11]">
            {t('No menu items match your search', 'لم يتم العثور على أصناف مطابقة')}
          </h3>
          <p className="text-xs text-[#8c7463]">
            {t('Try clearing filters or search for another keyword', 'جرب البحث بكلمة أخرى أو مسح التصفية')}
          </p>
          <button
            onClick={() => {
              setSelectedCategoryId('all');
              setSearchQuery('');
              setOnlyFeatured(false);
            }}
            className="mt-4 px-4 py-2 bg-[#4a2e1b] text-white rounded-xl text-xs font-bold"
          >
            {t('Reset Filters', 'إعادة ضبط الفلاتر')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const cat = categories.find((c) => c.id === product.category_id);
            const catName = cat ? (isRTL ? cat.name_ar : cat.name_en) : undefined;
            return (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={catName}
                onOpenDetails={onOpenDetails}
                onInstantOrder={onInstantOrder}
                whatsappNumber={settings.whatsapp}
              />
            );
          })}
        </div>
      )}

      {/* Bonfire Special Banner in Menu */}
      <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#2c1d11] to-[#4a2e1b] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-amber-900/50">
        <div className="space-y-2 text-center md:text-start">
          <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>{t('Diriyah Evening Gathering', 'شبة النار وسهرة الدرعية')}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif">
            {t('Looking for a Cozy Outdoor Table?', 'هل ترغب بحجز جلسة حطب وشواء مارشميلو؟')}
          </h3>
          <p className="text-xs sm:text-sm text-[#d5c7b3] max-w-xl">
            {t(
              'Our outdoor fire pits and patio are prepared every evening. Order online or contact us via WhatsApp for instant arrangements.',
              'جلسات الحطب الخارجية مهيأة لكم كل ليلة. يمكنك الطلب الآن أو مراسلتنا مباشرة على الواتساب.'
            )}
          </p>
        </div>

        <a
          href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            isRTL
              ? 'مرحباً نبع الدرعيه، أود الاستفسار عن توفر جلسة خارجية مع شبة النار'
              : 'Hello Gulf Spring, I would like to inquire about outdoor seating with the bonfire'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-105 shrink-0"
        >
          {t('Inquire via WhatsApp', 'استفسر عبر الواتساب')}
        </a>
      </div>
    </div>
  );
};
