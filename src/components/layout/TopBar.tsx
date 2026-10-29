import React, { useState, useEffect } from 'react';
import {
  Store,
  ChevronDown,
  User,
  Bell,
  Search,
  Maximize,
  Minimize,
  RefreshCw,
  ShoppingCart,
  Send,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { formatIndonesianDateTime, generateWhatsAppStockAlertUrl } from '../../utils/format';

export const TopBar: React.FC = () => {
  const {
    currentBranch,
    setCurrentBranch,
    branches,
    currentUser,
    setCurrentUser,
    activeView,
    setActiveView,
    lowStockProducts,
    outOfStockProducts,
    cart,
    settings,
    sendLowStockAlert,
  } = usePOS();

  const [currentDateTime, setCurrentDateTime] = useState<string>(formatIndonesianDateTime());
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifAlertStatus, setNotifAlertStatus] = useState<string | null>(null);

  // Live real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(formatIndonesianDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalCritical = lowStockProducts.length + outOfStockProducts.length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSendWhatsAppAlert = () => {
    const allCritical = [...outOfStockProducts, ...lowStockProducts];
    if (allCritical.length === 0) return;
    const url = generateWhatsAppStockAlertUrl(settings.whatsappAlertNumber, allCritical, settings.storeName);
    sendLowStockAlert('whatsapp');
    window.open(url, '_blank');
    setNotifAlertStatus('WhatsApp peringatan berhasil dibuka!');
    setTimeout(() => setNotifAlertStatus(null), 4000);
  };

  const handleSendEmailAlert = () => {
    const res = sendLowStockAlert('email');
    setNotifAlertStatus(res.message);
    setTimeout(() => setNotifAlertStatus(null), 4000);
  };

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 select-none sticky top-0 z-40">
      <div className="flex items-center justify-between px-3 lg:px-5 h-14">
        {/* Left: Brand & Unit Switcher */}
        <div className="flex items-center space-x-3 lg:space-x-5">
          {/* Logo Enigma */}
          <div
            onClick={() => setActiveView('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-white text-base tracking-tighter">e</span>
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="font-extrabold text-white tracking-wider text-sm block">ENIGMA</span>
              <span className="text-[10px] text-cyan-400 font-medium tracking-tight block -mt-0.5">Software POS</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700/80 hidden sm:block" />

          {/* Menu Pindah Unit (Branch Switcher) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBranchMenu(!showBranchMenu);
                setShowUserMenu(false);
                setShowNotifMenu(false);
              }}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-xs text-slate-200 transition-colors shadow-sm"
              title="Menu Pindah Unit"
            >
              <Store className="w-3.5 h-3.5 text-cyan-400" />
              <div className="text-left hidden md:block">
                <span className="text-[10px] text-slate-400 block -mb-0.5 uppercase tracking-wider font-semibold">
                  Unit / Cabang:
                </span>
                <span className="font-semibold text-slate-100 truncate max-w-[140px] block">
                  {currentBranch.name}
                </span>
              </div>
              <span className="md:hidden font-semibold text-slate-200 text-xs">
                {currentBranch.code}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
            </button>

            {/* Dropdown Menu Pindah Unit */}
            {showBranchMenu && (
              <div className="absolute left-0 mt-1.5 w-64 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-1.5 z-50 text-xs divide-y divide-slate-700/50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Pilih Unit Operasional
                </div>
                <div className="py-1">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => {
                        setCurrentBranch(branch);
                        setShowBranchMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700/70 transition-colors ${
                        currentBranch.id === branch.id
                          ? 'bg-cyan-950/60 text-cyan-300 font-semibold'
                          : 'text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-[10px] text-slate-400">{branch.address}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono">
                        {branch.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Indonesian Clock, Fast Kasir Button, Notifications, User Menu */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Live Date and Time */}
          <div className="hidden lg:flex flex-col text-right pr-2">
            <span className="text-xs font-mono font-medium text-slate-200">
              {currentDateTime}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center justify-end space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>Sistem Online & Terhubung</span>
            </span>
          </div>

          {/* Quick Cashier Button */}
          <button
            onClick={() => setActiveView('pos')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              activeView === 'pos'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
                : 'bg-emerald-600/90 hover:bg-emerald-500 text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Kasir MPOS</span>
            {cart.length > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          {/* Low Stock Alert Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowBranchMenu(false);
                setShowUserMenu(false);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 relative transition-colors border border-slate-700/60"
              title="Notifikasi & Peringatan Stok"
            >
              <Bell className="w-4 h-4" />
              {totalCritical > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full animate-bounce">
                  {totalCritical}
                </span>
              )}
            </button>

            {/* Notification Menu Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2.5 z-50 text-xs">
                <div className="px-3.5 pb-2 border-b border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Pusat Notifikasi Stok ({totalCritical})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Real-time</span>
                </div>

                {notifAlertStatus && (
                  <div className="mx-3 my-2 p-2 rounded bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-[11px] flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{notifAlertStatus}</span>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto px-3 py-2 space-y-2">
                  {totalCritical === 0 ? (
                    <div className="text-center py-4 text-slate-400">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1 opacity-70" />
                      Semua stok barang dalam kondisi aman.
                    </div>
                  ) : (
                    <>
                      {outOfStockProducts.map((p) => (
                        <div
                          key={p.id}
                          className="p-2 rounded bg-rose-950/40 border border-rose-800/50 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-rose-300">{p.name}</div>
                            <div className="text-[10px] text-slate-400">
                              SKU: {p.sku} | Supplier: {p.supplier}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900 text-rose-200">
                            STOK HABIS (0)
                          </span>
                        </div>
                      ))}

                      {lowStockProducts.map((p) => (
                        <div
                          key={p.id}
                          className="p-2 rounded bg-amber-950/40 border border-amber-800/50 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-amber-200">{p.name}</div>
                            <div className="text-[10px] text-slate-400">
                              SKU: {p.sku} | Min: {p.minStock} {p.unit}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/80 text-amber-200">
                            Sisa {p.stock} {p.unit}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {totalCritical > 0 && (
                  <div className="pt-2 px-3 border-t border-slate-700/80 space-y-1.5">
                    <button
                      onClick={handleSendWhatsAppAlert}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Peringatan Otomatis WhatsApp</span>
                    </button>
                    <button
                      onClick={handleSendEmailAlert}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs transition-colors"
                    >
                      <span>Simulasikan Dispatch Email ke Manager</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hidden sm:block border border-slate-700/60"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Kiosk)'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* User Menu ("Admin PUSAT") */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowBranchMenu(false);
                setShowNotifMenu(false);
              }}
              className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-xs transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden md:block leading-tight">
                <div className="font-bold text-slate-100 text-[11px]">{currentUser.name}</div>
                <div className="text-[9px] text-cyan-400 font-medium">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown User Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-700">
                  <div className="font-bold text-slate-100">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                  <div className="mt-1 text-[10px] text-emerald-400 font-semibold">
                    Unit Aktif: {currentBranch.name}
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentUser({
                        name: 'Admin PUSAT',
                        role: 'Super Administrator',
                        email: 'hasymisomaida@unikma.ac.id',
                      });
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-700/70"
                  >
                    Masuk Sebagai Admin PUSAT
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUser({
                        name: 'Kasir Sift Pagi (Siti)',
                        role: 'Kasir Utama',
                        email: 'kasir1@enigma-pos.id',
                      });
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-700/70"
                  >
                    Ganti ke Kasir Sift Pagi
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-700/70 border-t border-slate-700"
                  >
                    Pengaturan Profil & Toko
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
