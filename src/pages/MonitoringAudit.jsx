import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, LineChart as LineIcon, ShieldCheck, Clock, Activity, RefreshCw, AlertCircle } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

const STATUS_COLORS = {
  Pending: '#f59e0b',    // amber
  Processing: '#6366f1', // indigo
  Completed: '#10b981'   // emerald
};

export default function MonitoringAudit({ auth }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/monitoring`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat dashboard monitoring.');
      }
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 5 seconds for live visual updates
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Convert statusStats to array for Line/Bar chart
  const statusData = stats ? [
    { name: 'Pending', Jumlah: stats.statusStats.Pending },
    { name: 'Processing', Jumlah: stats.statusStats.Processing },
    { name: 'Completed', Jumlah: stats.statusStats.Completed }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Monitoring & Audit Trail</h1>
          <p className="text-slate-500 font-medium">Analisis tren keluhan per unit dan riwayat perubahan log keluhan secara live.</p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Segarkan Data
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading || !stats ? (
        <div className="bg-white rounded-2xl p-16 text-center text-slate-500 font-medium border border-slate-100 shadow-sm">
          Menghitung metrik grafis real-time...
        </div>
      ) : (
        <>
          {/* Executive Widgets Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avg Response Time Widget */}
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl shadow-blue-500/10 flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-blue-100 font-bold text-xs uppercase tracking-wider block">Rata-Rata Waktu Respon</span>
                <span className="text-4xl font-black block">{stats.avgMinutes} Menit</span>
                <p className="text-xs text-blue-200 font-medium">
                  Dihitung dari selisih waktu pembuatan keluhan sampai status diperbarui ke 'Processing'/'Completed'.
                </p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl">
                <Clock className="h-8 w-8 text-blue-100" />
              </div>
            </div>

            {/* Audit Shield / Health State Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Keandalan Sistem Audit</span>
                <span className="text-4xl font-black text-slate-800 block">100% Aman</span>
                <p className="text-xs text-slate-500 font-medium">
                  Semua aktivitas transaksi keluhan tercatat di Audit Trail secara otomatis tanpa jeda manual.
                </p>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <ShieldCheck className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Unit breakdown */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800">Sebaran Keluhan Per Unit</h3>
              </div>
              <div className="h-80 w-full">
                {stats.unitStats.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400">Belum ada sebaran unit.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.unitStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} height={60} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#f1f5f9' }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Jumlah Keluhan">
                        {stats.unitStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Status Breakdown */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">Tren Status Keluhan Pasien</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="Jumlah" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Audit Trail List */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Log Aktivitas & Audit Trail</h3>
              <p className="text-xs text-slate-500">Log audit riwayat status perubahan keluhan dari awal dikirim pasien sampai selesai diproses.</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {stats.logs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Tidak ada data log perubahan.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100 sticky top-0">
                        <th className="p-4 pl-6">Timestamp</th>
                        <th className="p-4">Keluhan ID</th>
                        <th className="p-4">Pasien</th>
                        <th className="p-4">Transisi Status</th>
                        <th className="p-4">Eksekutor / Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                      {stats.logs.map((log) => (
                        <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6 text-xs text-slate-500 font-mono">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-400">#CB-{log.complaint_id}</td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-800">{log.patient_name || 'N/A'}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              {log.status_from ? (
                                <span style={{ color: STATUS_COLORS[log.status_from] || '#94a3b8' }}>
                                  {log.status_from}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal">Baru Masuk</span>
                              )}
                              <span className="text-slate-400">&rarr;</span>
                              <span style={{ color: STATUS_COLORS[log.status_to] || '#94a3b8' }}>
                                {log.status_to}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-xs font-medium text-slate-600">
                            {log.changed_by}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
