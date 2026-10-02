import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BusinessSettings } from '../types';
import { LiveStatusBadge } from '../components/LiveStatusBadge';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ExternalLink,
  Send,
  CheckCircle,
  Mail,
  Copy,
  Check,
  Navigation,
  Compass,
} from 'lucide-react';

interface ContactPageProps {
  settings: BusinessSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const { isRTL, t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const cleanPhone = settings.whatsapp.replace(/[^0-9]/g, '');
  const gpsCoords = '24.7342, 46.5753';

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(gpsCoords);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newInquiry = {
        id: `inq-${Date.now()}`,
        name,
        phone,
        email,
        subject,
        message,
        created_at: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('gs_inquiries') || '[]');
      existing.unshift(newInquiry);
      localStorage.setItem('gs_inquiries', JSON.stringify(existing));
    } catch (err) {
      console.warn('Error saving inquiry:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `مرحباً نبع الدرعية 🌿\nاسمي: ${name}\nرقمي: ${phone}\nالموضوع: ${subject}\nرسالتي: ${message}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Google Maps Embed URL for Diriyah, Riyadh
  const mapEmbedUrl = `https://maps.google.com/maps?q=Diriyah,+Riyadh,+Saudi+Arabia&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-5xl font-bold text-[#2c1d11] font-serif">
          {isRTL ? 'تواصل معنا وموقعنا بالدرعية' : 'Contact & Visit Us in Diriyah'}
        </h1>
        <p className="text-sm sm:text-base text-[#6b5849] leading-relaxed">
          {isRTL
            ? 'نسعد باستقبالكم يومياً في نبع الدرعية للاستمتاع بأجمل اللحظات، القهوة المختصة، والشاي على الحطب في قلب واحة الدرعية التاريخية.'
            : 'We welcome you every day at Gulf Spring to enjoy cozy evenings, specialty coffee, and campfire tea in historic Diriyah.'}
        </p>
        <div className="pt-2 flex justify-center">
          <LiveStatusBadge />
        </div>
      </div>

      {/* INTERACTIVE GOOGLE MAP PREVIEW SECTION */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#ded3c3] shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center shadow-xs">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2c1d11]">
                {t('Interactive Location Map & Live Preview', 'الخريطة التفاعلية وموقع الكافيه')}
              </h2>
              <p className="text-xs text-[#8c7463]">
                {t(
                  'Explore our location in Diriyah Heritage Area, Riyadh with real-time navigation directions',
                  'استكشف موقعنا في واحة الدرعية التاريخية بالرياض مع إمكانية الملاحة المباشرة'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCoords}
              className="px-3.5 py-2 bg-[#faf7f2] hover:bg-[#f2eae0] border border-[#ded3c3] text-[#4a2e1b] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCoords ? t('Copied!', 'تم النسخ!') : t('Copy GPS Coordinates', 'نسخ الإحداثيات')}</span>
            </button>

            <a
              href={settings.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('Open in Google Maps App', 'فتح في تطبيق الخرائط')}</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>
        </div>

        {/* Embedded Map iFrame with Decorative Card Overlay */}
        <div className="relative w-full max-w-full rounded-2xl overflow-hidden border border-[#ded3c3] shadow-inner bg-[#f2eae0] aspect-4/3 sm:aspect-21/9 min-h-[300px]">
          <iframe
            title="Gulf Spring Cafe Location Map"
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full min-h-[300px] object-cover"
          />

          {/* Floating Location Overlay Badge */}
          <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto bg-[#2c1d11]/95 text-white backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-amber-900/40 max-w-sm space-y-1.5 pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="font-serif font-bold text-sm text-amber-200">
                {isRTL ? settings.name_ar : settings.name_en}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {t('Open Daily', 'مفتوح يومياً')}
              </span>
            </div>
            <p className="text-xs text-[#ded3c3] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isRTL ? settings.address_ar : settings.address_en}</span>
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-[#b8a28e] border-t border-white/10 font-mono" dir="ltr">
              <span>GPS: 24.7342° N, 46.5753° E</span>
              <span>Diriyah, Riyadh</span>
            </div>
          </div>
        </div>

        {/* Riyadh Distance & Arrival Estimates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-center">
            <span className="text-xs text-[#8c7463] block">{t('From King Saud University', 'من جامعة الملك سعود')}</span>
            <span className="text-sm font-bold text-[#2c1d11]">~ 15 {t('minutes', 'دقيقة')}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-center">
            <span className="text-xs text-[#8c7463] block">{t('From KAFD Financial Center', 'من مركز الملك عبدالله المالي')}</span>
            <span className="text-sm font-bold text-[#2c1d11]">~ 20 {t('minutes', 'دقيقة')}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-center">
            <span className="text-xs text-[#8c7463] block">{t('From Riyadh Center (Olaya)', 'من وسط الرياض (العليا)')}</span>
            <span className="text-sm font-bold text-[#2c1d11]">~ 25 {t('minutes', 'دقيقة')}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Col: Contact Information Cards */}
        <div className="space-y-6">
          {/* Address Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#faf5ee] border border-[#ded3c3] flex items-center justify-center text-[#8c532b] shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif text-[#2c1d11]">
                  {t('Cafe Address', 'عنوان الكافيه')}
                </h3>
                <p className="text-sm text-[#4a2e1b] font-medium">
                  {isRTL ? settings.address_ar : settings.address_en}
                </p>
                <p className="text-xs text-[#8c7463]">
                  {t('Diriyah, Riyadh, Kingdom of Saudi Arabia', 'الدرعية، منطقة الرياض، المملكة العربية السعودية')}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={settings.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all"
              >
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{t('Open Directions in Google Maps', 'فتح الاتجاهات على خرائط قوقل')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Hours Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#faf5ee] border border-[#ded3c3] flex items-center justify-center text-[#8c532b] shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif text-[#2c1d11]">
                  {t('Opening Hours', 'ساعات العمل الرسمية')}
                </h3>
                <p className="text-sm font-bold text-[#4a2e1b]">
                  {t('Every Day of the Week', 'يومياً طوال أيام الأسبوع')}
                </p>
                <p className="text-xs text-[#6b5849] font-sans" dir="ltr">
                  3:30 PM – 7:00 AM
                </p>
                <p className="text-xs text-[#8c7463] mt-1">
                  {t(
                    'Evenings, bonfire lighting, late nights & early dawn hours',
                    'الفترة المسائية، شبة النار، السهرات وساعات الفجر'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Direct Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 hover:bg-emerald-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-800">{t('WhatsApp', 'واتساب مباشر')}</p>
                <p className="text-xs sm:text-sm font-bold font-mono" dir="ltr">
                  {settings.whatsapp}
                </p>
              </div>
            </a>

            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#faf5ee] border border-[#ded3c3] text-[#2c1d11] hover:bg-[#f2eae0] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#4a2e1b] text-amber-200 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#8c6d53]">{t('Direct Call', 'اتصال هاتفي')}</p>
                <p className="text-xs sm:text-sm font-bold font-mono" dir="ltr">
                  {settings.phone}
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Right Col: Contact Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e8dfd3] shadow-xs">
          <div className="mb-6">
            <h3 className="text-2xl font-bold font-serif text-[#2c1d11]">
              {isRTL ? 'أرسل لنا استفسارك أو اقتراحك' : 'Send an Inquiry or Feedback'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8c7463] mt-1">
              {t(
                'We value your feedback and respond swiftly.',
                'يسعدنا سماع رأيك والرد على كافة تساؤلاتك في أقرب وقت.'
              )}
            </p>
          </div>

          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-[#2c1d11] font-serif">
                {t('Message Sent Successfully!', 'تم إرسال رسالتك بنجاح!')}
              </h4>
              <p className="text-xs sm:text-sm text-[#6b5849] max-w-sm mx-auto">
                {t(
                  'Thank you for reaching out to Gulf Spring. Our team in Diriyah has received your inquiry.',
                  'شكراً لتواصلك مع نبع الدرعية. تم استلام رسالتك وسيتواصل معك فريقنا.'
                )}
              </p>

              {/* Instant WhatsApp Option */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#25D366] hover:bg-[#1faa4b] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('Send via WhatsApp Too', 'إرسال نفس الرسالة عبر واتساب')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setMessage('');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#4a2e1b] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {t('Send Another Message', 'إرسال رسالة أخرى')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                  {t('Full Name', 'الاسم الكامل')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('e.g. Faisal Al-Otaibi', 'مثال: فيصل العتيبي')}
                  className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b] focus:ring-2 focus:ring-[#8c532b]/20"
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 5X XXX XXXX"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b] focus:ring-2 focus:ring-[#8c532b]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Email Address', 'البريد الإلكتروني')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b] focus:ring-2 focus:ring-[#8c532b]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                  {t('Inquiry Type', 'نوع الاستفسار')}
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                >
                  <option value="general">{t('General Inquiry', 'استفسار عام')}</option>
                  <option value="gathering">{t('Bonfire & Gathering Reservation', 'حجز جلسة حطب وشبة نار')}</option>
                  <option value="events">{t('Private Gatherings / Catering', 'مناسبات خاصة أو طلبات خارجية')}</option>
                  <option value="feedback">{t('Customer Feedback / Compliment', 'ملاحظات واقتراحات')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                  {t('Message', 'نص الرسالة')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('Write your message here...', 'اكتب رسالتك أو استفسارك هنا...')}
                  className="w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b] focus:ring-2 focus:ring-[#8c532b]/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting ? t('Sending...', 'جاري الإرسال...') : t('Submit Message', 'إرسال الرسالة')}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
