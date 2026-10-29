import React from 'react';
import {
  Monitor,
  LayoutGrid,
  Gift,
  FileText,
  BookMarked,
  Undo2,
  MapPin,
  Building2,
  TrendingUp,
  Boxes,
  ShoppingCart,
  ArrowLeftRight,
  UserCheck,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, isSidebarOpen, setIsSidebarOpen, lowStockProducts } = usePOS();

  // Far-left icon strip
  const iconStrip = [
    { id: 'dashboard', icon: <Monitor className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'inventory', icon: <LayoutGrid className="w-5 h-5" />, label: 'Inventory' },
    { id: 'pos', icon: <ShoppingCart className="w-5 h-5" />, label: 'Kasir MPOS' },
    { id: 'transfer', icon: <ArrowLeftRight className="w-5 h-5" />, label: 'Transfer Stok' },
    { id: 'akuntansi', icon: <FileSpreadsheet className="w-5 h-5" />, label: 'Akuntansi' },
    { id: 'pegawai', icon: <UserCheck className="w-5 h-5" />, label: 'Pegawai' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Pengaturan' },
  ];

  // MPOS 2-column colored tiles matching screenshot
  const mposTiles = [
    {
      id: 'promo',
      label: 'Promo',
      icon: <Gift className="w-5 h-5" />,
      color: 'bg-amber-600 hover:bg-amber-500',
      action: () => setActiveView('promo'),
    },
    {
      id: 'laporan-stok',
      label: 'Laporan Stok',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-purple-700 hover:bg-purple-600',
      badge: lowStockProducts.length > 0 ? `${lowStockProducts.length}` : undefined,
      action: () => setActiveView('inventory'),
    },
    {
      id: 'buku-besar',
      label: 'Buku Besar',
      icon: <BookMarked className="w-5 h-5" />,
      color: 'bg-fuchsia-700 hover:bg-fuchsia-600',
      action: () => setActiveView('akuntansi'),
    },
    {
      id: 'retur',
      label: 'Retur',
      icon: <Undo2 className="w-5 h-5" />,
      color: 'bg-emerald-600 hover:bg-emerald-500',
      action: () => setActiveView('retur'),
    },
    {
      id: 'provinsi',
      label: 'Provinsi',
      icon: <MapPin className="w-5 h-5" />,
      color: 'bg-teal-600 hover:bg-teal-500',
      action: () => setActiveView('referensi'),
    },
    {
      id: 'laporan-supplier',
      label: 'Lap. Supplier',
      icon: <Building2 className="w-5 h-5" />,
      color: 'bg-orange-600 hover:bg-orange-500',
      action: () => setActiveView('reports'),
    },
    {
      id: 'grafik-pembelian',
      label: 'Grafik Beli',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-cyan-600 hover:bg-cyan-500',
      action: () => setActiveView('dashboard'),
    },
    {
      id: 'laporan-inventaris',
      label: 'Lap. Inventaris',
      icon: <Boxes className="w-5 h-5" />,
      color: 'bg-rose-700 hover:bg-rose-600',
      action: () => setActiveView('reports'),
    },
  ];

  return (
    <aside className="relative flex flex-shrink-0 z-30 transition-all duration-200">
      {/* 1. Slim Vertical Navigation Strip (Far Left) */}
      <div className="w-12 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-2 space-y-1">
        {iconStrip.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-9 h-9 rounded flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-900 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={item.label}
            >
              {item.icon}
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-9 h-9 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isSidebarOpen ? 'Sembunyikan Panel MPOS' : 'Tampilkan Panel MPOS'}
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Menu MPOS Panel (Expandable colored tiles as shown in image) */}
      {isSidebarOpen && (
        <div className="hidden lg:flex flex-col w-52 bg-slate-850 bg-slate-900/95 border-r border-slate-800 p-2.5 shadow-lg select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              Menu MPOS
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-mono">
              v2.4
            </span>
          </div>

          {/* 2x4 Colored Quick Sub-Tiles */}
          <div className="grid grid-cols-2 gap-2">
            {mposTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={tile.action}
                className={`relative flex flex-col items-center justify-center p-2 rounded shadow text-white transition-transform active:scale-95 ${tile.color}`}
              >
                <div className="mb-1">{tile.icon}</div>
                <span className="text-[10px] font-bold text-center leading-tight">
                  {tile.label}
                </span>

                {tile.badge && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black px-1.2 py-0.2 rounded-full">
                    {tile.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Info Box at bottom */}
          <div className="mt-auto pt-3 border-t border-slate-800 text-[10px] text-slate-400">
            <div className="flex justify-between items-center mb-1">
              <span>Status Server:</span>
              <span className="text-emerald-400 font-semibold">Aktif</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database:</span>
              <span className="text-slate-300">Lokal / Cloud</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
