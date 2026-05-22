import React, { useState } from 'react';
import { HeartPulse, CheckCircle2, AlertCircle, Phone, User, Stethoscope, FileText, Loader2, ArrowRight } from 'lucide-react';

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
  const [form, setForm] = useState({
    patient_name: '',
    whatsapp_number: '',
    unit: '',
    complaint_content: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSelectUnit = (unitName) => {
    setForm({ ...form, unit: unitName });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_name || !form.whatsapp_number || !form.unit || !form.complaint_content) {
      setError('Mohon lengkapi semua kolom formulir.');
      return;
    }

    setLoading(true);
    setError('');

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
      setForm({
        patient_name: '',
        whatsapp_number: '',
        unit: '',
        complaint_content: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-height-screen bg-gradient-to-tr from-sky-100 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between" style={{ minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto w-full">
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 mb-4 animate-bounce">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            E-Care Response
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-md mx-auto">
            Layanan Pengaduan Digital Pasien CAREBRIDGES. Kami siap mendengar dan meningkatkan layanan kami.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300">
          <div className="p-8 sm:p-10">
            {success ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center p-4 bg-emerald-100 text-emerald-600 rounded-full mb-6">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Laporan Berhasil Terkirim!</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Terima kasih atas laporan Anda. Tim administrasi kami akan segera memproses laporan Anda secara real-time.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all duration-200"
                >
                  Kirim Pengaduan Baru
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-800">Form Pengaduan Pasien (E-Complaint)</h2>
                  <p className="text-sm text-slate-500">Silakan isi detail pengaduan Anda di bawah ini.</p>
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 animate-shake">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
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
                        className="pl-11 w-full rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-all outline-none"
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
                        className="pl-11 w-full rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Unit / Poly Option Grid */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Pilih Unit/Layanan yang Dilaporkan</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {UNITS.map((unitName) => {
                      const isSelected = form.unit === unitName;
                      return (
                        <button
                          type="button"
                          key={unitName}
                          onClick={() => handleSelectUnit(unitName)}
                          className={`py-2.5 px-3 text-xs sm:text-sm font-medium rounded-xl border text-center transition-all duration-150 ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
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
                  <label className="text-sm font-semibold text-slate-700 block">Isi Keluhan/Pengaduan</label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-3.5 flex items-start pointer-events-none text-slate-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <textarea
                      name="complaint_content"
                      value={form.complaint_content}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Jelaskan kendala atau keluhan yang Anda rasakan dengan detail..."
                      className="pl-11 w-full rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-all outline-none resize-none"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all duration-200 disabled:bg-blue-400 disabled:shadow-none"
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
          </div>
        </div>
      </div>

      {/* Footer Info & Admin Entry Link */}
      <div className="text-center mt-8 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} CAREBRIDGES. All rights reserved.</p>
        <p className="mt-2">
          Halaman Khusus Administrator?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-semibold">
            Masuk Portal Admin
          </a>
        </p>
      </div>
    </div>
  );
}
