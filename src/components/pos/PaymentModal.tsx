import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  QrCode,
  Banknote,
  Smartphone,
  CreditCard,
  Building,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { PaymentMethod, PaymentDetails, Transaction } from '../../types/pos';
import { formatRupiah, formatNumber } from '../../utils/format';
import { usePOS } from '../../context/POSContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cartTotal, completeCheckout, currentBranch, settings, customers } = usePOS();

  const [method, setMethod] = useState<PaymentMethod>('qris');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('Pelanggan Umum');

  // Cash State
  const [cashGiven, setCashGiven] = useState<number>(cartTotal);
  const [cashInputStr, setCashInputStr] = useState<string>(String(cartTotal));

  // Digital Payment States
  const [ewalletProvider, setEwalletProvider] = useState<'GoPay' | 'OVO' | 'ShopeePay' | 'DANA'>('GoPay');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [bankProvider, setBankProvider] = useState<'BCA' | 'Mandiri' | 'BRI' | 'BNI'>('BCA');
  const [cardType, setCardType] = useState<'Debit' | 'Kredit'>('Debit');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [qrisTimer, setQrisTimer] = useState<number>(180); // 3 minutes countdown

  // Sync cash input when cartTotal changes
  useEffect(() => {
    setCashGiven(cartTotal);
    setCashInputStr(String(cartTotal));
  }, [cartTotal]);

  // QRIS Timer countdown
  useEffect(() => {
    if (method !== 'qris' || !isOpen) return;
    setQrisTimer(180);
    const interval = setInterval(() => {
      setQrisTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [method, isOpen]);

  if (!isOpen) return null;

  const change = Math.max(0, cashGiven - cartTotal);
  const isCashInsufficient = method === 'cash' && cashGiven < cartTotal;

  // Preset cash shortcuts
  const cashShortcuts = [
    { label: 'Uang Pas', amount: cartTotal },
    { label: '50.000', amount: 50000 },
    { label: '100.000', amount: 100000 },
    { label: '150.000', amount: 150000 },
    { label: '200.000', amount: 200000 },
    { label: '500.000', amount: 500000 },
  ].filter((sc) => sc.label === 'Uang Pas' || sc.amount >= cartTotal);

  const handleCashShortcut = (amount: number) => {
    setCashGiven(amount);
    setCashInputStr(String(amount));
  };

  const handleCashInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10) || 0;
    setCashInputStr(raw);
    setCashGiven(num);
  };

  const handleProcessPayment = () => {
    if (isCashInsufficient) return;

    setIsProcessing(true);

    let paymentDetails: PaymentDetails;
    if (method === 'cash') {
      paymentDetails = {
        method: 'cash',
        amountPaid: cashGiven,
        change: change,
      };
    } else if (method === 'qris') {
      paymentDetails = {
        method: 'qris',
        amountPaid: cartTotal,
        change: 0,
        provider: 'QRIS Dinamis',
        referenceNumber: `QRIS-${Date.now().toString().slice(-8)}`,
      };
    } else if (method === 'ewallet') {
      paymentDetails = {
        method: 'ewallet',
        amountPaid: cartTotal,
        change: 0,
        provider: ewalletProvider,
        referenceNumber: `${ewalletProvider.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      };
    } else if (method === 'card') {
      paymentDetails = {
        method: 'card',
        amountPaid: cartTotal,
        change: 0,
        provider: `${cardType} ${bankProvider}`,
        referenceNumber: `EDC-${bankProvider}-${Date.now().toString().slice(-6)}`,
      };
    } else {
      paymentDetails = {
        method: 'transfer',
        amountPaid: cartTotal,
        change: 0,
        provider: `VA ${bankProvider}`,
        referenceNumber: `VA-${bankProvider}-${Date.now().toString().slice(-6)}`,
      };
    }

    // Small delay to simulate digital transaction gateway processing
    setTimeout(() => {
      setIsProcessing(false);
      const newTx = completeCheckout(paymentDetails, selectedCustomer);

      // Confetti feedback
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onSuccess(newTx);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight flex items-center space-x-2">
              <span>Pembayaran & Kasir Digital</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                {currentBranch.name}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Pilih metode pembayaran tunai atau integrasi digital terverifikasi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total to pay banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-emerald-100 font-semibold block">
              Total Tagihan Belanja
            </span>
            <div className="text-2xl sm:text-3xl font-black">{formatRupiah(cartTotal)}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-100 block">Pelanggan:</span>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="bg-emerald-900/60 border border-emerald-400/40 text-white text-xs font-semibold rounded px-2 py-1 mt-0.5 focus:outline-hidden"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.name} className="bg-slate-900 text-white">
                  {c.name} {c.memberTier !== 'Regular' ? `(${c.memberTier})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-4 bg-slate-100 border-b border-slate-200 p-1 text-xs font-bold text-slate-600">
          <button
            onClick={() => setMethod('qris')}
            className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition-all ${
              method === 'qris'
                ? 'bg-white text-purple-700 shadow-sm border border-purple-200'
                : 'hover:bg-slate-200/60'
            }`}
          >
            <QrCode className="w-4 h-4 text-purple-600" />
            <span>QRIS</span>
          </button>

          <button
            onClick={() => setMethod('cash')}
            className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition-all ${
              method === 'cash'
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                : 'hover:bg-slate-200/60'
            }`}
          >
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Tunai (Cash)</span>
          </button>

          <button
            onClick={() => setMethod('ewallet')}
            className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition-all ${
              method === 'ewallet'
                ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
                : 'hover:bg-slate-200/60'
            }`}
          >
            <Smartphone className="w-4 h-4 text-sky-600" />
            <span>e-Wallet</span>
          </button>

          <button
            onClick={() => setMethod('card')}
            className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition-all ${
              method === 'card'
                ? 'bg-white text-amber-700 shadow-sm border border-amber-200'
                : 'hover:bg-slate-200/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Kartu / Debit</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: QRIS */}
          {method === 'qris' && (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Dynamic QRIS Graphic */}
              <div className="flex-shrink-0 flex flex-col items-center p-3 bg-white border-2 border-slate-300 rounded-xl shadow-md w-48">
                {/* QRIS Header */}
                <div className="w-full flex items-center justify-between pb-1 mb-1 border-b border-slate-200 text-[10px] font-black text-slate-800">
                  <span className="text-rose-600 tracking-wider">QRIS</span>
                  <span className="text-[8px] text-slate-400">PEMBAYARAN DIGITAL</span>
                </div>

                {/* QR Pattern visual */}
                <div className="w-36 h-36 bg-slate-900 p-2 rounded-lg relative flex items-center justify-center shadow-inner">
                  {/* Stylized QR Matrix Pattern */}
                  <div className="w-full h-full bg-white p-1 rounded grid grid-cols-6 gap-0.5">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          [0, 1, 4, 5, 6, 11, 24, 29, 30, 31, 34, 35, 14, 21, 16].includes(i)
                            ? 'bg-slate-900'
                            : (i * 7) % 3 === 0
                            ? 'bg-slate-900'
                            : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Center QRIS logo */}
                  <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-white shadow">
                    QR
                  </div>
                </div>

                <div className="text-center mt-2">
                  <div className="text-[10px] font-bold text-slate-800">{settings.storeName}</div>
                  <div className="text-[8px] font-mono text-slate-400">NMID: {settings.qrisNmid}</div>
                </div>
              </div>

              {/* Instructions & Instant Verification */}
              <div className="space-y-3 flex-1 text-xs">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900">
                  <div className="font-bold flex items-center space-x-1.5 mb-1 text-purple-950">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Dukung Semua Aplikasi Pembayaran</span>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    Pelanggan dapat memindai QRIS di layar menggunakan GoPay, OVO, ShopeePay, DANA, BCA Mobile, Livin Mandiri, BRImo, atau BSI.
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-slate-500 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Batas waktu QR: <strong className="text-slate-800">{Math.floor(qrisTimer / 60)}:{String(qrisTimer % 60).padStart(2, '0')}</strong>
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Simulasi Webhook Aktif: Klik tombol <strong>Selesaikan Transaksi</strong> di bawah saat pembeli telah scan.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CASH (TUNAI) */}
          {method === 'cash' && (
            <div className="space-y-4">
              {/* Input Uang Diterima */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Uang Diterima dari Pembeli (Rp):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={cashInputStr}
                    onChange={handleCashInputChange}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-xl font-black text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              {/* Fast Cash Shortcut Buttons */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Tombol Cepat Pecahan Uang:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {cashShortcuts.map((sc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCashShortcut(sc.amount)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all text-center ${
                        cashGiven === sc.amount
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Change (Kembalian) Calculation */}
              <div
                className={`p-3.5 rounded-xl border-2 flex items-center justify-between ${
                  isCashInsufficient
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold block">
                    {isCashInsufficient ? 'Uang Masih Kurang' : 'Uang Kembalian (Change)'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black">
                    {formatRupiah(isCashInsufficient ? cartTotal - cashGiven : change)}
                  </div>
                </div>

                {isCashInsufficient ? (
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                )}
              </div>
            </div>
          )}

          {/* TAB 3: e-Wallet */}
          {method === 'ewallet' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Pilih Saluran Dompet Digital:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['GoPay', 'OVO', 'ShopeePay', 'DANA'] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setEwalletProvider(prov)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        ewalletProvider === prov
                          ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor Handphone Terdaftar Akun {ewalletProvider}:
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-mono text-sm focus:border-sky-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Permintaan tagihan (push notification) akan diteruskan ke aplikasi pembeli.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: Debit / Card */}
          {method === 'card' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-2">Pilih Bank EDC:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['BCA', 'Mandiri', 'BRI', 'BNI'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBankProvider(b)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        bankProvider === b
                          ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kartu:</label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as 'Debit' | 'Kredit')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  >
                    <option value="Debit">Debit Card (GPN / Mastercard)</option>
                    <option value="Kredit">Kartu Kredit (Visa / JCB)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block font-bold text-slate-700 mb-1">No. Batch / Ref EDC:</label>
                  <input
                    type="text"
                    disabled
                    value={`APP-EDC-${Math.floor(100000 + Math.random() * 900000)}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 font-mono text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors"
          >
            Batal
          </button>

          <button
            onClick={handleProcessPayment}
            disabled={isCashInsufficient || isProcessing}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-black text-sm text-white shadow-lg transition-all ${
              isCashInsufficient || isProcessing
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30 active:scale-95'
            }`}
          >
            <span>{isProcessing ? 'Memproses Transaksi...' : 'Selesaikan Transaksi & Cetak'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
