export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  costPrice: number;    // Harga Pokok Penjualan (HPP)
  sellingPrice: number; // Harga Jual
  stock: number;
  minStock: number;     // Batas peringatan stok menipis
  unit: string;         // 'pcs' | 'box' | 'botol' | 'kg' | 'pack'
  image?: string;
  supplier: string;
  lastUpdated: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number; // in rupiah or percentage
  notes?: string;
}

export type PaymentMethod = 'qris' | 'cash' | 'ewallet' | 'card' | 'transfer';

export interface PaymentDetails {
  method: PaymentMethod;
  amountPaid: number;
  change: number;
  provider?: string; // 'GoPay', 'OVO', 'ShopeePay', 'DANA', 'BCA', 'Mandiri'
  referenceNumber?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  cashierName: string;
  branchName: string;
  customerName?: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    costPrice: number;
    sellingPrice: number;
    quantity: number;
    subtotal: number;
    discount: number;
  }[];
  subtotal: number;
  discountTotal: number;
  tax: number; // PPN 11%
  total: number;
  totalCost: number; // Total HPP
  grossProfit: number; // Total - TotalCost
  payment: PaymentDetails;
  status: 'completed' | 'refunded' | 'void';
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'transfer_in' | 'transfer_out';
  productId: string;
  productName: string;
  quantity: number;
  balanceAfter: number;
  referenceNo: string;
  note: string;
  operator: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  date: string;
  fromBranch: string;
  toBranch: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'completed' | 'in_transit' | 'pending';
  notes: string;
  operator: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  totalSpent: number;
  memberTier: 'Regular' | 'Silver' | 'Gold';
}

export interface LowStockNotification {
  id: string;
  date: string;
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  channel: 'whatsapp' | 'email';
  recipient: string;
  status: 'sent' | 'failed';
  message: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  manager: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  receiptFooter: string;
  taxRate: number; // in percent (e.g., 11)
  taxEnabled: boolean;
  whatsappAlertNumber: string;
  managerEmail: string;
  autoAlertLowStock: boolean;
  qrisNmid: string;
}
