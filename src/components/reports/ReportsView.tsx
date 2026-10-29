import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types/pos';
import {
  formatRupiah,
  formatIndonesianDateTime,
  formatIndonesianDate,
  exportTransactionsToExcel,
} from '../../utils/format';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  Receipt,
  PiggyBank,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, settings, currentBranch } = usePOS();

  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | 'month' | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Custom filter dates
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTransactions = transactions.filter((t) => {
    const txDateStr = t.date.split('T')[0];

    let matchDate = true;
    if (dateFilter === 'today') {
      matchDate = txDateStr === todayStr;
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      matchDate = txDateStr === yesterday.toISOString().split('T')[0];
    } else if (dateFilter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchDate = new Date(t.date) >= sevenDaysAgo;
    } else if (dateFilter === 'month') {
      const now = new Date();
      const txD = new Date(t.date);
      matchDate = txD.getMonth() === now.getMonth() && txD.getFullYear() === now.getFullYear();
    }

    let matchMethod = true;
    if (methodFilter !== 'all') {
      matchMethod = t.payment.method === methodFilter;
    }

    return matchDate && matchMethod;
  });

  // Financial Summary
  const totalOmzet = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalHPP = filteredTransactions.reduce((acc, t) => acc + t.totalCost, 0);
  const totalDiskon = filteredTransactions.reduce((acc, t) => acc + t.discountTotal, 0);
  const totalPajak = filteredTransactions.reduce((acc, t) => acc + t.tax, 0);
  const totalLabaKotor = filteredTransactions.reduce((acc, t) => acc + t.grossProfit, 0);
  const marginPersen = totalOmzet > 0 ? ((totalLabaKotor / totalOmzet) * 100).toFixed(1) : '0';

  const dateRangeLabel =
    dateFilter === 'today'
      ? 'Hari Ini'
      : dateFilter === 'yesterday'
      ? 'Kemarin'
      : dateFilter === '7days'
      ? '7 Hari Terakhir'
      : dateFilter === 'month'
      ? 'Bulan Ini'
      : 'Semua Periode';

  const handleExportExcel = () => {
    exportTransactionsToExcel(filteredTransactions, settings.storeName, dateRangeLabel);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <span>Laporan Penjualan & Pembukuan Kasir</span>
          </h1>
          <p className="text-xs text-slate-500">
            Analisis omzet, laba kotor, rincian per struk penjualan, serta ekspor akuntansi ke PDF & Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print PDF Button */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Ekspor PDF</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor ke Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Omzet */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Omzet / Penjualan
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {formatRupiah(totalOmzet)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {filteredTransactions.length} Struk ({dateRangeLabel})
          </div>
        </div>

        {/* Total HPP Modal */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Modal (HPP)
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-700 mt-1">
            {formatRupiah(totalHPP)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Harga Pokok Barang Terjual</div>
        </div>

        {/* Laba Kotor */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Laba Kotor (Gross Profit)
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {formatRupiah(totalLabaKotor)}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
            Margin: {marginPersen}% dari Omzet
          </div>
        </div>

        {/* Rata-rata per Struk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rata-rata Nilai Struk
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {formatRupiah(filteredTransactions.length ? totalOmzet / filteredTransactions.length : 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Nilai Rata-rata Belanja</div>
        </div>
      </div>

      {/* Date & Payment Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Date Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <span className="text-slate-400 text-[11px] mr-1 uppercase">Periode:</span>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateFilter === 'today'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDateFilter('yesterday')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateFilter === 'yesterday'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kemarin
          </button>
          <button
            onClick={() => setDateFilter('7days')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateFilter === '7days'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateFilter === 'month'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              dateFilter === 'all'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Data
          </button>
        </div>

        {/* Payment filter dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-bold text-[11px]">Metode:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">Semua Metode</option>
            <option value="qris">QRIS</option>
            <option value="cash">Tunai (Cash)</option>
            <option value="ewallet">e-Wallet</option>
            <option value="card">Kartu Debit / Kredit</option>
            <option value="transfer">Transfer Bank</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
            Rincian Buku Penjualan ({filteredTransactions.length} Transaksi)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Klik baris transaksi untuk melihat rincian produk
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">No. Faktur</th>
                <th className="py-2.5 px-3">Tanggal & Waktu</th>
                <th className="py-2.5 px-3">Kasir / Unit</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3 text-center">Items</th>
                <th className="py-2.5 px-3">Pembayaran</th>
                <th className="py-2.5 px-3 text-right">Modal (HPP)</th>
                <th className="py-2.5 px-3 text-right">Total Transaksi</th>
                <th className="py-2.5 px-3 text-right">Laba Kotor</th>
                <th className="py-2.5 px-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Tidak ada transaksi pada periode yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const isExpanded = expandedTxId === t.id;
                  const totalItems = t.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <React.Fragment key={t.id}>
                      <tr
                        onClick={() => setExpandedTxId(isExpanded ? null : t.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-cyan-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {t.invoiceNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono">
                          {formatIndonesianDate(t.date)}{' '}
                          <span className="text-[10px] text-slate-400">
                            {new Date(t.date).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{t.cashierName}</div>
                          <div className="text-[10px] text-slate-400">{t.branchName}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-700">{t.customerName || 'Pelanggan Umum'}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                          {totalItems}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 uppercase">
                            {t.payment.method} {t.payment.provider ? `(${t.payment.provider})` : ''}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">
                          {formatRupiah(t.totalCost)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                          {formatRupiah(t.total)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                          +{formatRupiah(t.grossProfit)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4 mx-auto" /> : <ChevronDown className="w-4 h-4 mx-auto" />}
                        </td>
                      </tr>

                      {/* Expandable item details */}
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={10} className="p-3 pl-8">
                            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs">
                              <span className="text-[11px] font-bold text-slate-700 uppercase mb-2 block">
                                Rincian Barang Faktur #{t.invoiceNumber}:
                              </span>
                              <div className="space-y-1.5">
                                {t.items.map((item, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none"
                                  >
                                    <div>
                                      <span className="font-semibold text-slate-800">
                                        {item.productName}
                                      </span>
                                      <span className="text-slate-400 font-mono text-[10px] ml-2">
                                        SKU: {item.sku}
                                      </span>
                                    </div>
                                    <div className="text-right font-mono">
                                      <span className="text-slate-500">
                                        {item.quantity} x {formatRupiah(item.sellingPrice)} =
                                      </span>{' '}
                                      <strong className="text-slate-900">
                                        {formatRupiah(item.subtotal)}
                                      </strong>
                                      <span className="text-emerald-600 text-[10px] ml-2">
                                        (Laba: +{formatRupiah(item.subtotal - item.costPrice * item.quantity)})
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF PRINT MODAL */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Bar (Hidden on print) */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
              <h2 className="text-sm font-extrabold flex items-center space-x-2">
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Pratinjau Dokumen Laporan Akuntansi (PDF)</span>
              </h2>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs font-sans print:p-0 print:m-0 print:w-full">
              {/* Document Header */}
              <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {settings.storeName}
                  </h1>
                  <p className="text-xs text-slate-600">{settings.address}</p>
                  <p className="text-xs text-slate-600">Telp: {settings.phone} | Email: {settings.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-cyan-800 uppercase">
                    Laporan Penjualan & Laba Rugi
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Periode: {dateRangeLabel}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dicetak: {formatIndonesianDateTime()}
                  </div>
                </div>
              </div>

              {/* Financial Summary Table */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-extrabold text-slate-800 uppercase text-[11px] mb-3">
                  Ringkasan Kinerja Keuangan
                </h4>
                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">TOTAL OMZET:</span>
                    <strong className="text-sm font-black text-slate-900">
                      {formatRupiah(totalOmzet)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">HARGA POKOK (HPP):</span>
                    <strong className="text-sm font-black text-slate-700">
                      {formatRupiah(totalHPP)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">LABA KOTOR:</span>
                    <strong className="text-sm font-black text-emerald-600">
                      {formatRupiah(totalLabaKotor)} ({marginPersen}%)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Detail Table */}
              <div>
                <h4 className="font-extrabold text-slate-800 uppercase text-[11px] mb-2">
                  Daftar Transaksi Kasir
                </h4>
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2 border-b">No. Faktur</th>
                      <th className="p-2 border-b">Waktu</th>
                      <th className="p-2 border-b">Kasir</th>
                      <th className="p-2 border-b">Metode</th>
                      <th className="p-2 border-b text-right">Omzet</th>
                      <th className="p-2 border-b text-right">Laba</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id}>
                        <td className="p-2 font-bold">{t.invoiceNumber}</td>
                        <td className="p-2">{formatIndonesianDate(t.date)}</td>
                        <td className="p-2 font-sans">{t.cashierName}</td>
                        <td className="p-2 uppercase">{t.payment.method}</td>
                        <td className="p-2 text-right">{formatRupiah(t.total)}</td>
                        <td className="p-2 text-right text-emerald-600 font-bold">
                          +{formatRupiah(t.grossProfit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between text-xs text-center">
                <div>
                  <p className="text-slate-500 mb-12">Disiapkan Oleh (Kasir):</p>
                  <p className="font-bold border-t border-slate-400 pt-1 px-6">
                    {filteredTransactions[0]?.cashierName || 'Kasir Toko'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-12">Disetujui Oleh (Manajer Toko):</p>
                  <p className="font-bold border-t border-slate-400 pt-1 px-6">
                    {currentBranch.manager}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-100 p-3.5 border-t border-slate-200 flex justify-between items-center print:hidden">
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 font-bold text-xs"
              >
                Tutup
              </button>

              <button
                onClick={handlePrintPdf}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan Sebagai PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
