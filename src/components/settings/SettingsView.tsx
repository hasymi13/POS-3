import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { generateWhatsAppStockAlertUrl } from '../../utils/format';
import {
  Settings,
  Bell,
  Smartphone,
  Mail,
  Store,
  Receipt,
  RotateCcw,
  CheckCircle,
  Send,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    lowStockProducts,
    outOfStockProducts,
    notifications,
    sendLowStockAlert,
    resetDataToDefault,
  } = usePOS();

  const [formSettings, setFormSettings] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveStatus('Pengaturan berhasil disimpan dan diperbarui!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleTestWhatsApp = () => {
    const criticalList = [...outOfStockProducts, ...lowStockProducts];
    const url = generateWhatsAppStockAlertUrl(
      formSettings.whatsappAlertNumber,
      criticalList.length > 0 ? criticalList : [],
      formSettings.storeName
    );
    sendLowStockAlert('whatsapp');
    window.open(url, '_blank');
  };

  const handleTestEmail = () => {
    const res = sendLowStockAlert('email');
    setSaveStatus(res.message);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span>Pengaturan Sistem & Notifikasi Otomatis</span>
        </h1>
        <p className="text-xs text-slate-500">
          Konfigurasi nomor WhatsApp peringatan stok menipis, email manajer, profil toko, dan format struk kasir.
        </p>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* 1. Automated Low Stock Alert Settings */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Sistem Notifikasi Stok Menipis (WhatsApp & Email)
            </h3>
            <p className="text-[11px] text-slate-500">
              Kirim peringatan otomatis saat jumlah stok barang berada pada atau di bawah batas minimum.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* WhatsApp Alert Number */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Nomor WhatsApp Manajer / Supplier</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Format internasional diawali 08... atau 628... Pesan akan terformat otomatis berisi daftar item yang harus di-restock.
            </p>
            <input
              type="text"
              value={formSettings.whatsappAlertNumber}
              onChange={(e) =>
                setFormSettings({ ...formSettings, whatsappAlertNumber: e.target.value })
              }
              placeholder="Contoh: 081288997766"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-800"
            />
            <button
              type="button"
              onClick={handleTestWhatsApp}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Uji Coba Kirim Notifikasi WhatsApp Sekarang</span>
            </button>
          </div>

          {/* Email Alert */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <Mail className="w-4 h-4 text-sky-600" />
              <span>Email Manajer / Akuntansi Toko</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Laporan ringkasan stok kritis dan rekap harian dikirimkan ke alamat email tujuan ini.
            </p>
            <input
              type="email"
              value={formSettings.managerEmail}
              onChange={(e) =>
                setFormSettings({ ...formSettings, managerEmail: e.target.value })
              }
              placeholder="manajer@toko.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
            />
            <button
              type="button"
              onClick={handleTestEmail}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Simulasi Dispatch Notifikasi Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Store Profile & Receipt Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200">
          <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Identitas Toko & Format Struk Pembayaran
            </h3>
            <p className="text-[11px] text-slate-500">
              Data ini akan dicetak pada kepala struk thermal dan dokumen PDF laporan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Toko / Usaha:</label>
            <input
              type="text"
              required
              value={formSettings.storeName}
              onChange={(e) => setFormSettings({ ...formSettings, storeName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Slogan / Tagline Toko:</label>
            <input
              type="text"
              value={formSettings.tagline}
              onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Toko:</label>
            <input
              type="text"
              value={formSettings.address}
              onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">No. Telepon Toko:</label>
            <input
              type="text"
              value={formSettings.phone}
              onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ID QRIS (NMID Nasional):</label>
            <input
              type="text"
              value={formSettings.qrisNmid}
              onChange={(e) => setFormSettings({ ...formSettings, qrisNmid: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Pesan Catatan Kaki Struk (Receipt Footer):</label>
            <textarea
              rows={2}
              value={formSettings.receiptFooter}
              onChange={(e) => setFormSettings({ ...formSettings, receiptFooter: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          {/* Tax Toggle */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="taxToggle"
              checked={formSettings.taxEnabled}
              onChange={(e) => setFormSettings({ ...formSettings, taxEnabled: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <label htmlFor="taxToggle" className="font-bold text-slate-800">
              Aktifkan Pajak PPN (11%) pada Transaksi Kasir
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Simpan Konfigurasi Toko
          </button>
        </div>
      </form>

      {/* 3. Notification Log History */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
        <h3 className="font-extrabold text-slate-800 text-sm">
          Riwayat Pengiriman Notifikasi Stok ({notifications.length})
        </h3>

        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">Belum ada log pengiriman notifikasi tercatat.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-800">{n.message}</div>
                  <div className="text-[10px] text-slate-400">
                    Tujuan: {n.recipient} ({n.channel.toUpperCase()}) | {new Date(n.date).toLocaleString('id-ID')}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  TERKIRIM
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Reset to Default Data */}
      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="font-bold text-rose-800 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Reset Database ke Data Contoh Awal</span>
          </div>
          <p className="text-rose-600 text-[11px] mt-0.5">
            Kembalikan daftar katalog barang dan riwayat transaksi ke nilai contoh awal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Apakah Anda yakin ingin me-reset data kembali ke default awal?')) {
              resetDataToDefault();
              setFormSettings(settings);
              setSaveStatus('Data berhasil di-reset ke nilai default awal!');
              setTimeout(() => setSaveStatus(null), 3000);
            }
          }}
          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-xs whitespace-nowrap"
        >
          Reset Data Toko
        </button>
      </div>
    </div>
  );
};
