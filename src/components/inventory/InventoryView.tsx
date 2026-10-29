import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types/pos';
import { formatRupiah, exportInventoryToExcel, generateWhatsAppStockAlertUrl } from '../../utils/format';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  AlertTriangle,
  Edit,
  Trash2,
  TrendingUp,
  Boxes,
  Truck,
  CheckCircle,
  X,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    adjustStock,
    lowStockProducts,
    outOfStockProducts,
    settings,
    sendLowStockAlert,
  } = usePOS();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'low' | 'out'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('Sembako & Pangan');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(10);
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formUnit, setFormUnit] = useState('pcs');
  const [formSupplier, setFormSupplier] = useState('');

  // Restock form
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockCost, setRestockCost] = useState<number>(0);

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.supplier.toLowerCase().includes(search.toLowerCase());

    const isOut = p.stock <= 0;
    const isLow = p.stock > 0 && p.stock <= p.minStock;
    const isSafe = p.stock > p.minStock;

    let matchStatus = true;
    if (statusFilter === 'safe') matchStatus = isSafe;
    if (statusFilter === 'low') matchStatus = isLow;
    if (statusFilter === 'out') matchStatus = isOut;

    return matchCategory && matchSearch && matchStatus;
  });

  const totalValue = products.reduce((acc, p) => acc + p.stock * p.costPrice, 0);

  const handleOpenAdd = () => {
    setFormName('');
    setFormSku(`PRD-${Math.floor(100 + Math.random() * 900)}`);
    setFormBarcode(`899${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormCategory('Sembako & Pangan');
    setFormCostPrice(10000);
    setFormSellingPrice(13000);
    setFormStock(20);
    setFormMinStock(5);
    setFormUnit('pcs');
    setFormSupplier('Supplier Utama');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setActiveProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormBarcode(p.barcode);
    setFormCategory(p.category);
    setFormCostPrice(p.costPrice);
    setFormSellingPrice(p.sellingPrice);
    setFormStock(p.stock);
    setFormMinStock(p.minStock);
    setFormUnit(p.unit);
    setFormSupplier(p.supplier);
    setIsEditModalOpen(true);
  };

  const handleOpenRestock = (p: Product) => {
    setActiveProduct(p);
    setRestockQty(10);
    setRestockCost(p.costPrice);
    setIsRestockModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    addProduct({
      name: formName,
      sku: formSku,
      barcode: formBarcode,
      category: formCategory,
      costPrice: formCostPrice,
      sellingPrice: formSellingPrice,
      stock: formStock,
      minStock: formMinStock,
      unit: formUnit,
      supplier: formSupplier,
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || !formName.trim()) return;

    updateProduct(activeProduct.id, {
      name: formName,
      sku: formSku,
      barcode: formBarcode,
      category: formCategory,
      costPrice: formCostPrice,
      sellingPrice: formSellingPrice,
      stock: formStock,
      minStock: formMinStock,
      unit: formUnit,
      supplier: formSupplier,
    });
    setIsEditModalOpen(false);
  };

  const handleSaveRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || restockQty <= 0) return;

    restockProduct(activeProduct.id, restockQty, restockCost > 0 ? restockCost : undefined);
    setIsRestockModalOpen(false);
  };

  const handleSendWhatsAppAlert = () => {
    const criticalList = [...outOfStockProducts, ...lowStockProducts];
    if (criticalList.length === 0) return;
    const url = generateWhatsAppStockAlertUrl(settings.whatsappAlertNumber, criticalList, settings.storeName);
    sendLowStockAlert('whatsapp');
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <span>Manajemen Stok & Inventaris Toko</span>
          </h1>
          <p className="text-xs text-slate-500">
            Kelola katalog barang, pantau batas minimum stok, restock pemasok, dan ekspor data ke Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel */}
          <button
            onClick={() => exportInventoryToExcel(products, settings.storeName)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          {/* WhatsApp Alert Trigger */}
          <button
            onClick={handleSendWhatsAppAlert}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
            title="Kirim pesan notifikasi stok menipis otomatis ke nomor WhatsApp supplier/manajer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Notif WhatsApp</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Varian Produk</div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{products.length} Item</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{categories.length - 1} Kategori Terdaftar</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Nilai Aset Stok</div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{formatRupiah(totalValue)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Berdasarkan Harga Modal (HPP)</div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
          className={`p-3.5 sm:p-4 rounded-xl border shadow-sm cursor-pointer transition-all ${
            statusFilter === 'low'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-700 uppercase flex items-center justify-between">
            <span>Stok Menipis</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {lowStockProducts.length} Produk
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Di bawah batas minimum</div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
          className={`p-3.5 sm:p-4 rounded-xl border shadow-sm cursor-pointer transition-all ${
            statusFilter === 'out'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-700 uppercase flex items-center justify-between">
            <span>Stok Habis (0)</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
            {outOfStockProducts.length} Produk
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Perlu restock segera</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, SKU, barcode, atau supplier..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 font-semibold focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Kategori: {c}
              </option>
            ))}
          </select>

          {/* Status filter pills */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('low')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'low' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Menipis ({lowStockProducts.length})
            </button>
            <button
              onClick={() => setStatusFilter('out')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'out' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Habis ({outOfStockProducts.length})
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Menampilkan: <strong className="text-slate-800">{filteredProducts.length}</strong> dari {products.length}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3 text-right">Harga Modal (HPP)</th>
                <th className="py-3 px-3 text-right">Harga Jual</th>
                <th className="py-3 px-3 text-right">Margin Laba</th>
                <th className="py-3 px-3 text-center">Sisa Stok</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isOut = p.stock <= 0;
                const isLow = p.stock > 0 && p.stock <= p.minStock;
                const margin = p.sellingPrice - p.costPrice;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Product Name & SKU */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SKU: {p.sku} | Barcode: {p.barcode}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {p.category}
                      </span>
                    </td>

                    {/* HPP */}
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatRupiah(p.costPrice)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(p.sellingPrice)}
                    </td>

                    {/* Margin */}
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 font-bold">
                      +{formatRupiah(margin)}
                    </td>

                    {/* Stock & Unit */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-slate-900 text-sm">{p.stock}</span>{' '}
                      <span className="text-[10px] text-slate-500 font-medium">{p.unit}</span>
                      <div className="text-[9px] text-slate-400">Min: {p.minStock}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                          HABIS
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                          MENIPIS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                          AMAN
                        </span>
                      )}
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-3 text-slate-600 text-[11px] truncate max-w-[140px]">
                      {p.supplier}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Restock Button */}
                        <button
                          onClick={() => handleOpenRestock(p)}
                          className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                          title="Restock (Tambah Stok)"
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white transition-colors"
                          title="Edit Produk"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus produk "${p.name}" dari katalog?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Produk Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">Tambah Produk Baru ke Katalog</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Produk:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kopi Luwak White Koffie 10x20g"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode SKU:</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Barcode / EAN-13:</label>
                  <input
                    type="text"
                    required
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Sembako & Pangan">Sembako & Pangan</option>
                    <option value="Minuman Dingin & Panas">Minuman Dingin & Panas</option>
                    <option value="Snack & Makanan Ringan">Snack & Makanan Ringan</option>
                    <option value="Perawatan Diri">Perawatan Diri</option>
                    <option value="Kebutuhan Rumah Tangga">Kebutuhan Rumah Tangga</option>
                    <option value="Alat Tulis & Kantor">Alat Tulis & Kantor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan:</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="pcs, botol, karung, pack"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Beli / HPP (Rp):</label>
                  <input
                    type="number"
                    min="0"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    min="0"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok Awal:</label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batas Minimum Peringatan:</label>
                  <input
                    type="number"
                    min="1"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pemasok / Supplier:</label>
                <input
                  type="text"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  placeholder="PT Indofood, Unilever, Distributor..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Simpan Produk Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Produk */}
      {isEditModalOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">Edit Data Produk</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Produk:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Beli / HPP (Rp):</label>
                  <input
                    type="number"
                    min="0"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    min="0"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok Fisik:</label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batas Min Peringatan:</label>
                  <input
                    type="number"
                    min="1"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Restock Pembelian Inbound */}
      {isRestockModalOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-sm font-extrabold flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>Restock Barang (Pembelian / Inbound)</span>
              </h2>
              <button onClick={() => setIsRestockModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRestock} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
                <div className="font-bold text-slate-800 text-sm">{activeProduct.name}</div>
                <div className="text-[11px] text-slate-500">
                  Stok saat ini: <strong className="text-slate-900">{activeProduct.stock} {activeProduct.unit}</strong> | Batas Min: {activeProduct.minStock} {activeProduct.unit}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah Tambahan Stok Masuk ({activeProduct.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-base font-black text-slate-800 font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Update Harga Beli / HPP Baru (Opsional):
                </label>
                <input
                  type="number"
                  min="0"
                  value={restockCost}
                  onChange={(e) => setRestockCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                Stok setelah restock: <strong>{activeProduct.stock + restockQty} {activeProduct.unit}</strong>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Konfirmasi Stok Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
