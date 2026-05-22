import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, RefreshCw, AlertCircle, Phone, ArrowRightLeft, Loader2 } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

const UNITS = [
  "Poli Umum", "Poli Jiwa", "UGD", "Poli Persalinan", 
  "Poli Gizi", "Poli Gigi dan Mulut", "Laboratorium", "Poli Lansia", 
  "Poli TB dan Paru", "Kunjungan Offline", "Home-Visit", "Farmasi", 
  "Kasir", "Ranap"
];

export default function VerifikasiAntrean({ auth }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track execution states for individual complaints
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [dispatchUnits, setDispatchUnits] = useState({}); // { complaintId: selectedUnitName }

  const fetchActiveComplaints = async () => {
    try {
      const response = await fetch(`${API_BASE}/complaints`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat data antrean.');
      }
      
      // Filter out completed ones, keep Pending and Processing
      const active = data.filter(c => c.status !== 'Completed');
      setComplaints(active);

      // Prepopulate dispatchUnits mapping
      const initialUnits = {};
      active.forEach(c => {
        initialUnits[c.id] = c.unit;
      });
      setDispatchUnits(prev => ({ ...initialUnits, ...prev }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveComplaints();
    const interval = setInterval(fetchActiveComplaints, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (complaintId, newStatus) => {
    setActionLoading({ id: complaintId, status: newStatus });
    setError('');
    setSuccessMsg('');

    const targetUnit = dispatchUnits[complaintId];

    try {
      const response = await fetch(`${API_BASE}/update-complaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          complaint_id: complaintId,
          status: newStatus,
          unit: targetUnit
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui status keluhan.');
      }

      setSuccessMsg(`Keluhan #CB-${complaintId} berhasil diperbarui.`);
      
      // Instantly update UI without waiting for next poll
      setComplaints(prev => {
        if (newStatus === 'Completed') {
          return prev.filter(c => c.id !== complaintId);
        } else {
          return prev.map(c => c.id === complaintId ? { ...c, status: newStatus, unit: targetUnit } : c);
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnitChange = (complaintId, val) => {
    setDispatchUnits({
      ...dispatchUnits,
      [complaintId]: val
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Verifikasi & Antrean Tugas</h1>
          <p className="text-slate-500 font-medium">Proses pengaduan pasien secara real-time dan arahkan ke unit yang tepat.</p>
        </div>
        <button
          onClick={fetchActiveComplaints}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Segarkan Antrean
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 font-medium text-sm flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 font-medium border border-slate-100 shadow-sm">
          Memuat antrean tugas aktif...
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center text-slate-500 font-medium border border-slate-100 shadow-sm space-y-3">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Semua Tugas Selesai!</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Tidak ada antrean keluhan aktif saat ini. Semua keluhan pasien telah ditangani.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const isProcessing = c.status === 'Processing';
            const selectedUnit = dispatchUnits[c.id] || c.unit;
            const isThisLoading = actionLoading?.id === c.id;

            return (
              <div
                key={c.id}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-sm ${
                  isProcessing ? 'border-indigo-100 bg-indigo-50/10' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                  
                  {/* Left: Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-400">#CB-{c.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isProcessing
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-xs text-slate-500 font-medium">
                        Dibuat: {new Date(c.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} ({new Date(c.created_at).toLocaleDateString('id-ID')})
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{c.patient_name}</h3>
                      <a
                        href={`https://wa.me/${c.whatsapp_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1.5 mt-0.5"
                      >
                        <Phone className="h-4 w-4 text-blue-500" />
                        {c.whatsapp_number}
                      </a>
                    </div>

                    <div className="text-sm text-slate-600 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-medium whitespace-pre-wrap">
                      {c.complaint_content}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="w-full lg:w-80 space-y-4 shrink-0 bg-slate-50/40 p-5 rounded-2xl border border-slate-100">
                    {/* Dispatch unit selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Arahkan Unit Penerima
                      </label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => handleUnitChange(c.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 text-sm font-semibold outline-none transition-all cursor-pointer"
                      >
                        {UNITS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {/* Process button (Only if pending) */}
                      {!isProcessing && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'Processing')}
                          disabled={isThisLoading}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 px-4 text-sm font-bold shadow-lg shadow-indigo-100 transition-all duration-150 disabled:opacity-50"
                        >
                          {isThisLoading && actionLoading?.status === 'Processing' ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 fill-white" />
                          )}
                          Proses
                        </button>
                      )}

                      {/* Complete button */}
                      <button
                        onClick={() => handleUpdateStatus(c.id, 'Completed')}
                        disabled={isThisLoading}
                        className={`flex-1 inline-flex items-center justify-center gap-2 text-white rounded-xl py-2.5 px-4 text-sm font-bold transition-all duration-150 disabled:opacity-50 ${
                          isProcessing 
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100' 
                            : 'bg-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {isThisLoading && actionLoading?.status === 'Completed' ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Selesai
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
