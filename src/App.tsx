/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import {
  BusinessSettings,
  Category,
  GalleryImage,
  OpeningHour,
  Order,
  Product,
  ViewMode,
} from './types';
import {
  getBusinessSettings,
  getCategories,
  getGalleryImages,
  getOpeningHours,
  getOrders,
  getProducts,
} from './lib/storage';
import { INITIAL_BUSINESS_SETTINGS } from './lib/initialData';

// Components & Pages
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WhatsAppSticky } from './components/WhatsAppSticky';

import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomerAuthPage } from './pages/CustomerAuthPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { LegalPage } from './pages/LegalPage';
import { AdminDashboard } from './admin/AdminDashboard';

const MainApp: React.FC = () => {
  const { language, isRTL, t } = useLanguage();

  const getViewFromUrl = (): ViewMode => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path.includes('/admin') || hash.includes('admin') || search.includes('admin')) {
        return 'admin';
      }
      if (path.includes('/menu') || hash.includes('menu') || search.includes('menu')) return 'menu';
      if (path.includes('/about') || hash.includes('about') || search.includes('about')) return 'about';
      if (path.includes('/gallery') || hash.includes('gallery') || search.includes('gallery')) return 'gallery';
      if (path.includes('/contact') || hash.includes('contact') || search.includes('contact')) return 'contact';
      if (path.includes('/checkout') || hash.includes('checkout') || search.includes('checkout')) return 'checkout';
      if (path.includes('/login') || hash.includes('login') || search.includes('login')) return 'login';
      if (path.includes('/profile') || hash.includes('profile') || search.includes('profile')) return 'profile';
      if (path.includes('/order-tracking') || hash.includes('order-tracking')) return 'order-tracking';
    } catch {}
    return 'home';
  };

  const [currentView, setCurrentView] = useState<ViewMode>(getViewFromUrl);
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_BUSINESS_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  const loadData = async () => {
    try {
      const [s, p, c, g, o, h] = await Promise.all([
        getBusinessSettings(),
        getProducts(),
        getCategories(),
        getGalleryImages(),
        getOrders(),
        getOpeningHours(),
      ]);
      setSettings(s);
      setProducts(p);
      setCategories(c);
      setGalleryImages(g);
      setOrders(o);
      setOpeningHours(h);
    } catch (e) {
      console.error('Failed to load cafe data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUrlChange = () => {
      setCurrentView(getViewFromUrl());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      if (view === 'home') {
        const cleanPath = window.location.pathname.includes('/admin') ? '/' : window.location.pathname;
        window.history.pushState({ view }, '', cleanPath);
      } else {
        window.history.pushState({ view }, '', `#${view}`);
      }
    } catch {}
  };

  const handleOpenProductDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleInstantOrder = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleOrderCompleted = (newOrder: Order) => {
    setTrackingOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#4a2e1b] flex items-center justify-center text-amber-200 shadow-xl animate-pulse">
          <span className="text-2xl font-serif font-bold">GS</span>
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-bold font-serif text-[#2c1d11]">
            نبع الدرعيه · Gulf Spring
          </p>
          <p className="text-xs text-[#8c7463]">
            {t('Preparing coffee, tea & cozy vibes...', 'تحضير القهوة والشاي والأجواء الجميلة...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#faf7f2] text-[#2c1d11] ${isRTL ? 'font-arabic' : 'font-sans'}`}>
      {/* Navbar (hidden in full admin view for distraction-free operations, or accessible via top button) */}
      {currentView !== 'admin' && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          settings={settings}
        />
      )}

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            settings={settings}
            products={products}
            categories={categories}
            onNavigate={handleNavigate}
            onOpenProductDetails={handleOpenProductDetails}
            onInstantOrder={handleInstantOrder}
          />
        )}

        {currentView === 'menu' && (
          <MenuPage
            products={products}
            categories={categories}
            settings={settings}
            onOpenDetails={handleOpenProductDetails}
            onInstantOrder={handleInstantOrder}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'gallery' && (
          <GalleryPage images={galleryImages} />
        )}

        {currentView === 'contact' && (
          <ContactPage settings={settings} />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            settings={settings}
            onNavigate={handleNavigate}
            onOrderCompleted={handleOrderCompleted}
          />
        )}

        {currentView === 'order-tracking' && (
          <OrderTrackingPage
            order={trackingOrder}
            allOrders={orders}
            settings={settings}
            onNavigate={handleNavigate}
            onSelectOrder={(ord) => setTrackingOrder(ord)}
          />
        )}

        {currentView === 'login' && (
          <CustomerAuthPage onNavigate={handleNavigate} />
        )}

        {(currentView === 'profile' || currentView === 'my-orders') && (
          <CustomerProfilePage
            orders={orders}
            products={products}
            onNavigate={handleNavigate}
            onSelectOrder={(ord) => {
              setTrackingOrder(ord);
              handleNavigate('order-tracking');
            }}
          />
        )}

        {currentView === 'privacy' && (
          <LegalPage type="privacy" settings={settings} />
        )}

        {currentView === 'terms' && (
          <LegalPage type="terms" settings={settings} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            settings={settings}
            products={products}
            categories={categories}
            galleryImages={galleryImages}
            orders={orders}
            openingHours={openingHours}
            onRefreshData={loadData}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        settings={settings}
        onNavigate={handleNavigate}
      />

      {/* Product Details Customizer Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        settings={settings}
        onGoToCheckout={() => handleNavigate('checkout')}
      />

      {/* Sticky Floating WhatsApp Widget */}
      {currentView !== 'admin' && (
        <WhatsAppSticky settings={settings} />
      )}

      {/* Footer */}
      {currentView !== 'admin' && (
        <Footer
          settings={settings}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
