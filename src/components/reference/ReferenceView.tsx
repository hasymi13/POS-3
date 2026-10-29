import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { BookOpen, MapPin, Building2, Layers, Tag } from 'lucide-react';

export const ReferenceView: React.FC = () => {
  const { products, branches } = usePOS();

  const suppliers = Array.from(new Set(products.map((p) => p.supplier)));
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const units = Array.from(new Set(products.map((p) => p.unit)));

  const provinces = [
    { code: 'DKI', name: 'DKI Jakarta', city: 'Jakarta Pusat, Jakarta Barat' },
    { code: 'JABAR', name: 'Jawa Barat', city: 'Bandung, Bekasi, Depok, Bogor' },
    { code: 'JATIM', name: 'Jawa Timur', city: 'Surabaya, Malang, Sidoarjo' },
    { code: 'JATENG', name: 'Jawa Tengah', city: 'Semarang, Surakarta' },
    { code: 'BANTEN', name: 'Banten', city: 'Tangerang, Tangerang Selatan' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span>Data Referensi & Master Wilayah</span>
        </h1>
        <p className="text-xs text-slate-500">
          Kamus data master toko: Wilayah provinsi operasional, direktori pemasok/supplier resmi, kategori, dan satuan barang.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wilayah / Provinsi Operasional (matching "Provinsi" tile in screenshot) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-teal-700 font-extrabold text-sm pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4" />
            <span>Wilayah & Provinsi Operasional Toko</span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {provinces.map((prov) => (
              <div key={prov.code} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{prov.name}</span>
                  <div className="text-[11px] text-slate-400">Cakupan: {prov.city}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-mono text-[10px] font-bold">
                  {prov.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Direktori Pemasok / Supplier */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-orange-700 font-extrabold text-sm pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4" />
            <span>Pemasok & Distributor Resmi ({suppliers.length})</span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {suppliers.map((sup, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <span className="font-semibold text-slate-800">{sup}</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Pemasok Aktif
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kategori Barang */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-purple-700 font-extrabold text-sm pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4" />
            <span>Kategori Barang Dagang ({categories.length})</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-semibold"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Satuan Barang (UoM) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-sm pb-2 border-b border-slate-100">
            <Tag className="w-4 h-4" />
            <span>Satuan Ukur & Kemasan ({units.length})</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {units.map((u) => (
              <span
                key={u}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-mono font-bold"
              >
                {u}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
