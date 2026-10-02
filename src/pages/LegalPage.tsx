import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BusinessSettings } from '../types';
import { ShieldCheck, FileText } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms';
  settings: BusinessSettings;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type: initialType, settings }) => {
  const { isRTL, t } = useLanguage();
  const [type, setType] = useState<'privacy' | 'terms'>(initialType);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Header Tabs */}
      <div className="flex border-b border-[#ded3c3] gap-6">
        <button
          onClick={() => setType('privacy')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            type === 'privacy'
              ? 'text-[#4a2e1b] border-b-2 border-[#8c532b]'
              : 'text-[#8c7463] hover:text-[#2c1d11]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t('Privacy Policy', 'سياسة الخصوصية')}</span>
        </button>

        <button
          onClick={() => setType('terms')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            type === 'terms'
              ? 'text-[#4a2e1b] border-b-2 border-[#8c532b]'
              : 'text-[#8c7463] hover:text-[#2c1d11]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('Terms & Conditions', 'الشروط والأحكام')}</span>
        </button>
      </div>

      {type === 'privacy' ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e8dfd3] shadow-xs space-y-6 text-[#4a2e1b] leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2c1d11]">
            {isRTL ? 'سياسة الخصوصية - نبع الدرعية' : 'Privacy Policy - Gulf Spring'}
          </h1>
          <p className="text-xs text-[#8c7463]">
            {t('Last updated: October 2026', 'آخر تحديث: أكتوبر ٢٠٢٦')}
          </p>

          <section className="space-y-2 text-sm text-[#6b5849]">
            <h3 className="font-bold text-base text-[#2c1d11]">
              {isRTL ? '١. المعلومات التي نجمعها' : '1. Information We Collect'}
            </h3>
            <p>
              {isRTL
                ? 'نقوم بجمع بيانات التواصل الضرورية لمعالجة طلباتكم وتأكيد استلام المشروبات والمأكولات، وتشمل: الاسم، رقم الجوال، وعنوان البريد الإلكتروني. لا نشارك هذه البيانات مع أي طرف ثالث لأغراض تسويقية.'
                : 'We collect contact information necessary to process your coffee, tea, and food orders, including your name, mobile number, and email. We do not sell or share your personal information with third parties for external marketing.'}
            </p>
          </section>

          <section className="space-y-2 text-sm text-[#6b5849]">
            <h3 className="font-bold text-base text-[#2c1d11]">
              {isRTL ? '٢. استخدام رقم الواتساب والهاتف' : '2. Use of WhatsApp & Phone Numbers'}
            </h3>
            <p>
              {isRTL
                ? 'يُستخدم رقم الجوال حصراً لإرسال إشعارات تجهيز الطلب، والتنسيق عبر تطبيق الواتساب الخاص بالفرع في الدرعية لتأكيد الطلبات وجاهزيتها للاستلام.'
                : 'Your mobile phone number is solely utilized to notify you when your order is brewing, ready for pickup, or to communicate directly via WhatsApp regarding your custom order requests.'}
            </p>
          </section>

          <section className="space-y-2 text-sm text-[#6b5849]">
            <h3 className="font-bold text-base text-[#2c1d11]">
              {isRTL ? '٣. الأمان وحماية البيانات' : '3. Data Security & Storage'}
            </h3>
            <p>
              {isRTL
                ? 'نطبق معايير أمنية لحماية بياناتكم وقواعد البيانات المحمية بسياسات الأمان على مستوى الصفوف (RLS).'
                : 'We implement industry best practices and Row-Level Security (RLS) policies within our database to ensure that customer profile information and order records remain private and secure.'}
            </p>
          </section>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e8dfd3] shadow-xs space-y-6 text-[#4a2e1b] leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2c1d11]">
            {isRTL ? 'الشروط والأحكام - نبع الدرعية' : 'Terms & Conditions - Gulf Spring'}
          </h1>
          <p className="text-xs text-[#8c7463]">
            {t('Last updated: October 2026', 'آخر تحديث: أكتوبر ٢٠٢٦')}
          </p>

          <section className="space-y-2 text-sm text-[#6b5849]">
            <h3 className="font-bold text-base text-[#2c1d11]">
              {isRTL ? '١. الطلبات والدفع' : '1. Ordering & Payments'}
            </h3>
            <p>
              {isRTL
                ? 'جميع الأسعار المعروضة بالريال السعودي (SAR) وتشمل ضريبة القيمة المضافة. يمكن للعملاء الدفع نقداً أو عبر بطاقات مدى والبطاقات الائتمانية عند الاستلام في الفرع.'
                : 'All listed prices are in Saudi Riyals (SAR) and inclusive of applicable value-added taxes. Guests may pay in cash or via Mada/Credit cards upon pickup at the cafe counter.'}
            </p>
          </section>

          <section className="space-y-2 text-sm text-[#6b5849]">
            <h3 className="font-bold text-base text-[#2c1d11]">
              {isRTL ? '٢. جلسات شبة النار والمجموعات' : '2. Bonfire Patio & Seating'}
            </h3>
            <p>
              {isRTL
                ? 'جلسات شبة النار الخارجية تتاح لرواد الكافيه خلال ساعات العمل المسائية. يرجى مراعاة إرشادات السلامة بالقرب من مواقد الحطب، ويحق للإدارة تنظيم الجلوس وفق السعة الاستيعابية.'
                : 'Outdoor firewood pit tables and patio seating are accessible during evening operating hours. Guests are requested to follow general safety considerations around the hearth.'}
            </p>
          </section>

          <section className="space-y-2 text-sm text-[#6b5849]">
            <h3 className="font-bold text-base text-[#2c1d11]">
              {isRTL ? '٣. مواعيد العمل' : '3. Operating Hours'}
            </h3>
            <p>
              {isRTL
                ? 'يعمل نبع الدرعية يومياً من الساعة ٣:٣٠ عصراً وحتى الساعة ٧:٠٠ صباحاً في الدرعية، الرياض.'
                : 'Gulf Spring operates daily between 3:30 PM and 7:00 AM in historic Diriyah, Riyadh.'}
            </p>
          </section>
        </div>
      )}
    </div>
  );
};
