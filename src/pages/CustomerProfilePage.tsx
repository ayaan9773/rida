import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order, Product, ViewMode, CustomerReview } from '../types';
import { getCustomerReviews, createCustomerReview } from '../lib/storage';
import {
  User,
  ShoppingBag,
  Clock,
  LogOut,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Edit2,
  Save,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Star,
  MapPin,
  Coffee,
  Truck,
  Sparkles,
  PackageCheck,
  MessageSquarePlus,
  Activity,
  Award,
  Wallet,
} from 'lucide-react';

interface CustomerProfilePageProps {
  orders: Order[];
  products: Product[];
  onNavigate: (view: ViewMode) => void;
  onSelectOrder: (order: Order) => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({
  orders,
  products,
  onNavigate,
  onSelectOrder,
}) => {
  const { isRTL, t, language } = useLanguage();
  const { user, logout, updateProfile, updatePassword, isAdmin } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'tracking' | 'reviews' | 'profile'>('orders');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [rating, setRating] = useState(5);
  const [favoriteItem, setFavoriteItem] = useState('شبة النار وبراد الكرك');
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Password change states
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');

  useEffect(() => {
    getCustomerReviews().then(setReviews).catch(() => {});
  }, []);

  // Filter orders matching user or all demo orders if guest
  const userOrders = user
    ? orders.filter(
        (o) =>
          o.customer_id === user.id ||
          o.customer_email === user.email ||
          o.customer_name.toLowerCase() === user.full_name.toLowerCase()
      )
    : orders;

  const activeOrders = userOrders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
  const completedOrders = userOrders.filter(o => o.status === 'completed');
  const totalSpent = userOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const loyaltyPoints = Math.round(totalSpent / 10); // 1 point per 10 SAR

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({ full_name: fullName, phone });
    if (res.success) {
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!comment.trim()) {
      setReviewError(t('Please write a comment for your review', 'يرجى كتابة تعليق لتقييمك'));
      return;
    }

    setReviewSubmitting(true);
    try {
      const updated = await createCustomerReview({
        customer_id: user?.id,
        customer_name: user?.full_name || fullName || 'عميل نبع الدرعية',
        customer_email: user?.email,
        rating,
        favorite_item: favoriteItem,
        comment,
        is_approved: true,
      });
      setReviews(updated);
      setComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err: any) {
      setReviewError(err.message || t('Failed to submit review', 'فشل إرسال التقييم'));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (newPass.length < 6) {
      setPassError(t('Password must be at least 6 characters', 'كلمة المرور يجب أن تكون ٦ خانات على الأقل'));
      return;
    }

    if (newPass !== confirmPass) {
      setPassError(t('Passwords do not match', 'كلمتا المرور غير متطابقتين'));
      return;
    }

    setPassLoading(true);
    const res = await updatePassword(newPass);
    setPassLoading(false);

    if (res.success) {
      setPassSuccess(true);
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setPassSuccess(false), 4000);
    } else {
      setPassError(res.error || t('Failed to update password', 'فشل تحديث كلمة المرور'));
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        addToCart(prod, item.quantity);
      }
    });
    onNavigate('cart');
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {t('Completed', 'مكتمل')}
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 animate-pulse">
            {t('Ready for Pickup', 'جاهز للاستلام')}
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
            {t('Preparing', 'جاري التحضير')}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            {t('Confirmed', 'مؤكد')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            {t('Cancelled', 'ملغي')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800">
            {t('Pending', 'قيد المراجعة')}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-start">
          <div className="w-16 h-16 rounded-2xl bg-[#f2eae0] border border-[#ded3c3] flex items-center justify-center text-[#8c532b] shrink-0 shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#2c1d11]">
                {user?.full_name || t('Guest Customer', 'عميل زائر')}
              </h1>
              {isAdmin && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-[#2c1d11] text-amber-300 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[#8c7463] mt-0.5">{user?.email || 'guest@gulfspring.sa'}</p>
            {user?.phone && <p className="text-xs text-[#8c7463]" dir="ltr">{user.phone}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="px-5 py-2.5 bg-[#2c1d11] text-amber-300 rounded-xl text-xs font-bold hover:bg-[#4a2e1b] transition-colors shadow-sm cursor-pointer"
            >
              {t('Open Admin Suite', 'لوحة التحكم')}
            </button>
          )}

          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#faf7f2] hover:bg-stone-200/60 text-stone-700 rounded-xl text-xs font-bold border border-[#ded3c3] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('Sign Out', 'تسجيل الخروج')}</span>
          </button>
        </div>
      </div>

      {/* 2. Order Balance & Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#e8dfd3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#8c7463] uppercase tracking-wider">{t('Total Spent', 'إجمالي المشتريات')}</span>
            <div className="text-xl font-bold text-[#2c1d11] font-serif">{totalSpent} <span className="text-xs font-normal">ر.س</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e8dfd3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#8c7463] uppercase tracking-wider">{t('Completed Orders', 'الطلبات المكتملة')}</span>
            <div className="text-xl font-bold text-[#2c1d11] font-serif">{completedOrders.length} {t('Orders', 'طلبات')}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e8dfd3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#8c7463] uppercase tracking-wider">{t('Active / Preparing', 'طلبات قيد التجهيز')}</span>
            <div className="text-xl font-bold text-[#2c1d11] font-serif">{activeOrders.length} {t('Active', 'نشط')}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e8dfd3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#8c7463] uppercase tracking-wider">{t('Coffee Loyalty Points', 'نقاط ولاء القهوة')}</span>
            <div className="text-xl font-bold text-[#2c1d11] font-serif">{loyaltyPoints} <span className="text-xs font-normal">{t('Pts', 'نقطة')}</span></div>
          </div>
        </div>
      </div>

      {/* 3. Main Layout with Left Sidebar (Right in RTL) & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar / Tabs */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-[#e8dfd3] shadow-xs space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#4a2e1b] text-white shadow-md'
                : 'text-[#6b5849] hover:bg-[#faf7f2]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('My Orders', 'سجل الطلبات')} ({userOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-[#4a2e1b] text-white shadow-md'
                : 'text-[#6b5849] hover:bg-[#faf7f2]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t('Live Track Order', 'تتبع حالة الطلب')}</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#4a2e1b] text-white shadow-md'
                : 'text-[#6b5849] hover:bg-[#faf7f2]'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>{t('Rate & Reviews', 'تقييمات المقهى')}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#4a2e1b] text-white shadow-md'
                : 'text-[#6b5849] hover:bg-[#faf7f2]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('Account Settings', 'إعدادات الحساب')}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                  {t('My Order History', 'سجل طلباتك السابقة')}
                </h2>
                <button
                  onClick={() => onNavigate('menu')}
                  className="px-4 py-2 bg-[#4a2e1b] text-white rounded-xl text-xs font-bold hover:bg-[#2c1d11] transition-colors cursor-pointer"
                >
                  {t('+ New Order', '+ طلب جديد')}
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#e8dfd3] space-y-4">
                  <ShoppingBag className="w-12 h-12 text-[#8c6d53] mx-auto opacity-50" />
                  <h3 className="text-lg font-bold text-[#2c1d11]">
                    {t('No orders yet', 'لا توجد طلبات سابقة')}
                  </h3>
                  <p className="text-xs text-[#8c7463] max-w-sm mx-auto">
                    {t(
                      'Order some fresh Karak tea, specialty coffee, or desserts to see your order history here.',
                      'اطلب الآن لتظهر تفاصيل طلباتك ومشترياتك هنا.'
                    )}
                  </p>
                </div>
              ) : (
                userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl p-6 border border-[#e8dfd3] shadow-xs hover:border-[#d5c7b3] transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f2eae0]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-[#2c1d11]">#{ord.order_number}</span>
                          {getStatusBadge(ord.status)}
                          <span className="text-xs font-bold px-2 py-0.5 bg-[#faf7f2] text-[#8c532b] rounded-md border border-[#ded3c3]">
                            {ord.order_type === 'dine_in'
                              ? t('Dine-In', 'محلي')
                              : ord.order_type === 'delivery'
                              ? t('Delivery', 'توصيل')
                              : t('Pickup', 'استلام من الكافيه')}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8c7463] mt-1">
                          {new Date(ord.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onSelectOrder(ord);
                            onNavigate('order-tracking');
                          }}
                          className="px-4 py-2 bg-[#f2eae0] hover:bg-[#e8dfd3] text-[#4a2e1b] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t('Live Track', 'تتبع حي')}</span>
                        </button>
                        <button
                          onClick={() => handleReorder(ord)}
                          className="px-4 py-2 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t('Reorder', 'إعادة الطلب')}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div className="text-[#2c1d11]">
                            <span className="font-bold text-[#8c532b]">{item.quantity}x</span>{' '}
                            {isRTL ? item.product_name_ar : item.product_name_en}
                            {item.size_name_ar && <span className="text-stone-500 ms-1">({isRTL ? item.size_name_ar : item.size_name_en})</span>}
                          </div>
                          <span className="font-bold font-mono text-[#2c1d11]">{item.item_total} ر.س</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#f2eae0] flex justify-between items-center text-xs">
                      <span className="text-[#8c7463]">
                        {t('Payment:', 'طريقة الدفع:')} <strong className="text-[#2c1d11]">{ord.payment_method}</strong>
                      </span>
                      <div className="text-sm font-bold text-[#2c1d11] font-serif">
                        {t('Total:', 'المجموع:')} <span className="text-[#8c532b]">{ord.total} ر.س</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: LIVE TRACK ORDER FIXER */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#f2eae0]">
                  <div>
                    <h2 className="text-lg font-bold font-serif text-[#2c1d11]">
                      {t('Live Kitchen & Barista Tracking', 'التتبع المباشر لتجهيز الطلب')}
                    </h2>
                    <p className="text-xs text-[#8c7463]">
                      {t('Real-time preparation updates from Gulf Spring cafe', 'تحديثات فورية من بار ومطبخ نبع الدرعية')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const latest = userOrders.length > 0 ? userOrders[0] : null;
                      if (latest) {
                        onSelectOrder(latest);
                        onNavigate('order-tracking');
                      }
                    }}
                    className="px-4 py-2 bg-[#4a2e1b] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {t('Open Full Tracker View', 'عرض شاشة التتبع الكاملة')}
                  </button>
                </div>

                {userOrders.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 text-xs">
                    {t('No active orders to track right now.', 'لا توجد طلبات نشطة للتتبع حالياً.')}
                  </div>
                ) : (
                  (() => {
                    const latest = userOrders[0];
                    const steps = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
                    const currentIdx = steps.indexOf(latest.status);
                    return (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center bg-[#faf7f2] p-4 rounded-2xl border border-[#ded3c3]">
                          <div>
                            <span className="text-xs font-bold text-[#8c532b]">#{latest.order_number}</span>
                            <div className="text-sm font-bold text-[#2c1d11] mt-0.5">{latest.customer_name}</div>
                          </div>
                          {getStatusBadge(latest.status)}
                        </div>

                        {/* Visual timeline */}
                        <div className="space-y-4 py-4">
                          <div className="relative flex justify-between max-w-md mx-auto">
                            {['استلام الطلب', 'التأكيد', 'التحضير', 'جاهز'].map((stepLabel, idx) => {
                              const isDone = currentIdx >= idx;
                              return (
                                <div key={idx} className="flex flex-col items-center z-10">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                                    isDone ? 'bg-[#4a2e1b] text-amber-300 shadow-md' : 'bg-stone-200 text-stone-500'
                                  }`}>
                                    {idx + 1}
                                  </div>
                                  <span className="text-[11px] font-bold text-[#2c1d11] mt-2">{stepLabel}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-[#f2eae0]/50 p-4 rounded-2xl border border-[#ded3c3] space-y-2 text-xs">
                          <div className="font-bold text-[#2c1d11]">
                            {t('Barista Note:', 'ملاحظة الباريستا:')}
                          </div>
                          <p className="text-[#6b5849]">
                            {latest.status === 'preparing'
                              ? t('Your specialty coffee and Karak tea are being meticulously prepared by our head barista.', 'جاري تحضير قهوتك المختصة وكرك الجمر بعناية فائقة بواسطة الباريستا.')
                              : latest.status === 'ready'
                              ? t('Your order is ready! Please collect from the counter or wait for delivery.', 'طلبك جاهز الآن! يمكنك استلامه من الكارفير أو بانتظار المندوب.')
                              : t('Your order has been received and queued in our kitchen.', 'تم استلام طلبك وجدولة تجهيزه في المطبخ.')}
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RATE & REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                    {t('Share Your Experience at Gulf Spring', 'شاركنا رأيك وتجربتك في نبع الدرعية')}
                  </h2>
                  <p className="text-xs text-[#8c7463] mt-1">
                    {t('Your feedback helps us brew better moments every day.', 'تقييمك ومقترحاتك تساعدنا على تقديم أفضل تجربة دائماً.')}
                  </p>
                </div>

                {reviewSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t('Thank you! Your review has been published successfully.', 'شكراً لك! تم نشر تقييمك بنجاح.')}</span>
                  </div>
                )}

                {reviewError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                      {t('Rating (1 to 5 Stars)', 'التقييم العام (من 5 نجوم)')} *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all cursor-pointer ${
                            rating >= star
                              ? 'bg-amber-500 text-white shadow-md'
                              : 'bg-[#faf7f2] text-stone-400 border border-[#ded3c3]'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ms-2 text-xs font-bold text-[#4a2e1b]">
                        {rating} / 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                      {t('Favorite Item or Experience', 'طلبك المفضل أو الجلسة')}
                    </label>
                    <input
                      type="text"
                      value={favoriteItem}
                      onChange={(e) => setFavoriteItem(e.target.value)}
                      placeholder="e.g. شبة النار، كرك الجمر، قهوة V60"
                      className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                      {t('Your Review & Comments', 'رأيك وتعليقك المفصل')} *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t('Write how you felt about our atmosphere, service, and drinks...', 'اكتب تجربتك عن أجواء المقهى، جودة القهوة والشاي، وحفاوة الاستقبال...')}
                      className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting || !comment.trim()}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitting ? t('Publishing Review...', 'جاري النشر...') : t('Publish Review', 'نشر التقييم')}
                  </button>
                </form>

                <div className="pt-6 border-t border-[#f2eae0] space-y-4">
                  <h3 className="text-sm font-bold text-[#2c1d11]">
                    {t('Community & Recent Reviews', 'أحدث تقييمات الزوار')}
                  </h3>
                  <div className="space-y-3">
                    {reviews.slice(0, 5).map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd3] space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#2c1d11]">{rev.customer_name}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                              {rev.favorite_item}
                            </span>
                          </div>
                          <div className="flex text-amber-500 text-xs">
                            {'★'.repeat(rev.rating)}
                          </div>
                        </div>
                        <p className="text-xs text-[#6b5849] leading-relaxed">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCOUNT SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#f2eae0]">
                  <h2 className="text-lg font-bold font-serif text-[#2c1d11]">
                    {t('Profile Information', 'معلومات الحساب الشخصي')}
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-[#8c532b] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditing ? t('Cancel', 'إلغاء') : t('Edit Details', 'تعديل البيانات')}</span>
                  </button>
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{t('Profile updated successfully!', 'تم تحديث البيانات بنجاح!')}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                      {t('Full Name', 'الاسم الكامل')} *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!isEditing}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                      {t('Phone Number', 'رقم الجوال')}
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      dir="ltr"
                      placeholder="05xxxxxxxx"
                      className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden disabled:opacity-60 text-start"
                    />
                  </div>

                  {isEditing && (
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{t('Save Changes', 'حفظ التعديلات')}</span>
                    </button>
                  )}
                </form>

                {/* Change Password Section */}
                <div className="pt-6 border-t border-[#f2eae0] space-y-4">
                  <h3 className="text-sm font-bold text-[#2c1d11]">
                    {t('Change Password', 'تغيير كلمة المرور')}
                  </h3>

                  {passSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{t('Password changed successfully!', 'تم تغيير كلمة المرور بنجاح!')}</span>
                    </div>
                  )}

                  {passError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                        {t('New Password', 'كلمة المرور الجديدة')} *
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden"
                        />
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                        {t('Confirm New Password', 'تأكيد كلمة المرور')} *
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden"
                        />
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passLoading || newPass.length < 6}
                      className="px-6 py-3 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {passLoading ? t('Updating...', 'جاري التحديث...') : t('Update Password', 'تحديث كلمة المرور')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
