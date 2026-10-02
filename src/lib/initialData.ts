import { BusinessSettings, Category, GalleryImage, OpeningHour, Product } from '../types';

export const INITIAL_BUSINESS_SETTINGS: BusinessSettings = {
  id: 'gulf-spring-settings-01',
  name_en: 'Gulf Spring',
  name_ar: 'نبع الدرعيه',
  tagline_en: 'Coffee, Tea & Cozy Moments in Diriyah',
  tagline_ar: 'قهوة وشاي ولحظات جميلة في الدرعية',
  phone: '+966 55 707 0172',
  whatsapp: '+966557070172',
  address_en: '4210 Imam Faisal Bin Turki, Diriyah, Riyadh',
  address_ar: '4210 الامام فيصل بن تركي، الدرعية، الرياض',
  google_rating: 3.7,
  review_count: 1627,
  logo_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
  hero_title_en: 'Gulf Spring',
  hero_title_ar: 'نبع الدرعيه',
  hero_subtitle_en: 'Coffee, Tea & Cozy Moments in Diriyah',
  hero_subtitle_ar: 'قهوة وشاي ولحظات جميلة في الدرعية',
  hero_image_url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1920&q=80',
  show_hero: true,
  hero_button_text_en: 'View Menu',
  hero_button_text_ar: 'تصفح المنيو',
  hero_button_link: 'menu',
  instagram_url: 'https://instagram.com',
  tiktok_url: 'https://tiktok.com',
  snapchat_url: 'https://snapchat.com',
  google_maps_url: 'https://maps.google.com/?q=4210+Imam+Faisal+Bin+Turki+Diriyah+Riyadh',
  primary_color: '#4a2e1b',
  whatsapp_template_en: "Hello Gulf Spring / نبع الدرعيه,\n\nI would like to place an order from your website:\n\n{ORDER_ITEMS}\n\nTotal: SAR {TOTAL}\n\nCustomer Details:\nName: {CUSTOMER_NAME}\nPhone: {CUSTOMER_PHONE}\nOrder Type: {ORDER_TYPE}\nNotes: {NOTES}\n\nPlease confirm my order. Thank you!",
  whatsapp_template_ar: "مرحباً نبع الدرعيه / Gulf Spring،\n\nأود تأكيد طلبي من الموقع الإلكتروني:\n\n{ORDER_ITEMS}\n\nالمجموع: {TOTAL} ر.س\n\nبيانات العميل:\nالاسم: {CUSTOMER_NAME}\nالجوال: {CUSTOMER_PHONE}\nنوع الطلب: {ORDER_TYPE}\nملاحظات: {NOTES}\n\nيرجى تأكيد الطلب، شاكر ومقدر لكم!",
  email_config: {
    provider: 'smtp',
    sender_name: 'Gulf Spring / نبع الدرعيه',
    sender_email: 'noreply@gulfspring.sa',
    smtp_host: 'smtp.mailgun.org',
    smtp_port: 587,
    smtp_user: 'postmaster@gulfspring.sa',
    smtp_password: '',
    enable_verification: true,
    email_subject_en: 'Gulf Spring - Your Email Verification Code',
    email_subject_ar: 'نبع الدرعية - رمز التحقق لتسجيل حسابك',
    email_template_en: "Hello,\n\nYour Gulf Spring verification code is: {CODE}\n\nUse this code to verify your email and complete your account setup.\n\nWarm regards,\nGulf Spring Diriyah",
    email_template_ar: "أهلاً بك،\n\nرمز التحقق الخاص بك في نبع الدرعية هو: {CODE}\n\nاستخدم هذا الرمز لتأكيد بريدك الإلكتروني وإكمال إنشاء حسابك.\n\nمع أطيب التحيات،\nفريق نبع الدرعية"
  }
};

export const INITIAL_OPENING_HOURS: OpeningHour[] = [
  { id: 'h-0', day_of_week: 0, day_name_en: 'Sunday', day_name_ar: 'الأحد', open_time: '15:30', close_time: '07:00', is_open: true },
  { id: 'h-1', day_of_week: 1, day_name_en: 'Monday', day_name_ar: 'الإثنين', open_time: '15:30', close_time: '07:00', is_open: true },
  { id: 'h-2', day_of_week: 2, day_name_en: 'Tuesday', day_name_ar: 'الثلاثاء', open_time: '15:30', close_time: '07:00', is_open: true },
  { id: 'h-3', day_of_week: 3, day_name_en: 'Wednesday', day_name_ar: 'الأربعاء', open_time: '15:30', close_time: '07:00', is_open: true },
  { id: 'h-4', day_of_week: 4, day_name_en: 'Thursday', day_name_ar: 'الخميس', open_time: '15:30', close_time: '07:00', is_open: true },
  { id: 'h-5', day_of_week: 5, day_name_en: 'Friday', day_name_ar: 'الجمعة', open_time: '15:30', close_time: '07:00', is_open: true },
  { id: 'h-6', day_of_week: 6, day_name_en: 'Saturday', day_name_ar: 'السبت', open_time: '15:30', close_time: '07:00', is_open: true },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-tea',
    name_en: 'Tea & Karak',
    name_ar: 'الشاي والكرك',
    slug: 'tea',
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'cat-coffee',
    name_en: 'Specialty Coffee',
    name_ar: 'القهوة المختصة',
    slug: 'coffee',
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'cat-traditional',
    name_en: 'Saudi Traditional Coffee',
    name_ar: 'القهوة السعودية الأصيلة',
    slug: 'traditional-coffee',
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'cat-cold',
    name_en: 'Cold Drinks & Refreshers',
    name_ar: 'المشروبات الباردة والمنعشة',
    slug: 'cold-drinks',
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'cat-desserts',
    name_en: 'Desserts & Sweets',
    name_ar: 'الحلويات والكيك',
    slug: 'desserts',
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'cat-food',
    name_en: 'Food & Savory Bites',
    name_ar: 'المأكولات والمعجنات',
    slug: 'food',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'cat-bonfire',
    name_en: 'Bonfire & Evening Sets',
    name_ar: 'جلسات الحطب ومجموعات السهرة',
    slug: 'bonfire-sets',
    image_url: 'https://images.unsplash.com/photo-1525869916826-972885c91c1e?auto=format&fit=crop&w=600&q=80',
    sort_order: 7,
    is_active: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    category_id: 'cat-tea',
    name_en: 'Gulf Spring Signature Karak Pot',
    name_ar: 'براد كرك نبع الدرعية الخاص',
    description_en: 'Slow-brewed rich black tea infused with cardamom, saffron, evaporated milk, and secret spices. Served steaming in our signature traditional pot.',
    description_ar: 'شاي كرك غني مطبوخ على مهل بنكهة الهيل والزعفران الأصلي والحليب المبخر. يقدم ساخناً في البراد التراثي المميز.',
    price: 24,
    discount_price: 20,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: true,
    is_available: true,
    sort_order: 1,
    sku: 'TEA-KRK-01',
    sizes: [
      { name_en: 'Cup', name_ar: 'كوب', price: 9 },
      { name_en: 'Medium Pot (2 Persons)', name_ar: 'براد وسط (شخصين)', price: 20 },
      { name_en: 'Large Pot (4 Persons)', name_ar: 'براد كبير (٤ أشخاص)', price: 34 }
    ],
    extras: [
      { name_en: 'Extra Saffron Threads', name_ar: 'خيوط زعفران إضافية', price: 4 },
      { name_en: 'Cardamom Boost', name_ar: 'هيل إضافي', price: 2 }
    ]
  },
  {
    id: 'prod-2',
    category_id: 'cat-traditional',
    name_en: 'Khawlani Saudi Coffee Dallah with Dates',
    name_ar: 'دلة قهوة سعودية خولانية مع التمر والطحينة',
    description_en: 'Premium Saudi Khawlani blonde coffee roasted with golden cardamom and saffron. Served with fresh Sukari dates, tahina, and sesame.',
    description_ar: 'قهوة سعودية خولانية شقراء فاخرة محمصة مع الهيل الذهبي والزعفران. تقدم مع سكري فاخر وطحينة وسمسم.',
    price: 36,
    discount_price: 32,
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: true,
    is_available: true,
    sort_order: 2,
    sku: 'COF-SAU-01',
    sizes: [
      { name_en: 'Small Dallah', name_ar: 'دلة صغيرة', price: 32 },
      { name_en: 'Large Dallah', name_ar: 'دلة كبيرة عائلية', price: 48 }
    ]
  },
  {
    id: 'prod-3',
    category_id: 'cat-tea',
    name_en: 'Moroccan Mint Tea Pot (Fire Brewed)',
    name_ar: 'براد شاي مغربي بالنعناع الطازج (على الجمر)',
    description_en: 'Fresh spearmint leaves steeped with gunpowder green tea and mild raw sugar, poured with traditional high frothy head.',
    description_ar: 'أوراق النعناع الطازجة مع الشاي الأخضر الأصيل والسكر الموزون، محضر على طريقة المغاربة برغوة غنية.',
    price: 22,
    image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: false,
    is_available: true,
    sort_order: 3,
    sku: 'TEA-MOR-01'
  },
  {
    id: 'prod-4',
    category_id: 'cat-coffee',
    name_en: 'Specialty V60 Pour-Over Coffee',
    name_ar: 'قهوة مقطرة V60 مختصة',
    description_en: 'Single origin Ethiopian Yirgacheffe or Colombian Huila beans, manually brewed to bring out floral jasmine and bright berry notes.',
    description_ar: 'محصول إثيوبي أو كولومبي مختص محضر بطريقة التقطير اليدوي V60 لإبراز الإيحاءات العطرية والفاكهية.',
    price: 22,
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: true,
    is_available: true,
    sort_order: 4,
    sku: 'COF-V60-01',
    sizes: [
      { name_en: 'Hot', name_ar: 'حار', price: 22 },
      { name_en: 'Iced', name_ar: 'بارد', price: 24 }
    ]
  },
  {
    id: 'prod-5',
    category_id: 'cat-coffee',
    name_en: 'Iced Spanish Latte',
    name_ar: 'سبانش لاتيه بارد',
    description_en: 'Double shot of specialty espresso shaken with chilled condensed sweet milk and fresh dairy. Smooth, creamy, and refreshing.',
    description_ar: 'دبل شوت إسبريسو مختص مع مزيج الحليب المكثف المحلى والحليب الطازج والثلج، قوام مخملي ومذاق منعش.',
    price: 23,
    discount_price: 19,
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: true,
    is_available: true,
    sort_order: 5,
    sku: 'COF-LAT-01',
    extras: [
      { name_en: 'Extra Shot Espresso', name_ar: 'شوت إسبريسو إضافي', price: 4 },
      { name_en: 'Oat Milk Alternative', name_ar: 'حليب شوفان عضوي', price: 4 }
    ]
  },
  {
    id: 'prod-6',
    category_id: 'cat-coffee',
    name_en: 'Velvety Flat White',
    name_ar: 'فلات وايت مخملي',
    description_en: 'Expertly microfoamed whole milk poured over a rich double ristretto shot with elegant silky latte art.',
    description_ar: 'حليب مبخر بقوام ميكروفوم مخملي ناعم مسكوب فوق دبل ريستريتو غني برسمة أنيقة.',
    price: 18,
    image_url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: false,
    is_available: true,
    sort_order: 6,
    sku: 'COF-FLT-01'
  },
  {
    id: 'prod-7',
    category_id: 'cat-desserts',
    name_en: 'Diriyah Warm Date Pudding with Vanilla Gelato',
    name_ar: 'بودينغ التمر الدافئ مع الآيسكريم وصوص الكراميل',
    description_en: 'Freshly baked date pudding made from local Diriyah dates, drizzled with warm sea salt butterscotch sauce and artisanal vanilla gelato.',
    description_ar: 'بودينغ طري مخبوز بتمر الدرعية الفاخر، مغطى بصلصة التوفي الدافئة مع كرة آيسكريم فانيليا فاخرة.',
    price: 32,
    discount_price: 28,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: true,
    is_available: true,
    sort_order: 7,
    sku: 'DES-DAT-01'
  },
  {
    id: 'prod-8',
    category_id: 'cat-desserts',
    name_en: 'Royal Saffron Milk Cake',
    name_ar: 'كيكة الحليب بالزعفران الملكي',
    description_en: 'Sponge cake soaked overnight in saffron-infused three milks, topped with light whipped cream and pure saffron threads.',
    description_ar: 'كيكة إسفنجية مشبعة بثلاثة أنواع حليب غنية بالزعفران، مغطاة بكريمة خفيفة وخيوط الزعفران الأصلي.',
    price: 30,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: true,
    is_available: true,
    sort_order: 8,
    sku: 'DES-SAF-01'
  },
  {
    id: 'prod-9',
    category_id: 'cat-desserts',
    name_en: 'San Sebastian Burnt Cheesecake',
    name_ar: 'تشيز كيك سان سيباستيان مع الشوكولاتة البلجيكية',
    description_en: 'Caramelized Basque-style burnt cheesecake with creamy melting center, served with warm Belgian chocolate ganache.',
    description_ar: 'تشيز كيك باسكي مكرمل من الخارج وقوام ذائب كريمي من الداخل، يقدم مع صوص الشوكولاتة البلجيكية الدافئة.',
    price: 34,
    image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: false,
    is_available: true,
    sort_order: 9,
    sku: 'DES-SAN-01'
  },
  {
    id: 'prod-10',
    category_id: 'cat-food',
    name_en: 'Toasted Halloumi & Zaatar Croissant',
    name_ar: 'كرواسون حلوم مشوي بالزعتر والطماطم المجففة',
    description_en: 'Buttery flaky French croissant stuffed with grilled Cypriot halloumi, wild zaatar herbs, sun-dried tomatoes, and olive tapenade.',
    description_ar: 'كرواسون فرنسي مقرمش بحشوة جبن الحلوم المشوي، زعتر بري، طماطم مجففة ومعجون الزيتون الفاخر.',
    price: 26,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: true,
    is_available: true,
    sort_order: 10,
    sku: 'FOD-HAL-01'
  },
  {
    id: 'prod-11',
    category_id: 'cat-cold',
    name_en: 'Wild Hibiscus Cooler (Karkadeh)',
    name_ar: 'كركديه بارد منعش بنكهة الرمان',
    description_en: 'Naturally steeped crimson Egyptian hibiscus flowers infused with pomegranate reduction, fresh mint, and sparkling water.',
    description_ar: 'أزهار الكركديه المنقوعة بعناية مع لمسة دبس الرمان المنعش والنعناع الفريش.',
    price: 18,
    image_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: false,
    is_available: true,
    sort_order: 11,
    sku: 'CLD-HIB-01'
  },
  {
    id: 'prod-12',
    category_id: 'cat-bonfire',
    name_en: 'Outdoor Bonfire Gathering Platter & Marshmallows',
    name_ar: 'بكج جلسة شبة النار والمارشميلو مع براد شاي',
    description_en: 'Complete cozy evening experience: Wooden skewers with marshmallows, digestive biscuits, Nutella dip, and a hot teapot of your choice around the outdoor fire.',
    description_ar: 'تجربة سهرة الدرعية الشتوية الكاملة: أعواد مارشميلو للشواء، بسكويت دايجستف، غموس نوتيلا دافئ، وبراد شاي أو كرك من اختيارك حول شبة النار.',
    price: 75,
    discount_price: 68,
    image_url: 'https://images.unsplash.com/photo-1525869916826-972885c91c1e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1525869916826-972885c91c1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'
    ],
    is_featured: true,
    is_available: true,
    sort_order: 12,
    sku: 'BNF-PKG-01'
  }
];

export const INITIAL_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'gal-1',
    title_en: 'Outdoor Evening Seating with Warm Lanterns',
    title_ar: 'جلسات خارجية مسائية بفوانيس دافئة',
    category: 'outdoor',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    sort_order: 1,
    created_at: '2026-09-01'
  },
  {
    id: 'gal-2',
    title_en: 'The Cozy Bonfire Gathering in Diriyah',
    title_ar: 'شبة النار وجلسة الحطب في الدرعية',
    category: 'bonfire',
    image_url: 'https://images.unsplash.com/photo-1525869916826-972885c91c1e?auto=format&fit=crop&w=1000&q=80',
    sort_order: 2,
    created_at: '2026-09-02'
  },
  {
    id: 'gal-3',
    title_en: 'Traditional Karak Tea Pouring',
    title_ar: 'سكب شاي الكرك الأصيل',
    category: 'tea',
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=80',
    sort_order: 3,
    created_at: '2026-09-03'
  },
  {
    id: 'gal-4',
    title_en: 'Specialty Espresso Extraction',
    title_ar: 'استخلاص الإسبريسو المختص',
    category: 'coffee',
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
    sort_order: 4,
    created_at: '2026-09-04'
  },
  {
    id: 'gal-5',
    title_en: 'Warm Cafe Interior & Historic Walls',
    title_ar: 'التصميم الداخلي الدافئ بروح التراث',
    category: 'interior',
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
    sort_order: 5,
    created_at: '2026-09-05'
  },
  {
    id: 'gal-6',
    title_en: 'Nighttime Atmosphere under the Stars',
    title_ar: 'أجواء الليل والهدوء تحت سماء الرياض',
    category: 'evening',
    image_url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1000&q=80',
    sort_order: 6,
    created_at: '2026-09-06'
  },
  {
    id: 'gal-7',
    title_en: 'Fresh Baked Saffron & Date Sweets',
    title_ar: 'حلويات التمر والزعفران الطازجة يومياً',
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=80',
    sort_order: 7,
    created_at: '2026-09-07'
  },
  {
    id: 'gal-8',
    title_en: 'Artisan Latte Art in Ceramic Cups',
    title_ar: 'فنون اللاتيه في أكواب فخارية أنيقة',
    category: 'coffee',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    sort_order: 8,
    created_at: '2026-09-08'
  }
];
