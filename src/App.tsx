import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PosView } from './components/pos/PosView';
import { InventoryView } from './components/inventory/InventoryView';
import { ReportsView } from './components/reports/ReportsView';
import { StockTransferView } from './components/transfer/StockTransferView';
import { SettingsView } from './components/settings/SettingsView';
import { CustomersView } from './components/customers/CustomersView';
import { EmployeesView } from './components/employees/EmployeesView';
import { ReferenceView } from './components/reference/ReferenceView';
import { PromoView } from './components/promo/PromoView';
import { ReturnsView } from './components/returns/ReturnsView';
import {
  Monitor,
  ShoppingCart,
  Package,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeView, setActiveView, cart } = usePOS();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <PosView />;
      case 'inventory':
      case 'pembelian':
        return <InventoryView />;
      case 'transfer':
        return <StockTransferView />;
      case 'akuntansi':
      case 'reports':
        return <ReportsView />;
      case 'pelanggan':
        return <CustomersView />;
      case 'pegawai':
        return <EmployeesView />;
      case 'referensi':
        return <ReferenceView />;
      case 'promo':
        return <PromoView />;
      case 'retur':
        return <ReturnsView />;
      case 'settings':
      case 'system':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 font-sans antialiased text-slate-800">
      {/* 1. Universal Top Bar */}
      <TopBar />

      {/* 2. Main Body with Left MPOS Sidebar + Dynamic View */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-100">
          {renderActiveView()}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation Bar (Visible only on small mobile devices) */}
      <nav className="lg:hidden bg-slate-900 border-t border-slate-800 px-2 py-1.5 flex items-center justify-around z-40 select-none">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold ${
            activeView === 'dashboard' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Monitor className="w-4 h-4 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveView('pos')}
          className={`relative flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold ${
            activeView === 'pos' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mb-0.5" />
          <span>Kasir</span>
          {cart.length > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveView('inventory')}
          className={`flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold ${
            activeView === 'inventory' ? 'text-purple-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4 mb-0.5" />
          <span>Stok</span>
        </button>

        <button
          onClick={() => setActiveView('akuntansi')}
          className={`flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold ${
            activeView === 'akuntansi' ? 'text-rose-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 mb-0.5" />
          <span>Laporan</span>
        </button>

        <button
          onClick={() => setActiveView('settings')}
          className={`flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold ${
            activeView === 'settings' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span>Pengaturan</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
