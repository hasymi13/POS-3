import React from 'react';
import {
  Package,
  Truck,
  ShoppingCart,
  ArrowLeftRight,
  Users,
  UserCheck,
  FileSpreadsheet,
  BookOpen,
  Settings,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface MetroTileProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  bgGradient: string;
  badge?: string | number;
  badgeColor?: string;
}

export const MetroTiles: React.FC = () => {
  const { activeView, setActiveView, lowStockProducts, outOfStockProducts, cart } = usePOS();

  const totalCritical = lowStockProducts.length + outOfStockProducts.length;

  const tiles: MetroTileProps[] = [
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-6 h-6 sm:w-7 sm:h-7" />,
      bgGradient: 'from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600',
      badge: totalCritical > 0 ? `${totalCritical} Kritis` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'pembelian',
      label: 'Pembelian',
      icon: <Truck className="w-6 h-6 sm:w-7 sm:h-7" />,
      bgGradient: 'from-pink-600 to-fuchsia-700 hover:from-pink-500 hover:to-fuchsia-600',
    },
    {
      id: 'pos',
      label: 'Penjualan',
      icon: <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />,
      bgGradient: 'from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 ring-2 ring-emerald-400/50',
      badge: cart.length > 0 ? `${cart.length} di Troli` : 'Kasir MPOS',
      badgeColor: 'bg-amber-300 text-slate-900',
    },
    {
      id: 'transfer',
      label: 'Transfer Stok',
      icon: <ArrowLeftRight className="w-6 h-6 sm:w-7 sm:h-7" />,
      bgGradient: 'from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600',
    },
    {
      id: 'pelanggan',
      label: 'Pelanggan',
      icon: <Users className="w-6 h-6 sm:w-7 sm:h-7" />,
      bgGradient: 'from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600',
    },
    {
      id: 'pegawai',
      label: 'Pegawai',
      icon: <UserCheck className="w-6 h-6 sm:w-7 sm:h-7" />,
      bgGradient: 'from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500',
    },
    {
      id: 'akuntansi',
      label: 'Akuntansi',
      icon: <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7" />,
      bgGradient: 'from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700',
      badge: 'Laba/Rugi',
      badgeColor: 'bg-slate-900/60 text-rose-200',
    },
    {
      id: 'referensi',
      label: 'Referensi',
      icon: <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />,
      bgGradient: 'from-orange-700 to-amber-800 hover:from-orange-600 hover:to-amber-700',
    },
    {
      id: 'system',
      label: 'System',
      icon: <Settings className="w-6 h-6 sm:w-7 sm:h-7" />,
      bgGradient: 'from-indigo-600 to-slate-800 hover:from-indigo-500 hover:to-slate-700',
    },
  ];

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-3 py-3 overflow-x-auto shadow-inner">
      <div className="flex items-center space-x-2.5 min-w-max pb-1">
        {tiles.map((tile) => {
          const isActive = activeView === tile.id;
          return (
            <button
              key={tile.id}
              onClick={() => setActiveView(tile.id)}
              className={`relative flex flex-col items-center justify-center w-24 h-20 sm:w-28 sm:h-22 rounded-md bg-gradient-to-b ${tile.bgGradient} text-white shadow-md transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 ${
                isActive ? 'scale-105 ring-3 ring-cyan-400 shadow-cyan-500/30' : 'opacity-95 hover:opacity-100'
              }`}
            >
              <div className="mb-1 text-white drop-shadow">{tile.icon}</div>
              <span className="text-[11px] sm:text-xs font-bold tracking-wide drop-shadow-sm text-center leading-tight">
                {tile.label}
              </span>

              {tile.badge && (
                <span
                  className={`absolute -top-1.5 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-sm tracking-tight ${tile.badgeColor}`}
                >
                  {tile.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
