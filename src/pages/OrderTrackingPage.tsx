import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BusinessSettings, Order, OrderStatus, ViewMode } from '../types';
import {
  Clock,
  CheckCircle2,
  Coffee,
  PackageCheck,
  ShoppingBag,
  Phone,
  MessageCircle,
  AlertCircle,
  Printer,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
} from 'lucide-react';

interface OrderTrackingPageProps {
  order: Order | null;
  allOrders: Order[];
  settings: BusinessSettings;
  onNavigate: (view: ViewMode) => void;
  onSelectOrder: (order: Order) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  order,
  allOrders,
  settings,
  onNavigate,
  onSelectOrder,
}) => {
  const { isRTL, t } = useLanguage();
  const [searchNum, setSearchNum] = useState('');
  const [searchFeedback, setSearchFeedback] = useState('');

  const activeOrder = order || (allOrders.length > 0 ? allOrders[0] : null);

  const steps: { key: OrderStatus; labelEn: string; labelAr: string; icon: any }[] = [
    { key: 'pending', labelEn: 'Received', labelAr: 'تم الاستلام', icon: Clock },
    { key: 'confirmed', labelEn: 'Confirmed', labelAr: 'مؤكد', icon: CheckCircle2 },
    { key: 'preparing', labelEn: 'Brewing & Baking', labelAr: 'جاري التحضير', icon: Coffee },
    { key: 'ready', labelEn: 'Ready for You', labelAr: 'جاهز للاستلام', icon: PackageCheck },
    { key: 'completed', labelEn: 'Completed', labelAr: 'مكتمل', icon: ShoppingBag },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFeedback('');
    if (!searchNum.trim()) return;

    const q = searchNum.trim().toLowerCase();
    const found = allOrders.find(
      (o) =>
        o.order_number.toLowerCase() === q ||
        o.customer_phone.includes(q) ||
        o.customer_name.toLowerCase().includes(q)
    );

    if (found) {
      onSelectOrder(found);
      setSearchFeedback('');
    } else {
      setSearchFeedback(
        t('Order not found. Check order number or browse recent orders below.', 'لم يتم العثور على طلب بهذا الرقم. تأكد من الرقم أو اختر من الطلبات أدناه.')
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = settings.whatsapp.replace(/[^0-9]/g, '');
  const currentStepIdx = activeOrder ? getStepIndex(activeOrder.status) : 0;
  const isCancelled = activeOrder?.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2eae0] text-[#8c532b] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('Live Kitchen & Barista Tracking', 'التتبع المباشر لطلبات المطبخ والبار')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#2c1d11]">
          {t('Track Your Order Live', 'تتبع حالة طلبك في نبع الدرعية')}
        </h1>
        <p className="text-xs sm:text-sm text-[#6b5849]">
          {t(
            'Track your coffee, tea and desserts from the moment they are ordered until they are served fresh.',
            'تابع تجهيز قهوتك، الشاي والحلويات من لحظة تأكيد الطلب حتى استلامها طازجة وساخنة.'
          )}
        </p>

        {/* Global Order Search Form */}
        <form onSubmit={handleSearch} className="pt-2 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchNum}
              onChange={(e) => setSearchNum(e.target.value)}
              placeholder={t('Enter order # (e.g. GS-20261002-0001) or phone', 'أدخل رقم الطلب أو رقم الجوال...')}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#ded3c3] bg-white text-xs sm:text-sm focus:outline-hidden focus:border-[#8c532b]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            {t('Track', 'تتبع')}
          </button>
        </form>

        {searchFeedback && (
          <p className="text-xs text-red-600 bg-red-50 py-1.5 px-3 rounded-lg border border-red-200">
            {searchFeedback}
          </p>
        )}

        {/* Recent Orders Quick Select Pills */}
        {allOrders.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-[#8c7463] font-medium">{t('Quick Select:', 'اختر من الطلبات:')}</span>
            {allOrders.slice(0, 4).map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  onSelectOrder(o);
                  setSearchFeedback('');
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                  activeOrder?.id === o.id
                    ? 'bg-[#4a2e1b] text-white border-[#4a2e1b]'
                    : 'bg-white text-[#6b5849] border-[#ded3c3] hover:bg-[#faf7f2]'
                }`}
              >
                {o.order_number} ({o.items.length} {t('items', 'صنف')})
              </button>
            ))}
          </div>
        )}
      </div>

      {activeOrder ? (
        <div className="space-y-6">
          {/* Order Header Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#ded3c3]">
            <div>
              <button
                onClick={() => onNavigate('my-orders')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#8c532b] hover:text-[#4a2e1b] mb-1"
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{t('Back to My Orders', 'العودة لطلباتي')}</span>
              </button>
              <h2 className="text-2xl font-bold font-serif text-[#2c1d11]">
                {t('Order Status & Receipt', 'حالة الطلب والفاتورة')}
              </h2>
              <p className="text-xs text-[#8c7463] font-mono mt-0.5">
                {t('Order Number:', 'رقم الطلب:')} <strong>{activeOrder.order_number}</strong>
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#ded3c3] rounded-xl text-xs font-bold text-[#4a2e1b] hover:bg-[#faf7f2] shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>{t('Print Receipt', 'طباعة الفاتورة')}</span>
            </button>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs space-y-8">
            {isCancelled ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">{t('Order Cancelled', 'تم إلغاء الطلب')}</h4>
                  <p className="text-xs text-red-600">
                    {t('This order was cancelled. Please contact the cafe for assistance.', 'تم إلغاء هذا الطلب. يرجى التواصل مع الفرع لمزيد من المساعدة.')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Progress Track Line */}
                <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-[#f2eae0] hidden sm:block">
                  <div
                    className="h-full bg-[#8c532b] transition-all duration-700"
                    style={{
                      width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-[#4a2e1b] text-white ring-4 ring-[#8c532b]/20 scale-110 shadow-md'
                              : isPassed
                              ? 'bg-[#8c532b] text-white shadow-xs'
                              : 'bg-[#faf7f2] text-stone-400 border border-[#ded3c3]'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isCurrent
                                ? 'text-[#4a2e1b]'
                                : isPassed
                                ? 'text-[#8c532b]'
                                : 'text-stone-400'
                            }`}
                          >
                            {isRTL ? step.labelAr : step.labelEn}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] text-amber-600 font-semibold animate-pulse block">
                              ● {t('In Progress', 'جاري الآن')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Estimation & Contact Bar */}
            <div className="bg-[#faf7f2] rounded-2xl p-4 sm:p-5 border border-[#ded3c3] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2c1d11]">
                    {activeOrder.status === 'ready'
                      ? t('Ready for Pickup / Serving!', 'طلبك جاهز للاستلام أو التقديم!')
                      : activeOrder.status === 'completed'
                      ? t('Enjoy your coffee & tea!', 'بالعافية، نتمنى لك وقتاً ممتعاً!')
                      : t('Estimated Preparation: ~10 - 15 mins', 'الوقت المتوقع للتحضير: حوالي ١٠ - ١٥ دقيقة')}
                  </p>
                  <p className="text-[11px] text-[#8c7463]">
                    {t('Diriyah Branch · 4210 Imam Faisal Bin Turki', 'فرع الدرعية · ٤٢١٠ الإمام فيصل بن تركي')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    isRTL
                      ? `مرحباً، أستفسر عن طلبي رقم ${activeOrder.order_number}`
                      : `Hello, inquiring about my order ${activeOrder.order_number}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#1faa52]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('WhatsApp Barista', 'مراسلة الباريستا')}</span>
                </a>

                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#4a2e1b] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#2c1d11]"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('Call', 'اتصال')}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Printable Receipt Card */}
          <div id="printable-receipt" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs space-y-6">
            <div className="border-b border-[#ded3c3] pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#2c1d11]">
                  {isRTL ? settings.name_ar : settings.name_en}
                </h3>
                <p className="text-xs text-[#8c7463]">
                  {isRTL ? settings.address_ar : settings.address_en}
                </p>
                <p className="text-xs text-[#8c7463]" dir="ltr">
                  Tel: {settings.phone}
                </p>
              </div>

              <div className="text-end">
                <span className="text-xs text-[#8c7463]">{t('Order Date', 'تاريخ الطلب')}</span>
                <p className="text-xs font-bold text-[#2c1d11]">
                  {new Date(activeOrder.created_at).toLocaleDateString()}{' '}
                  {new Date(activeOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#8c7463] block">{t('Customer', 'العميل')}</span>
                <span className="font-bold text-[#2c1d11]">{activeOrder.customer_name}</span>
              </div>
              <div>
                <span className="text-[#8c7463] block">{t('Phone', 'الجوال')}</span>
                <span className="font-bold text-[#2c1d11]" dir="ltr">{activeOrder.customer_phone}</span>
              </div>
              <div>
                <span className="text-[#8c7463] block">{t('Order Type', 'نوع الطلب')}</span>
                <span className="font-bold text-[#2c1d11] capitalize">
                  {activeOrder.order_type === 'dine_in'
                    ? `${t('Dine-In', 'محلي')} (${activeOrder.table_number || ''})`
                    : activeOrder.order_type === 'pickup'
                    ? t('Pickup', 'استلام')
                    : t('Delivery', 'توصيل')}
                </span>
              </div>
              <div>
                <span className="text-[#8c7463] block">{t('Payment Method', 'طريقة الدفع')}</span>
                <span className="font-bold text-[#2c1d11] uppercase">{activeOrder.payment_method}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-t border-b border-[#ded3c3] py-4 space-y-3">
              {activeOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-[#2c1d11]">
                      {item.quantity}x {isRTL ? item.product_name_ar : item.product_name_en}
                    </span>
                    {item.size_name_en && (
                      <span className="text-[#8c7463] ms-2">
                        ({isRTL ? item.size_name_ar : item.size_name_en})
                      </span>
                    )}
                    {item.extras && <p className="text-[11px] text-[#8c6d53]">+ {item.extras}</p>}
                  </div>
                  <span className="font-bold text-[#4a2e1b]">
                    {item.item_total} {t('SAR', 'ر.س')}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between text-[#8c7463]">
                <span>{t('Subtotal', 'المجموع الفرعي')}</span>
                <span>{activeOrder.subtotal} {t('SAR', 'ر.س')}</span>
              </div>
              <div className="flex justify-between text-[#8c7463]">
                <span>{t('Delivery / Service', 'الخدمة والتوصيل')}</span>
                <span>{activeOrder.delivery_fee} {t('SAR', 'ر.س')}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#2c1d11] pt-2 border-t border-[#ded3c3]">
                <span>{t('Total', 'الإجمالي')}</span>
                <span className="text-[#8c532b]">{activeOrder.total} {t('SAR', 'ر.س')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#ded3c3] space-y-3">
          <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-lg font-bold text-[#2c1d11]">
            {t('No Active Order Selected', 'لم يتم اختيار طلب')}
          </h3>
          <p className="text-xs text-[#8c7463] max-w-sm mx-auto">
            {t(
              'Enter an order number above or place an order from the menu to start live tracking.',
              'أدخل رقم الطلب في خانة البحث أعلاه أو اطلب من المنيو للبدء بالتتبع المباشر.'
            )}
          </p>
          <button
            onClick={() => onNavigate('menu')}
            className="mt-3 px-6 py-2.5 bg-[#4a2e1b] text-white rounded-xl text-xs font-bold"
          >
            {t('Explore Menu & Order', 'تصفح المنيو والطلب')}
          </button>
        </div>
      )}
    </div>
  );
};
