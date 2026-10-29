import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatIndonesianDateTime } from '../../utils/format';
import { ArrowLeftRight, CheckCircle, Plus, Send, Building2, Package } from 'lucide-react';

export const StockTransferView: React.FC = () => {
  const { products, branches, currentBranch, stockTransfers, transferStock } = usePOS();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [targetBranchId, setTargetBranchId] = useState<string>(
    branches.find((b) => b.id !== currentBranch.id)?.id || branches[1]?.id || ''
  );
  const [transferQty, setTransferQty] = useState<number>(5);
  const [notes, setNotes] = useState<string>('Pengiriman restock cabang reguler');
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || transferQty <= 0) return;

    if (selectedProduct.stock < transferQty) {
      setFeedback(`Gagal: Stok fisik di ${currentBranch.name} hanya tersisa ${selectedProduct.stock} ${selectedProduct.unit}.`);
      return;
    }

    const success = transferStock(targetBranchId, selectedProductId, transferQty, notes);
    if (success) {
      setFeedback(`Sukses! ${transferQty} ${selectedProduct.unit} ${selectedProduct.name} berhasil ditransfer.`);
      setTransferQty(1);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span>Transfer Stok Antar Unit & Cabang</span>
        </h1>
        <p className="text-xs text-slate-500">
          Mutasi stok barang dari {currentBranch.name} ke cabang operasional lainnya secara tercatat dan terpadu.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
            feedback.startsWith('Gagal')
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Transfer Input Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <h3 className="font-extrabold text-slate-800 text-sm mb-4 flex items-center space-x-2">
          <ArrowLeftRight className="w-4 h-4 text-teal-600" />
          <span>Buat Surat Mutasi / Transfer Barang Baru</span>
        </h3>

        <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Origin Unit (Disabled/Current) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit Pengirim (Asal):</label>
              <input
                type="text"
                disabled
                value={`${currentBranch.name} (${currentBranch.code})`}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-semibold"
              />
            </div>

            {/* Destination Unit */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit Tujuan (Penerima):</label>
              <select
                value={targetBranchId}
                onChange={(e) => setTargetBranchId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-800 focus:border-teal-500 focus:outline-hidden"
              >
                {branches
                  .filter((b) => b.id !== currentBranch.id)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code}) - {b.manager}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Product selection */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Pilih Produk:</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-800 focus:border-teal-500 focus:outline-hidden"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Tersedia: {p.stock} {p.unit}) - SKU: {p.sku}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jumlah Transfer ({selectedProduct?.unit || 'unit'}):
              </label>
              <input
                type="number"
                min="1"
                max={selectedProduct?.stock || 999}
                value={transferQty}
                onChange={(e) => setTransferQty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Keterangan / Catatan Ekspedisi:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nomor armada, sopir, atau keperluan stok"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-700"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!selectedProduct || selectedProduct.stock <= 0}
              className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-sm transition-all ${
                !selectedProduct || selectedProduct.stock <= 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/20 active:scale-95'
              }`}
            >
              Proses Mutasi & Transfer Stok
            </button>
          </div>
        </form>
      </div>

      {/* Transfer History Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
            Riwayat Surat Jalan & Mutasi Stok ({stockTransfers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-2.5 px-4">No. Mutasi</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Produk</th>
                <th className="py-2.5 px-3 text-center">Jumlah</th>
                <th className="py-2.5 px-3">Dari Unit</th>
                <th className="py-2.5 px-3">Ke Unit</th>
                <th className="py-2.5 px-3">Catatan</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockTransfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada catatan transfer barang antar cabang.
                  </td>
                </tr>
              ) : (
                stockTransfers.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {st.transferNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {formatIndonesianDateTime(st.date)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{st.productName}</td>
                    <td className="py-3 px-3 text-center font-bold text-teal-700">
                      {st.quantity} item
                    </td>
                    <td className="py-3 px-3 text-slate-700">{st.fromBranch}</td>
                    <td className="py-3 px-3 text-slate-700">{st.toBranch}</td>
                    <td className="py-3 px-3 text-slate-500 italic">{st.notes}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        SELESAI
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
