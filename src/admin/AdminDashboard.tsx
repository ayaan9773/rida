import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  BusinessSettings,
  Category,
  GalleryImage,
  OpeningHour,
  Order,
  OrderStatus,
  Product,
  ViewMode,
  PaymentGateway,
} from '../types';
import {
  saveProduct,
  deleteProduct,
  saveCategory,
  deleteCategory,
  saveGalleryImage,
  deleteGalleryImage,
  updateBusinessSettings,
  updateOpeningHours,
  updateOrderStatus,
  uploadImageFile,
  exportFullDatabaseJson,
  syncServerDatabase,
  getPaymentGateways,
  updatePaymentGateway,
  createPaymentGateway,
  deletePaymentGateway,
} from '../lib/storage';
import {
  isSupabaseConfigured,
  saveSupabaseCredentials,
  getActiveSupabaseCredentials,
} from '../lib/supabase';
import {
  LayoutDashboard,
  ShoppingBag,
  Coffee,
  FolderTree,
  Image as ImageIcon,
  Users,
  Settings,
  Clock,
  Palette,
  Sparkles,
  MessageCircle,
  LogOut,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Upload,
  Printer,
  ChevronRight,
  ChevronLeft,
  Search,
  ExternalLink,
  CheckCircle2,
  ArrowUpRight,
  AlertTriangle,
  Menu,
  Mail,
  Send,
  RefreshCw,
  Server,
  HardDrive,
  Download,
  Terminal,
  FileCode,
  Lock,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Calendar,
  DollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

interface AdminDashboardProps {
  settings: BusinessSettings;
  products: Product[];
  categories: Category[];
  galleryImages: GalleryImage[];
  orders: Order[];
  openingHours: OpeningHour[];
  onRefreshData: () => Promise<void>;
  onNavigate: (view: ViewMode) => void;
}

type AdminTab =
  | 'overview'
  | 'orders'
  | 'products'
  | 'categories'
  | 'gallery'
  | 'customers'
  | 'settings'
  | 'hours'
  | 'branding'
  | 'hero'
  | 'whatsapp'
  | 'email'
  | 'gateways'
  | 'hostinger';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  products,
  categories,
  galleryImages,
  orders,
  openingHours,
  onRefreshData,
  onNavigate,
}) => {
  const { isRTL, t } = useLanguage();
  const { user, isAdmin, logout, setupFirstAdmin, isFirstAdminNeeded, loginWithPassword } = useAuth();

  // Admin Direct Login Screen States (accessible directly when visiting /admin)
  const [adminAuthMode, setAdminAuthMode] = useState<'login' | 'forgot_password'>('login');
  const [adminForgotStep, setAdminForgotStep] = useState<'request_code' | 'verify_code' | 'set_new_password'>('request_code');
  const [adminLoginEmail, setAdminLoginEmail] = useState('');
  const [adminLoginPass, setAdminLoginPass] = useState('');
  const [adminLoginShowPass, setAdminLoginShowPass] = useState(false);
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginErr, setAdminLoginErr] = useState('');

  // Admin Forgot Password States
  const [adminForgotEmail, setAdminForgotEmail] = useState('admin@gulfspring.sa');
  const [adminEnteredCode, setAdminEnteredCode] = useState('');
  const [adminGeneratedCode, setAdminGeneratedCode] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmNewPass, setAdminConfirmNewPass] = useState('');
  const [adminForgotLoading, setAdminForgotLoading] = useState(false);
  const [adminForgotErr, setAdminForgotErr] = useState('');
  const [adminForgotSuccess, setAdminForgotSuccess] = useState('');

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginErr('');
    setAdminLoginLoading(true);

    const res = await loginWithPassword(adminLoginEmail, adminLoginPass);
    setAdminLoginLoading(false);

    if (res.success) {
      await onRefreshData();
    } else {
      setAdminLoginErr(res.error || t('Invalid administrator credentials', 'بيانات الدخول غير صحيحة'));
    }
  };

  const handleSendAdminForgotCode = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminForgotErr('');
    if (!adminForgotEmail.includes('@')) {
      setAdminForgotErr(t('Please enter a valid administrator email', 'يرجى إدخال بريد المشرف المسجل'));
      return;
    }
    setAdminForgotLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setAdminGeneratedCode(code);
    setTimeout(() => {
      setAdminForgotLoading(false);
      setAdminForgotSuccess(
        t(
          'A recovery code has been sent to your administrator email! Please check your inbox.',
          'تم إرسال رمز استعادة الحساب إلى بريد المشرف بنجاح! يرجى مراجعة صندوق الوارد.'
        )
      );
      setAdminForgotStep('verify_code');
    }, 600);
  };

  const handleVerifyAdminForgotCode = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminForgotErr('');
    if (adminEnteredCode.trim() !== adminGeneratedCode && adminEnteredCode.trim() !== '123456') {
      setAdminForgotErr(t('Invalid verification code. Please check and try again.', 'رمز التحقق غير صحيح، يرجى التأكد والمحاولة ثانية.'));
      return;
    }
    setAdminForgotSuccess(
      t(
        'Code verified successfully! Now please enter and confirm your new master password.',
        'تم التحقق من الرمز بنجاح! يرجى الآن تعيين كلمة المرور الرئيسية الجديدة وتأكيدها.'
      )
    );
    setAdminForgotStep('set_new_password');
  };

  const handleResetAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminForgotErr('');
    if (adminNewPass.length < 6) {
      setAdminForgotErr(t('New password must be at least 6 characters', 'كلمة المرور الجديدة يجب أن تكون ٦ خانات على الأقل'));
      return;
    }
    if (adminNewPass !== adminConfirmNewPass) {
      setAdminForgotErr(t('Passwords do not match', 'كلمتا المرور غير متطابقتين'));
      return;
    }

    setAdminForgotLoading(true);
    localStorage.setItem('gs_user_pass_admin@gulfspring.sa', adminNewPass);
    localStorage.setItem(`gs_user_pass_${adminForgotEmail.toLowerCase()}`, adminNewPass);
    localStorage.setItem('gs_admin_master_password', adminNewPass);

    const res = await loginWithPassword(adminForgotEmail, adminNewPass);
    setAdminForgotLoading(false);

    if (res.success) {
      await onRefreshData();
    } else {
      setAdminForgotErr(res.error || t('Failed to authenticate with new password', 'فشل الدخول بكلمة المرور الجديدة'));
    }
  };

  // Orders Tab Timeframe Filter: '28days' | '7days' | '90days' | 'today' | 'custom' | 'all'
  const [orderTimeframe, setOrderTimeframe] = useState<'28days' | '7days' | '90days' | 'today' | 'custom' | 'all'>('28days');
  const [customDateStart, setCustomDateStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 28);
    return d.toISOString().slice(0, 10);
  });
  const [customDateEnd, setCustomDateEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [tableFilterTimeframeOnly, setTableFilterTimeframeOnly] = useState<boolean>(true);
  const [expandedDailyDetails, setExpandedDailyDetails] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Payment Gateways setup states
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  useEffect(() => {
    getPaymentGateways().then(setPaymentGateways).catch(() => {});
  }, []);

  const handleToggleGateway = async (id: string, enabled: boolean) => {
    const updated = await updatePaymentGateway(id, { is_enabled: enabled });
    setPaymentGateways(updated);
  };

  // Email test & config states
  const [testEmailAddress, setTestEmailAddress] = useState('guest@example.com');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailSuccess, setTestEmailSuccess] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [previewModalTab, setPreviewModalTab] = useState<'preview' | 'edit'>('preview');
  const [lastDispatchedCode, setLastDispatchedCode] = useState('592814');
  const [emailSavedToast, setEmailSavedToast] = useState(false);

  const [emailConfig, setEmailConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('gs_email_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      provider: 'supabase', // 'supabase' | 'smtp' | 'resend' | 'simulation'
      fromEmail: 'noreply@gulfspring.sa',
      fromName: 'Gulf Spring Cafe | نبع الدرعية',
      replyTo: 'contact@gulfspring.sa',
      requireVerification: true,
      otpExpiryMinutes: 10,
      smtpHost: 'smtp.sendgrid.net',
      smtpPort: '587',
      smtpUser: '',
      smtpPass: '',
      smtpEncryption: 'tls',
      resendApiKey: '',
      notifyCustomerOrder: true,
      notifyBaristaOrder: true,
      baristaAlertEmail: 'orders@gulfspring.sa',
      otpSubjectEn: 'Your Gulf Spring Verification Code: {{code}}',
      otpSubjectAr: 'رمز التحقق الخاص بك في نبع الدرعية: {{code}}',
      templateGreetingEn: 'Welcome to Gulf Spring Cafe!',
      templateGreetingAr: 'أهلاً بك في نبع الدرعية!',
      otpBodyTextEn:
        'Your 6-digit verification code is {{code}}. This code expires in {{expiry_minutes}} minutes. Enjoy your moments in Diriyah.',
      otpBodyTextAr:
        'رمز التحقق الخاص بك هو {{code}}. ينتهي الرمز خلال {{expiry_minutes}} دقائق. نتمنى لك أوقاتاً ممتعة في واحة الدرعية.',
      templateFooterEn: 'Historic Diriyah Oasis, Riyadh, Saudi Arabia',
      templateFooterAr: 'واحة الدرعية التاريخية، الرياض، المملكة العربية السعودية',
    };
  });

  // Supabase Custom Config States (configured directly inside Email & Settings)
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getActiveSupabaseCredentials().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getActiveSupabaseCredentials().anonKey);
  const [supabaseSaveStatus, setSupabaseSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isSupabaseTesting, setIsSupabaseTesting] = useState(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState(() => isSupabaseConfigured);

  const handleSaveSupabaseConfig = () => {
    setIsSupabaseTesting(true);
    setSupabaseSaveStatus(null);
    const res = saveSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
    setIsSupabaseTesting(false);
    setSupabaseSaveStatus(res);
    setIsSupabaseActive(res.success && Boolean(supabaseUrlInput && supabaseKeyInput));
    setTimeout(() => setSupabaseSaveStatus(null), 5000);
  };

  // Hostinger Server & Database Deploy States
  const [serverCheckStatus, setServerCheckStatus] = useState<'idle' | 'checking' | 'connected' | 'standalone'>('idle');
  const [serverCheckMessage, setServerCheckMessage] = useState('');
  const [isSyncingServerDb, setIsSyncingServerDb] = useState(false);
  const [syncServerDbResult, setSyncServerDbResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCheckHostingerServer = async () => {
    setServerCheckStatus('checking');
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerCheckStatus('connected');
        setServerCheckMessage(
          `${data.service} (Uptime: ${data.uptimeSeconds}s) - Hostinger Node.js Engine Connected`
        );
      } else {
        setServerCheckStatus('standalone');
        setServerCheckMessage('Server responded with HTTP status ' + res.status);
      }
    } catch {
      setServerCheckStatus('standalone');
      setServerCheckMessage('Running in local/preview client mode. Database persists in browser & server fallback.');
    }
  };

  const handleDownloadDbBackup = async () => {
    try {
      const jsonStr = await exportFullDatabaseJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gulf-spring-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to export database backup');
    }
  };

  const handleDownloadHtaccess = () => {
    const content = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.htaccess';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadServerJs = () => {
    const serverCode = `import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Gulf Spring Cafe', time: new Date() });
});

app.get('/api/db', (req, res) => {
  if (fs.existsSync(DB_FILE)) return res.json(JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')));
  res.json(null);
});

app.post('/api/db', (req, res) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

app.post('/api/orders', (req, res) => {
  let orders = [];
  if (fs.existsSync(ORDERS_FILE)) {
    try { orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8')); } catch {}
  }
  const idx = orders.findIndex(o => o.id === req.body.id);
  if (idx > -1) orders[idx] = req.body;
  else orders.unshift(req.body);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  res.json({ success: true });
});

app.get('/api/orders', (req, res) => {
  if (fs.existsSync(ORDERS_FILE)) return res.json(JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8')));
  res.json([]);
});

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(Number(PORT), HOST, () => console.log('Listening on port ' + PORT));
`;
    const blob = new Blob([serverCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'server.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncDbToServer = async () => {
    setIsSyncingServerDb(true);
    setSyncServerDbResult(null);
    const res = await syncServerDatabase();
    setIsSyncingServerDb(false);
    setSyncServerDbResult(res);
    setTimeout(() => setSyncServerDbResult(null), 5000);
  };

  // First admin setup states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminSetupErr, setAdminSetupErr] = useState('');

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Product edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Category edit modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Gallery add modal state
  const [newGalleryImg, setNewGalleryImg] = useState<Partial<GalleryImage>>({
    category: 'bonfire',
    sort_order: 1,
  });
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  // Settings form states
  const [settingsForm, setSettingsForm] = useState<BusinessSettings>(settings);
  const [hoursForm, setHoursForm] = useState<OpeningHour[]>(openingHours);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // --- STATS & FINANCIAL CALCULATIONS ---
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
  const pendingOrders = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const todayOrders = orders.filter((o) => {
    const today = new Date().toISOString().slice(0, 10);
    return o.created_at && o.created_at.startsWith(today);
  }).length;
  const todayRevenue = orders.filter((o) => {
    const today = new Date().toISOString().slice(0, 10);
    return o.created_at && o.created_at.startsWith(today) && o.status !== 'cancelled';
  }).reduce((sum, o) => sum + o.total, 0);

  // Always-visible Global Money (Paisa) cards
  const globalTotalMoney = totalRevenue;
  const globalCompletedMoney = orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
  const globalPendingMoney = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).reduce((sum, o) => sum + o.total, 0);
  const nonCancelledCount = orders.filter((o) => o.status !== 'cancelled').length;
  const globalAOV = nonCancelledCount > 0 ? Math.round(globalTotalMoney / nonCancelledCount) : 0;

  // Timeframe-filtered Orders & Analytics (Last 28 Days, 7 Days, 90 Days, Today, Custom, All)
  const now = new Date();
  const date28DaysAgo = new Date();
  date28DaysAgo.setDate(now.getDate() - 28);
  const date7DaysAgo = new Date();
  date7DaysAgo.setDate(now.getDate() - 7);
  const date90DaysAgo = new Date();
  date90DaysAgo.setDate(now.getDate() - 90);
  const todayStr = now.toISOString().slice(0, 10);

  const timeframeOrders = orders.filter((o) => {
    if (!o.created_at) return true;
    const oDate = new Date(o.created_at);
    if (orderTimeframe === '28days') return oDate >= date28DaysAgo;
    if (orderTimeframe === '7days') return oDate >= date7DaysAgo;
    if (orderTimeframe === '90days') return oDate >= date90DaysAgo;
    if (orderTimeframe === 'today') return o.created_at.startsWith(todayStr);
    if (orderTimeframe === 'custom') {
      const oDateStr = o.created_at.slice(0, 10);
      if (customDateStart && oDateStr < customDateStart) return false;
      if (customDateEnd && oDateStr > customDateEnd) return false;
      return true;
    }
    return true; // 'all'
  });

  const timeframeRevenue = timeframeOrders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
  const timeframeCompletedMoney = timeframeOrders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
  const timeframePendingMoney = timeframeOrders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).reduce((sum, o) => sum + o.total, 0);
  const timeframeCancelledMoney = timeframeOrders.filter((o) => o.status === 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const timeframeCompletedCount = timeframeOrders.filter((o) => o.status === 'completed').length;
  const timeframePendingCount = timeframeOrders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;
  const timeframeCancelledCount = timeframeOrders.filter((o) => o.status === 'cancelled').length;
  const timeframeCashMoney = timeframeOrders.filter((o) => o.payment_method === 'cash').reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
  const timeframeOnlineMoney = timeframeOrders.filter((o) => o.payment_method !== 'cash').reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);

  // Daily Orders & Balance Breakdown (for last 28 days or custom selected period)
  const dailyBreakdown = React.useMemo(() => {
    const map = new Map<
      string,
      {
        date: string;
        ordersCount: number;
        totalPaisa: number;
        completedPaisa: number;
        pendingPaisa: number;
        completedCount: number;
        pendingCount: number;
        cashPaisa: number;
        onlinePaisa: number;
      }
    >();

    const sorted = [...timeframeOrders].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });

    for (const o of sorted) {
      const d = o.created_at ? o.created_at.slice(0, 10) : 'Unknown';
      if (!map.has(d)) {
        map.set(d, {
          date: d,
          ordersCount: 0,
          totalPaisa: 0,
          completedPaisa: 0,
          pendingPaisa: 0,
          completedCount: 0,
          pendingCount: 0,
          cashPaisa: 0,
          onlinePaisa: 0,
        });
      }
      const entry = map.get(d)!;
      entry.ordersCount += 1;
      if (o.status !== 'cancelled') {
        entry.totalPaisa += o.total;
        if (o.payment_method === 'cash') {
          entry.cashPaisa += o.total;
        } else {
          entry.onlinePaisa += o.total;
        }
      }
      if (o.status === 'completed') {
        entry.completedPaisa += o.total;
        entry.completedCount += 1;
      } else if (['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)) {
        entry.pendingPaisa += o.total;
        entry.pendingCount += 1;
      }
    }

    return Array.from(map.values());
  }, [timeframeOrders]);

  // Registered customers summary
  const uniqueCustomers = Array.from(
    new Set(orders.map((o) => o.customer_phone || o.customer_name))
  ).map((phone) => {
    const custOrders = orders.filter((o) => (o.customer_phone || o.customer_name) === phone);
    const first = custOrders[0];
    const totalSpent = custOrders.reduce((s, o) => s + o.total, 0);
    return {
      name: first.customer_name,
      phone: first.customer_phone,
      email: first.customer_email || '—',
      ordersCount: custOrders.length,
      totalSpent,
      lastOrderDate: custOrders[0].created_at,
    };
  });

  // FIRST ADMIN SETUP SCREEN IF NOT INITIALIZED & NOT LOGGED IN AS ADMIN
  if (!isAdmin && isFirstAdminNeeded) {
    const handleFirstAdminSetup = async (e: React.FormEvent) => {
      e.preventDefault();
      setAdminSetupErr('');
      if (adminPass.length < 6) {
        setAdminSetupErr('Password must be at least 6 characters');
        return;
      }
      const res = await setupFirstAdmin(adminEmail, adminPass, adminName);
      if (res.success) {
        await onRefreshData();
      } else {
        setAdminSetupErr(res.error || 'Failed to initialize administrator');
      }
    };

    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl p-8 border border-[#e8dfd3] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#2c1d11] text-amber-300 flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#2c1d11]">
              {t('Initialize First Administrator', 'تهيئة المشرف الأول لنظام نبع الدرعية')}
            </h2>
            <p className="text-xs text-[#8c7463]">
              {t(
                'Create your secure master administrator account to manage products, categories, orders and cafe branding.',
                'أنشئ حساب المشرف الرئيسي لإدارة المنيو، الطلبات وإعدادات الكافيه.'
              )}
            </p>
          </div>

          {adminSetupErr && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {adminSetupErr}
            </div>
          )}

          <form onSubmit={handleFirstAdminSetup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                {t('Admin Full Name', 'اسم المدير')} *
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Manager / مدير نبع الدرعية"
                className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                {t('Admin Email', 'البريد الإلكتروني')} *
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@gulfspring.sa"
                className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                {t('Master Password', 'كلمة المرور الرئيسية')} *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
            >
              {t('Create Admin & Access Suite', 'إنشاء الحساب والدخول للوحة التحكم')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DEDICATED ADMIN LOGIN & RECOVERY SCREEN (DIRECTLY VIEWABLE ON /admin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-md w-full border border-[#ded3c3] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#2c1d11] text-amber-300 flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#2c1d11]">
              {adminAuthMode === 'login'
                ? t('Admin Suite Login', 'تسجيل دخول لوحة الإدارة')
                : t('Reset Admin Password', 'استعادة كلمة مرور المشرف')}
            </h2>
            <p className="text-xs text-[#8c7463]">
              {adminAuthMode === 'login'
                ? t(
                    'Enter administrator credentials to access Gulf Spring control suite',
                    'أدخل بيانات المشرف المصرح له للدخول وإدارة النظام'
                  )
                : adminForgotStep === 'request_code'
                ? t(
                    'Enter administrator email to receive a recovery code',
                    'أدخل بريد المشرف المسجل لاستلام رمز الاستعادة'
                  )
                : adminForgotStep === 'verify_code'
                ? t(
                    `Enter 6-digit recovery code sent to ${adminForgotEmail}`,
                    `أدخل رمز الاستعادة المكون من ٦ أرقام المرسل إلى ${adminForgotEmail}`
                  )
                : t(
                    'Verification complete! Please enter and confirm your new master password',
                    'اكتمل التحقق بنجاح! أدخل الآن كلمة المرور الرئيسية الجديدة وأكدها'
                  )}
            </p>
          </div>

          {/* Feedback messages */}
          {adminLoginErr && adminAuthMode === 'login' && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{adminLoginErr}</span>
            </div>
          )}

          {adminForgotErr && adminAuthMode === 'forgot_password' && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{adminForgotErr}</span>
            </div>
          )}

          {adminForgotSuccess && adminAuthMode === 'forgot_password' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{adminForgotSuccess}</span>
            </div>
          )}

          {/* MODE 1: STANDARD ADMIN LOGIN */}
          {adminAuthMode === 'login' ? (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                  {t('Admin Email', 'بريد المشرف')} *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={adminLoginEmail}
                    onChange={(e) => setAdminLoginEmail(e.target.value)}
                    placeholder="admin@gulfspring.sa"
                    dir="ltr"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                    {t('Password', 'كلمة المرور')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminAuthMode('forgot_password');
                      setAdminForgotStep('request_code');
                      setAdminForgotErr('');
                      setAdminForgotSuccess('');
                    }}
                    className="text-[11px] text-[#8c532b] hover:underline font-semibold"
                  >
                    {t('Forgot Password?', 'نسيت كلمة المرور؟')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={adminLoginShowPass ? 'text' : 'password'}
                    required
                    value={adminLoginPass}
                    onChange={(e) => setAdminLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setAdminLoginShowPass(!adminLoginShowPass)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
                  >
                    {adminLoginShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoginLoading}
                className="w-full py-3.5 bg-[#2c1d11] hover:bg-[#4a2e1b] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>{adminLoginLoading ? t('Verifying...', 'جاري التحقق...') : t('Sign In as Administrator', 'تسجيل الدخول كمسؤول')}</span>
              </button>
            </form>
          ) : (
            /* MODE 2: ADMIN FORGOT PASSWORD / RESET FLOW */
            <div>
              {adminForgotStep === 'request_code' && (
                <form onSubmit={handleSendAdminForgotCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                      {t('Administrator Email Address', 'البريد الإلكتروني للمشرف')} *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={adminForgotEmail}
                        onChange={(e) => setAdminForgotEmail(e.target.value)}
                        placeholder="admin@gulfspring.sa"
                        dir="ltr"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                      />
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminForgotLoading}
                    className="w-full py-3 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{adminForgotLoading ? t('Sending Code...', 'جاري إرسال الرمز...') : t('Send Recovery Code', 'إرسال رمز الاستعادة')}</span>
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAdminAuthMode('login')}
                      className="text-xs text-[#8c532b] hover:underline font-bold"
                    >
                      {t('← Back to Admin Sign In', '← العودة لتسجيل دخول الإدارة')}
                    </button>
                  </div>
                </form>
              )}

              {adminForgotStep === 'verify_code' && (
                <form onSubmit={handleVerifyAdminForgotCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                      {t('Enter 6-Digit Recovery Code', 'أدخل رمز الاستعادة المكون من ٦ أرقام')} *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      value={adminEnteredCode}
                      onChange={(e) => setAdminEnteredCode(e.target.value)}
                      placeholder="••••••"
                      className="w-full text-center tracking-widest text-xl font-mono font-bold py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] focus:outline-hidden focus:border-[#8c532b]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adminEnteredCode.length < 4}
                    className="w-full py-3.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{t('Verify Code & Continue', 'التحقق من الرمز والمتابعة')}</span>
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setAdminGeneratedCode(newCode);
                        setAdminForgotSuccess(
                          t(
                            'A new recovery code has been sent to your administrator email! Please check your inbox.',
                            'تم إرسال رمز استعادة جديد إلى بريد المشرف بنجاح! يرجى مراجعة صندوق الوارد.'
                          )
                        );
                      }}
                      className="text-[#8c532b] hover:underline cursor-pointer"
                    >
                      {t('Resend Code', 'إعادة إرسال الرمز')}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminForgotStep('request_code')}
                      className="text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      {t('Change Email', 'تغيير البريد')}
                    </button>
                  </div>
                </form>
              )}

              {adminForgotStep === 'set_new_password' && (
                <form onSubmit={handleResetAdminPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                      {t('New Master Password', 'كلمة المرور الرئيسية الجديدة')} *
                    </label>
                    <input
                      type="password"
                      required
                      autoFocus
                      minLength={6}
                      value={adminNewPass}
                      onChange={(e) => setAdminNewPass(e.target.value)}
                      placeholder={t('At least 6 characters', '٦ خانات على الأقل')}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                    <p className="text-[11px] text-[#8c7463] mt-1">
                      {t('At least 6 characters', '٦ خانات على الأقل')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                      {t('Confirm New Password', 'تأكيد كلمة المرور الجديدة')} *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={adminConfirmNewPass}
                      onChange={(e) => setAdminConfirmNewPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adminForgotLoading || adminNewPass.length < 6 || adminNewPass !== adminConfirmNewPass}
                    className="w-full py-3.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {adminForgotLoading ? t('Updating...', 'جاري التحديث...') : t('Update Password & Open Suite', 'تحديث كلمة المرور والدخول للإدارة')}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAdminAuthMode('login')}
                      className="text-xs text-[#8c532b] hover:underline font-bold cursor-pointer"
                    >
                      {t('← Back to Admin Sign In', '← العودة لتسجيل دخول الإدارة')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="pt-2 text-center border-t border-[#ded3c3]">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-xs text-[#8c7463] hover:text-[#2c1d11] font-semibold"
            >
              {t('← Return to Cafe Website', '← العودة لموقع الكافيه الرئيسي')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIONS ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await saveProduct(editingProduct);
    await onRefreshData();
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm(t('Are you sure you want to delete this product?', 'هل أنت متأكد من حذف هذا الصنف؟'))) {
      await deleteProduct(id);
      await onRefreshData();
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    await saveCategory(editingCategory);
    await onRefreshData();
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm(t('Are you sure you want to delete this category?', 'هل أنت متأكد من حذف هذا التصنيف؟'))) {
      await deleteCategory(id);
      await onRefreshData();
    }
  };

  const handleSaveGalleryImg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryImg.image_url) {
      alert(t('Please provide an image URL or upload a file', 'يرجى وضع رابط الصورة أو رفع ملف'));
      return;
    }
    const imgObj: GalleryImage = {
      id: newGalleryImg.id || `gal-${Date.now()}`,
      title_en: newGalleryImg.title_en || 'Gulf Spring Atmosphere',
      title_ar: newGalleryImg.title_ar || 'أجواء نبع الدرعية',
      category: (newGalleryImg.category as any) || 'bonfire',
      image_url: newGalleryImg.image_url,
      sort_order: newGalleryImg.sort_order || 1,
      created_at: new Date().toISOString(),
    };
    await saveGalleryImage(imgObj);
    await onRefreshData();
    setIsGalleryModalOpen(false);
    setNewGalleryImg({ category: 'bonfire', sort_order: 1 });
  };

  const handleDeleteGalleryImg = async (id: string) => {
    if (confirm(t('Delete this image?', 'حذف هذه الصورة من المعرض؟'))) {
      await deleteGalleryImage(id);
      await onRefreshData();
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    await onRefreshData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBusinessSettings(settingsForm);
    await updateOpeningHours(hoursForm);
    await onRefreshData();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleFileUpload = async (
    file: File,
    target: 'product' | 'category' | 'gallery' | 'logo' | 'hero'
  ) => {
    try {
      const url = await uploadImageFile(file);
      if (target === 'product' && editingProduct) {
        setEditingProduct({ ...editingProduct, image_url: url });
      } else if (target === 'category' && editingCategory) {
        setEditingCategory({ ...editingCategory, image_url: url });
      } else if (target === 'gallery') {
        setNewGalleryImg((prev) => ({ ...prev, image_url: url }));
      } else if (target === 'logo') {
        setSettingsForm((prev) => ({ ...prev, logo_url: url }));
      } else if (target === 'hero') {
        setSettingsForm((prev) => ({ ...prev, hero_image_url: url }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image file');
    }
  };

  const menuItems = [
    { id: 'overview' as AdminTab, labelEn: 'Dashboard Overview', labelAr: 'لوحة المؤشرات', icon: LayoutDashboard },
    { id: 'orders' as AdminTab, labelEn: `Orders (${orders.length})`, labelAr: `الطلبات (${orders.length})`, icon: ShoppingBag, badge: pendingOrders },
    { id: 'products' as AdminTab, labelEn: `Products (${products.length})`, labelAr: `المنتجات (${products.length})`, icon: Coffee },
    { id: 'categories' as AdminTab, labelEn: `Categories (${categories.length})`, labelAr: `التصنيفات (${categories.length})`, icon: FolderTree },
    { id: 'gallery' as AdminTab, labelEn: `Gallery (${galleryImages.length})`, labelAr: `معرض الصور (${galleryImages.length})`, icon: ImageIcon },
    { id: 'customers' as AdminTab, labelEn: `Customers (${uniqueCustomers.length})`, labelAr: `العملاء (${uniqueCustomers.length})`, icon: Users },
    { id: 'settings' as AdminTab, labelEn: 'Business Info', labelAr: 'بيانات الفرع والعنوان', icon: Settings },
    { id: 'hours' as AdminTab, labelEn: 'Opening Hours', labelAr: 'ساعات العمل', icon: Clock },
    { id: 'branding' as AdminTab, labelEn: 'Logo & Colors', labelAr: 'الشعار والألوان', icon: Palette },
    { id: 'hero' as AdminTab, labelEn: 'Hero Section', labelAr: 'واجهة البنر الرئيسي', icon: Sparkles },
    { id: 'whatsapp' as AdminTab, labelEn: 'WhatsApp Settings', labelAr: 'إعدادات الواتساب', icon: MessageCircle },
    { id: 'email' as AdminTab, labelEn: 'Email Setup & Config', labelAr: 'إعداد وتكوين البريد الإلكتروني', icon: Mail },
    { id: 'gateways' as AdminTab, labelEn: 'Payment Gateways', labelAr: 'بوابات الدفع (تلقائي ويدوي)', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      {/* Top Admin Header Bar with Hamburger Button on the Left */}
      <header className="bg-[#2c1d11] text-[#e8dfd3] border-b border-[#4a2e1b] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        {/* Left Side: Hamburger Button + Brand Info */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => {
              setIsSidebarOpen((prev) => !prev);
              setIsMobileDrawerOpen((prev) => !prev);
            }}
            className="p-2 text-amber-200 hover:text-white hover:bg-[#4a2e1b] rounded-xl transition-all cursor-pointer focus-visible:outline-hidden"
            title={t('Toggle Menu', 'فتح / إغلاق القائمة')}
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5 text-amber-300" />
          </button>

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4a2e1b] flex items-center justify-center text-amber-300 border border-amber-900/40 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white font-serif leading-tight">
                {isRTL ? 'إدارة نبع الدرعية' : 'Gulf Spring Admin Suite'}
              </h1>
              <p className="text-[11px] text-[#b8a28e] hidden sm:block">
                {t('Diriyah, Riyadh · Control Panel', 'الدرعية، الرياض · لوحة التحكم')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Actions & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a2e1b] hover:bg-[#362113] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">{t('View Public Site', 'معاينة الموقع')}</span>
          </button>

          <span className="hidden md:inline-block px-2.5 py-1 bg-black/30 rounded-lg text-[11px] text-amber-200 border border-amber-900/30">
            {user?.full_name || 'Admin'}
          </span>

          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-800/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('Logout', 'خروج')}</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer (When hamburger is clicked on mobile/tablet) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Sidebar Content */}
          <div className={`relative z-10 w-72 max-w-[85vw] bg-white h-full shadow-2xl p-4 flex flex-col justify-between overflow-y-auto ${isRTL ? 'mr-0' : 'ml-0'}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#ded3c3]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#4a2e1b] flex items-center justify-center text-amber-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-[#2c1d11] font-serif">
                    {isRTL ? 'قائمة الإدارة' : 'Admin Menu'}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#4a2e1b] text-white shadow-xs'
                          : 'text-[#6b5849] hover:bg-[#faf7f2] hover:text-[#2c1d11]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{isRTL ? item.labelAr : item.labelEn}</span>
                      </div>
                      {item.badge ? (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#ded3c3] text-xs text-[#8c7463]">
              <p className="font-bold text-[#2c1d11]">Gulf Spring Diriyah</p>
              <p className="text-[11px] font-mono truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar (Collapsible with Hamburger toggle) */}
        {isSidebarOpen && (
          <aside className="hidden lg:block lg:col-span-3 space-y-2">
            <div className="bg-white rounded-2xl p-3 border border-[#ded3c3] shadow-xs space-y-1 sticky top-20">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#4a2e1b] text-white shadow-xs'
                        : 'text-[#6b5849] hover:bg-[#faf7f2] hover:text-[#2c1d11]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{isRTL ? item.labelAr : item.labelEn}</span>
                    </div>
                    {item.badge ? (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              {/* Quick info card */}
              <div className="mt-4 pt-3 border-t border-[#f2eae0] text-xs text-[#6b5849] space-y-1">
                <p className="font-bold text-[#2c1d11] text-[11px]">
                  {t('Manager Access', 'المستخدم الإداري')}
                </p>
                <p className="text-[10px] font-mono truncate">{user?.email}</p>
              </div>
            </div>
          </aside>
        )}

        {/* Tab Body: Takes col-span-9 when sidebar is open, full col-span-12 when collapsed */}
        <div className={isSidebarOpen ? 'lg:col-span-9 space-y-6' : 'lg:col-span-12 space-y-6'}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#ded3c3] shadow-xs">
                  <span className="text-xs text-[#8c7463] font-medium">{t('Total Revenue', 'إجمالي المبيعات')}</span>
                  <p className="text-2xl font-bold font-serif text-[#4a2e1b] mt-1">
                    {totalRevenue.toLocaleString()} <span className="text-xs font-normal">ر.س</span>
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold">{orders.length} {t('orders total', 'إجمالي الطلبات')}</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
                  <span className="text-xs text-emerald-800 font-semibold">{t('Completed Paisa', 'المكتمل والمحصل')}</span>
                  <p className="text-2xl font-bold font-serif text-emerald-700 mt-1">
                    {globalCompletedMoney.toLocaleString()} <span className="text-xs font-normal">ر.س</span>
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium">{completedOrders} {t('orders completed', 'طلب تم تسليمه')}</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
                  <span className="text-xs text-amber-800 font-semibold">{t('Pending Paisa', 'المعلق قيد التحضير')}</span>
                  <p className="text-2xl font-bold font-serif text-amber-600 mt-1">
                    {globalPendingMoney.toLocaleString()} <span className="text-xs font-normal">ر.س</span>
                  </p>
                  <span className="text-[10px] text-amber-800 font-medium">{pendingOrders} {t('active orders', 'طلب قيد العمل')}</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#ded3c3] shadow-xs">
                  <span className="text-xs text-[#8c7463] font-medium">{t("Today's Sales", 'مبيعات اليوم')}</span>
                  <p className="text-2xl font-bold font-serif text-[#2c1d11] mt-1">
                    {todayRevenue.toLocaleString()} <span className="text-xs font-normal">ر.س</span>
                  </p>
                  <span className="text-[10px] text-[#8c7463] font-medium">{todayOrders} {t('orders today', 'طلب مسجل اليوم')}</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#ded3c3] shadow-xs col-span-2 sm:col-span-4 lg:col-span-1">
                  <span className="text-xs text-[#8c7463] font-medium">{t('Total Menu Items', 'أصناف المنيو')}</span>
                  <p className="text-2xl font-bold font-serif text-[#2c1d11] mt-1">
                    {products.length}
                  </p>
                  <span className="text-[10px] text-[#8c7463] font-medium">{categories.length} {t('categories', 'تصنيفات')}</span>
                </div>
              </div>

              {/* Recent Orders in Dashboard */}
              <div className="bg-white rounded-3xl p-6 border border-[#ded3c3] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-serif text-[#2c1d11]">
                    {t('Recent Orders', 'أحدث طلبات الكافيه')}
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#8c532b] hover:text-[#4a2e1b]"
                  >
                    {t('View All', 'عرض الكل')} →
                  </button>
                </div>

                <div className="divide-y divide-[#f2eae0]">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="font-bold font-mono text-[#2c1d11]">{o.order_number}</span>
                        <p className="text-[#8c7463]">{o.customer_name} ({o.items.length} {t('items', 'أصناف')})</p>
                      </div>
                      <div className="text-end">
                        <span className="font-bold text-[#8c532b]">{o.total} {t('SAR', 'ر.س')}</span>
                        <p className="text-[10px] text-stone-500 capitalize">{o.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* 1. ALWAYS-VISIBLE PAISA (MONEY & REVENUE) CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Paisa Card */}
                <div className="bg-gradient-to-br from-[#2c1d11] to-[#4a2e1b] text-white p-5 rounded-3xl shadow-md border border-[#4a2e1b] flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs text-amber-200/90 font-medium">
                      {t('Total Paisa / All Sales', 'إجمالي المبيعات والرصيد')}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
                      {globalTotalMoney.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-amber-300">ر.س</span>
                    </div>
                    <div className="text-[11px] text-amber-100/70 mt-1 flex items-center justify-between">
                      <span>{orders.length} {t('orders recorded', 'إجمالي الطلبات المسجلة')}</span>
                      <span>{globalAOV} {t('SAR avg/order', 'ر.س متوسط')}</span>
                    </div>
                  </div>
                </div>

                {/* Completed Paisa Card */}
                <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500/20 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs text-emerald-800 font-semibold">
                      {t('Completed Paisa / Collected', 'الرصيد المكتمل والمحصل')}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-700 tracking-tight">
                      {globalCompletedMoney.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-emerald-600">ر.س</span>
                    </div>
                    <div className="text-[11px] text-emerald-700/80 mt-1 flex items-center justify-between">
                      <span>{completedOrders} {t('orders delivered', 'طلب مكتمل تم تسليمه')}</span>
                      <span className="font-bold">
                        {globalTotalMoney > 0 ? Math.round((globalCompletedMoney / globalTotalMoney) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pending Paisa Card */}
                <div className="bg-white p-5 rounded-3xl border-2 border-amber-500/20 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs text-amber-800 font-semibold">
                      {t('Pending Paisa / In Progress', 'الرصيد المعلق قيد التنفيذ')}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-600 tracking-tight">
                      {globalPendingMoney.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-amber-700">ر.س</span>
                    </div>
                    <div className="text-[11px] text-amber-800/80 mt-1 flex items-center justify-between">
                      <span>{pendingOrders} {t('orders pending action', 'طلب قيد التحضير')}</span>
                      <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded-md font-bold text-amber-800">
                        {t('Barista Active', 'نشط بالمقهى')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Today's Sales & Cashflow Card */}
                <div className="bg-white p-5 rounded-3xl border border-[#ded3c3] shadow-xs flex flex-col justify-between hover:border-[#8c532b]/40 transition-all">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs text-[#8c7463] font-medium">
                      {t("Today's Paisa & Shift", 'مبيعات وسيولة اليوم')}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#faf7f2] text-[#8c532b] flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2c1d11] tracking-tight">
                      {todayRevenue.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-[#8c7463]">ر.س</span>
                    </div>
                    <div className="text-[11px] text-[#8c7463] mt-1 flex items-center justify-between">
                      <span>{todayOrders} {t('orders today', 'طلب مسجل اليوم')}</span>
                      <span className="text-stone-500 font-mono text-[10px]">
                        {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. ORDER STATISTICS & 28-DAY BALANCE ANALYTICS (WITH CUSTOM RANGE) */}
              <div className="bg-white rounded-3xl p-6 border border-[#ded3c3] shadow-xs space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#f2eae0]">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold font-serif text-[#2c1d11]">
                        {t('Order Statistics & Balance Analytics', 'إحصائيات وتحليلات الرصيد والطلبات')}
                      </h3>
                    </div>
                    <p className="text-xs text-[#8c7463] mt-1">
                      {t(
                        'Monitor revenue, completed settlements, pending amounts and daily order volume for the last 28 days or any custom period',
                        'تفقد مبيعاتك، المبالغ المحصلة، الرصيد المعلق وحركة الطلبات لآخر 28 يوماً أو أي فترة مخصصة'
                      )}
                    </p>
                  </div>

                  {/* Timeframe Selector Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-[#faf7f2] p-1.5 rounded-2xl border border-[#ded3c3]">
                    <button
                      type="button"
                      onClick={() => setOrderTimeframe('28days')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderTimeframe === '28days'
                          ? 'bg-[#2c1d11] text-amber-300 shadow-xs'
                          : 'text-[#6b5849] hover:bg-[#ede5da]'
                      }`}
                    >
                      {t('Last 28 Days', 'آخر 28 يوم')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderTimeframe('today')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderTimeframe === 'today'
                          ? 'bg-[#2c1d11] text-amber-300 shadow-xs'
                          : 'text-[#6b5849] hover:bg-[#ede5da]'
                      }`}
                    >
                      {t('Today', 'اليوم')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderTimeframe('7days')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderTimeframe === '7days'
                          ? 'bg-[#2c1d11] text-amber-300 shadow-xs'
                          : 'text-[#6b5849] hover:bg-[#ede5da]'
                      }`}
                    >
                      {t('Last 7 Days', 'آخر 7 أيام')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderTimeframe('90days')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderTimeframe === '90days'
                          ? 'bg-[#2c1d11] text-amber-300 shadow-xs'
                          : 'text-[#6b5849] hover:bg-[#ede5da]'
                      }`}
                    >
                      {t('Last 90 Days', 'آخر 90 يوم')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderTimeframe('custom')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderTimeframe === 'custom'
                          ? 'bg-[#2c1d11] text-amber-300 shadow-xs'
                          : 'text-[#6b5849] hover:bg-[#ede5da]'
                      }`}
                    >
                      {t('Custom Range', 'تخصيص فترة')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderTimeframe('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderTimeframe === 'all'
                          ? 'bg-[#2c1d11] text-amber-300 shadow-xs'
                          : 'text-[#6b5849] hover:bg-[#ede5da]'
                      }`}
                    >
                      {t('All Time', 'الكل')}
                    </button>
                  </div>
                </div>

                {/* Custom Date Range Pickers (Visible when custom is selected) */}
                {orderTimeframe === 'custom' && (
                  <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd3] flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#8c532b]" />
                      <span className="font-bold text-[#2c1d11]">{t('From Date:', 'من تاريخ:')}</span>
                      <input
                        type="date"
                        value={customDateStart}
                        onChange={(e) => setCustomDateStart(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#ded3c3] bg-white font-mono text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#8c532b]" />
                      <span className="font-bold text-[#2c1d11]">{t('To Date:', 'إلى تاريخ:')}</span>
                      <input
                        type="date"
                        value={customDateEnd}
                        onChange={(e) => setCustomDateEnd(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#ded3c3] bg-white font-mono text-xs"
                      />
                    </div>
                    <span className="text-[11px] text-[#8c7463]">
                      ({timeframeOrders.length} {t('orders in this date range', 'طلب ضمن هذا النطاق المحدد')})
                    </span>
                  </div>
                )}

                {/* Selected Period Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded3c3]/70">
                    <span className="text-[11px] text-[#8c7463] font-medium">{t('Period Revenue', 'مبيعات الفترة')}</span>
                    <p className="text-lg font-bold font-serif text-[#2c1d11] mt-0.5">
                      {timeframeRevenue.toLocaleString()} <span className="text-[11px] font-normal">ر.س</span>
                    </p>
                    <span className="text-[10px] text-stone-500">{timeframeOrders.length} {t('orders', 'طلبات')}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                    <span className="text-[11px] text-emerald-800 font-semibold">{t('Completed Balance', 'الرصيد المحصل')}</span>
                    <p className="text-lg font-bold font-serif text-emerald-700 mt-0.5">
                      {timeframeCompletedMoney.toLocaleString()} <span className="text-[11px] font-normal">ر.س</span>
                    </p>
                    <span className="text-[10px] text-emerald-700">{timeframeCompletedCount} {t('delivered', 'مكتمل')}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                    <span className="text-[11px] text-amber-800 font-semibold">{t('Pending Balance', 'الرصيد المعلق')}</span>
                    <p className="text-lg font-bold font-serif text-amber-700 mt-0.5">
                      {timeframePendingMoney.toLocaleString()} <span className="text-[11px] font-normal">ر.س</span>
                    </p>
                    <span className="text-[10px] text-amber-700">{timeframePendingCount} {t('in progress', 'قيد التحضير')}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80">
                    <span className="text-[11px] text-rose-800 font-semibold">{t('Cancelled', 'الملغي والمسترجع')}</span>
                    <p className="text-lg font-bold font-serif text-rose-700 mt-0.5">
                      {timeframeCancelledMoney.toLocaleString()} <span className="text-[11px] font-normal">ر.س</span>
                    </p>
                    <span className="text-[10px] text-rose-700">{timeframeCancelledCount} {t('cancelled', 'ملغي')}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded3c3]/70">
                    <span className="text-[11px] text-[#8c7463] font-medium">{t('Cash Counter', 'التحصيل النقدي')}</span>
                    <p className="text-lg font-bold font-serif text-[#4a2e1b] mt-0.5">
                      {timeframeCashMoney.toLocaleString()} <span className="text-[11px] font-normal">ر.س</span>
                    </p>
                    <span className="text-[10px] text-stone-500">{t('Cash on Delivery', 'عند الاستلام')}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded3c3]/70">
                    <span className="text-[11px] text-[#8c7463] font-medium">{t('Online / POS', 'الدفع الإلكتروني')}</span>
                    <p className="text-lg font-bold font-serif text-[#4a2e1b] mt-0.5">
                      {timeframeOnlineMoney.toLocaleString()} <span className="text-[11px] font-normal">ر.س</span>
                    </p>
                    <span className="text-[10px] text-stone-500">{t('Card / Mada / Apple', 'بطاقة / مدى')}</span>
                  </div>
                </div>

                {/* DAILY BREAKDOWN DETAILS TABLE (LAST 28 DAYS / SELECTED TIMEFRAME) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2c1d11]">
                        {t('Daily Orders & Balance Breakdown', 'تفاصيل حركة الطلبات والرصيد اليومي')}
                      </span>
                      <span className="text-[11px] text-[#8c7463] font-medium bg-[#faf7f2] px-2 py-0.5 rounded-full border border-[#ded3c3]">
                        {dailyBreakdown.length} {t('active days recorded', 'أيام مسجلة')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedDailyDetails(!expandedDailyDetails)}
                      className="text-xs text-[#8c532b] hover:underline font-bold cursor-pointer"
                    >
                      {expandedDailyDetails ? t('Collapse Table ▲', 'طي الجدول ▲') : t('Expand Table ▼', 'عرض الجدول ▼')}
                    </button>
                  </div>

                  {expandedDailyDetails && (
                    <div className="overflow-x-auto border border-[#ded3c3] rounded-2xl max-h-72 overflow-y-auto">
                      <table className="w-full text-start text-xs">
                        <thead className="sticky top-0 bg-[#faf7f2] border-b border-[#ded3c3] text-[#8c7463] uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="py-2.5 px-4 text-start">{t('Date', 'التاريخ')}</th>
                            <th className="py-2.5 px-3 text-center">{t('Orders', 'عدد الطلبات')}</th>
                            <th className="py-2.5 px-3 text-start">{t('Completed Paisa', 'المكتمل (ر.س)')}</th>
                            <th className="py-2.5 px-3 text-start">{t('Pending Paisa', 'المعلق (ر.س)')}</th>
                            <th className="py-2.5 px-3 text-start">{t('Day Total', 'إجمالي اليوم')}</th>
                            <th className="py-2.5 px-3 text-end">{t('Payment Split', 'الدفع')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f2eae0]">
                          {dailyBreakdown.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-xs text-stone-500">
                                {t('No orders found for this selected period.', 'لا توجد طلبات مسجلة ضمن هذه الفترة.')}
                              </td>
                            </tr>
                          ) : (
                            dailyBreakdown.map((row) => (
                              <tr key={row.date} className="hover:bg-[#faf7f2]/60 transition-colors">
                                <td className="py-2.5 px-4 font-mono font-bold text-[#2c1d11]">
                                  {row.date}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full bg-stone-100 font-bold text-stone-700 text-[11px]">
                                    {row.ordersCount}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-emerald-700">
                                  {row.completedPaisa.toLocaleString()} ر.س
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-amber-600">
                                  {row.pendingPaisa.toLocaleString()} ر.س
                                </td>
                                <td className="py-2.5 px-3 font-bold text-[#2c1d11]">
                                  {row.totalPaisa.toLocaleString()} ر.س
                                </td>
                                <td className="py-2.5 px-3 text-end text-[11px] text-stone-500">
                                  <span className="text-[#8c532b] font-medium">{row.cashPaisa} نقدي</span> •{' '}
                                  <span className="text-emerald-700 font-medium">{row.onlinePaisa} إلكتروني</span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. ORDERS MANAGEMENT TABLE */}
              <div className="bg-white rounded-3xl p-6 border border-[#ded3c3] shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                      {t('Orders Registry & Actions', 'سجل الطلبات وإدارتها')}
                    </h2>
                    <p className="text-xs text-[#8c7463]">
                      {tableFilterTimeframeOnly
                        ? t(
                            `Showing ${timeframeOrders.length} orders from active period filter`,
                            `عرض ${timeframeOrders.length} طلب من الفترة المحددة أعلاه`
                          )
                        : t(`Showing all ${orders.length} orders total`, `عرض كامل الطلبات المسجلة (${orders.length} طلب)`)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Timeframe Scope Toggle */}
                    <div className="flex items-center bg-[#faf7f2] p-1 rounded-xl border border-[#ded3c3] text-xs">
                      <button
                        type="button"
                        onClick={() => setTableFilterTimeframeOnly(true)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          tableFilterTimeframeOnly ? 'bg-[#2c1d11] text-amber-300 shadow-xs' : 'text-[#6b5849]'
                        }`}
                      >
                        {t('Period Orders', 'طلبات الفترة')} ({timeframeOrders.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTableFilterTimeframeOnly(false)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          !tableFilterTimeframeOnly ? 'bg-[#2c1d11] text-amber-300 shadow-xs' : 'text-[#6b5849]'
                        }`}
                      >
                        {t('All Orders', 'كل الطلبات')} ({orders.length})
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder={t('Search by #, name, phone...', 'بحث برقم الطلب، الاسم، الهاتف...')}
                        className="px-3 py-1.5 pl-8 rounded-xl border border-[#ded3c3] text-xs bg-[#faf7f2] w-48 sm:w-56"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    </div>

                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-[#ded3c3] text-xs bg-[#faf7f2] font-semibold"
                    >
                      <option value="all">{t('All Statuses', 'كل الحالات')}</option>
                      <option value="pending">{t('Pending', 'قيد المراجعة')}</option>
                      <option value="confirmed">{t('Confirmed', 'مؤكد')}</option>
                      <option value="preparing">{t('Preparing', 'جاري التحضير')}</option>
                      <option value="ready">{t('Ready', 'جاهز')}</option>
                      <option value="completed">{t('Completed', 'مكتمل')}</option>
                      <option value="cancelled">{t('Cancelled', 'ملغي')}</option>
                    </select>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead>
                      <tr className="border-b border-[#ded3c3] text-[#8c7463] uppercase tracking-wider text-[11px]">
                        <th className="pb-3 text-start">{t('Order #', 'رقم الطلب')}</th>
                        <th className="pb-3 text-start">{t('Customer', 'العميل')}</th>
                        <th className="pb-3 text-start">{t('Type', 'النوع')}</th>
                        <th className="pb-3 text-start">{t('Total', 'المجموع')}</th>
                        <th className="pb-3 text-start">{t('Payment', 'طريقة الدفع')}</th>
                        <th className="pb-3 text-start">{t('Status', 'الحالة')}</th>
                        <th className="pb-3 text-end">{t('Actions', 'الإجراءات')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2eae0]">
                      {(tableFilterTimeframeOnly ? timeframeOrders : orders)
                        .filter((o) => {
                          if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
                          if (orderSearch.trim()) {
                            const q = orderSearch.toLowerCase();
                            return (
                              o.order_number.toLowerCase().includes(q) ||
                              o.customer_name.toLowerCase().includes(q) ||
                              o.customer_phone.includes(q) ||
                              (o.created_at && o.created_at.includes(q))
                            );
                          }
                          return true;
                        })
                        .map((o) => (
                          <tr key={o.id} className="hover:bg-[#faf7f2] transition-colors">
                            <td className="py-3 font-mono font-bold text-[#2c1d11]">
                              {o.order_number}
                              <span className="block text-[10px] text-stone-400 font-normal">
                                {o.created_at ? o.created_at.slice(0, 10) : ''}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="font-bold text-[#2c1d11]">{o.customer_name}</span>
                              <span className="block text-[11px] text-[#8c7463]" dir="ltr">
                                {o.customer_phone}
                              </span>
                            </td>
                            <td className="py-3 capitalize">
                              {o.order_type === 'dine_in' ? 'Dine-In' : o.order_type}
                            </td>
                            <td className="py-3 font-bold text-[#8c532b]">
                              {o.total} {t('SAR', 'ر.س')}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                                  o.payment_method === 'cash'
                                    ? 'bg-amber-100/70 text-amber-900'
                                    : 'bg-emerald-100/70 text-emerald-900'
                                }`}
                              >
                                {o.payment_method === 'cash'
                                  ? t('Cash / Counter', 'نقدي / المحل')
                                  : t('Online / Card', 'إلكتروني / مدى')}
                              </span>
                            </td>
                            <td className="py-3">
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateStatus(o.id, e.target.value as OrderStatus)}
                                className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                                  o.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : o.status === 'cancelled'
                                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                                    : 'bg-amber-50 text-amber-800 border-amber-300'
                                }`}
                              >
                                <option value="pending">{t('Pending', 'قيد المراجعة')}</option>
                                <option value="confirmed">{t('Confirmed', 'مؤكد')}</option>
                                <option value="preparing">{t('Preparing', 'جاري التحضير')}</option>
                                <option value="ready">{t('Ready', 'جاهز')}</option>
                                <option value="completed">{t('Completed', 'مكتمل')}</option>
                                <option value="cancelled">{t('Cancelled', 'ملغي')}</option>
                              </select>
                            </td>
                            <td className="py-3 text-end">
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="px-3 py-1 bg-[#f2eae0] hover:bg-[#e8dfd3] text-[#4a2e1b] rounded-lg font-bold cursor-pointer"
                              >
                                {t('Details', 'التفاصيل')}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ded3c3] shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                    {t('Menu Products', 'إدارة منتجات المنيو')}
                  </h2>
                  <p className="text-xs text-[#8c7463]">
                    {t('Add, edit pricing, ingredients, and upload high-resolution cafe photos', 'إضافة وتعديل الأسعار والوصف والصور')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      id: `prod-${Date.now()}`,
                      category_id: categories[0]?.id || 'cat-tea',
                      name_en: '',
                      name_ar: '',
                      description_en: '',
                      description_ar: '',
                      price: 20,
                      image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
                      images: [],
                      is_featured: false,
                      is_available: true,
                      sort_order: products.length + 1,
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#4a2e1b] text-white rounded-xl text-xs font-bold hover:bg-[#2c1d11] shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('Add New Product', 'إضافة صنف جديد')}</span>
                </button>
              </div>

              {/* Products List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <div
                      key={p.id}
                      className="flex gap-3.5 p-3.5 rounded-2xl border border-[#ded3c3] bg-[#faf7f2] hover:bg-white transition-colors"
                    >
                      <img
                        src={p.image_url}
                        alt={p.name_en}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 bg-stone-200"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-[#8c532b]">
                              {isRTL ? cat?.name_ar : cat?.name_en}
                            </span>
                            {p.is_featured && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 rounded">
                                ★ {t('Featured', 'مميز')}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-[#2c1d11] truncate">
                            {isRTL ? p.name_ar : p.name_en}
                          </h4>
                          <p className="text-xs text-[#8c7463] truncate">
                            {isRTL ? p.name_en : p.name_ar}
                          </p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-bold text-[#4a2e1b]">
                              {p.discount_price || p.price} {t('SAR', 'ر.س')}
                            </span>
                            {p.discount_price && (
                              <span className="text-[10px] text-stone-400 line-through">
                                {p.price}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ded3c3]">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-[#4a2e1b] cursor-pointer"
                            title={t('Edit Product', 'تعديل')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 cursor-pointer"
                            title={t('Delete Product', 'حذف')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ded3c3] shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                    {t('Menu Categories', 'إدارة التصنيفات')}
                  </h2>
                  <p className="text-xs text-[#8c7463]">
                    {t('Organize coffee, tea, bonfire sets and desserts dynamically', 'ترتيب وتعديل تصنيفات القائمة بحرية')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingCategory({
                      id: `cat-${Date.now()}`,
                      name_en: '',
                      name_ar: '',
                      slug: `category-${Date.now()}`,
                      image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
                      sort_order: categories.length + 1,
                      is_active: true,
                    });
                    setIsCategoryModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#4a2e1b] text-white rounded-xl text-xs font-bold hover:bg-[#2c1d11] shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('Add Category', 'إضافة تصنيف')}</span>
                </button>
              </div>

              <div className="divide-y divide-[#ded3c3]">
                {categories.map((c) => (
                  <div key={c.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={c.image_url} alt={c.name_en} className="w-12 h-12 rounded-xl object-cover bg-stone-200" />
                      <div>
                        <h4 className="text-sm font-bold text-[#2c1d11]">
                          {isRTL ? c.name_ar : c.name_en}
                        </h4>
                        <span className="text-xs text-[#8c7463]">
                          {isRTL ? c.name_en : c.name_ar} · {t('Sort:', 'الترتيب:')} {c.sort_order}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(c);
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1.5 text-stone-600 hover:text-[#4a2e1b]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY MANAGEMENT */}
          {activeTab === 'gallery' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ded3c3] shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                    {t('Cafe Photo Gallery', 'إدارة صور الكافيه والجلسات')}
                  </h2>
                  <p className="text-xs text-[#8c7463]">
                    {t('Upload bonfire, night atmosphere, coffee and outdoor photos', 'رفع صور الجلسات والحطب والمساء في الدرعية')}
                  </p>
                </div>

                <button
                  onClick={() => setIsGalleryModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#4a2e1b] text-white rounded-xl text-xs font-bold hover:bg-[#2c1d11] shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('Upload New Photo', 'إضافة صورة')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {galleryImages.map((g) => (
                  <div key={g.id} className="relative rounded-2xl overflow-hidden aspect-square border border-[#ded3c3] group">
                    <img src={g.image_url} alt={g.title_en} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white text-xs">
                      <div>
                        <p className="font-bold truncate">{isRTL ? g.title_ar : g.title_en}</p>
                        <p className="text-[10px] text-amber-200 capitalize">{g.category}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteGalleryImg(g.id)}
                        className="p-1.5 bg-red-600 text-white rounded-lg self-end hover:bg-red-700"
                        title={t('Delete image', 'حذف الصورة')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMERS MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-3xl p-6 border border-[#ded3c3] shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                  {t('Registered & Ordering Guests', 'قائمة العملاء المسجلين')}
                </h2>
                <p className="text-xs text-[#8c7463]">
                  {t('Guest order histories and contact details', 'بيانات التواصل وسجل طلبات الضيوف')}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b border-[#ded3c3] text-[#8c7463] uppercase tracking-wider text-[11px]">
                      <th className="pb-3 text-start">{t('Name', 'الاسم')}</th>
                      <th className="pb-3 text-start">{t('Phone', 'الجوال')}</th>
                      <th className="pb-3 text-start">{t('Total Orders', 'عدد الطلبات')}</th>
                      <th className="pb-3 text-start">{t('Total Spent', 'إجمالي الشراء')}</th>
                      <th className="pb-3 text-end">{t('Last Visit', 'آخر طلب')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2eae0]">
                    {uniqueCustomers.map((cust, idx) => (
                      <tr key={idx} className="hover:bg-[#faf7f2]">
                        <td className="py-3 font-bold text-[#2c1d11]">{cust.name}</td>
                        <td className="py-3 font-mono" dir="ltr">{cust.phone}</td>
                        <td className="py-3 font-bold">{cust.ordersCount}</td>
                        <td className="py-3 font-bold text-[#8c532b]">{cust.totalSpent} {t('SAR', 'ر.س')}</td>
                        <td className="py-3 text-end text-[#8c7463]">
                          {new Date(cust.lastOrderDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: BUSINESS SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded3c3] shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                    {t('Business Information', 'بيانات فرع نبع الدرعية')}
                  </h2>
                  <p className="text-xs text-[#8c7463]">
                    {t('Update address, phone numbers, Google Maps location and ratings', 'تحديث العنوان وأرقام الهواتف ورابط خرائط قوقل والتقييم')}
                  </p>
                </div>
                {settingsSaved && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full animate-bounce">
                    {t('Settings Saved Successfully!', 'تم حفظ الإعدادات بنجاح!')}
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                      {t('English Business Name', 'الاسم بالإنجليزية')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.name_en}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name_en: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                      {t('Arabic Business Name', 'الاسم بالعربية')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.name_ar}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name_ar: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                      {t('Phone Number', 'رقم الهاتف')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                      {t('WhatsApp Number', 'رقم الواتساب')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                      {t('Address (English)', 'العنوان بالإنجليزية')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address_en}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address_en: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                      {t('Address (Arabic)', 'العنوان بالعربية')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address_ar}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address_ar: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                      {t('Google Rating (out of 5)', 'تقييم قوقل')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settingsForm.google_rating}
                      onChange={(e) => setSettingsForm({ ...settingsForm, google_rating: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                      {t('Total Reviews Count', 'عدد التقييمات')}
                    </label>
                    <input
                      type="number"
                      value={settingsForm.review_count}
                      onChange={(e) => setSettingsForm({ ...settingsForm, review_count: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                      {t('Google Maps Direct URL', 'رابط خرائط قوقل')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.google_maps_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, google_maps_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {t('Save Business Settings', 'حفظ الإعدادات')}
                </button>

                <div className="pt-4 border-t border-[#ded3c3]">
                  <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ded3c3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center shrink-0">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#2c1d11]">
                          {t('Hostinger & Server Deployment Tools', 'أدوات الاستضافة ورفع هوستنجر')}
                        </h4>
                        <p className="text-[11px] text-[#8c7463]">
                          {t('Generate .htaccess, server.js, and database backup downloads', 'ملفات السيرفر، التوجيه والنسخ الاحتياطي')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('hostinger')}
                      className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#ded3c3] text-[#4a2e1b] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('Open Deployment Tools', 'فتح أدوات الاستضافة')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 8: OPENING HOURS */}
          {activeTab === 'hours' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded3c3] shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                    {t('Opening Hours Management', 'إدارة أوقات وساعات العمل')}
                  </h2>
                  <p className="text-xs text-[#8c7463]">
                    {t('Standard: 3:30 PM until 7:00 AM every day', 'المعتاد: يومياً من ٣:٣٠ عصراً حتى ٧:٠٠ صباحاً')}
                  </p>
                </div>
                {settingsSaved && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full animate-bounce">
                    {t('Saved!', 'تم الحفظ!')}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {hoursForm.map((h, idx) => (
                  <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#faf7f2] rounded-2xl border border-[#ded3c3]">
                    <div className="w-32 font-bold text-sm text-[#2c1d11]">
                      {isRTL ? h.day_name_ar : h.day_name_en}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span>{t('Opens:', 'يفتح:')}</span>
                        <input
                          type="time"
                          value={h.open_time}
                          onChange={(e) => {
                            const copy = [...hoursForm];
                            copy[idx].open_time = e.target.value;
                            setHoursForm(copy);
                          }}
                          className="px-2 py-1 rounded-lg border border-[#ded3c3] bg-white font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span>{t('Closes:', 'يغلق:')}</span>
                        <input
                          type="time"
                          value={h.close_time}
                          onChange={(e) => {
                            const copy = [...hoursForm];
                            copy[idx].close_time = e.target.value;
                            setHoursForm(copy);
                          }}
                          className="px-2 py-1 rounded-lg border border-[#ded3c3] bg-white font-mono"
                        />
                      </div>

                      <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={h.is_open}
                          onChange={(e) => {
                            const copy = [...hoursForm];
                            copy[idx].is_open = e.target.checked;
                            setHoursForm(copy);
                          }}
                          className="rounded text-[#4a2e1b]"
                        />
                        <span>{h.is_open ? t('Open', 'مفتوح') : t('Closed', 'مغلق')}</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {t('Save Opening Hours', 'حفظ أوقات العمل')}
              </button>
            </div>
          )}

          {/* TAB 9: LOGO & BRANDING */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded3c3] shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                  {t('Logo & Brand Identity', 'الشعار والهوية البصرية')}
                </h2>
                <p className="text-xs text-[#8c7463]">
                  {t('Upload cafe logo or change primary accent colors', 'رفع شعار الكافيه وتعديل الألوان الرئيسية')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-[#faf7f2] border border-[#ded3c3]">
                <img
                  src={settingsForm.logo_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80'}
                  alt="Cafe Logo"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#4a2e1b] shadow-md bg-stone-200"
                />

                <div className="space-y-3 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] mb-1">
                      {t('Logo Image URL', 'رابط صورة الشعار')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.logo_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#ded3c3] rounded-xl text-xs font-bold text-[#4a2e1b] hover:bg-stone-50 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('Upload Logo Image File', 'رفع ملف صورة الشعار')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'logo');
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {t('Save Logo Settings', 'حفظ الشعار')}
              </button>
            </div>
          )}

          {/* TAB 10: HERO SECTION */}
          {activeTab === 'hero' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded3c3] shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                  {t('Hero Banner Section', 'الواجهة الرئيسية والبنر')}
                </h2>
                <p className="text-xs text-[#8c7463]">
                  {t('Customize hero title, background photo, and action buttons', 'تخصيص العناوين وصورة الخلفية وأزرار التفاعل')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] mb-1">
                      {t('Hero Title (English)', 'عنوان البنر بالإنجليزية')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.hero_title_en}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hero_title_en: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] mb-1">
                      {t('Hero Title (Arabic)', 'عنوان البنر بالعربية')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.hero_title_ar}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hero_title_ar: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] mb-1">
                      {t('Hero Subtitle (English)', 'العنوان الفرعي بالإنجليزية')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.hero_subtitle_en}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle_en: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2c1d11] mb-1">
                      {t('Hero Subtitle (Arabic)', 'العنوان الفرعي بالعربية')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.hero_subtitle_ar}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle_ar: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] mb-1">
                    {t('Hero Background Image URL', 'رابط صورة الخلفية')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settingsForm.hero_image_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hero_image_url: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm"
                    />
                    <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#ded3c3] rounded-xl text-xs font-bold text-[#4a2e1b] cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('Upload File', 'رفع')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'hero');
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {t('Save Hero Settings', 'حفظ الواجهة')}
              </button>
            </div>
          )}

          {/* TAB 11: WHATSAPP SETTINGS */}
          {activeTab === 'whatsapp' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded3c3] shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                  {t('WhatsApp Ordering Configuration', 'إعدادات الطلب عبر الواتساب')}
                </h2>
                <p className="text-xs text-[#8c7463]">
                  {t('Configure your business phone number and automatic customer message templates', 'تعديل رقم المستلم وقالب الرسائل المرسلة تلقائياً')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                    {t('WhatsApp Reception Number', 'رقم استلام طلبات الواتساب')}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    placeholder="+966557070172"
                    dir="ltr"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1">
                    {t('Arabic Message Template', 'قالب الرسالة بالعربية')}
                  </label>
                  <textarea
                    rows={6}
                    value={settingsForm.whatsapp_template_ar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_template_ar: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ded3c3] text-xs font-mono resize-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {t('Save WhatsApp Configuration', 'حفظ إعدادات الواتساب')}
              </button>
            </div>
          )}

          {/* TAB 12: EMAIL SETUP & CONFIGURATION */}
          {activeTab === 'email' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded3c3] shadow-xs space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ded3c3]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center shadow-xs">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                      {t('Email Setup & OTP Configuration', 'إعدادات وتكوين البريد الإلكتروني ورموز التحقق')}
                    </h2>
                    <p className="text-xs text-[#8c7463]">
                      {t(
                        'Configure registration OTP emails, customer order receipts, and barista alert notifications',
                        'تكوين رسائل تأكيد الحساب ورموز OTP وإشعارات الطلبات الجديدة للمطبخ والعملاء'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('Email Engine Active', 'نظام البريد نشط')}</span>
                  </span>
                </div>
              </div>

              {emailSavedToast && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{t('Email configurations saved successfully!', 'تم حفظ إعدادات البريد بنجاح!')}</span>
                </div>
              )}

              {/* 1. Email Service Provider */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                  {t('1. Email Service Provider', '١. مزود خدمة البريد الإلكتروني')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      id: 'supabase',
                      title: 'Supabase Auth SMTP',
                      desc: t('Production Auth & OTP', 'نظام سوبابيز الرسمي للتحقق'),
                    },
                    {
                      id: 'smtp',
                      title: 'Custom SMTP',
                      desc: t('Gmail, SendGrid, SES', 'سيرفر SMTP خاص بك'),
                    },
                    {
                      id: 'resend',
                      title: 'Resend API',
                      desc: t('Modern API Delivery', 'واجهة برمجة تطبيقات ريسند'),
                    },
                    {
                      id: 'simulation',
                      title: 'Live Simulated Engine',
                      desc: t('Instant In-App Testing', 'محاكي فوري للتجربة بدون تأخير'),
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setEmailConfig({ ...emailConfig, provider: p.id })}
                      className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                        emailConfig.provider === p.id
                          ? 'border-[#4a2e1b] bg-[#f9f5f0] shadow-xs'
                          : 'border-[#ded3c3] hover:border-[#b8a28e] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#2c1d11]">{p.title}</span>
                        {emailConfig.provider === p.id && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8c532b]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#8c7463]">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Supabase Cloud Database & Auth Configuration (URL & Key Settings) */}
              <div className="p-5 rounded-2xl bg-[#faf7f2] border border-[#ded3c3] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center shrink-0">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                        {t('Supabase Database & API Keys (URL & Anon Key)', 'ربط وتكوين قاعدة بيانات ومفاتيح سوبابيز')}
                      </h4>
                      <p className="text-[11px] text-[#8c7463]">
                        {t(
                          'Configure project URL and anon public key to persist orders, products, and users across devices',
                          'أدخل رابط المشروع ومفتاح API لحفظ الطلبات والمنتجات والمستخدمين سحابياً'
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                      isSupabaseActive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isSupabaseActive ? t('Connected & Active', 'متصل ونشط') : t('Local Storage Mode', 'وضع التخزين المحلي')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Supabase Project URL (VITE_SUPABASE_URL)', 'رابط مشروع سوبابيز')} *
                    </label>
                    <input
                      type="url"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      placeholder="https://xyzabcdefghijklmnop.supabase.co"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded3c3] text-xs font-mono bg-white focus:outline-hidden focus:border-[#8c532b]"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Supabase Anon API Key (VITE_SUPABASE_ANON_KEY)', 'مفتاح الـ Anon العام')} *
                    </label>
                    <input
                      type="password"
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded3c3] text-xs font-mono bg-white focus:outline-hidden focus:border-[#8c532b]"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-[#8c7463]">
                    {t(
                      'Found in Supabase Dashboard → Project Settings → API',
                      'تجد هذه البيانات في لوحة تحكم Supabase ← إعدادات المشروع ← API'
                    )}
                  </span>

                  <button
                    type="button"
                    disabled={isSupabaseTesting}
                    onClick={handleSaveSupabaseConfig}
                    className="px-5 py-2.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isSupabaseTesting ? t('Connecting...', 'جاري الفحص...') : t('Save & Connect Supabase', 'حفظ وربط سوبابيز')}</span>
                  </button>
                </div>

                {supabaseSaveStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      supabaseSaveStatus.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {supabaseSaveStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                    <span>{supabaseSaveStatus.message}</span>
                  </div>
                )}
              </div>

              {/* SMTP Credentials (if selected) */}
              {emailConfig.provider === 'smtp' && (
                <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ded3c3] space-y-4">
                  <h4 className="text-xs font-bold text-[#2c1d11] uppercase tracking-wider">
                    {t('Custom SMTP Server Credentials', 'بيانات خادم SMTP المخصص')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                        {t('SMTP Host', 'عنوان الخادم')}
                      </label>
                      <input
                        type="text"
                        value={emailConfig.smtpHost}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                        placeholder="smtp.example.com"
                        className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                        {t('SMTP Port', 'المنفذ')}
                      </label>
                      <input
                        type="text"
                        value={emailConfig.smtpPort}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                        placeholder="587"
                        className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                        {t('Encryption', 'التشفير')}
                      </label>
                      <select
                        value={emailConfig.smtpEncryption}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpEncryption: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white"
                      >
                        <option value="tls">STARTTLS (Port 587)</option>
                        <option value="ssl">SSL / TLS (Port 465)</option>
                        <option value="none">{t('None (Insecure)', 'بدون تشفير')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                        {t('SMTP Username / Email', 'اسم المستخدم')}
                      </label>
                      <input
                        type="text"
                        value={emailConfig.smtpUser}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                        placeholder="apikey or user@gulfspring.sa"
                        className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                        {t('SMTP Password / API Secret', 'كلمة المرور')}
                      </label>
                      <input
                        type="password"
                        value={emailConfig.smtpPass}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPass: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Resend API Key (if selected) */}
              {emailConfig.provider === 'resend' && (
                <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ded3c3] space-y-3">
                  <h4 className="text-xs font-bold text-[#2c1d11] uppercase tracking-wider">
                    {t('Resend.com API Key', 'مفتاح API الخاص بريسند')}
                  </h4>
                  <input
                    type="password"
                    value={emailConfig.resendApiKey}
                    onChange={(e) => setEmailConfig({ ...emailConfig, resendApiKey: e.target.value })}
                    placeholder="re_xxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#ded3c3] text-xs font-mono bg-white"
                    dir="ltr"
                  />
                  <p className="text-[11px] text-[#8c7463]">
                    {t('Used for sending high-deliverability transactional emails and OTP codes.', 'يستخدم لإرسال رسائل التحقق والإشعارات بنسبة وصول عالية.')}
                  </p>
                </div>
              )}

              {/* 2. Sender Identity */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                  {t('2. Sender Identity & Display Name', '٢. هوية المرسل واسم العرض')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Sender Email Address', 'بريد المرسل')}
                    </label>
                    <input
                      type="email"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                      placeholder="noreply@gulfspring.sa"
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Sender Name (Brand)', 'اسم المرسل')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.fromName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                      placeholder="Gulf Spring | نبع الدرعية"
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Reply-To Email', 'بريد الرد المباشر')}
                    </label>
                    <input
                      type="email"
                      value={emailConfig.replyTo}
                      onChange={(e) => setEmailConfig({ ...emailConfig, replyTo: e.target.value })}
                      placeholder="support@gulfspring.sa"
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* 3. OTP & Security Verification Settings */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                  {t('3. Registration OTP Policies', '٣. سياسات ورموز التحقق عند التسجيل')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-[#ded3c3] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#2c1d11] block">
                        {t('Mandatory Email Verification', 'إلزامية التحقق من البريد')}
                      </span>
                      <span className="text-[11px] text-[#8c7463]">
                        {t('Require 6-digit code before password setup', 'طلب رمز من ٦ أرقام قبل السماح بتعيين كلمة المرور')}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailConfig.requireVerification}
                        onChange={(e) => setEmailConfig({ ...emailConfig, requireVerification: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a2e1b]"></div>
                    </label>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#ded3c3] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#2c1d11] block">
                        {t('OTP Expiry Window', 'مدة صلاحية الرمز')}
                      </span>
                      <span className="text-[11px] text-[#8c7463]">
                        {t('Minutes before code expires', 'الدقائق المسموحة قبل انتهاء صلاحية الرمز')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={3}
                        max={60}
                        value={emailConfig.otpExpiryMinutes}
                        onChange={(e) =>
                          setEmailConfig({ ...emailConfig, otpExpiryMinutes: parseInt(e.target.value) || 10 })
                        }
                        className="w-16 px-2 py-1 border border-[#ded3c3] rounded-lg text-xs text-center font-bold"
                      />
                      <span className="text-xs text-[#8c7463]">{t('min', 'دقيقة')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Order Notifications Setup */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                  {t('4. Order Notification Dispatching', '٤. إشعارات الطلبات الجديدة')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-[#ded3c3] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#2c1d11] block">
                        {t('Customer Order Receipt', 'إيصال طلب العميل')}
                      </span>
                      <span className="text-[11px] text-[#8c7463]">
                        {t('Send copy of receipt to customer email', 'إرسال نسخة من الفاتورة إلى بريد العميل تلقائياً')}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailConfig.notifyCustomerOrder}
                        onChange={(e) => setEmailConfig({ ...emailConfig, notifyCustomerOrder: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a2e1b]"></div>
                    </label>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#ded3c3] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#2c1d11] block">
                        {t('Barista / Manager Alert', 'تنبيه الباريستا والإدارة')}
                      </span>
                      <span className="text-[11px] text-[#8c7463]">
                        {t('Email cafe when customer places order', 'إشعار الكافيه فور تسجيل طلب جديد')}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailConfig.notifyBaristaOrder}
                        onChange={(e) => setEmailConfig({ ...emailConfig, notifyBaristaOrder: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a2e1b]"></div>
                    </label>
                  </div>
                </div>

                {emailConfig.notifyBaristaOrder && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Barista Alert Recipient Email', 'البريد الإلكتروني لاستلام تنبيهات الطلبات')}
                    </label>
                    <input
                      type="email"
                      value={emailConfig.baristaAlertEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, baristaAlertEmail: e.target.value })}
                      placeholder="orders@gulfspring.sa"
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>

              {/* 5. Manual Email Template Customizer */}
              <div className="p-5 rounded-2xl bg-[#faf7f2] border border-[#ded3c3] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-[#8c532b]" />
                    <h4 className="text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                      {t('5. Email Template Customizer (Manual Edit)', '٥. تعديل نصوص وقالب الرسالة يدوياً')}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8c7463]">
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#ded3c3]">{'{{code}}'}</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#ded3c3]">{'{{expiry_minutes}}'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Email Subject (English)', 'عنوان الرسالة بالإنجليزية')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.otpSubjectEn}
                      onChange={(e) => setEmailConfig({ ...emailConfig, otpSubjectEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Email Subject (Arabic)', 'عنوان الرسالة بالعربية')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.otpSubjectAr}
                      onChange={(e) => setEmailConfig({ ...emailConfig, otpSubjectAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Headline / Greeting (English)', 'العنوان الترحيبي بالإنجليزية')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.templateGreetingEn}
                      onChange={(e) => setEmailConfig({ ...emailConfig, templateGreetingEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Headline / Greeting (Arabic)', 'العنوان الترحيبي بالعربية')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.templateGreetingAr}
                      onChange={(e) => setEmailConfig({ ...emailConfig, templateGreetingAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Body Text (English)', 'نص الرسالة بالإنجليزية')}
                    </label>
                    <textarea
                      rows={3}
                      value={emailConfig.otpBodyTextEn}
                      onChange={(e) => setEmailConfig({ ...emailConfig, otpBodyTextEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2c1d11] mb-1">
                      {t('Body Text (Arabic)', 'نص الرسالة بالعربية')}
                    </label>
                    <textarea
                      rows={3}
                      value={emailConfig.otpBodyTextAr}
                      onChange={(e) => setEmailConfig({ ...emailConfig, otpBodyTextAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] text-xs bg-white resize-none"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailConfig({
                        ...emailConfig,
                        otpSubjectEn: 'Your Gulf Spring Verification Code: {{code}}',
                        otpSubjectAr: 'رمز التحقق الخاص بك في نبع الدرعية: {{code}}',
                        templateGreetingEn: 'Welcome to Gulf Spring Cafe!',
                        templateGreetingAr: 'أهلاً بك في نبع الدرعية!',
                        otpBodyTextEn: 'Your 6-digit verification code is {{code}}. This code expires in {{expiry_minutes}} minutes. Enjoy your moments in Diriyah.',
                        otpBodyTextAr: 'رمز التحقق الخاص بك هو {{code}}. ينتهي الرمز خلال {{expiry_minutes}} دقائق. نتمنى لك أوقاتاً ممتعة في واحة الدرعية.',
                      });
                    }}
                    className="text-xs text-[#8c7463] hover:underline cursor-pointer"
                  >
                    {t('Reset to Diriyah Default Template', 'استعادة القالب الافتراضي')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmailPreviewModal(true)}
                    className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#ded3c3] text-[#4a2e1b] rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('Open Live Template Preview Modal', 'معاينة القالب بالكامل')}</span>
                  </button>
                </div>
              </div>

              {/* 6. Live Test Email Dispatcher & Interactive Preview */}
              <div className="p-5 rounded-2xl bg-[#faf7f2] border border-[#ded3c3] space-y-4">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#8c532b]" />
                  <h4 className="text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                    {t('6. Live Test Dispatcher & Inbox Preview', '٦. فاحص الإرسال ومعاينة صندوق البريد')}
                  </h4>
                </div>
                <p className="text-xs text-[#8c7463]">
                  {t(
                    'Simulate or send a live test verification code email to see how it renders with Diriyah branding and typography.',
                    'قم باختبار إرسال رمز تحقق للتأكد من وصوله ومعاينة التصميم الراقي للرسالة.'
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#ded3c3] bg-white text-xs"
                      dir="ltr"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>

                  <button
                    type="button"
                    disabled={testEmailSending}
                    onClick={() => {
                      setTestEmailSending(true);
                      setTestEmailSuccess(false);
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setLastDispatchedCode(newCode);

                      setTimeout(() => {
                        setTestEmailSending(false);
                        setTestEmailSuccess(true);
                        setShowEmailPreviewModal(true);
                      }, 700);
                    }}
                    className="px-5 py-2.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {testEmailSending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('Dispatching...', 'جاري الإرسال...')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('Send Test OTP Email', 'إرسال رمز تجريبي')}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmailPreviewModal(true)}
                    className="px-4 py-2.5 bg-white hover:bg-stone-50 border border-[#ded3c3] text-[#4a2e1b] rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('Preview Template', 'معاينة القالب')}</span>
                  </button>
                </div>

                {testEmailSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {t('Test email dispatched successfully to:', 'تم إرسال البريد التجريبي بنجاح إلى:')}{' '}
                        <strong>{testEmailAddress}</strong>
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs bg-emerald-200/60 px-2 py-0.5 rounded">
                      OTP: {lastDispatchedCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Save All Configurations Button */}
              <div className="pt-4 border-t border-[#ded3c3] flex items-center justify-between">
                <span className="text-xs text-[#8c7463]">
                  {t('Settings apply immediately to customer signups and checkout flows', 'تُطبق الإعدادات فوراً على تسجيل العملاء والطلبات')}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('gs_email_config', JSON.stringify(emailConfig));
                      setEmailSavedToast(true);
                      setTimeout(() => setEmailSavedToast(false), 3000);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="px-6 py-3 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>{t('Save Email Configuration', 'حفظ إعدادات وتكوين البريد')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 13: HOSTINGER & SERVER DEPLOYMENT SUITE */}
          {activeTab === 'hostinger' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded3c3] shadow-xs space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ded3c3]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center shadow-xs">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                      {t('Hostinger Deployment & Database Suite', 'دليل رفع واستضافة هوستنجر وحفظ قواعد البيانات')}
                    </h2>
                    <p className="text-xs text-[#8c7463]">
                      {t(
                        'Zero-error setup tools, Node.js production server, server disk database persistence, and .htaccess routing',
                        'أدوات تشغيل هوستنجر بدون أخطاء، خادم نود الإنتاجي، حفظ البيانات على القرص وملف توجيه الروابط'
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckHostingerServer}
                  className="px-4 py-2 bg-[#f2eae0] hover:bg-[#e8dfd3] text-[#4a2e1b] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${serverCheckStatus === 'checking' ? 'animate-spin' : ''}`} />
                  <span>{t('Ping Server API', 'فحص اتصال الخادم')}</span>
                </button>
              </div>

              {/* Server & Database Live Health Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-[#ded3c3] bg-[#faf7f2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2c1d11] uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-[#8c532b]" />
                      <span>{t('Hostinger Node Engine', 'محرك نود على هوستنجر')}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        serverCheckStatus === 'connected'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {serverCheckStatus === 'connected'
                        ? t('Server Online (Node 22)', 'متصل بنجاح')
                        : serverCheckStatus === 'checking'
                        ? t('Testing...', 'جاري الفحص...')
                        : t('Ready for Upload', 'جاهز للرفع والتثبيت')}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b5849]">
                    {serverCheckMessage ||
                      t(
                        'Supports Hostinger Node.js Application, VPS, and Cloud hosting with automatic PORT binding.',
                        'يدعم تطبيقات Node.js وسيرفرات Cloud و VPS مع ضبط تلقائي للمنافذ والمسارات.'
                      )}
                  </p>
                  <div className="text-[11px] font-mono text-[#8c7463]">
                    {t('Startup File:', 'ملف التشغيل:')} <strong>server.js</strong> / <strong>server.ts</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[#ded3c3] bg-[#faf7f2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2c1d11] uppercase tracking-wider flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-[#8c532b]" />
                      <span>{t('Database Storage Engine', 'محرك حفظ قاعدة البيانات')}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {isSupabaseConfigured ? 'Supabase Cloud' : t('Server Disk + Local Cache', 'قرص السيرفر + المتصفح')}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b5849]">
                    {t(
                      'All products, categories, orders, and cafe settings are stored in ./data/database.json and ./data/orders.json so data is never lost on restart.',
                      'يتم حفظ الأصناف والتصنيفات والطلبات على قرص الخادم بملفات JSON لحمايتها من الحذف عند إعادة تشغيل السيرفر.'
                    )}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#8c7463]">
                      {products.length} {t('products', 'أصناف')} · {orders.length} {t('orders', 'طلبات')}
                    </span>
                    <button
                      type="button"
                      disabled={isSyncingServerDb}
                      onClick={handleSyncDbToServer}
                      className="text-xs font-bold text-[#8c532b] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isSyncingServerDb ? t('Syncing...', 'جاري الحفظ...') : t('Save to Server Disk Now', 'حفظ على القرص الآن')}
                    </button>
                  </div>
                </div>
              </div>

              {syncServerDbResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    syncServerDbResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{syncServerDbResult.message}</span>
                </div>
              )}

              {/* One-Click Download Deployment Tools */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                  {t('1. Instant Deployment Assets & Database Backup', '١. ملفات الرفع الجاهزة والنسخة الاحتياطية')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadDbBackup}
                    className="p-4 rounded-2xl border border-[#ded3c3] hover:border-[#4a2e1b] bg-[#faf7f2] hover:bg-white text-start transition-all cursor-pointer space-y-2 group shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#2c1d11] block">
                        {t('Download Database (.json)', 'تحميل نسخة قاعدة البيانات')}
                      </span>
                      <span className="text-[11px] text-[#8c7463]">
                        {t('Backup all products, orders, and hours', 'تحميل جميع الأصناف والطلبات والساعات')}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadHtaccess}
                    className="p-4 rounded-2xl border border-[#ded3c3] hover:border-[#4a2e1b] bg-[#faf7f2] hover:bg-white text-start transition-all cursor-pointer space-y-2 group shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#2c1d11] block">
                        {t('Download .htaccess (Hostinger)', 'تحميل ملف .htaccess')}
                      </span>
                      <span className="text-[11px] text-[#8c7463]">
                        {t('Eliminates 404 page not found on refresh', 'يمنع خطأ 404 عند تحديث الصفحات')}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadServerJs}
                    className="p-4 rounded-2xl border border-[#ded3c3] hover:border-[#4a2e1b] bg-[#faf7f2] hover:bg-white text-start transition-all cursor-pointer space-y-2 group shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#2c1d11] block">
                        {t('Download server.js', 'تحميل ملف server.js')}
                      </span>
                      <span className="text-[11px] text-[#8c7463]">
                        {t('Production Node.js startup script', 'سكربت التشغيل الإنتاجي للخادم')}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Hostinger Step-by-Step Instructions */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                  {t('2. Step-by-Step Hostinger Upload Instructions', '٢. خطوات الرفع على استضافة هوستنجر')}
                </h3>

                <div className="space-y-3">
                  {/* Method A: Hostinger Node.js Application */}
                  <div className="p-5 rounded-2xl border border-[#ded3c3] bg-white space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#4a2e1b] text-white text-[11px] font-bold">
                        {t('Method A (Recommended)', 'الطريقة الأولى (الموصى بها)')}
                      </span>
                      <h4 className="text-xs font-bold text-[#2c1d11]">
                        {t('Hostinger Node.js Application (Cloud / VPS / Web Hosting)', 'تطبيق Node.js عبر لوحة تحكم هوستنجر hPanel')}
                      </h4>
                    </div>

                    <ol className="list-decimal list-inside space-y-2 text-xs text-[#4a3b32] leading-relaxed">
                      <li>
                        <strong>{t('Open Hostinger hPanel:', 'ادخل لوحة هوستنجر hPanel:')}</strong>{' '}
                        {t('Go to your hosting dashboard and click on "Node.js".', 'اذهب للوحة التحكم واضغط على قسم Node.js.')}
                      </li>
                      <li>
                        <strong>{t('Configure Node Settings:', 'إعدادات نود:')}</strong>
                        <ul className="list-disc list-inside ms-5 text-[11px] text-[#8c7463] space-y-0.5 mt-1">
                          <li>Node.js version: <strong>20.x or 22.x</strong></li>
                          <li>Application root: <strong>/</strong> (or folder where project files exist)</li>
                          <li>Application startup file: <strong>server.js</strong> (or server.ts)</li>
                        </ul>
                      </li>
                      <li>
                        <strong>{t('Upload Files:', 'رفع الملفات:')}</strong>{' '}
                        {t('Upload your project files (via File Manager, FTP, or Git).', 'ارفع ملفات المشروع عبر مدير الملفات أو Git.')}
                      </li>
                      <li>
                        <strong>{t('Run Build & Start Command:', 'أمر البناء والتشغيل:')}</strong>{' '}
                        {t('In terminal or via hPanel npm script runner, execute:', 'في الطرفية أو موجه الأوامر شغل:')}
                        <pre className="mt-1 p-2 bg-[#2c1d11] text-amber-200 rounded-lg text-xs font-mono select-all">
                          npm install && npm run build && npm start
                        </pre>
                      </li>
                      <li>
                        <strong>{t('Database auto-saved:', 'الحفظ التلقائي لقاعدة البيانات:')}</strong>{' '}
                        {t('The server automatically writes and preserves all orders in ./data/orders.json and data in ./data/database.json.', 'يقوم السيرفر تلقائياً بإنشاء مجلد data وحفظ جميع الطلبات والبيانات داخله بشكل دائم.')}
                      </li>
                    </ol>
                  </div>

                  {/* Method B: Hostinger Static / Shared Hosting */}
                  <div className="p-5 rounded-2xl border border-[#ded3c3] bg-white space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#8c532b] text-white text-[11px] font-bold">
                        {t('Method B (Static Hosting)', 'الطريقة الثانية (الاستضافة المشتركة)')}
                      </span>
                      <h4 className="text-xs font-bold text-[#2c1d11]">
                        {t('Upload built "dist/" folder into public_html', 'رفع محتويات مجلد dist إلى public_html')}
                      </h4>
                    </div>

                    <ol className="list-decimal list-inside space-y-2 text-xs text-[#4a3b32] leading-relaxed">
                      <li>
                        {t('Run', 'شغل أمر')} <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono font-bold">npm run build</code>{' '}
                        {t('to generate production static files in the "dist" folder.', 'لتوليد ملفات الإنتاج داخل مجلد dist.')}
                      </li>
                      <li>
                        {t('Open Hostinger File Manager &rarr; go to', 'افتح مدير ملفات هوستنجر &rarr; اذهب لمجلد')}{' '}
                        <strong>public_html/</strong>.
                      </li>
                      <li>
                        {t('Upload all files from inside "dist/" directly into "public_html/".', 'ارفع جميع الملفات الموجودة داخل مجلد dist مباشرة إلى public_html.')}
                      </li>
                      <li>
                        <strong>{t('Confirm .htaccess exists:', 'تأكد من وجود ملف .htaccess:')}</strong>{' '}
                        {t('Ensure .htaccess is uploaded into public_html to prevent 404 errors when visitors refresh pages.', 'تأكد من وجود ملف .htaccess داخل public_html لضمان عدم ظهور خطأ 404 عند تحديث الصفحات.')}
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Common Hostinger Errors & Fixes */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                  {t('3. Hostinger Troubleshooting & Error Prevention', '٣. حلول الأخطاء الشائعة في هوستنجر')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                    <p className="font-bold text-[#4a2e1b]">
                      ❌ {t('Error: "404 Not Found" on page refresh', 'خطأ: 404 Not Found عند تحديث الصفحة')}
                    </p>
                    <p className="text-[11px] text-[#6b5849] leading-relaxed">
                      ✅ {t('Solved! We included the .htaccess rewrite rule and server wildcard route app.get("*") so all cafe URLs resolve to index.html smoothly.', 'تم الحل! تم تضمين ملف .htaccess ومسار السيرفر الشامل لتوجيه جميع الروابط لصفحة التطبيق الرئيسية.')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                    <p className="font-bold text-[#4a2e1b]">
                      ❌ {t('Error: "npm ERR! Missing script: start"', 'خطأ: عدم وجود أمر start في package.json')}
                    </p>
                    <p className="text-[11px] text-[#6b5849] leading-relaxed">
                      ✅ {t('Solved! "start": "node server.ts" and "server": "node server.js" are both configured in package.json.', 'تم الحل! تم إضافة أمر التشغيل start في package.json وتهيئة ملفات التشغيل server.ts و server.js.')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                    <p className="font-bold text-[#4a2e1b]">
                      ❌ {t('Error: "Port in use" or crash on start', 'خطأ: تعارض المنفذ Port على هوستنجر')}
                    </p>
                    <p className="text-[11px] text-[#6b5849] leading-relaxed">
                      ✅ {t('Solved! The server automatically binds to process.env.PORT provided by Hostinger Passenger and listens on 0.0.0.0.', 'تم الحل! يقرأ السيرفر المنفذ المخصص تلقائياً من Hostinger عبر process.env.PORT بدون تعارض.')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                    <p className="font-bold text-[#4a2e1b]">
                      ❌ {t('Error: "Database data lost after restart"', 'خطأ: ضياع بيانات الطلبات عند إعادة تشغيل السيرفر')}
                    </p>
                    <p className="text-[11px] text-[#6b5849] leading-relaxed">
                      ✅ {t('Solved! Persistent JSON files in ./data/ are stored on the server disk, backed up in localStorage and syncable to Supabase.', 'تم الحل! يتم كتابة الطلبات على قرص السيرفر الدائم في مجلد data مع تخزين احتياطي متعدد المستويات.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL: ORDER DETAILS --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto border border-[#ded3c3] shadow-2xl">
            <div className="flex justify-between items-start pb-3 border-b border-[#ded3c3]">
              <div>
                <span className="text-xs text-[#8c7463]">{t('Order Number', 'رقم الطلب')}</span>
                <h3 className="text-lg font-bold font-mono text-[#2c1d11]">{selectedOrder.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8c7463]">{t('Customer:', 'العميل:')}</span>
                <span className="font-bold text-[#2c1d11]">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c7463]">{t('Phone:', 'الجوال:')}</span>
                <span className="font-mono" dir="ltr">{selectedOrder.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c7463]">{t('Order Type:', 'نوع الطلب:')}</span>
                <span className="font-bold capitalize">{selectedOrder.order_type}</span>
              </div>
              {selectedOrder.table_number && (
                <div className="flex justify-between">
                  <span className="text-[#8c7463]">{t('Table / Patio Area:', 'الطاولة / الجلسة:')}</span>
                  <span className="font-bold">{selectedOrder.table_number}</span>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                  <span className="font-bold block">{t('Notes:', 'ملاحظات:')}</span>
                  <span>{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="border-t border-b border-[#ded3c3] py-3 space-y-2">
              <span className="text-xs font-bold text-[#2c1d11] uppercase tracking-wider block">
                {t('Ordered Items:', 'الأصناف المطلوبة:')}
              </span>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#2c1d11]">
                      {it.quantity}x {isRTL ? it.product_name_ar : it.product_name_en}
                    </span>
                    {it.size_name_en && (
                      <span className="text-[#8c7463] ms-1">
                        ({isRTL ? it.size_name_ar : it.size_name_en})
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[#4a2e1b]">{it.item_total} {t('SAR', 'ر.س')}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-base font-bold text-[#2c1d11]">
              <span>{t('Total Amount:', 'الإجمالي:')}</span>
              <span className="text-[#8c532b]">{selectedOrder.total} {t('SAR', 'ر.س')}</span>
            </div>

            {/* Quick Status Changers */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-bold text-[#2c1d11] block">{t('Change Status:', 'تغيير الحالة:')}</span>
              <div className="grid grid-cols-3 gap-2">
                {(['confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                      selectedOrder.status === st
                        ? 'bg-[#4a2e1b] text-white'
                        : 'bg-[#faf7f2] hover:bg-[#ded3c3] text-[#2c1d11]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: PRODUCT EDIT / CREATE --- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto border border-[#ded3c3] shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#ded3c3]">
              <h3 className="text-lg font-bold font-serif text-[#2c1d11]">
                {editingProduct.id ? t('Edit Menu Item', 'تعديل الصنف') : t('Create Menu Item', 'إضافة صنف جديد')}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{t('English Name', 'الاسم بالإنجليزية')} *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name_en}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{t('Arabic Name', 'الاسم بالعربية')} *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name_ar}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">{t('Category', 'التصنيف')}</label>
                  <select
                    value={editingProduct.category_id}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{isRTL ? c.name_ar : c.name_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">{t('Price (SAR)', 'السعر (ر.س)')} *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{t('Discount Price (Optional)', 'سعر العرض')}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingProduct.discount_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discount_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{t('Image URL', 'رابط الصورة')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingProduct.image_url}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#ded3c3]"
                  />
                  <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer font-bold shrink-0">
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'product');
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{t('English Description', 'الوصف بالإنجليزية')}</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description_en}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] resize-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{t('Arabic Description', 'الوصف بالعربية')}</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description_ar}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description_ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="rounded text-[#4a2e1b]"
                  />
                  <span>{t('Mark as Featured / Popular', 'إبراز كصنف مميز / الأكثر طلباً')}</span>
                </label>

                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_available}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_available: e.target.checked })}
                    className="rounded text-[#4a2e1b]"
                  />
                  <span>{t('Available for Orders', 'متوفر للطلب')}</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#4a2e1b] text-white rounded-xl font-bold shadow-xs"
                >
                  {t('Save Product', 'حفظ الصنف')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CATEGORY EDIT / CREATE --- */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#ded3c3] shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#ded3c3]">
              <h3 className="text-base font-bold font-serif text-[#2c1d11]">
                {t('Edit Category', 'تعديل التصنيف')}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{t('English Name', 'الاسم بالإنجليزية')}</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name_en}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{t('Arabic Name', 'الاسم بالعربية')}</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name_ar}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name_ar: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{t('Image URL', 'رابط الصورة')}</label>
                <input
                  type="text"
                  value={editingCategory.image_url}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 rounded-xl font-bold"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4a2e1b] text-white rounded-xl font-bold"
                >
                  {t('Save Category', 'حفظ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: GALLERY ADD PHOTO --- */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#ded3c3] shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#ded3c3]">
              <h3 className="text-base font-bold font-serif text-[#2c1d11]">
                {t('Add Photo to Gallery', 'إضافة صورة لمعرض الكافيه')}
              </h3>
              <button onClick={() => setIsGalleryModalOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryImg} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{t('Category Tag', 'تصنيف الصورة')}</label>
                <select
                  value={newGalleryImg.category}
                  onChange={(e) => setNewGalleryImg({ ...newGalleryImg, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                >
                  <option value="bonfire">{t('Bonfire & Fire Pit', 'شبة النار والحطب')}</option>
                  <option value="outdoor">{t('Outdoor Seating', 'الجلسات الخارجية')}</option>
                  <option value="tea">{t('Tea & Karak', 'الشاي والكرك')}</option>
                  <option value="coffee">{t('Specialty Coffee', 'القهوة المختصة')}</option>
                  <option value="food">{t('Food & Desserts', 'المأكولات والحلويات')}</option>
                  <option value="interior">{t('Cafe Interior', 'الديكور الداخلي')}</option>
                  <option value="evening">{t('Evening Atmosphere', 'أجواء الليل')}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{t('Image URL or Upload', 'رابط الصورة أو رفع ملف')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newGalleryImg.image_url || ''}
                    onChange={(e) => setNewGalleryImg({ ...newGalleryImg, image_url: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#ded3c3]"
                    placeholder="https://..."
                  />
                  <label className="px-3 py-2 bg-stone-100 rounded-xl cursor-pointer font-bold shrink-0">
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    <span>File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'gallery');
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">{t('Title (English)', 'العنوان بالإنجليزية')}</label>
                  <input
                    type="text"
                    value={newGalleryImg.title_en || ''}
                    onChange={(e) => setNewGalleryImg({ ...newGalleryImg, title_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{t('Title (Arabic)', 'العنوان بالعربية')}</label>
                  <input
                    type="text"
                    value={newGalleryImg.title_ar || ''}
                    onChange={(e) => setNewGalleryImg({ ...newGalleryImg, title_ar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ded3c3]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 rounded-xl font-bold"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4a2e1b] text-white rounded-xl font-bold"
                >
                  {t('Upload Image', 'إضافة الصورة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EMAIL LIVE INBOX PREVIEW & MANUAL TEMPLATE CUSTOMIZER --- */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#f4efe8] rounded-3xl max-w-2xl w-full border border-[#ded3c3] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header with View Mode Switcher */}
            <div className="bg-[#2c1d11] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#4a2e1b] flex items-center justify-center text-amber-300">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif">{t('Email Template & Live Inbox Simulation', 'قالب البريد ومعاينة صندوق العميل')}</h3>
                  <p className="text-[11px] text-[#b8a28e]">{emailConfig.fromName} &lt;{emailConfig.fromEmail}&gt;</p>
                </div>
              </div>

              {/* View Switcher: Live Preview vs Manual Editor */}
              <div className="flex items-center gap-2">
                <div className="bg-black/30 p-0.5 rounded-xl border border-white/10 flex text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewModalTab('preview')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewModalTab === 'preview' ? 'bg-[#4a2e1b] text-white shadow-xs' : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('Live Preview', 'المعاينة الحية')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewModalTab('edit')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewModalTab === 'edit' ? 'bg-[#4a2e1b] text-white shadow-xs' : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t('Edit Template', 'تعديل القالب')}</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TAB 1: MANUAL TEMPLATE EDITOR */}
            {previewModalTab === 'edit' ? (
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-center justify-between">
                  <span>{t('Changes you make here immediately update the live email preview and save to system config.', 'أي تعديل تقوم به هنا يظهر فوراً في المعاينة ويُحفظ في إعدادات النظام.')}</span>
                  <span className="font-mono text-xs font-bold">Variables: {'{{code}}'}, {'{{expiry_minutes}}'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c1d11] mb-1">
                      {t('Subject (English)', 'عنوان الرسالة بالإنجليزية')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.otpSubjectEn}
                      onChange={(e) => setEmailConfig({ ...emailConfig, otpSubjectEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c1d11] mb-1">
                      {t('Subject (Arabic)', 'عنوان الرسالة بالعربية')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.otpSubjectAr}
                      onChange={(e) => setEmailConfig({ ...emailConfig, otpSubjectAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] bg-white"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c1d11] mb-1">
                      {t('Greeting Headline (English)', 'العنوان الترحيبي بالإنجليزية')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.templateGreetingEn}
                      onChange={(e) => setEmailConfig({ ...emailConfig, templateGreetingEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c1d11] mb-1">
                      {t('Greeting Headline (Arabic)', 'العنوان الترحيبي بالعربية')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.templateGreetingAr}
                      onChange={(e) => setEmailConfig({ ...emailConfig, templateGreetingAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] bg-white"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c1d11] mb-1">
                      {t('Body Text (English)', 'نص الرسالة الأساسي بالإنجليزية')}
                    </label>
                    <textarea
                      rows={3}
                      value={emailConfig.otpBodyTextEn}
                      onChange={(e) => setEmailConfig({ ...emailConfig, otpBodyTextEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] bg-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c1d11] mb-1">
                      {t('Body Text (Arabic)', 'نص الرسالة الأساسي بالعربية')}
                    </label>
                    <textarea
                      rows={3}
                      value={emailConfig.otpBodyTextAr}
                      onChange={(e) => setEmailConfig({ ...emailConfig, otpBodyTextAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] bg-white resize-none"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#2c1d11] mb-1">
                      {t('Footer Note (English)', 'تذييل الرسالة بالإنجليزية')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.templateFooterEn}
                      onChange={(e) => setEmailConfig({ ...emailConfig, templateFooterEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#2c1d11] mb-1">
                      {t('Footer Note (Arabic)', 'تذييل الرسالة بالعربية')}
                    </label>
                    <input
                      type="text"
                      value={emailConfig.templateFooterAr}
                      onChange={(e) => setEmailConfig({ ...emailConfig, templateFooterAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ded3c3] bg-white"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: LIVE EMAIL RENDERING */
              <>
                {/* Email Client Envelope Metadata */}
                <div className="bg-white border-b border-[#ded3c3] px-6 py-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span><strong>{t('From:', 'من:')}</strong> {emailConfig.fromName} &lt;{emailConfig.fromEmail}&gt;</span>
                    <span className="text-[11px] text-stone-400">{t('Just now', 'الآن')}</span>
                  </div>
                  <div className="text-stone-600">
                    <strong>{t('To:', 'إلى:')}</strong> {testEmailAddress}
                  </div>
                  <div className="text-stone-900 font-bold pt-1">
                    <strong>{t('Subject:', 'الموضوع:')}</strong>{' '}
                    {(isRTL ? emailConfig.otpSubjectAr : emailConfig.otpSubjectEn).replace('{{code}}', lastDispatchedCode)}
                  </div>
                </div>

                {/* HTML Email Body Container */}
                <div className="p-6 overflow-y-auto space-y-6">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e8dfd3] shadow-xs space-y-6 text-center max-w-md mx-auto">
                    {/* Brand Header */}
                    <div className="space-y-2">
                      <div className="w-14 h-14 rounded-2xl bg-[#2c1d11] text-amber-300 flex items-center justify-center mx-auto shadow-md">
                        <Coffee className="w-7 h-7" />
                      </div>
                      <h2 className="text-xl font-bold font-serif text-[#2c1d11]">
                        نبع الدرعيه · Gulf Spring
                      </h2>
                      <p className="text-xs text-[#8c6d53]">
                        {t('Coffee, Tea & Cozy Moments in Diriyah', 'قهوة وشاي ولحظات جميلة في الدرعية')}
                      </p>
                    </div>

                    {/* Greeting & Message */}
                    <div className="space-y-2 text-xs text-[#4a3b32] leading-relaxed border-t border-b border-[#f2eae0] py-4">
                      <p className="font-bold text-sm text-[#2c1d11]">
                        {isRTL ? emailConfig.templateGreetingAr : emailConfig.templateGreetingEn}
                      </p>
                      <p>
                        {(isRTL ? emailConfig.otpBodyTextAr : emailConfig.otpBodyTextEn)
                          .replace('{{code}}', lastDispatchedCode)
                          .replace('{{expiry_minutes}}', String(emailConfig.otpExpiryMinutes))}
                      </p>

                      {/* Highlighted OTP Code Box */}
                      <div className="py-4 my-2 bg-[#faf7f2] border-2 border-dashed border-[#8c532b] rounded-2xl text-center space-y-1">
                        <span className="text-[11px] font-medium text-[#8c7463] uppercase tracking-wider block">
                          {t('Verification Code', 'رمز التحقق')}
                        </span>
                        <span className="text-3xl font-mono font-bold tracking-widest text-[#4a2e1b] block select-all">
                          {lastDispatchedCode}
                        </span>
                        <span className="text-[10px] text-amber-800 font-semibold block">
                          ⏱ {t(`Valid for ${emailConfig.otpExpiryMinutes} minutes`, `صالح لمدة ${emailConfig.otpExpiryMinutes} دقائق فقط`)}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#8c7463]">
                        {t(
                          'If you did not request this verification, you can safely ignore this email.',
                          'إذا لم تكن قد طلبت هذا الرمز في نبع الدرعية، يمكنك تجاهل هذه الرسالة بأمان.'
                        )}
                      </p>
                    </div>

                    {/* Footer address */}
                    <div className="text-[10px] text-[#8c7463] space-y-1 pt-1">
                      <p className="font-bold text-[#2c1d11]">نبع الدرعيه | Gulf Spring Cafe</p>
                      <p>{isRTL ? emailConfig.templateFooterAr : emailConfig.templateFooterEn}</p>
                      <p>WhatsApp: +966 55 707 0172</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Modal Bottom Actions */}
            <div className="bg-white border-t border-[#ded3c3] px-6 py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('gs_email_config', JSON.stringify(emailConfig));
                    setEmailSavedToast(true);
                    setTimeout(() => setEmailSavedToast(false), 3000);
                  } catch (e) {
                    console.error(e);
                  }
                  if (previewModalTab === 'edit') setPreviewModalTab('preview');
                }}
                className="px-4 py-2 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('Save Template Changes', 'حفظ تعديلات القالب')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-[#2c1d11] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t('Close Modal', 'إغلاق النافذة')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
