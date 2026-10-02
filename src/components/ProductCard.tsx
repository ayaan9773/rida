import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { Plus, ShoppingBag, Eye, MessageCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onOpenDetails: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  whatsappNumber: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categoryName,
  onOpenDetails,
  onInstantOrder,
  whatsappNumber,
}) => {
  const { isRTL, t } = useLanguage();
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.sizes && product.sizes.length > 0) {
      onOpenDetails(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleWhatsAppQuick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clean = whatsappNumber.replace(/[^0-9]/g, '');
    const priceText = product.discount_price || product.price;
    const msg = isRTL
      ? `مرحباً نبع الدرعيه، أود طلب: 1x ${product.name_ar} (${priceText} ر.س)`
      : `Hello Gulf Spring, I would like to order: 1x ${product.name_en} (SAR ${priceText})`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#e8dfd3] shadow-xs hover:shadow-xl hover:border-[#d5c7b3] transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#f2eae0]">
        <img
          src={product.image_url}
          alt={product.name_en}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {product.discount_price ? (
            <span className="bg-[#8c532b] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
              {t('Special Offer', 'عرض خاص')}
            </span>
          ) : product.is_featured ? (
            <span className="bg-[#2c1d11] text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
              ★ {t('Popular', 'مميز')}
            </span>
          ) : <span />}

          {!product.is_available && (
            <span className="bg-stone-800/90 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
              {t('Sold Out', 'نفد مؤقتاً')}
            </span>
          )}
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="p-2.5 rounded-full bg-white text-[#2c1d11] hover:scale-110 transition-transform shadow-md"
            title={t('Quick View', 'معاينة')}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleWhatsAppQuick}
            className="p-2.5 rounded-full bg-[#25D366] text-white hover:scale-110 transition-transform shadow-md"
            title={t('Order on WhatsApp', 'طلب واتساب')}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category kicker */}
          {categoryName && (
            <p className="text-[11px] font-medium text-[#8c6d53] uppercase tracking-wider mb-1">
              {categoryName}
            </p>
          )}

          <h3 className="text-base sm:text-lg font-bold text-[#2c1d11] font-serif leading-snug group-hover:text-[#8c532b] transition-colors">
            {isRTL ? product.name_ar : product.name_en}
          </h3>
          <p className="text-xs text-[#8c7463] mb-2 font-medium">
            {isRTL ? product.name_en : product.name_ar}
          </p>

          <p className="text-xs text-[#6b5849] line-clamp-2 leading-relaxed mb-4">
            {isRTL ? product.description_ar : product.description_en}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="pt-3 border-t border-[#f2eae0] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-[#4a2e1b]">
                {product.discount_price || product.price}{' '}
                <span className="text-xs font-normal">{t('SAR', 'ر.س')}</span>
              </span>
              {product.discount_price && (
                <span className="text-xs text-stone-400 line-through">
                  {product.price}
                </span>
              )}
            </div>
            {product.sizes && product.sizes.length > 0 && (
              <span className="text-[10px] text-[#8c7463]">
                {t('Sizes available', 'أحجام متعددة')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleQuickAdd}
              disabled={!product.is_available}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#f2eae0] hover:bg-[#e8dfd3] text-[#4a2e1b] rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              title={t('Add to Cart', 'أضف للسلة')}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('Add', 'أضف')}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onInstantOrder(product);
              }}
              disabled={!product.is_available}
              className="p-2 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              title={t('Order Now', 'اطلب الآن')}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
