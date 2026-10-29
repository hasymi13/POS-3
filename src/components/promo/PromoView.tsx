import React, { useState } from 'react';
import { Gift, Plus, CheckCircle, Tag, Percent, Calendar } from 'lucide-react';
import { formatRupiah } from '../../utils/format';

export const PromoView: React.FC = () => {
  const [promos, setPromos] = useState([
    {
      id: 'prm-1',
      code: 'DISKONBERAS',
      title: 'Potongan Belanja Beras Pandan Wangi',
      discountType: 'nominal',
      discountValue: 10000,
      minSpend: 150000,
      status: 'Aktif',
      validUntil: '31 Des 2026',
    },
    {
      id: 'prm-2',
      code: 'QRISCASHBACK',
      title: 'Cashback Pembayaran QRIS Dinamis 5%',
      discountType: 'percentage',
      discountValue: 5,
      minSpend: 50000,
      status: 'Aktif',
      validUntil: '30 Nov 2026',
    },
    {
      id: 'prm-3',
      code: 'MEMBERVIP',
      title: 'Diskon Spesial Member Gold VIP',
      discountType: 'percentage',
      discountValue: 10,
      minSpend: 200000,
      status: 'Aktif',
      validUntil: '31 Des 2026',
    },
  ]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <span>Manajemen Promo & Kupon Diskon Kasir</span>
          </h1>
          <p className="text-xs text-slate-500">
            Atur program promosi belanja, kupon diskon persentase, dan reward member kasir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono font-black text-xs tracking-wider border border-amber-300">
                {p.code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {p.status}
              </span>
            </div>

            <h3 className="font-extrabold text-slate-900 text-sm mt-3">{p.title}</h3>

            <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Nilai Potongan:</span>
                <strong className="text-slate-900">
                  {p.discountType === 'nominal'
                    ? formatRupiah(p.discountValue)
                    : `${p.discountValue}%`}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Minimal Belanja:</span>
                <span className="font-mono">{formatRupiah(p.minSpend)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Masa Berlaku:</span>
                <span className="text-slate-500">{p.validUntil}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
