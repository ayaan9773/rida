import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GalleryImage } from '../types';
import { X, ChevronLeft, ChevronRight, Sparkles, ZoomIn } from 'lucide-react';

interface GalleryPageProps {
  images: GalleryImage[];
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ images }) => {
  const { isRTL, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const categories = [
    { id: 'all', labelEn: 'All Photos', labelAr: 'جميع الصور' },
    { id: 'bonfire', labelEn: 'Bonfire & Fire Pit', labelAr: 'شبة النار والحطب' },
    { id: 'outdoor', labelEn: 'Outdoor Seating', labelAr: 'الجلسات الخارجية' },
    { id: 'tea', labelEn: 'Tea & Karak Pots', labelAr: 'الشاي والكرك' },
    { id: 'coffee', labelEn: 'Specialty Coffee', labelAr: 'القهوة المختصة' },
    { id: 'food', labelEn: 'Desserts & Food', labelAr: 'الحلويات والمأكولات' },
    { id: 'interior', labelEn: 'Cafe Interior', labelAr: 'الديكور الداخلي' },
    { id: 'evening', labelEn: 'Night Vibes', labelAr: 'أجواء الليل' },
  ];

  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter((img) => img.category === selectedCategory);

  const openLightbox = (index: number) => {
    setActiveLightboxIndex(index);
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const prevImage = () => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((activeLightboxIndex - 1 + filteredImages.length) % filteredImages.length);
  };

  const nextImage = () => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((activeLightboxIndex + 1) % filteredImages.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2eae0] text-[#8c532b] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('Gulf Spring Visual Atmosphere', 'معرض أجواء نبع الدرعية')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#2c1d11] font-serif">
          {isRTL ? 'معرض الصور والجلسات' : 'Cafe Atmosphere & Moments'}
        </h1>
        <p className="text-xs sm:text-base text-[#6b5849] leading-relaxed">
          {isRTL
            ? 'لقطات من ليالي نبع الدرعية الهادئة، شبة النار، أكواب القهوة المتقنة وبراريد الكرك المحضرة بكل عناية.'
            : 'Glimpses into cozy nights at Gulf Spring, the crackling firewood, handcrafted coffee extractions, and steaming Karak tea pots.'}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-center">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#4a2e1b] text-white shadow-md'
                  : 'bg-white text-[#6b5849] border border-[#ded3c3] hover:bg-[#faf7f2]'
              }`}
            >
              {isRTL ? cat.labelAr : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* Masonry / Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => openLightbox(idx)}
            className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl bg-[#f2eae0] border border-[#e8dfd3] cursor-pointer aspect-4/3 transition-all duration-300"
          >
            <img
              src={img.image_url}
              alt={img.title_en}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold font-serif">
                    {isRTL ? img.title_ar : img.title_en}
                  </p>
                  <p className="text-xs text-amber-200/80 capitalize">{img.category}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && filteredImages[activeLightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 z-50 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={prevImage}
            className="absolute left-4 sm:left-8 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextImage}
            className="absolute right-4 sm:right-8 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image & Caption */}
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={filteredImages[activeLightboxIndex].image_url}
              alt={filteredImages[activeLightboxIndex].title_en}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 text-center text-white space-y-1">
              <h3 className="text-lg font-bold font-serif">
                {isRTL
                  ? filteredImages[activeLightboxIndex].title_ar
                  : filteredImages[activeLightboxIndex].title_en}
              </h3>
              <p className="text-xs text-stone-400 capitalize">
                {filteredImages[activeLightboxIndex].category} · {activeLightboxIndex + 1} /{' '}
                {filteredImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
