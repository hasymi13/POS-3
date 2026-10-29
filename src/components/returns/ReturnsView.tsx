import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatRupiah, formatIndonesianDateTime } from '../../utils/format';
import { Undo2, CheckCircle, AlertCircle, Search } from 'lucide-react';

export const ReturnsView: React.FC = () => {
  const { transactions, refundTransaction } = usePOS();
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const completedTransactions = transactions.filter((t) => t.status === 'completed');

  const filtered = completedTransactions.filter(
    (t) =>
      t.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefund = (id: string, invoice: string) => {
    if (window.confirm(`Yakin ingin melakukan retur & pengembalian dana untuk faktur ${invoice}? Stok barang akan dikembalikan ke inventaris.`)) {
      refundTransaction(id);
      setFeedback(`Faktur ${invoice} berhasil di-retur. Stok barang telah dikembalikan!`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span>Retur Penjualan & Pengembalian Barang</span>
        </h1>
        <p className="text-xs text-slate-500">
          Proses retur barang rusak atau pembatalan transaksi dengan pengembalian stok inventaris otomatis.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center max-w-md">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor faktur pembelian atau nama pembeli..."
          className="w-full text-xs text-slate-800 focus:outline-hidden"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-2.5 px-4">No. Faktur</th>
                <th className="py-2.5 px-3">Waktu Transaksi</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Item Pembelian</th>
                <th className="py-2.5 px-3 text-right">Total Transaksi</th>
                <th className="py-2.5 px-4 text-center">Aksi Retur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.invoiceNumber}</td>
                  <td className="py-3 px-3 text-slate-600">{formatIndonesianDateTime(t.date)}</td>
                  <td className="py-3 px-3 text-slate-700">{t.customerName || 'Pelanggan Umum'}</td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-600">
                      {t.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                    {formatRupiah(t.total)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleRefund(t.id, t.invoiceNumber)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Proses Retur
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
