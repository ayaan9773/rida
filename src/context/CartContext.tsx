import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductExtra, ProductVariant } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: ProductVariant,
    selectedExtras?: ProductExtra[],
    notes?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  generateWhatsAppMessage: (
    customerName: string,
    customerPhone: string,
    orderType: string,
    notes?: string,
    lang?: 'en' | 'ar'
  ) => string;
}

import { useAuth } from './AuthContext';

const GUEST_CART_KEY = 'gs_cart_guest';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentKey = user ? `gs_cart_user_${user.id}` : GUEST_CART_KEY;

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      // First check if user was stored locally
      const savedUserRaw = localStorage.getItem('gs_auth_user');
      if (savedUserRaw) {
        const u = JSON.parse(savedUserRaw);
        if (u?.id) {
          const userSaved = localStorage.getItem(`gs_cart_user_${u.id}`);
          if (userSaved) return JSON.parse(userSaved);
        }
      }
      const guestRaw = localStorage.getItem(GUEST_CART_KEY) || localStorage.getItem('gs_shopping_cart');
      return guestRaw ? JSON.parse(guestRaw) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart when user logs in / switches session
  useEffect(() => {
    try {
      if (user) {
        const userKey = `gs_cart_user_${user.id}`;
        const userSaved = localStorage.getItem(userKey);
        const userCart: CartItem[] = userSaved ? JSON.parse(userSaved) : [];
        const guestSaved = localStorage.getItem(GUEST_CART_KEY);
        const guestCart: CartItem[] = guestSaved ? JSON.parse(guestSaved) : [];

        // If there were guest cart items, merge them with user cart!
        if (guestCart.length > 0) {
          const merged = [...userCart];
          guestCart.forEach((gItem) => {
            const existingIdx = merged.findIndex((m) => m.id === gItem.id);
            if (existingIdx > -1) {
              merged[existingIdx].quantity += gItem.quantity;
              merged[existingIdx].totalPrice = merged[existingIdx].quantity * merged[existingIdx].unitPrice;
            } else {
              merged.push(gItem);
            }
          });
          setCart(merged);
          localStorage.setItem(userKey, JSON.stringify(merged));
          localStorage.removeItem(GUEST_CART_KEY); // Clean guest cart after merging into user session
        } else if (userCart.length > 0) {
          setCart(userCart);
        }
      } else {
        // Guest mode
        const guestSaved = localStorage.getItem(GUEST_CART_KEY);
        if (guestSaved) {
          setCart(JSON.parse(guestSaved));
        }
      }
    } catch (e) {
      console.error('Session cart sync error:', e);
    }
  }, [user]);

  // Persist cart to current active session storage key
  useEffect(() => {
    try {
      localStorage.setItem(currentKey, JSON.stringify(cart));
      // Also maintain general fallback
      localStorage.setItem('gs_shopping_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, currentKey]);

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedSize?: ProductVariant,
    selectedExtras?: ProductExtra[],
    notes?: string
  ) => {
    // Unique ID composed of product id + chosen size and extras
    const extrasKey = (selectedExtras || [])
      .map((e) => e.name_en)
      .sort()
      .join('-');
    const cartItemId = `${product.id}-${selectedSize?.name_en || 'base'}-${extrasKey}`;

    const basePrice = selectedSize?.price ?? (product.discount_price || product.price);
    const extrasPrice = (selectedExtras || []).reduce((acc, curr) => acc + curr.price, 0);
    const unitPrice = basePrice + extrasPrice;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const copy = [...prev];
        const newQty = copy[existingIndex].quantity + quantity;
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
          notes: notes || copy[existingIndex].notes,
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            product,
            quantity,
            selectedSize,
            selectedExtras,
            notes,
            unitPrice,
            totalPrice: unitPrice * quantity,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity,
              totalPrice: item.unitPrice * quantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(currentKey);
      localStorage.removeItem('gs_shopping_cart');
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const deliveryFee = 0; // Free or calculated dynamically at checkout
  const total = subtotal + deliveryFee;
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const generateWhatsAppMessage = (
    customerName: string,
    customerPhone: string,
    orderType: string,
    notes = '',
    lang = 'ar'
  ): string => {
    const isAr = lang === 'ar';
    const lines: string[] = [];

    if (isAr) {
      lines.push('مرحباً نبع الدرعيه / Gulf Spring،');
      lines.push('أود تقديم طلب جديد:');
      lines.push('');
      lines.push('📋 *تفاصيل الطلب:*');
      cart.forEach((item) => {
        const sizeStr = item.selectedSize ? ` (${item.selectedSize.name_ar})` : '';
        const extrasStr = item.selectedExtras?.length
          ? ` + ${item.selectedExtras.map((e) => e.name_ar).join(', ')}`
          : '';
        lines.push(`• ${item.quantity}x ${item.product.name_ar}${sizeStr}${extrasStr} - ${item.totalPrice} ر.س`);
      });
      lines.push('');
      lines.push(`💰 *المجموع:* ${total} ر.س`);
      lines.push('');
      lines.push('👤 *بيانات العميل:*');
      lines.push(`الاسم: ${customerName || 'عميل نبع الدرعية'}`);
      if (customerPhone) lines.push(`الجوال: ${customerPhone}`);
      lines.push(`نوع الطلب: ${orderType}`);
      if (notes) lines.push(`ملاحظات: ${notes}`);
      lines.push('');
      lines.push('يرجى تأكيد استلام الطلب وتجهيزه. شكراً لكم!');
    } else {
      lines.push('Hello Gulf Spring / نبع الدرعيه,');
      lines.push('I would like to place an order:');
      lines.push('');
      lines.push('📋 *Order Items:*');
      cart.forEach((item) => {
        const sizeStr = item.selectedSize ? ` (${item.selectedSize.name_en})` : '';
        const extrasStr = item.selectedExtras?.length
          ? ` + ${item.selectedExtras.map((e) => e.name_en).join(', ')}`
          : '';
        lines.push(`• ${item.quantity}x ${item.product.name_en}${sizeStr}${extrasStr} - SAR ${item.totalPrice}`);
      });
      lines.push('');
      lines.push(`💰 *Total:* SAR ${total}`);
      lines.push('');
      lines.push('👤 *Customer Details:*');
      lines.push(`Name: ${customerName || 'Valued Guest'}`);
      if (customerPhone) lines.push(`Phone: ${customerPhone}`);
      lines.push(`Order Type: ${orderType}`);
      if (notes) lines.push(`Notes: ${notes}`);
      lines.push('');
      lines.push('Please confirm my order. Thank you!');
    }

    return lines.join('\n');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryFee,
        total,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        generateWhatsAppMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
};
