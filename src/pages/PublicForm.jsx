import React, { useState } from 'react';
import { 
  HeartPulse, CheckCircle2, AlertCircle, Phone, User, Stethoscope, 
  FileText, Loader2, ArrowRight, Search, ClipboardList, Activity, 
  Check, Calendar, Shield, RefreshCw, Send, Building2, HelpCircle 
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

const UNITS = [
  "Poli Umum", "Poli Jiwa", "UGD", "Poli Persalinan", 
  "Poli Gizi", "Poli Gigi dan Mulut", "Laboratorium", "Poli Lansia", 
  "Poli TB dan Paru", "Kunjungan Offline", "Home-Visit", "Farmasi", 
  "Kasir", "Ranap"
];

export default function PublicForm() {
  // Tab state: 'submit' or 'track'
  const [activeTab, setActiveTab] = useState('submit');
  
  // Submit Complaint Form State
  const [form, setForm] = useState({
    patient_name: '',
    whatsapp_number: '',
    unit: '',
    complaint_content: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Track Complaint State
  const [trackId, setTrackId] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (submitError) setSubmitError('');
  };

  const handleSelectUnit = (unitName) => {
    setForm({ ...form, unit: unitName });
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_name || !form.whatsapp_number || !form.unit || !form.complaint_content) {
      setSubmitError('Mohon lengkapi semua kolom formulir.');
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const response = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mengirim pengaduan.');
      }

      setSuccess(true);
      setSubmittedId(data.complaint.id);
      setForm({
        patient_name: '',
        whatsapp_number: '',
        unit: '',
        complaint_content: ''
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackId.trim()) {
      setTrackError('Silakan masukkan nomor tiket.');
      return;
    }

    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);

    try {
      const response = await fetch(`${API_BASE}/track?id=${trackId.trim()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Laporan tidak ditemukan.');
      }
      
      setTrackResult(data);
    } catch (err) {
      setTrackError(err.message);
    } finally {
      setTrackLoading(false);
    }
  };

  const handleTrackFromSuccess = (id) => {
    setSuccess(false);
    setActiveTab('track');
    setTrackId(id.toString());
    // Auto-fetch status
    setTimeout(() => {
      const btn = document.getElementById('track-search-btn');
      if (btn) btn.click();
    }, 100);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper for Stepper State
  const getStepState = (stepNumber, status) => {
    // status: Pending, Processing, Completed
    if (status === 'Completed') {
      return 'completed';
    }
    if (status === 'Processing') {
      if (stepNumber < 2) return 'completed';
      if (stepNumber === 2) return 'active';
      return 'upcoming';
    }
    // Pending
    if (stepNumber === 1) return 'active';
    return 'upcoming';
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'Pending': return 'Verifikasi';
      case 'Processing': return 'Pengerjaan';
      case 'Completed': return 'Selesai';
      default: return status || 'Pendaftaran';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/20 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between" style={{ minHeight: '100vh' }}>
      
      {/* Background patterns */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-teal-600 to-transparent opacity-10 pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto w-full z-10 relative">
        {/* Header Logo & Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-100 text-teal-800 rounded-full text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
            <HeartPulse className="h-4 w-4 text-teal-600 animate-pulse" />
            <span>E-Care Response System</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight mb-3">
            Layanan Pengaduan Cepat <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">Sarana & Prasarana</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Kenyamanan Anda adalah prioritas kami. Laporkan keluhan fasilitas rumah sakit CAREBRIDGES dalam sekejap atau lacak status penanganannya secara real-time.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Hospital Info & Guidelines */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Stats Panel */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-xl shadow-teal-900/5">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-600" />
                Informasi & Panduan
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 text-center">
                  <div className="text-2xl font-extrabold text-teal-700">14</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Unit Terintegrasi</div>
                </div>
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-center">
                  <div className="text-2xl font-extrabold text-indigo-700">&lt; 2 Jam</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Rata-rata Respon</div>
                </div>
              </div>

              {/* Core Features list */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl mt-0.5">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Kerahasiaan Terjamin</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Identitas dan nomor telepon WhatsApp Anda terenkripsi aman dan hanya dapat diakses staf berwenang.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-xl mt-0.5">
                    <RefreshCw className="h-4.5 w-4.5 animate-spin-slow" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Pelacakan Real-time</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Pasien dapat melacak proses penanganan secara transparan melalui nomor tiket pengaduan yang didapatkan.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl mt-0.5">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Notifikasi Terpadu</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Admin akan menghubungi nomor WhatsApp Anda yang terdaftar untuk informasi detail tindak lanjut.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Units badge grid */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-xl shadow-teal-900/5">
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                Daftar Unit Layanan Tercover
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {UNITS.map(u => (
                  <span 
                    key={u} 
                    className="text-xs font-semibold px-3 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-lg border border-slate-200/60 transition-colors"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Interaction Card (Submit / Track) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300">
              
              {/* Tab Selector */}
              <div className="flex border-b border-slate-100 bg-slate-50 p-2 gap-2">
                <button
                  onClick={() => { setActiveTab('submit'); setSuccess(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 ${
                    activeTab === 'submit'
                      ? 'bg-white text-teal-700 shadow-md shadow-teal-100/50 border border-slate-100'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                  }`}
                >
                  <Send className="h-4.5 w-4.5" />
                  Buat Pengaduan
                </button>
                <button
                  onClick={() => { setActiveTab('track'); setSuccess(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 ${
                    activeTab === 'track'
                      ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50 border border-slate-100'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                  }`}
                >
                  <Search className="h-4.5 w-4.5" />
                  Lacak Laporan
                </button>
              </div>

              <div className="p-8 sm:p-10">
                {/* SUBMIT COMPLAINT TAB */}
                {activeTab === 'submit' && (
                  <>
                    {success ? (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center p-4 bg-emerald-100 text-emerald-600 rounded-full mb-6 animate-bounce">
                          <CheckCircle2 className="h-16 w-16" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Laporan Berhasil Terkirim!</h2>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                          Terima kasih atas laporan Anda. Pengaduan Anda telah terdaftar dalam sistem CAREBRIDGES.
                        </p>

                        {/* Ticket ID Box */}
                        {submittedId && (
                          <div className="bg-gradient-to-r from-teal-50 to-indigo-50 border border-slate-100 rounded-2xl p-5 mb-8 max-w-xs mx-auto">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">NOMOR TIKET ANDA</span>
                            <span className="text-3xl font-black text-teal-700 tracking-wider">#CB-{submittedId}</span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                          {submittedId && (
                            <button
                              onClick={() => handleTrackFromSuccess(submittedId)}
                              className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200 w-full sm:w-auto"
                            >
                              <Search className="mr-2 h-4.5 w-4.5" />
                              Lacak Laporan Ini
                            </button>
                          )}
                          <button
                            onClick={() => setSuccess(false)}
                            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-200 w-full sm:w-auto"
                          >
                            Buat Pengaduan Baru
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                          <h2 className="text-xl font-bold text-slate-800">Form Pengaduan Pasien</h2>
                          <p className="text-sm text-slate-500">Silakan laporkan keluhan fasilitas/sarana prasarana demi perbaikan kami.</p>
                        </div>

                        {submitError && (
                          <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 animate-shake">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-medium">{submitError}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Patient Name */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">Nama Lengkap Pasien</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="h-5 w-5" />
                              </div>
                              <input
                                type="text"
                                name="patient_name"
                                value={form.patient_name}
                                onChange={handleChange}
                                placeholder="Contoh: Siti Rahma"
                                className="pl-11 w-full rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800 transition-all outline-none"
                                required
                              />
                            </div>
                          </div>

                          {/* WhatsApp Number */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">Nomor WhatsApp (Aktif)</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Phone className="h-5 w-5" />
                              </div>
                              <input
                                type="tel"
                                name="whatsapp_number"
                                value={form.whatsapp_number}
                                onChange={handleChange}
                                placeholder="Contoh: 081234567890"
                                className="pl-11 w-full rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800 transition-all outline-none"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Unit / Poly Option Grid */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 block">Pilih Unit/Layanan yang Bermasalah</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {UNITS.map((unitName) => {
                              const isSelected = form.unit === unitName;
                              return (
                                <button
                                  type="button"
                                  key={unitName}
                                  onClick={() => handleSelectUnit(unitName)}
                                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all duration-150 ${
                                    isSelected
                                      ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-200'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                                  }`}
                                >
                                  {unitName}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Complaint Content */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 block">Isi Keluhan / Pengaduan</label>
                          <div className="relative">
                            <div className="absolute top-3.5 left-3.5 flex items-start pointer-events-none text-slate-400">
                              <FileText className="h-5 w-5" />
                            </div>
                            <textarea
                              name="complaint_content"
                              value={form.complaint_content}
                              onChange={handleChange}
                              rows={4}
                              placeholder="Deskripsikan dengan detail mengenai kerusakan fasilitas, kebersihan, atau kendala sarana prasarana yang Anda temukan..."
                              className="pl-11 w-full rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800 transition-all outline-none resize-none"
                              required
                            ></textarea>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-200 transition-all duration-200 disabled:bg-teal-400 disabled:shadow-none cursor-pointer"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                              Sedang mengirimkan...
                            </>
                          ) : (
                            'Kirim Pengaduan Sekarang'
                          )}
                        </button>
                      </form>
                    )}
                  </>
                )}

                {/* TRACK COMPLAINT TAB */}
                {activeTab === 'track' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-bold text-slate-800">Lacak Status Pengaduan</h2>
                      <p className="text-sm text-slate-500">Masukkan nomor tiket pengaduan Anda untuk melihat status secara langsung.</p>
                    </div>

                    <form onSubmit={handleTrackSubmit} className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Search className="h-5 w-5" />
                        </div>
                        <input
                          type="number"
                          placeholder="Masukkan Nomor Tiket (Contoh: 12)"
                          value={trackId}
                          onChange={(e) => {
                            setTrackId(e.target.value);
                            if (trackError) setTrackError('');
                          }}
                          className="pl-11 w-full rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 font-mono tracking-wide outline-none transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        id="track-search-btn"
                        disabled={trackLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer disabled:bg-indigo-400"
                      >
                        {trackLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          'Cari'
                        )}
                      </button>
                    </form>

                    {trackError && (
                      <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{trackError}</p>
                      </div>
                    )}

                    {/* Track Results Area */}
                    {trackResult && (
                      <div className="space-y-6 border-t border-slate-100 pt-6 animate-zoom-in">
                        
                        {/* Info Ticket Card */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                            <span className="font-mono text-sm font-bold text-indigo-700">#CB-{trackResult.complaint.id}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Dibuat: {formatDate(trackResult.complaint.created_at)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-slate-200/50">
                            <div>
                              <span className="text-slate-400 text-xs font-semibold block">NAMA PASIEN</span>
                              <span className="font-bold text-slate-800">{trackResult.complaint.patient_name}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs font-semibold block">UNIT TERKAIT</span>
                              <span className="font-semibold text-slate-700">{trackResult.complaint.unit}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Stepper */}
                        <div className="py-4">
                          <h4 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">Tahapan Penanganan</h4>
                          
                          <div className="relative pl-8 border-l-2 border-slate-200 space-y-8 ml-3">
                            {/* Step 1: Verifikasi */}
                            <div className="relative">
                              {/* Step circle */}
                              <div className={`absolute -left-[41px] top-0.5 rounded-full p-1.5 border-2 flex items-center justify-center transition-all duration-300 ${
                                getStepState(1, trackResult.complaint.status) === 'completed'
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200'
                                  : getStepState(1, trackResult.complaint.status) === 'active'
                                  ? 'bg-teal-500 border-teal-500 text-white animate-pulse shadow-md shadow-teal-200'
                                  : 'bg-white border-slate-300 text-slate-400'
                              }`}>
                                {getStepState(1, trackResult.complaint.status) === 'completed' ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                ) : (
                                  <ClipboardList className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <div>
                                <h5 className={`text-sm font-bold ${
                                  getStepState(1, trackResult.complaint.status) !== 'upcoming' ? 'text-slate-800' : 'text-slate-400'
                                }`}>
                                  Verifikasi Laporan
                                </h5>
                                <p className="text-xs text-slate-500 mt-1">Laporan berhasil didaftarkan dan sedang diverifikasi oleh admin admin@test.com.</p>
                              </div>
                            </div>

                            {/* Step 2: Pengerjaan */}
                            <div className="relative">
                              {/* Step circle */}
                              <div className={`absolute -left-[41px] top-0.5 rounded-full p-1.5 border-2 flex items-center justify-center transition-all duration-300 ${
                                getStepState(2, trackResult.complaint.status) === 'completed'
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200'
                                  : getStepState(2, trackResult.complaint.status) === 'active'
                                  ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse shadow-md shadow-indigo-200'
                                  : 'bg-white border-slate-300 text-slate-400'
                              }`}>
                                {getStepState(2, trackResult.complaint.status) === 'completed' ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                ) : (
                                  <Activity className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <div>
                                <h5 className={`text-sm font-bold ${
                                  getStepState(2, trackResult.complaint.status) !== 'upcoming' ? 'text-slate-800' : 'text-slate-400'
                                }`}>
                                  Proses Pengerjaan
                                </h5>
                                <p className="text-xs text-slate-500 mt-1">Laporan diserahkan kepada unit penanggung jawab lapangan untuk perbaikan/penyelesaian.</p>
                              </div>
                            </div>

                            {/* Step 3: Selesai */}
                            <div className="relative">
                              {/* Step circle */}
                              <div className={`absolute -left-[41px] top-0.5 rounded-full p-1.5 border-2 flex items-center justify-center transition-all duration-300 ${
                                getStepState(3, trackResult.complaint.status) === 'completed'
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200'
                                  : 'bg-white border-slate-300 text-slate-400'
                              }`}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <h5 className={`text-sm font-bold ${
                                  getStepState(3, trackResult.complaint.status) === 'completed' ? 'text-emerald-700' : 'text-slate-400'
                                }`}>
                                  Laporan Selesai
                                </h5>
                                <p className="text-xs text-slate-500 mt-1">Laporan selesai dikerjakan secara tuntas dan fasilitas dapat digunakan kembali.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Audit Logs (Timeline History) */}
                        {trackResult.history && trackResult.history.length > 0 && (
                          <div className="border-t border-slate-100 pt-5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Log Riwayat Pembaruan</h4>
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-3">
                              {trackResult.history.map((log, index) => (
                                <div key={index} className="flex items-start gap-2.5 text-xs text-slate-600">
                                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></div>
                                  <div>
                                    <span className="font-semibold text-slate-700">
                                      {log.status_from ? `Status diubah dari ${translateStatus(log.status_from)}` : 'Laporan terdaftar'} ke{' '}
                                      <span className="font-bold text-indigo-700">{translateStatus(log.status_to)}</span>
                                    </span>
                                    {log.changed_by && (
                                      <span className="text-slate-400"> oleh {log.changed_by}</span>
                                    )}
                                    <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(log.timestamp)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Info & Admin Entry Link */}
      <div className="text-center mt-12 text-slate-500 text-sm z-10 relative">
        <p>&copy; {new Date().getFullYear()} CAREBRIDGES. Semua data tersinkronisasi ke database Neon.</p>
        <p className="mt-2 text-xs">
          Halaman Khusus Administrator?{' '}
          <a href="/login" className="text-teal-600 hover:text-teal-700 hover:underline font-bold">
            Masuk Portal Admin
          </a>
        </p>
      </div>
    </div>
  );
}
