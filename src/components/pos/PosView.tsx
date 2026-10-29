import React, { useState, useRef, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product, Transaction } from '../../types/pos';
import { formatRupiah } from '../../utils/format';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  CreditCard,
  Tag,
  Store,
} from 'lucide-react';

export const PosView: React.FC = () => {
  const {
    products,
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
    currentBranch,
    settings,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [barcodeAlert, setBarcodeAlert] = useState<string | null>(null);

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Extract unique categories
  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  // Handle Barcode Scanner Input
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const trimmed = barcodeInput.trim();
    const foundProduct = products.find(
      (p) => p.barcode === trimmed || p.sku.toLowerCase() === trimmed.toLowerCase()
    );

    if (foundProduct) {
      if (foundProduct.stock <= 0) {
        setBarcodeAlert(`Stok ${foundProduct.name} habis!`);
      } else {
        addToCart(foundProduct, 1);
        setBarcodeAlert(`Ditambahkan: ${foundProduct.name}`);
      }
    } else {
      setBarcodeAlert(`Barcode / SKU "${trimmed}" tidak ditemukan.`);
    }

    setBarcodeInput('');
    setTimeout(() => setBarcodeAlert(null), 3000);
  };

  const handlePaymentSuccess = (tx: Transaction) => {
    setIsPaymentOpen(false);
    setCompletedTx(tx);
    setIsReceiptOpen(true);
  };

  const handleNewTransaction = () => {
    setIsReceiptOpen(false);
    setCompletedTx(null);
    clearCart();
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
      {/* LEFT COLUMN: Product Catalog & Scanner */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-5 space-y-3">
        {/* Top Control Bar: Search & Barcode input */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/90 flex flex-wrap items-center gap-3">
          {/* Barcode Scanner Input */}
          <form onSubmit={handleBarcodeSubmit} className="flex-1 min-w-[200px] relative">
            <Barcode className="w-4 h-4 text-cyan-600 absolute left-3 top-3" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan Barcode / Ketik SKU lalu tekan Enter..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
            />
          </form>

          {/* Search by Name */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Barcode Feedback Alert */}
        {barcodeAlert && (
          <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs flex items-center justify-between shadow-md">
            <span>{barcodeAlert}</span>
            <button onClick={() => setBarcodeAlert(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all shadow-xs ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow-cyan-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
              <Search className="w-10 h-10 mb-2 opacity-50" />
              <p className="font-semibold text-sm">Tidak ada produk yang cocok</p>
              <p className="text-xs text-slate-400">Coba kata kunci lain atau ubah kategori pilihan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= p.minStock;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p, 1)}
                    className={`bg-white rounded-xl p-3 border transition-all duration-150 flex flex-col justify-between select-none relative group ${
                      isOutOfStock
                        ? 'opacity-60 border-rose-200 cursor-not-allowed bg-rose-50/20'
                        : 'border-slate-200/90 hover:border-cyan-500 hover:shadow-md cursor-pointer active:scale-98'
                    }`}
                  >
                    {/* Top Tag & Stock Indicator */}
                    <div className="flex items-center justify-between mb-1.5 text-[10px]">
                      <span className="font-mono text-slate-400 font-bold truncate max-w-[90px]">
                        {p.sku}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full font-bold ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOutOfStock ? 'Habis' : `Stok: ${p.stock} ${p.unit}`}
                      </span>
                    </div>

                    {/* Product Name */}
                    <div className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 mb-2 leading-snug">
                      {p.name}
                    </div>

                    {/* Price and Add button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block -mb-0.5">Harga</span>
                        <span className="font-black text-cyan-700 text-xs sm:text-sm">
                          {formatRupiah(p.sellingPrice)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white group-hover:bg-cyan-600 group-hover:text-white'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Real-Time Cashier Shopping Cart */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between shadow-lg">
        {/* Cart Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-sm tracking-tight">Keranjang Kasir</span>
            <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Kosongkan</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 max-h-[350px] lg:max-h-none">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center p-4">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-30 text-slate-400" />
              <p className="font-bold text-xs text-slate-600">Keranjang Masih Kosong</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Scan barcode barang atau klik produk pada katalog di sebelah kiri untuk menambahkan.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-2.5 first:pt-1 last:pb-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-xs text-slate-800 line-clamp-1">
                      {item.product.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {formatRupiah(item.product.sellingPrice)} / {item.product.unit}
                    </div>
                  </div>

                  <div className="font-black text-xs text-slate-900">
                    {formatRupiah(item.product.sellingPrice * item.quantity - item.discount)}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center shadow-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className={`w-6 h-6 rounded flex items-center justify-center shadow-xs ${
                        item.quantity >= item.product.stock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                    title="Hapus barang"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Checkout Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">{formatRupiah(cartSubtotal)}</span>
          </div>

          {/* Tax PPN */}
          {settings.taxEnabled && (
            <div className="flex justify-between text-xs text-slate-600">
              <span>PPN ({settings.taxRate}%)</span>
              <span className="font-semibold text-slate-800">{formatRupiah(cartTax)}</span>
            </div>
          )}

          {/* Discount if any */}
          {cartDiscount > 0 && (
            <div className="flex justify-between text-xs text-rose-600 font-semibold">
              <span>Diskon</span>
              <span>-{formatRupiah(cartDiscount)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">
              Total Tagihan
            </span>
            <span className="font-black text-xl sm:text-2xl text-emerald-600">
              {formatRupiah(cartTotal)}
            </span>
          </div>

          {/* Pay Button */}
          <button
            onClick={() => setIsPaymentOpen(true)}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center space-x-2 shadow-lg transition-all ${
              cart.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-500/30 active:scale-98'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Bayar Sekarang (F8)</span>
          </button>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Thermal Receipt Print Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        transaction={completedTx}
        onClose={() => setIsReceiptOpen(false)}
        onNewTransaction={handleNewTransaction}
      />
    </div>
  );
};
