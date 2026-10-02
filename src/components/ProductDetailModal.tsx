import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { BusinessSettings, Product, ProductExtra, ProductVariant } from '../types';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  Check,
  Zap,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  settings: BusinessSettings;
  onGoToCheckout: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  settings,
  onGoToCheckout,
}) => {
  const { language, isRTL, t } = useLanguage();
  const { addToCart } = useCart();

  if (!product) return null;

  const [activeImage, setActiveImage] = useState<string>(product.image_url);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<ProductVariant | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([]);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Pricing calculations
  const basePrice = selectedSize ? selectedSize.price : (product.discount_price || product.price);
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const itemUnitPrice = basePrice + extrasTotal;
  const totalPrice = itemUnitPrice * quantity;

  const toggleExtra = (extra: ProductExtra) => {
    if (selectedExtras.some((e) => e.name_en === extra.name_en)) {
      setSelectedExtras(selectedExtras.filter((e) => e.name_en !== extra.name_en));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedExtras);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 400);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedExtras);
    onClose();
    onGoToCheckout();
  };

  const handleWhatsAppSingleOrder = () => {
    const isAr = language === 'ar';
    const cleanPhone = settings.whatsapp.replace(/[^0-9]/g, '');
    const sizeStr = selectedSize ? ` (${isAr ? selectedSize.name_ar : selectedSize.name_en})` : '';
    const extrasStr = selectedExtras.length
      ? ` + ${selectedExtras.map((e) => (isAr ? e.name_ar : e.name_en)).join(', ')}`
      : '';

    const msg = isAr
      ? `مرحباً نبع الدرعيه، أود طلب: ${quantity}x ${product.name_ar}${sizeStr}${extrasStr} - المجموع: ${totalPrice} ر.س`
      : `Hello Gulf Spring, I would like to order: ${quantity}x ${product.name_en}${sizeStr}${extrasStr} - Total: SAR ${totalPrice}`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const allImages = product.images && product.images.length > 0
    ? [product.image_url, ...product.images.filter((img) => img !== product.image_url)]
    : [product.image_url];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#fdfbf7] rounded-3xl shadow-2xl overflow-hidden border border-[#e8dfd3] z-10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs text-stone-700 hover:text-stone-900 flex items-center justify-center shadow-xs hover:bg-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Gallery */}
          <div className="bg-[#f2eae0] p-4 sm:p-6 flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-inner bg-stone-200">
              <img
                src={activeImage}
                alt={product.name_en}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {product.discount_price && (
                <div className="absolute top-3 left-3 bg-[#8c532b] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {t('Special Offer', 'عرض خاص')}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img
                        ? 'border-[#8c532b] ring-2 ring-[#8c532b]/20 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="p-6 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div>
              <div className="mb-2">
                <span className="text-xs font-medium text-[#8c6d53] uppercase tracking-wider">
                  {isRTL ? 'نبع الدرعية' : 'Gulf Spring Diriyah'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#2c1d11] font-serif mt-0.5">
                  {isRTL ? product.name_ar : product.name_en}
                </h3>
                <p className="text-xs text-[#8c7463]">
                  {isRTL ? product.name_en : product.name_ar}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2.5 my-3">
                <span className="text-2xl font-bold text-[#4a2e1b]">
                  {itemUnitPrice} {t('SAR', 'ر.س')}
                </span>
                {product.discount_price && !selectedSize && (
                  <span className="text-sm text-stone-400 line-through">
                    {product.price} {t('SAR', 'ر.س')}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#6b5849] leading-relaxed mb-4">
                {isRTL ? product.description_ar : product.description_en}
              </p>

              {/* Sizes Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-[#2c1d11] mb-2 uppercase tracking-wide">
                    {t('Select Size / Serving', 'اختر الحجم أو التقديم')}:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.sizes.map((sz, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-start transition-all cursor-pointer ${
                          selectedSize?.name_en === sz.name_en
                            ? 'bg-[#f2eae0] border-[#8c532b] text-[#4a2e1b] font-bold shadow-xs'
                            : 'border-[#ded3c3] bg-white text-[#6b5849] hover:bg-[#faf7f2]'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{isRTL ? sz.name_ar : sz.name_en}</span>
                          <span className="text-[#8c532b] font-bold">{sz.price} {t('SAR', 'ر.س')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extras Selection */}
              {product.extras && product.extras.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-[#2c1d11] mb-2 uppercase tracking-wide">
                    {t('Add Extras / Customization', 'إضافات واختيارات خاصة')}:
                  </label>
                  <div className="space-y-1.5">
                    {product.extras.map((extra, idx) => {
                      const isSelected = selectedExtras.some((e) => e.name_en === extra.name_en);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleExtra(extra)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#f2eae0] border-[#8c532b] text-[#2c1d11]'
                              : 'bg-white border-[#ded3c3] text-[#6b5849] hover:bg-[#faf7f2]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                                isSelected
                                  ? 'bg-[#8c532b] border-[#8c532b] text-white'
                                  : 'border-stone-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <span>{isRTL ? extra.name_ar : extra.name_en}</span>
                          </div>
                          <span className="font-semibold text-[#8c532b]">
                            +{extra.price} {t('SAR', 'ر.س')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between py-3 border-y border-[#e8dfd3] my-4">
                <span className="text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                  {t('Quantity', 'الكمية')}:
                </span>
                <div className="flex items-center border border-[#ded3c3] rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-[#f2eae0] text-stone-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#2c1d11]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-[#f2eae0] text-stone-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.is_available}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer ${
                    product.is_available
                      ? addedAnimation
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#4a2e1b] hover:bg-[#2c1d11] text-white'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {product.is_available
                      ? addedAnimation
                        ? t('Added!', 'تمت الإضافة!')
                        : t('Add to Cart', 'أضف للسلة')
                      : t('Sold Out', 'غير متوفر')}
                  </span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!product.is_available}
                  className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#8c532b] hover:bg-[#703f1e] text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>{t('Instant Buy', 'شراء فوري')}</span>
                </button>
              </div>

              <button
                onClick={handleWhatsAppSingleOrder}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>{t('Order This on WhatsApp', 'اطلب هذا الصنف عبر الواتساب')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
