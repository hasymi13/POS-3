import React, { useState } from 'react';
import { Transaction } from '../../types/pos';
import { formatRupiah, formatIndonesianDateTime, generateWhatsAppReceiptUrl } from '../../utils/format';
import { usePOS } from '../../context/POSContext';
import { Printer, Send, PlusCircle, CheckCircle, X, Download } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onNewTransaction,
}) => {
  const { settings } = usePOS();
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [showWhatsAppInput, setShowWhatsAppInput] = useState(false);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsAppReceipt = () => {
    if (!customerWhatsApp) return;
    const url = generateWhatsAppReceiptUrl(customerWhatsApp, transaction, settings.storeName);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>Transaksi Berhasil Disimpan!</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Printable Thermal Receipt Container */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 bg-amber-50/20 select-text print:p-0 print:m-0 print:w-full">
          {/* Receipt Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
            <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
              {settings.storeName}
            </h2>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">{settings.tagline}</div>
            <div className="text-[10px] text-slate-600 mt-1">{settings.address}</div>
            <div className="text-[10px] text-slate-600">Telp: {settings.phone}</div>
          </div>

          {/* Receipt Meta */}
          <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Faktur:</span>
              <span className="font-bold">{transaction.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu:</span>
              <span>{formatIndonesianDateTime(transaction.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir:</span>
              <span>{transaction.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unit / Cabang:</span>
              <span>{transaction.branchName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pelanggan:</span>
              <span>{transaction.customerName || 'Pelanggan Umum'}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b-2 border-dashed border-slate-300 space-y-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="text-[11px]">
                <div className="font-bold text-slate-900">{item.productName}</div>
                <div className="flex justify-between text-slate-600 pl-1">
                  <span>
                    {item.quantity} x {formatRupiah(item.sellingPrice)}
                  </span>
                  <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals & Payment Summary */}
          <div className="py-2.5 border-b-2 border-dashed border-slate-300 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatRupiah(transaction.subtotal)}</span>
            </div>

            {transaction.discountTotal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Diskon</span>
                <span>-{formatRupiah(transaction.discountTotal)}</span>
              </div>
            )}

            {transaction.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>PPN (11%)</span>
                <span>{formatRupiah(transaction.tax)}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL BAYAR</span>
              <span>{formatRupiah(transaction.total)}</span>
            </div>

            <div className="flex justify-between text-slate-600 pt-1">
              <span>Metode:</span>
              <span className="uppercase font-semibold text-slate-800">
                {transaction.payment.method} {transaction.payment.provider ? `(${transaction.payment.provider})` : ''}
              </span>
            </div>

            {transaction.payment.method === 'cash' && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Uang Diterima:</span>
                  <span>{formatRupiah(transaction.payment.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(transaction.payment.change)}</span>
                </div>
              </>
            )}

            {transaction.payment.referenceNumber && (
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Ref ID:</span>
                <span>{transaction.payment.referenceNumber}</span>
              </div>
            )}
          </div>

          {/* Receipt Footer Note */}
          <div className="text-center pt-3 text-[10px] text-slate-500 font-sans leading-relaxed">
            <div>{settings.receiptFooter}</div>
            <div className="mt-1 font-mono text-[9px] text-slate-400">
              *** POWERED BY ENIGMA MPOS SYSTEM ***
            </div>
          </div>
        </div>

        {/* WhatsApp Digital Receipt Input Drawer (Hidden on Print) */}
        {showWhatsAppInput && (
          <div className="bg-emerald-50 p-3 border-t border-emerald-200 print:hidden text-xs">
            <label className="block font-bold text-emerald-900 mb-1">
              Nomor WhatsApp Pembeli:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="08xxxxxxxxxx"
                value={customerWhatsApp}
                onChange={(e) => setCustomerWhatsApp(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-slate-800 text-xs font-mono"
              />
              <button
                onClick={handleSendWhatsAppReceipt}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </div>
          </div>
        )}

        {/* Actions Button Bar (Hidden when printing) */}
        <div className="bg-slate-100 p-3 border-t border-slate-200 flex flex-wrap gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk Thermal</span>
          </button>

          <button
            onClick={() => setShowWhatsAppInput(!showWhatsAppInput)}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
            title="Kirim Struk Digital via WhatsApp"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={onNewTransaction}
            className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mulai Transaksi Baru (Kasir)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
