import { supabase, isSupabaseConfigured } from './supabase';
import {
  BusinessSettings,
  Category,
  GalleryImage,
  OpeningHour,
  Order,
  OrderStatus,
  Product,
  PaymentGateway,
  CustomerReview,
} from '../types';
import {
  INITIAL_BUSINESS_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_GALLERY_IMAGES,
  INITIAL_OPENING_HOURS,
  INITIAL_PRODUCTS,
} from './initialData';

const STORAGE_KEYS = {
  SETTINGS: 'gs_business_settings',
  HOURS: 'gs_opening_hours',
  CATEGORIES: 'gs_categories',
  PRODUCTS: 'gs_products',
  GALLERY: 'gs_gallery',
  ORDERS: 'gs_orders',
  GATEWAYS: 'gs_payment_gateways',
  REVIEWS: 'gs_customer_reviews',
};

export const INITIAL_PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'gw_apple_pay',
    type: 'automatic',
    name_en: 'Apple Pay',
    name_ar: 'أبل باي',
    description_en: 'Fast and secure contactless payment using Apple Wallet',
    description_ar: 'الدفع السريع والآمن باستخدام محفظة أبل باي',
    icon: 'apple-pay',
    is_enabled: true,
    sort_order: 1,
    provider: 'moyasar',
    is_test_mode: true,
    public_key: 'pk_live_gulfspring_applepay_9921',
  },
  {
    id: 'gw_mada_visa',
    type: 'automatic',
    name_en: 'Mada, Visa & Mastercard',
    name_ar: 'مدى، فيزا وماستركارد',
    description_en: 'Secure online card payment gateway',
    description_ar: 'بوابة الدفع الإلكتروني الآمنة بالبطاقات البنكية',
    icon: 'credit-card',
    is_enabled: true,
    sort_order: 2,
    provider: 'moyasar',
    is_test_mode: true,
    public_key: 'pk_live_gulfspring_cards_8832',
  },
  {
    id: 'gw_stc_pay',
    type: 'automatic',
    name_en: 'STC Pay / Urpay',
    name_ar: 'إس تي سي باي / يورباي',
    description_en: 'Mobile wallet payment via STC Pay',
    description_ar: 'الدفع عبر المحفظة الرقمية إس تي سي باي',
    icon: 'smartphone',
    is_enabled: true,
    sort_order: 3,
    provider: 'tap',
    is_test_mode: true,
  },
  {
    id: 'gw_bank_transfer',
    type: 'manual',
    name_en: 'Direct Bank Transfer (Al Rajhi / SNB)',
    name_ar: 'تحويل بنكي مباشر (مصرف الراجحي / الأهلي)',
    description_en: 'Transfer funds directly to our bank account and share receipt',
    description_ar: 'التحويل المباشر لحسابنا البنكي وإرسال إيصال التحويل',
    icon: 'building',
    is_enabled: true,
    sort_order: 4,
    bank_name_en: 'Al Rajhi Bank',
    bank_name_ar: 'مصرف الراجحي',
    account_name: 'مؤسسة نبع الدرعية لتقديم المشروبات',
    iban: 'SA0380000000608010167519',
    account_number: '208608010167519',
    instructions_en: 'Please transfer the exact amount and send transfer receipt via WhatsApp.',
    instructions_ar: 'يرجى تحويل المبلغ كاملاً وإرسال صورة الإيصال عبر الواتساب لتأكيد الطلب فورا.',
  },
  {
    id: 'gw_cash_counter',
    type: 'manual',
    name_en: 'Cash on Delivery / Pay at Counter',
    name_ar: 'الدفع نقداً عند الاستلام أو في الكافيه',
    description_en: 'Pay cash when picking up your order or upon delivery',
    description_ar: 'الدفع نقداً عند استلام طلبك من الكافيه أو عند وصول مندوب التوصيل',
    icon: 'banknote',
    is_enabled: true,
    sort_order: 5,
    instructions_en: 'Please have exact cash ready if possible.',
    instructions_ar: 'يرجى توفير المبلغ المطابق قدر الإمكان لتسهيل الاستلام.',
  },
];

export const INITIAL_CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev_1',
    customer_name: 'عبدالله القحطاني',
    rating: 5,
    favorite_item: 'شبة النار وبراد الكرك',
    comment: 'أجمل جلسة حطب وشاي كرك في الدرعية! الأجواء هادئة والخدمة سريعة جداً، شكراً نبع الدرعية.',
    created_at: '2026-03-28T21:30:00Z',
    is_approved: true,
  },
  {
    id: 'rev_2',
    customer_name: 'ساره الرويلي',
    rating: 5,
    favorite_item: 'قهوة V60 إثيوبي وكيك الزعفران',
    comment: 'القهوة المختصة عندهم موزونة وممتازة، وفتحتهم طوال الليل ميزة عظيمة لأهل الرياض.',
    created_at: '2026-03-29T02:15:00Z',
    is_approved: true,
  },
  {
    id: 'rev_3',
    customer_name: 'Fahad M.',
    rating: 4,
    favorite_item: 'Spanish Latte & Date Pudding',
    comment: 'Cozy bonfire setup and incredible Karak tea. Will definitely come back with friends!',
    created_at: '2026-03-30T04:00:00Z',
    is_approved: true,
  },
];

// Safe JSON loader
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// -------------------------------------------------------------
// BUSINESS SETTINGS
// -------------------------------------------------------------
export async function getBusinessSettings(): Promise<BusinessSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('id', 'gulf-spring-settings-01')
        .single();
      if (!error && data) {
        saveLocal(STORAGE_KEYS.SETTINGS, data);
        return data as BusinessSettings;
      }
    } catch (e) {
      console.warn('Supabase fetch settings failed, using cache:', e);
    }
  }
  return loadLocal<BusinessSettings>(STORAGE_KEYS.SETTINGS, INITIAL_BUSINESS_SETTINGS);
}

export async function updateBusinessSettings(updates: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const current = await getBusinessSettings();
  const updated: BusinessSettings = { ...current, ...updates };

  saveLocal(STORAGE_KEYS.SETTINGS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('business_settings')
        .upsert(updated, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase update settings error:', e);
    }
  }

  return updated;
}

// -------------------------------------------------------------
// OPENING HOURS
// -------------------------------------------------------------
export async function getOpeningHours(): Promise<OpeningHour[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('opening_hours')
        .select('*')
        .order('day_of_week', { ascending: true });
      if (!error && data && data.length > 0) {
        saveLocal(STORAGE_KEYS.HOURS, data);
        return data as OpeningHour[];
      }
    } catch (e) {
      console.warn('Supabase hours error:', e);
    }
  }
  return loadLocal<OpeningHour[]>(STORAGE_KEYS.HOURS, INITIAL_OPENING_HOURS);
}

export async function updateOpeningHours(hours: OpeningHour[]): Promise<OpeningHour[]> {
  saveLocal(STORAGE_KEYS.HOURS, hours);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('opening_hours').upsert(hours, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase update hours error:', e);
    }
  }

  return hours;
}

// -------------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        saveLocal(STORAGE_KEYS.CATEGORIES, data);
        return data as Category[];
      }
    } catch (e) {
      console.warn('Supabase categories error:', e);
    }
  }
  return loadLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
}

export async function saveCategory(category: Category): Promise<Category[]> {
  const current = await getCategories();
  const exists = current.some((c) => c.id === category.id);
  const updated = exists
    ? current.map((c) => (c.id === category.id ? category : c))
    : [...current, category];

  saveLocal(STORAGE_KEYS.CATEGORIES, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').upsert(category);
    } catch (e) {
      console.warn('Supabase save category error:', e);
    }
  }

  return updated;
}

export async function deleteCategory(id: string): Promise<Category[]> {
  const current = await getCategories();
  const updated = current.filter((c) => c.id !== id);
  saveLocal(STORAGE_KEYS.CATEGORIES, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete category error:', e);
    }
  }

  return updated;
}

// -------------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------------
export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        saveLocal(STORAGE_KEYS.PRODUCTS, data);
        return data as Product[];
      }
    } catch (e) {
      console.warn('Supabase products error:', e);
    }
  }
  return loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export async function saveProduct(product: Product): Promise<Product[]> {
  const current = await getProducts();
  const exists = current.some((p) => p.id === product.id);
  const updated = exists
    ? current.map((p) => (p.id === product.id ? product : p))
    : [...current, product];

  saveLocal(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').upsert(product);
    } catch (e) {
      console.warn('Supabase save product error:', e);
    }
  }

  return updated;
}

export async function deleteProduct(id: string): Promise<Product[]> {
  const current = await getProducts();
  const updated = current.filter((p) => p.id !== id);
  saveLocal(STORAGE_KEYS.PRODUCTS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete product error:', e);
    }
  }

  return updated;
}

// -------------------------------------------------------------
// GALLERY
// -------------------------------------------------------------
export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        saveLocal(STORAGE_KEYS.GALLERY, data);
        return data as GalleryImage[];
      }
    } catch (e) {
      console.warn('Supabase gallery error:', e);
    }
  }
  return loadLocal<GalleryImage[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY_IMAGES);
}

export async function saveGalleryImage(img: GalleryImage): Promise<GalleryImage[]> {
  const current = await getGalleryImages();
  const exists = current.some((g) => g.id === img.id);
  const updated = exists
    ? current.map((g) => (g.id === img.id ? img : g))
    : [img, ...current];

  saveLocal(STORAGE_KEYS.GALLERY, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('gallery_images').upsert(img);
    } catch (e) {
      console.warn('Supabase save gallery error:', e);
    }
  }

  return updated;
}

export async function deleteGalleryImage(id: string): Promise<GalleryImage[]> {
  const current = await getGalleryImages();
  const updated = current.filter((g) => g.id !== id);
  saveLocal(STORAGE_KEYS.GALLERY, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('gallery_images').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete gallery error:', e);
    }
  }

  return updated;
}

// -------------------------------------------------------------
// ORDERS
// -------------------------------------------------------------
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const formatted: Order[] = data.map((o: any) => ({
          ...o,
          items: o.order_items || [],
        }));
        saveLocal(STORAGE_KEYS.ORDERS, formatted);
        return formatted;
      }
    } catch (e) {
      console.warn('Supabase orders fetch error:', e);
    }
  }
  return loadLocal<Order[]>(STORAGE_KEYS.ORDERS, [
    {
      id: 'ord-seed-01',
      order_number: 'GS-20261001-0001',
      customer_name: 'Faisal Al-Otaibi',
      customer_phone: '+966501234567',
      customer_email: 'faisal@example.com',
      order_type: 'dine_in',
      status: 'completed',
      table_number: 'Table 7 (Bonfire Patio)',
      notes: 'Extra hot karak please',
      subtotal: 56.0,
      delivery_fee: 0,
      total: 56.0,
      payment_method: 'card',
      items: [
        {
          id: 'item-1',
          product_id: 'prod-1',
          product_name_en: 'Gulf Spring Signature Karak Pot',
          product_name_ar: 'براد كرك نبع الدرعية الخاص',
          price: 24,
          quantity: 1,
          size_name_en: 'Medium Pot',
          size_name_ar: 'براد وسط',
          item_total: 24,
        },
        {
          id: 'item-2',
          product_id: 'prod-7',
          product_name_en: 'Diriyah Warm Date Pudding with Vanilla Gelato',
          product_name_ar: 'بودينغ التمر الدافئ مع الآيسكريم وصوص الكراميل',
          price: 32,
          quantity: 1,
          item_total: 32,
        },
      ],
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'ord-seed-02',
      order_number: 'GS-20261002-0002',
      customer_name: 'Nouf Al-Dosari',
      customer_phone: '+966559876543',
      order_type: 'pickup',
      status: 'preparing',
      notes: 'Pickup in 15 minutes',
      subtotal: 75.0,
      delivery_fee: 0,
      total: 75.0,
      payment_method: 'cash',
      items: [
        {
          id: 'item-3',
          product_id: 'prod-12',
          product_name_en: 'Outdoor Bonfire Gathering Platter & Marshmallows',
          product_name_ar: 'بكج جلسة شبة النار والمارشميلو مع براد شاي',
          price: 75,
          quantity: 1,
          item_total: 75,
        },
      ],
      created_at: new Date(Date.now() - 1800000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);
}

export async function createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randSeq = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `GS-${dateStr}-${randSeq}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
  };

  const current = await getOrders();
  const updated = [newOrder, ...current];
  saveLocal(STORAGE_KEYS.ORDERS, updated);

  // Sync to Hostinger server disk database
  try {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number: newOrder.order_number,
          customer_id: newOrder.customer_id || null,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email || null,
          order_type: newOrder.order_type,
          status: newOrder.status,
          table_number: newOrder.table_number || null,
          delivery_address: newOrder.delivery_address || null,
          notes: newOrder.notes || null,
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.delivery_fee,
          total: newOrder.total,
          payment_method: newOrder.payment_method,
        })
        .select()
        .single();

      if (!orderErr && dbOrder) {
        newOrder.id = dbOrder.id;
        const itemsToInsert = newOrder.items.map((it) => ({
          order_id: dbOrder.id,
          product_id: it.product_id,
          product_name_en: it.product_name_en,
          product_name_ar: it.product_name_ar,
          price: it.price,
          quantity: it.quantity,
          size_name_en: it.size_name_en || null,
          size_name_ar: it.size_name_ar || null,
          extras: it.extras || null,
          item_total: it.item_total,
        }));
        await supabase.from('order_items').insert(itemsToInsert);
      }
    } catch (e) {
      console.warn('Supabase order insert error:', e);
    }
  }

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order[]> {
  const current = await getOrders();
  const updated = current.map((o) =>
    o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
  );
  saveLocal(STORAGE_KEYS.ORDERS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
    } catch (e) {
      console.warn('Supabase update order error:', e);
    }
  }

  return updated;
}

// -------------------------------------------------------------
// IMAGE UPLOAD HELPER
// -------------------------------------------------------------
export async function uploadImageFile(file: File, bucket = 'cafe-assets'): Promise<string> {
  // If Supabase is connected and bucket exists
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (!error) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (e) {
      console.warn('Supabase storage upload error, falling back to data URL:', e);
    }
  }

  // Fallback to client-side data URL for immediate zero-config persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// -------------------------------------------------------------
// HOSTINGER BACKUP & FULL DATABASE EXPORT
// -------------------------------------------------------------
export async function exportFullDatabaseJson(): Promise<string> {
  const [settings, hours, categories, products, gallery, orders] = await Promise.all([
    getBusinessSettings(),
    getOpeningHours(),
    getCategories(),
    getProducts(),
    getGalleryImages(),
    getOrders(),
  ]);

  const fullDb = {
    exported_at: new Date().toISOString(),
    cafe: 'Gulf Spring | نبع الدرعيه',
    settings,
    opening_hours: hours,
    categories,
    products,
    gallery_images: gallery,
    orders,
  };

  return JSON.stringify(fullDb, null, 2);
}

export async function syncServerDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const fullJson = await exportFullDatabaseJson();
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: fullJson,
    });
    if (res.ok) {
      return { success: true, message: 'Server database file updated on disk!' };
    }
    return { success: false, message: `Server returned status ${res.status}` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Server not reachable' };
  }
}

// -------------------------------------------------------------
// PAYMENT GATEWAYS
// -------------------------------------------------------------
export async function getPaymentGateways(): Promise<PaymentGateway[]> {
  return loadLocal<PaymentGateway[]>(STORAGE_KEYS.GATEWAYS, INITIAL_PAYMENT_GATEWAYS);
}

export async function updatePaymentGateway(id: string, updates: Partial<PaymentGateway>): Promise<PaymentGateway[]> {
  const current = await getPaymentGateways();
  const updated = current.map((g) => (g.id === id ? { ...g, ...updates } : g));
  saveLocal(STORAGE_KEYS.GATEWAYS, updated);
  return updated;
}

export async function createPaymentGateway(gateway: Omit<PaymentGateway, 'id'>): Promise<PaymentGateway[]> {
  const current = await getPaymentGateways();
  const newGateway: PaymentGateway = {
    ...gateway,
    id: `gw_${Date.now()}`,
  };
  const updated = [...current, newGateway];
  saveLocal(STORAGE_KEYS.GATEWAYS, updated);
  return updated;
}

export async function deletePaymentGateway(id: string): Promise<PaymentGateway[]> {
  const current = await getPaymentGateways();
  const updated = current.filter((g) => g.id !== id);
  saveLocal(STORAGE_KEYS.GATEWAYS, updated);
  return updated;
}

// -------------------------------------------------------------
// CUSTOMER REVIEWS
// -------------------------------------------------------------
export async function getCustomerReviews(): Promise<CustomerReview[]> {
  return loadLocal<CustomerReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_CUSTOMER_REVIEWS);
}

export async function createCustomerReview(review: Omit<CustomerReview, 'id' | 'created_at'>): Promise<CustomerReview[]> {
  const current = await getCustomerReviews();
  const newRev: CustomerReview = {
    ...review,
    id: `rev_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  const updated = [newRev, ...current];
  saveLocal(STORAGE_KEYS.REVIEWS, updated);
  return updated;
}
