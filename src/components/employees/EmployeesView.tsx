import React from 'react';
import { usePOS } from '../../context/POSContext';
import { UserCheck, Shield, KeyRound, Clock, Mail, Phone } from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const { branches, currentUser, setCurrentUser } = usePOS();

  const staffList = [
    {
      id: 'emp-1',
      name: 'Admin PUSAT',
      role: 'Super Administrator',
      branch: 'Unit Pusat (Gudang & Toko)',
      email: 'hasymisomaida@unikma.ac.id',
      phone: '0812-8899-7766',
      status: 'Aktif',
    },
    {
      id: 'emp-2',
      name: 'Siti Rahayu',
      role: 'Kasir Sift Pagi',
      branch: 'Unit Pusat (Gudang & Toko)',
      email: 'siti.kasir@enigma-pos.id',
      phone: '0857-1122-3344',
      status: 'Aktif',
    },
    {
      id: 'emp-3',
      name: 'Rian Pratama',
      role: 'Kasir Sift Malam',
      branch: 'Unit Pusat (Gudang & Toko)',
      email: 'rian.kasir@enigma-pos.id',
      phone: '0878-5566-7788',
      status: 'Aktif',
    },
    {
      id: 'emp-4',
      name: 'Budi Santoso',
      role: 'Kepala Cabang',
      branch: 'Cabang Jakarta Barat',
      email: 'budi.jkt@enigma-pos.id',
      phone: '0813-9900-1122',
      status: 'Aktif',
    },
    {
      id: 'emp-5',
      name: 'Hendra Wijaya',
      role: 'Staff Inventaris & Gudang',
      branch: 'Unit Pusat (Gudang & Toko)',
      email: 'hendra.gudang@enigma-pos.id',
      phone: '0821-4455-6677',
      status: 'Aktif',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span>Manajemen Pegawai & Hak Akses Kasir</span>
        </h1>
        <p className="text-xs text-slate-500">
          Kelola kredensial operator kasir, manajer toko, dan pergantian shift kerja harian.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((emp) => {
          const isCurrent = currentUser.name === emp.name;

          return (
            <div
              key={emp.id}
              className={`bg-white rounded-xl p-4 border transition-all shadow-sm ${
                isCurrent ? 'border-sky-500 ring-2 ring-sky-300' : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{emp.name}</h3>
                  <span className="text-[11px] font-semibold text-sky-600 block mt-0.5">
                    {emp.role}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {emp.status}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.branch}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{emp.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {isCurrent ? (
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded">
                    Sesi Aktif Saat Ini
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      setCurrentUser({
                        name: emp.name,
                        role: emp.role,
                        email: emp.email,
                      })
                    }
                    className="text-xs font-bold text-slate-700 hover:text-sky-600 transition-colors"
                  >
                    Ganti ke Pegawai Ini →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
