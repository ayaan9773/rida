import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BusinessSettings, Order, OrderItem, OrderType, ViewMode, PaymentGateway } from '../types';
import { createOrder, getPaymentGateways } from '../lib/storage';
import {
  ShoppingBag,
  MessageCircle,
  CreditCard,
  Banknote,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Truck,
  UtensilsCrossed,
  Smartphone,
  Building,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface CheckoutPageProps {
  settings: BusinessSettings;
  onNavigate: (view: ViewMode) => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  settings,
  onNavigate,
  onOrderCompleted,
}) => {
  const { isRTL, t, language } = useLanguage();
  const { cart, subtotal, deliveryFee, total, clearCart, generateWhatsAppMessage } = useCart();
  const { user } = useAuth();

  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('gw_cash_counter');
  const [copiedIban, setCopiedIban] = useState(false);

  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  useEffect(() => {
    getPaymentGateways().then((res) => {
      const active = res.filter((g) => g.is_enabled);
      setGateways(active);
      if (active.length > 0) {
        setSelectedGatewayId(active[0].id);
      }
    }).catch(() => {});
  }, []);

  if (cart.length === 0 && !createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#f2eae0] flex items-center justify-center mx-auto text-[#8c532b]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-[#2c1d11]">
          {t('Your cart is empty', 'سلتك فارغة')}
        </h2>
        <p className="text-sm text-[#6b5849]">
          {t('Add some specialty coffee, tea, or desserts before checking out!', 'أضف بعض القهوة، الشاي، أو الحلويات للبدء بإتمام الطلب!')}
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="mt-4 px-6 py-3 bg-[#4a2e1b] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
        >
          {t('Explore Menu', 'تصفح المنيو')}
        </button>
      </div>
    );
  }

  const selectedGateway = gateways.find((g) => g.id === selectedGatewayId) || gateways[0];

  const handlePlaceWebsiteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert(t('Please enter your name and phone number', 'يرجى إدخال اسمك ورقم الجوال'));
      return;
    }

    setIsSubmitting(true);

    try {
      const items: OrderItem[] = cart.map((item) => ({
        product_id: item.product.id,
        product_name_en: item.product.name_en,
        product_name_ar: item.product.name_ar,
        price: item.unitPrice,
        quantity: item.quantity,
        size_name_en: item.selectedSize?.name_en,
        size_name_ar: item.selectedSize?.name_ar,
        extras: item.selectedExtras?.map((e) => e.name_ar || e.name_en).join(', '),
        item_total: item.totalPrice,
      }));

      const paymentLabel = selectedGateway ? (isRTL ? selectedGateway.name_ar : selectedGateway.name_en) : 'Cash';

      const newOrder = await createOrder({
        customer_id: user?.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        order_type: orderType,
        status: 'pending',
        table_number: orderType === 'dine_in' ? tableNumber : undefined,
        delivery_address: orderType === 'delivery' ? deliveryAddress : undefined,
        notes,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentLabel,
        items,
      });

      // Confetti celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8c532b', '#c99a6b', '#1f140e', '#25D366'],
        });
      } catch (err) {
        console.warn(err);
      }

      clearCart();
      setCreatedOrder(newOrder);
      onOrderCompleted(newOrder);
    } catch (e: any) {
      alert(e.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const text = generateWhatsAppMessage(customerName, customerPhone, orderType, notes, language as ('en' | 'ar'));
    const cleanPhone = settings.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 3000);
  };

  if (createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            {t('Order Placed Successfully!', 'تم استلام طلبك بنجاح!')}
          </span>
          <h1 className="text-3xl font-bold font-serif text-[#2c1d11]">
            {t('Thank You, ', 'شكراً لك، ')}{customerName}
          </h1>
          <p className="text-sm text-[#6b5849]">
            {t('Order Number:', 'رقم الطلب:')} <strong className="font-mono text-[#2c1d11]">#{createdOrder.order_number}</strong>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e8dfd3] shadow-xs text-start space-y-4">
          <h3 className="text-sm font-bold text-[#2c1d11] pb-2 border-b border-[#f2eae0]">
            {t('Order Details & Payment Instructions', 'تعليمات الدفع وتفاصيل الطلب')}
          </h3>
          <p className="text-xs text-[#6b5849] leading-relaxed">
            {selectedGateway?.type === 'manual' && selectedGateway.id.includes('bank') ? (
              <span>
                {t('Please transfer the total amount of', 'يرجى تحويل إجمالي المبلغ البالغ')} <strong>{createdOrder.total} ر.س</strong> {t('to our bank account using the IBAN provided. Send receipt on WhatsApp.', 'إلى حسابنا البنكي وإرسال الإيصال عبر الواتساب لتأكيد البدء بالتحضير.')}
              </span>
            ) : (
              <span>
                {t('Your order is being reviewed by our baristas and kitchen team. You can track live status anytime.', 'جاري مراجعة وتجهيز طلبك بواسطة فريق الباريستا والمطبخ في نبع الدرعية. يمكنك متابعة حالة التجهيز مباشرة.')}
              </span>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                onOrderCompleted(createdOrder);
                onNavigate('order-tracking');
              }}
              className="flex-1 py-3 bg-[#4a2e1b] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              {t('Track Live Status', 'تتبع حالة الطلب حي')}
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 py-3 bg-[#f2eae0] text-[#4a2e1b] rounded-xl text-xs font-bold cursor-pointer"
            >
              {t('Return to Home', 'العودة للرئيسية')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#8c532b] uppercase tracking-wider bg-[#f2eae0] px-3 py-1 rounded-full">
          {t('Secure Checkout', 'إتمام الطلب بأمان')}
        </span>
        <h1 className="text-3xl font-bold font-serif text-[#2c1d11]">
          {t('Complete Your Order', 'تأكيد طلبك في نبع الدرعية')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Details & Gateways */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs">
          <form onSubmit={handlePlaceWebsiteOrder} className="space-y-6">
            {/* Order Type Selection */}
            <div>
              <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-2">
                {t('Fulfillment Type', 'طريقة استلام الطلب')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer ${
                    orderType === 'pickup'
                      ? 'bg-[#4a2e1b] text-white border-[#4a2e1b] shadow-sm'
                      : 'bg-[#faf7f2] border-[#ded3c3] text-[#6b5849]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('Pickup', 'استلام من الكافيه')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('dine_in')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer ${
                    orderType === 'dine_in'
                      ? 'bg-[#4a2e1b] text-white border-[#4a2e1b] shadow-sm'
                      : 'bg-[#faf7f2] border-[#ded3c3] text-[#6b5849]'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>{t('Dine-In', 'جلسات الكافيه')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer ${
                    orderType === 'delivery'
                      ? 'bg-[#4a2e1b] text-white border-[#4a2e1b] shadow-sm'
                      : 'bg-[#faf7f2] border-[#ded3c3] text-[#6b5849]'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>{t('Delivery', 'توصيل منزلي')}</span>
                </button>
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                  {t('Full Name', 'الاسم الكامل')} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('e.g. Abdullah Al-Diriyah', 'مثال: عبدالله الدرعية')}
                  className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Mobile Number', 'رقم الجوال')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+966 5X XXX XXXX"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Email (Optional)', 'البريد الإلكتروني (اختياري)')}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                  />
                </div>
              </div>

              {orderType === 'dine_in' && (
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Table Number / Area', 'رقم الطاولة أو الجلسة')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder={t('e.g. Table 4 / Patio Bonfire 2', 'مثال: طاولة ٤ أو جلسة شبة النار ٢')}
                    className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                  />
                </div>
              )}

              {orderType === 'delivery' && (
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Delivery Address in Diriyah/Riyadh', 'عنوان التوصيل بالدرعية / الرياض')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder={t('District, Street name, House/Building', 'الحي، اسم الشارع، رقم المنزل/المبنى')}
                    className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                  {t('Special Instructions / Notes', 'ملاحظات خاصة على التحضير')}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('e.g. Extra hot karak, sugar on the side...', 'مثال: كرك حار جداً، سكر قليل...')}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b] resize-none"
                />
              </div>
            </div>

            {/* Payment Gateways Configured by Admin */}
            <div className="space-y-3 pt-2 border-t border-[#f2eae0]">
              <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-2">
                {t('Select Payment Gateway', 'اختر طريقة وبوابة الدفع')} *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gateways.map((gw) => {
                  const isSelected = selectedGatewayId === gw.id;
                  return (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setSelectedGatewayId(gw.id)}
                      className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#f2eae0] border-[#8c532b] shadow-sm text-[#4a2e1b]'
                          : 'bg-[#faf7f2] border-[#ded3c3] text-[#6b5849] hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#2c1d11]">
                          {isRTL ? gw.name_ar : gw.name_en}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          gw.type === 'automatic' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {gw.type === 'automatic' ? t('Online', 'إلكتروني') : t('Manual', 'يدوي')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8c7463] line-clamp-1">
                        {isRTL ? gw.description_ar : gw.description_en}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* If Bank Transfer is selected, show IBAN & instructions */}
              {selectedGateway && selectedGateway.type === 'manual' && selectedGateway.iban && (
                <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ded3c3] space-y-3 mt-4 text-xs">
                  <div className="font-bold text-[#2c1d11]">
                    {isRTL ? selectedGateway.bank_name_ar : selectedGateway.bank_name_en} - {selectedGateway.account_name}
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#ded3c3]">
                    <span className="font-mono font-bold text-sm" dir="ltr">{selectedGateway.iban}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedGateway.iban || '')}
                      className="px-3 py-1.5 bg-[#4a2e1b] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedIban ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIban ? t('Copied!', 'تم النسخ!') : t('Copy IBAN', 'نسخ الآيبان')}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8c7463]">
                    {isRTL ? selectedGateway.instructions_ar : selectedGateway.instructions_en}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? t('Confirming Order...', 'جاري تأكيد الطلب...')
                    : `${t('Confirm & Place Order', 'تأكيد وإرسال الطلب')} (${total} ${t('SAR', 'ر.س')})`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#1faa52] text-white rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('Place Order Directly via WhatsApp', 'إرسال الطلب مباشرة بالواتساب')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#f7f2ea] rounded-3xl p-6 border border-[#ded3c3] space-y-4">
            <h3 className="text-base font-bold font-serif text-[#2c1d11] pb-3 border-b border-[#ded3c3]">
              {t('Order Summary', 'ملخص الطلب')} ({cart.length})
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-2 text-xs">
                  <div>
                    <span className="font-bold text-[#2c1d11]">
                      {item.quantity}x {isRTL ? item.product.name_ar : item.product.name_en}
                    </span>
                    {item.selectedSize && (
                      <div className="text-[10px] text-stone-500">
                        {isRTL ? item.selectedSize.name_ar : item.selectedSize.name_en}
                      </div>
                    )}
                  </div>
                  <span className="font-bold font-mono text-[#2c1d11]">{item.totalPrice} ر.س</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#ded3c3] space-y-2 text-xs">
              <div className="flex justify-between text-[#6b5849]">
                <span>{t('Subtotal', 'المجموع الفرعي')}</span>
                <span className="font-mono font-bold text-[#2c1d11]">{subtotal} ر.س</span>
              </div>
              <div className="flex justify-between text-[#6b5849]">
                <span>{t('Delivery & Service Fee', 'رسوم الخدمة والتوصيل')}</span>
                <span className="font-mono font-bold text-[#2c1d11]">
                  {deliveryFee === 0 ? t('Free', 'مجاناً') : `${deliveryFee} ر.س`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#2c1d11] pt-3 border-t border-[#ded3c3]">
                <span>{t('Total Amount', 'المجموع الكلي')}</span>
                <span className="font-serif text-[#8c532b]">{total} ر.س</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
