import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { BusinessSettings, ViewMode } from '../types';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Coffee,
} from 'lucide-react';

interface CartDrawerProps {
  settings: BusinessSettings;
  onNavigate: (view: ViewMode) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ settings, onNavigate }) => {
  const { language, isRTL, t } = useLanguage();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    total,
    isCartOpen,
    setIsCartOpen,
    clearCart,
    generateWhatsAppMessage,
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onNavigate('checkout');
  };

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage(
      t('Customer', 'عميل نبع الدرعية'),
      '',
      t('Pickup / Dine-in', 'استلام من الكافيه / طلب داخلي'),
      '',
      language
    );
    const cleanPhone = settings.whatsapp.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div
        className={`fixed inset-y-0 max-w-full flex ${
          isRTL ? 'left-0' : 'right-0'
        } pl-0 sm:pl-10`}
      >
        <div className="w-screen max-w-md bg-[#fdfbf7] shadow-2xl flex flex-col border-s border-[#e8dfd3]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#e8dfd3] flex items-center justify-between bg-[#f7f2ea]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#8c532b]" />
              <h2 className="text-lg font-bold text-[#2c1d11] font-serif">
                {t('Your Order', 'سلة الطلبات')}
              </h2>
              <span className="text-xs bg-[#e8dfd3] text-[#4a2e1b] font-bold px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-[#8c6d53] hover:text-red-700 transition-colors p-1"
                  title={t('Clear Cart', 'إفراغ السلة')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#8c7463]">
                <div className="w-16 h-16 rounded-full bg-[#f2eae0] flex items-center justify-center mb-4 text-[#8c532b]">
                  <Coffee className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-[#2c1d11]">
                  {t('Your cart is empty', 'سلتك فارغة حالياً')}
                </h3>
                <p className="text-xs text-[#8c7463] mt-1 max-w-xs">
                  {t(
                    'Explore our specialty coffee, karak tea and warm date desserts in Diriyah!',
                    'تصفح قائمتنا لتجربة قهوة مختصة وشاي كرك وحلويات التمر اللذيذة!'
                  )}
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('menu');
                  }}
                  className="mt-6 px-5 py-2.5 bg-[#4a2e1b] text-white rounded-xl text-xs font-semibold hover:bg-[#2c1d11] transition-colors shadow-xs"
                >
                  {t('Explore Menu', 'تصفح المنيو')}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-white border border-[#e8dfd3] shadow-xs hover:border-[#d5c7b3] transition-colors"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.name_en}
                    className="w-18 h-18 rounded-xl object-cover shrink-0 bg-[#f2eae0]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#2c1d11] truncate">
                        {isRTL ? item.product.name_ar : item.product.name_en}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {item.selectedSize && (
                      <p className="text-xs text-[#8c6d53] mt-0.5">
                        {isRTL ? item.selectedSize.name_ar : item.selectedSize.name_en}
                      </p>
                    )}

                    {item.selectedExtras && item.selectedExtras.length > 0 && (
                      <p className="text-xs text-[#8c6d53]">
                        + {item.selectedExtras.map((e) => (isRTL ? e.name_ar : e.name_en)).join(', ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f2eae0]">
                      <div className="flex items-center border border-[#ded3c3] rounded-lg overflow-hidden bg-[#faf7f2]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#e8dfd3] text-stone-700 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#2c1d11]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#e8dfd3] text-stone-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-end">
                        <span className="text-sm font-bold text-[#4a2e1b]">
                          {item.totalPrice} <span className="text-xs font-normal">{t('SAR', 'ر.س')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Totals & Action Buttons */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#f7f2ea] border-t border-[#e8dfd3] space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#8c7463]">
                  <span>{t('Subtotal', 'المجموع الفرعي')}</span>
                  <span className="font-semibold text-[#2c1d11]">
                    {subtotal} {t('SAR', 'ر.س')}
                  </span>
                </div>
                <div className="flex justify-between text-[#8c7463]">
                  <span>{t('Tax & Service', 'الضريبة والخدمة')}</span>
                  <span className="text-xs text-emerald-700 font-medium">
                    {t('Included in prices', 'شاملة بالأسعار')}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#2c1d11] pt-2 border-t border-[#e8dfd3]">
                  <span>{t('Total', 'الإجمالي')}</span>
                  <span className="text-lg text-[#8c532b]">
                    {total} {t('SAR', 'ر.س')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {/* 1. Website Order */}
                <button
                  onClick={handleCheckoutClick}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <span>{t('Proceed to Checkout', 'إتمام الطلب من الموقع')}</span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>

                {/* 2. WhatsApp Direct Order */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#1faa52] text-white rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('Order Directly via WhatsApp', 'طلب فوري عبر الواتساب')}</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-[#8c7463]">
                {t(
                  'Pickup at cafe in Diriyah or Dine-in available',
                  'الاستلام من الفرع بالدرعية أو الجلوس متوفر'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
