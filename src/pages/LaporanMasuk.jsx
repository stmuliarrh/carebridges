import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, AlertCircle, Phone, FileText, ArrowUpDown } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

const UNITS = [
  "Poli Umum", "Poli Jiwa", "UGD", "Poli Persalinan", 
  "Poli Gizi", "Poli Gigi dan Mulut", "Laboratorium", "Poli Lansia", 
  "Poli TB dan Paru", "Kunjungan Offline", "Home-Visit", "Farmasi", 
  "Kasir", "Ranap"
];

export default function LaporanMasuk({ auth }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${API_BASE}/complaints`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat data pengaduan.');
      }
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = 
      c.patient_name.toLowerCase().includes(search.toLowerCase()) || 
      c.complaint_content.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp_number.includes(search);
    const matchesUnit = selectedUnit === 'All' || c.unit === selectedUnit;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    
    return matchesSearch && matchesUnit && matchesStatus;
  });

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Laporan Masuk</h1>
        <p className="text-slate-500 font-medium">Manajemen seluruh laporan pengaduan masuk dari pasien secara terpusat.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 gap-4 flex flex-col md:flex-row md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            placeholder="Cari pasien, WA, atau deskripsi keluhan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-xl border border-slate-200 py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 text-sm outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Unit Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-transparent text-sm font-semibold outline-none border-none cursor-pointer text-slate-700"
            >
              <option value="All">Semua Unit</option>
              {UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-sm font-semibold outline-none border-none cursor-pointer text-slate-700"
            >
              <option value="All">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Laporan Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Memproses data laporan...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            Tidak ditemukan pengaduan pasien yang sesuai filter/kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Pasien</th>
                  <th className="p-4">WhatsApp</th>
                  <th className="p-4">Unit Terkait</th>
                  <th className="p-4">Tanggal Kirim</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs text-slate-400">#CB-{c.id}</td>
                    <td className="p-4 font-bold text-slate-800">{c.patient_name}</td>
                    <td className="p-4 text-slate-600">{c.whatsapp_number}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-200">
                        {c.unit}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(c.created_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        c.status === 'Completed'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : c.status === 'Processing'
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors underline"
                      >
                        Detail Keluhan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedComplaint(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 z-10 overflow-hidden animate-zoom-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="font-mono text-xs text-slate-400">PENGADUAN #CB-{selectedComplaint.id}</span>
                <h3 className="text-lg font-bold text-slate-800">Detail Laporan Pasien</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 hover:bg-slate-200/50 rounded-lg"
              >
                Tutup
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block">Nama Pasien</span>
                  <span className="text-sm font-bold text-slate-800">{selectedComplaint.patient_name}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block">Status Laporan</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${
                    selectedComplaint.status === 'Completed'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : selectedComplaint.status === 'Processing'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block">Nomor WhatsApp</span>
                  <a
                    href={`https://wa.me/${selectedComplaint.whatsapp_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Phone className="h-4 w-4" />
                    {selectedComplaint.whatsapp_number}
                  </a>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block">Unit Terkait</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedComplaint.unit}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block">Tanggal Kirim</span>
                  <span className="text-sm text-slate-800">{formatDate(selectedComplaint.created_at)}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block">Pembaruan Terakhir</span>
                  <span className="text-sm text-slate-800">{formatDate(selectedComplaint.updated_at)}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase block">Deskripsi Keluhan Pasien</span>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 font-medium whitespace-pre-wrap flex gap-3">
                  <FileText className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <p>{selectedComplaint.complaint_content}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
