import React from 'react';
import { usePOS } from '../../context/POSContext';
import { MetroTiles } from '../layout/MetroTiles';
import { SalesChart } from './SalesChart';
import { formatRupiah, generateWhatsAppStockAlertUrl } from '../../utils/format';
import {
  TrendingUp,
  Receipt,
  PiggyBank,
  AlertTriangle,
  Send,
  ArrowRight,
  CreditCard,
  QrCode,
  Banknote,
  Smartphone,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    transactions,
    products,
    lowStockProducts,
    outOfStockProducts,
    settings,
    sendLowStockAlert,
    setActiveView,
    currentBranch,
  } = usePOS();

  // Today's metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter((t) => t.date.startsWith(todayStr));
  const todaySales = todayTransactions.reduce((acc, t) => acc + t.total, 0);
  const todayProfit = todayTransactions.reduce((acc, t) => acc + t.grossProfit, 0);

  const totalCritical = lowStockProducts.length + outOfStockProducts.length;

  // Payment Breakdown
  const paymentMethodCounts = transactions.reduce(
    (acc, t) => {
      acc[t.payment.method] = (acc[t.payment.method] || 0) + t.total;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalAllRevenue = Math.max(1, transactions.reduce((acc, t) => acc + t.total, 0));

  // Top Selling Products
  const productSalesMap = transactions.reduce(
    (acc, t) => {
      t.items.forEach((item) => {
        if (!acc[item.productId]) {
          acc[item.productId] = {
            id: item.productId,
            name: item.productName,
            sku: item.sku,
            qty: 0,
            revenue: 0,
          };
        }
        acc[item.productId].qty += item.quantity;
        acc[item.productId].revenue += item.subtotal;
      });
      return acc;
    },
    {} as Record<string, { id: string; name: string; sku: string; qty: number; revenue: number }>
  );

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const maxTopQty = Math.max(1, ...(topProducts.map((p) => p.qty)));

  const handleWhatsAppAlert = () => {
    const criticalList = [...outOfStockProducts, ...lowStockProducts];
    if (criticalList.length === 0) return;
    const url = generateWhatsAppStockAlertUrl(settings.whatsappAlertNumber, criticalList, settings.storeName);
    sendLowStockAlert('whatsapp');
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 pb-12">
      {/* 1. Metro Tiles Header (Matches reference image) */}
      <MetroTiles />

      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Unit & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
              <span>Dashboard Analitik Toko</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 font-semibold">
                {currentBranch.name}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Monitoring performa transaksi kasir, perputaran stok barang, dan arus kas harian secara real-time.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveView('pos')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Buka Mesin Kasir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Low Stock Alert Banner (Automatically triggers when items are low) */}
        {totalCritical > 0 && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-3.5 sm:p-4 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm mt-0.5 flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base flex items-center space-x-2">
                  <span>Peringatan Stok Menipis!</span>
                  <span className="bg-white text-rose-700 text-xs px-2 py-0.2 rounded-full font-black">
                    {totalCritical} Item
                  </span>
                </div>
                <div className="text-xs text-amber-50 mt-0.5">
                  Terdapat {outOfStockProducts.length} barang habis dan {lowStockProducts.length} barang mendekati batas minimum.
                  Kirim notifikasi otomatis ke supplier atau manajer pengadaan sekarang.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleWhatsAppAlert}
                className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm flex-1 sm:flex-none"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kirim WhatsApp Otomatis</span>
              </button>
              <button
                onClick={() => setActiveView('inventory')}
                className="px-3 py-2 rounded-lg bg-black/20 hover:bg-black/30 text-white font-semibold text-xs transition-colors flex-1 sm:flex-none text-center"
              >
                Lihat Detail Stok
              </button>
            </div>
          </div>
        )}

        {/* 3. KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Penjualan Hari Ini */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Penjualan Hari Ini
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 font-black text-slate-800 text-lg sm:text-2xl truncate">
              {formatRupiah(todaySales)}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-emerald-600 font-medium">
              <span>{todayTransactions.length} transaksi hari ini</span>
            </div>
          </div>

          {/* Card 2: Total Transaksi */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Transaksi
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 font-black text-slate-800 text-lg sm:text-2xl truncate">
              {transactions.length} Struk
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Rata-rata: {formatRupiah(transactions.length ? totalAllRevenue / transactions.length : 0)}
            </div>
          </div>

          {/* Card 3: Laba Kotor */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Laba Kotor (Hari Ini)
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 font-black text-emerald-600 text-lg sm:text-2xl truncate">
              {formatRupiah(todayProfit)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Margin: {todaySales > 0 ? ((todayProfit / todaySales) * 100).toFixed(1) : '0'}%
            </div>
          </div>

          {/* Card 4: Stok Kritis */}
          <div
            onClick={() => setActiveView('inventory')}
            className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Stok Menipis
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalCritical > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 font-black text-slate-800 text-lg sm:text-2xl">
              {totalCritical} Produk
            </div>
            <div className="mt-1 text-[11px] text-amber-600 font-semibold flex items-center space-x-1">
              <span>{outOfStockProducts.length} habis, {lowStockProducts.length} restock</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* 4. Sales Chart ("Grafik Penjualan") matching the screenshot */}
        <SalesChart transactions={transactions} />

        {/* 5. Bottom Two-Column Row: Payment Breakdown & Top Selling Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
              <span>Metode Pembayaran Digital & Tunai</span>
              <span className="text-xs text-slate-400 font-normal">Semua Waktu</span>
            </h3>

            <div className="space-y-3">
              {/* QRIS */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                    <QrCode className="w-4 h-4 text-purple-600" />
                    <span>QRIS (Dinamis / Statis)</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatRupiah(paymentMethodCounts['qris'] || 0)} (
                    {(((paymentMethodCounts['qris'] || 0) / totalAllRevenue) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{
                      width: `${((paymentMethodCounts['qris'] || 0) / totalAllRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Cash / Tunai */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Tunai (Cash Register)</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatRupiah(paymentMethodCounts['cash'] || 0)} (
                    {(((paymentMethodCounts['cash'] || 0) / totalAllRevenue) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${((paymentMethodCounts['cash'] || 0) / totalAllRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* e-Wallet */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-sky-600" />
                    <span>e-Wallet (GoPay, OVO, ShopeePay, DANA)</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatRupiah(paymentMethodCounts['ewallet'] || 0)} (
                    {(((paymentMethodCounts['ewallet'] || 0) / totalAllRevenue) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{
                      width: `${((paymentMethodCounts['ewallet'] || 0) / totalAllRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Transfer & Card */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>Kartu Debit & Transfer Bank</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatRupiah(
                      (paymentMethodCounts['card'] || 0) + (paymentMethodCounts['transfer'] || 0)
                    )}{' '}
                    (
                    {(
                      (((paymentMethodCounts['card'] || 0) + (paymentMethodCounts['transfer'] || 0)) /
                        totalAllRevenue) *
                      100
                    ).toFixed(0)}
                    %)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${
                        (((paymentMethodCounts['card'] || 0) + (paymentMethodCounts['transfer'] || 0)) /
                          totalAllRevenue) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm">Produk Terlaris (Top Selling)</h3>
              <button
                onClick={() => setActiveView('reports')}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center space-x-1"
              >
                <span>Lihat Laporan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  Belum ada data penjualan tercatat.
                </div>
              ) : (
                topProducts.map((p, idx) => (
                  <div key={p.id} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 truncate max-w-[70%]">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900">{p.qty} terjual</span>
                        <span className="text-[10px] text-slate-400 block">
                          {formatRupiah(p.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${(p.qty / maxTopQty) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 6. Recent Transactions Feed */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
            <h3 className="font-bold text-slate-800 text-sm">5 Transaksi Terkini</h3>
            <button
              onClick={() => setActiveView('reports')}
              className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold"
            >
              Lihat Semua Laporan Transaksi →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">No. Faktur</th>
                  <th className="py-2.5 px-4">Waktu</th>
                  <th className="py-2.5 px-4">Pelanggan</th>
                  <th className="py-2.5 px-4">Metode</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                  <th className="py-2.5 px-4 text-right">Laba Kotor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                      {t.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {new Date(t.date).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      - {new Date(t.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{t.customerName}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {t.payment.method} {t.payment.provider ? `(${t.payment.provider})` : ''}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900">
                      {formatRupiah(t.total)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-600">
                      +{formatRupiah(t.grossProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
