import React, { useState, useEffect } from 'react';
import { Layers, Clock, CheckCircle2, MessageSquare, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

export default function DashboardOverview({ auth }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    // Poll data every 5 seconds for live stats
    const interval = setInterval(fetchComplaints, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const totalCount = complaints.length;
  const processingCount = complaints.filter(c => c.status === 'Processing').length;
  const completedCount = complaints.filter(c => c.status === 'Completed').length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;

  const latestComplaints = complaints.slice(0, 5);

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
        <h1 className="text-3xl font-extrabold text-slate-800">Overview Dashboard</h1>
        <p className="text-slate-500 font-medium">Pantau statistik pengaduan pasien secara real-time di CAREBRIDGES.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total complaints */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Total Keluhan</p>
            <p className="text-3xl font-black text-slate-800">{loading ? '...' : totalCount}</p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        {/* Pending complaints */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Menunggu (Pending)</p>
            <p className="text-3xl font-black text-amber-600">{loading ? '...' : pendingCount}</p>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>

        {/* Processing complaints */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Sedang Diproses</p>
            <p className="text-3xl font-black text-indigo-600">{loading ? '...' : processingCount}</p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Completed complaints */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">Selesai (Resolved)</p>
            <p className="text-3xl font-black text-emerald-600">{loading ? '...' : completedCount}</p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Latest Complaints Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Aktivitas Keluhan Terbaru</h2>
            <p className="text-xs text-slate-500">Daftar 5 keluhan pasien terbaru yang masuk ke sistem.</p>
          </div>
          <Link
            to="/admin/laporan"
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Lihat Semua Laporan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat data terbaru...</div>
        ) : latestComplaints.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Tidak ada pengaduan pasien masuk.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Pasien</th>
                  <th className="p-4">Unit Tujuan</th>
                  <th className="p-4">Tanggal Masuk</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {latestComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs text-slate-400">#CB-{c.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{c.patient_name}</div>
                      <div className="text-xs text-slate-400">{c.whatsapp_number}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
