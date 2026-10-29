import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Transaction,
  StockTransfer,
  Branch,
  StoreSettings,
  Customer,
  LowStockNotification,
  PaymentDetails,
} from '../types/pos';
import {
  INITIAL_PRODUCTS,
  INITIAL_BRANCHES,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_CUSTOMERS,
} from '../data/seedData';
import { generateInvoiceNumber } from '../utils/format';
import { posSound } from '../utils/sound';

interface POSContextType {
  // Navigation / active view
  activeView: string;
  setActiveView: (view: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;

  // Branch & Cashier
  branches: Branch[];
  currentBranch: Branch;
  setCurrentBranch: (branch: Branch) => void;
  currentUser: { name: string; role: string; email: string };
  setCurrentUser: (user: { name: string; role: string; email: string }) => void;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (id: string, quantityToAdd: number, costPrice?: number, note?: string) => void;
  adjustStock: (id: string, newStock: number, reason: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItemDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartDiscount: number;
  cartTotal: number;

  // Transactions & Checkout
  transactions: Transaction[];
  completeCheckout: (payment: PaymentDetails, customerName?: string) => Transaction;
  refundTransaction: (transactionId: string) => void;
  latestTransaction: Transaction | null;

  // Stock Transfer
  stockTransfers: StockTransfer[];
  transferStock: (toBranchId: string, productId: string, quantity: number, notes: string) => boolean;

  // Low Stock & Notifications
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  notifications: LowStockNotification[];
  sendLowStockAlert: (channel: 'whatsapp' | 'email') => { success: boolean; message: string; url?: string };
  dismissNotification: (id: string) => void;

  // Customers & Settings
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'points' | 'totalSpent'>) => void;
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Reset to default
  resetDataToDefault: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('enigma_pos_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Branches
  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]);

  // Current User
  const [currentUser, setCurrentUser] = useState({
    name: 'Admin PUSAT',
    role: 'Super Administrator',
    email: 'hasymisomaida@unikma.ac.id',
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('enigma_pos_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('enigma_pos_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Stock Transfers
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => {
    try {
      const saved = localStorage.getItem('enigma_pos_transfers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('enigma_pos_customers');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // Notifications Log
  const [notifications, setNotifications] = useState<LowStockNotification[]>(() => {
    try {
      const saved = localStorage.getItem('enigma_pos_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Shopping Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [latestTransaction, setLatestTransaction] = useState<Transaction | null>(null);

  // Save to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem('enigma_pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('enigma_pos_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('enigma_pos_transfers', JSON.stringify(stockTransfers));
  }, [stockTransfers]);

  useEffect(() => {
    localStorage.setItem('enigma_pos_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('enigma_pos_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('enigma_pos_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Derived low stock items
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const cartDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  const taxableAmount = Math.max(0, cartSubtotal - cartDiscount);
  const cartTax = settings.taxEnabled ? Math.round(taxableAmount * (settings.taxRate / 100)) : 0;
  const cartTotal = taxableAmount + cartTax;

  // Cart Operations
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      posSound.playWarning();
      return;
    }

    posSound.playBeep();

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        const newQty = Math.min(product.stock, item.quantity + quantity);
        const updated = [...prev];
        updated[existingIndex] = { ...item, quantity: newQty };
        return updated;
      } else {
        return [...prev, { product, quantity: Math.min(product.stock, quantity), discount: 0 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clamped = Math.min(item.product.stock, quantity);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const updateCartItemDiscount = (productId: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, discount: Math.max(0, discount) } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout
  const completeCheckout = (payment: PaymentDetails, customerName?: string): Transaction => {
    const invoiceNumber = generateInvoiceNumber();
    const now = new Date().toISOString();

    let totalCost = 0;
    const items = cart.map((item) => {
      const itemSubtotal = item.product.sellingPrice * item.quantity - item.discount;
      const itemHPP = item.product.costPrice * item.quantity;
      totalCost += itemHPP;

      return {
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        costPrice: item.product.costPrice,
        sellingPrice: item.product.sellingPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        discount: item.discount,
      };
    });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber,
      date: now,
      cashierName: currentUser.name,
      branchName: currentBranch.name,
      customerName: customerName || 'Pelanggan Umum',
      items,
      subtotal: cartSubtotal,
      discountTotal: cartDiscount,
      tax: cartTax,
      total: cartTotal,
      totalCost,
      grossProfit: cartTotal - totalCost,
      payment,
      status: 'completed',
    };

    // Deduct stock from products
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((ci) => ci.product.id === p.id);
        if (cartItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - cartItem.quantity),
            lastUpdated: now,
          };
        }
        return p;
      })
    );

    // Save transaction
    setTransactions((prev) => [newTx, ...prev]);
    setLatestTransaction(newTx);
    clearCart();

    posSound.playSuccess();
    return newTx;
  };

  const refundTransaction = (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.status === 'refunded') return;

    // Restore stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = tx.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.quantity };
        }
        return p;
      })
    );

    // Mark as refunded
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, status: 'refunded' as const } : t))
    );
  };

  // Product Inventory Management
  const addProduct = (newProdData: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const restockProduct = (id: string, quantityToAdd: number, costPrice?: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = p.stock + quantityToAdd;
          return {
            ...p,
            stock: newStock,
            costPrice: costPrice !== undefined && costPrice > 0 ? costPrice : p.costPrice,
            lastUpdated: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  const adjustStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, newStock), lastUpdated: new Date().toISOString() } : p))
    );
  };

  // Stock Transfer between branches
  const transferStock = (toBranchId: string, productId: string, quantity: number, notes: string): boolean => {
    const product = products.find((p) => p.id === productId);
    const destBranch = branches.find((b) => b.id === toBranchId);
    if (!product || !destBranch || product.stock < quantity) return false;

    // Deduct stock from current branch inventory
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock - quantity, lastUpdated: new Date().toISOString() } : p))
    );

    const transferRecord: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber: `TRF/${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      fromBranch: currentBranch.name,
      toBranch: destBranch.name,
      productId: product.id,
      productName: product.name,
      quantity,
      status: 'completed',
      notes,
      operator: currentUser.name,
    };

    setStockTransfers((prev) => [transferRecord, ...prev]);
    return true;
  };

  // Customers
  const addCustomer = (custData: Omit<Customer, 'id' | 'points' | 'totalSpent'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      points: 10,
      totalSpent: 0,
    };
    setCustomers((prev) => [...prev, newCust]);
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Notification Trigger
  const sendLowStockAlert = (channel: 'whatsapp' | 'email') => {
    const criticalItems = [...outOfStockProducts, ...lowStockProducts];
    if (criticalItems.length === 0) {
      return { success: false, message: 'Semua stok dalam keadaan aman (tidak ada stok menipis).' };
    }

    const recipient = channel === 'whatsapp' ? settings.whatsappAlertNumber : settings.managerEmail;
    const newNotification: LowStockNotification = {
      id: `notif-${Date.now()}`,
      date: new Date().toISOString(),
      productId: criticalItems[0].id,
      productName: `${criticalItems.length} Produk (${criticalItems.map((p) => p.name).slice(0, 2).join(', ')}${criticalItems.length > 2 ? '...' : ''})`,
      currentStock: criticalItems[0].stock,
      minStock: criticalItems[0].minStock,
      channel,
      recipient,
      status: 'sent',
      message: `Peringatan: ${criticalItems.length} produk memiliki stok di bawah batas minimum.`,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    return {
      success: true,
      message: `Notifikasi stok menipis berhasil dikirim via ${channel.toUpperCase()} ke ${recipient}!`,
    };
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Reset to default seed
  const resetDataToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setStockTransfers([]);
    setSettings(INITIAL_SETTINGS);
    setCustomers(INITIAL_CUSTOMERS);
    setNotifications([]);
    setCart([]);
    localStorage.clear();
  };

  return (
    <POSContext.Provider
      value={{
        activeView,
        setActiveView,
        isSidebarOpen,
        setIsSidebarOpen,
        branches,
        currentBranch,
        setCurrentBranch,
        currentUser,
        setCurrentUser,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        adjustStock,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartItemDiscount,
        clearCart,
        cartSubtotal,
        cartTax,
        cartDiscount,
        cartTotal,
        transactions,
        completeCheckout,
        refundTransaction,
        latestTransaction,
        stockTransfers,
        transferStock,
        lowStockProducts,
        outOfStockProducts,
        notifications,
        sendLowStockAlert,
        dismissNotification,
        customers,
        addCustomer,
        settings,
        updateSettings,
        resetDataToDefault,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
