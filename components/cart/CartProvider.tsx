'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

export interface CartItem {
  dishId: string;
  name: { pt: string; en: string };
  flavor?: { pt: string; en: string };
  price: number;
  quantity: number;
  weight?: string;
  image?: string;
  portionSize?: {
    label: { pt: string; en: string };
    price: number;
    weight?: string;
  };
  schedule?: {
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday?: boolean;
    sunday?: boolean;
  };
  maxQuantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (dishId: string) => boolean;
  getItemQuantity: (dishId: string) => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'caru-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading cart:', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Error saving cart:', e);
      }
    }
  }, [items, isHydrated]);

  const addItem = useCallback(
    (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
      setItems(prev => {
        const existing = prev.find(item => item.dishId === newItem.dishId);
        if (existing) {
          const newQty = Math.min(
            existing.quantity + (newItem.quantity || 1),
            newItem.maxQuantity,
          );
          return prev.map(item =>
            item.dishId === newItem.dishId
              ? { ...item, quantity: newQty }
              : item,
          );
        }
        return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
      });
      // Auto-open cart when item is added
      setIsCartOpen(true);
    },
    [],
  );

  const removeItem = useCallback((dishId: string) => {
    setItems(prev => prev.filter(item => item.dishId !== dishId));
  }, []);

  const updateQuantity = useCallback(
    (dishId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(dishId);
        return;
      }
      setItems(prev =>
        prev.map(item =>
          item.dishId === dishId
            ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
            : item,
        ),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setIsCartOpen(false);
  }, []);

  // Auto-close sidebar when cart becomes empty (e.g. removing last item)
  useEffect(() => {
    if (isHydrated && items.length === 0 && isCartOpen) {
      setIsCartOpen(false);
    }
  }, [items.length, isHydrated, isCartOpen]);

  const isInCart = useCallback(
    (dishId: string) => items.some(item => item.dishId === dishId),
    [items],
  );

  const getItemQuantity = useCallback(
    (dishId: string) =>
      items.find(item => item.dishId === dishId)?.quantity || 0,
    [items],
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) =>
      sum + (item.portionSize?.price || item.price) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
