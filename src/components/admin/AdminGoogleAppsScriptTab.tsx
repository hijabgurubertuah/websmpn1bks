import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Zap,
  Folder,
  RefreshCw,
  Info,
} from 'lucide-react';
import { SchoolConfig, GoogleAppsScriptConfig } from '../../types';
import {
  SAMPLE_APPS_SCRIPT_CODE,
  testAppsScriptConnection,
  uploadFileViaAppsScript,
  getStoredAppsScriptConfig,
  saveStoredAppsScriptConfig,
  AppsScriptUploadResult,
} from '../../lib/googleAppsScript';

interface AdminGoogleAppsScriptTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminGoogleAppsScriptTab: React.FC<AdminGoogleAppsScriptTabProps> = ({
  config,
  onChange,
}) => {
  const currentGasConfig: GoogleAppsScriptConfig = config.googleAppsScript || {
    enabled: true,
    webAppUrl: '',
    folderId: '',
    spreadsheetId: '',
    autoCreateFolder: true,
    testStatus: 'untested',
  };

  const [formData, setFormData] = useState<GoogleAppsScriptConfig>(currentGasConfig);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [showCode, setShowCode] = useState(true);

  // Live tester
  const [testUploading, setTestUploading] = useState(false);
  const [testUploadResult, setTestUploadResult] = useState<AppsScriptUploadResult | null>(null);
  const [testUploadError, setTestUploadError] = useState<string | null>(null);

  // Sync with local storage on mount
  useEffect(() => {
    const stored = getStoredAppsScriptConfig();
    if (stored && stored.webAppUrl && !formData.webAppUrl) {
      setFormData((prev) => ({
        ...prev,
        ...stored,
      }));
    }
  }, []);

  const handleFieldChange = (field: keyof GoogleAppsScriptConfig, value: any) => {
    const updated = {
      ...formData,
      [field]: value,
    };
    setFormData(updated);
    saveStoredAppsScriptConfig(updated);
    onChange({
      ...config,
      googleAppsScript: updated,
    });
  };

  const handleRunTest = async () => {
    if (!formData.webAppUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Web App terlebih dahulu sebelum menguji koneksi.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const res = await testAppsScriptConnection(formData.webAppUrl);
      setTestResult(res);

      const updated = {
        ...formData,
        lastTestedAt: new Date().toLocaleTimeString('id-ID'),
        testStatus: res.success ? ('success' as const) : ('error' as const),
        testMessage: res.message,
      };
      setFormData(updated);
      saveStoredAppsScriptConfig(updated);
      onChange({
        ...config,
        googleAppsScript: updated,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: 'Koneksi gagal: ' + msg,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      // Fallback
      setCopiedCode(false);
    }
  };

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!formData.webAppUrl.trim()) {
      setTestUploadError('Harap simpan URL Web App terlebih dahulu sebelum menguji upload.');
      return;
    }

    setTestUploading(true);
    setTestUploadError(null);
    setTestUploadResult(null);

    try {
      const res = await uploadFileViaAppsScript(file, {
        webAppUrl: formData.webAppUrl,
        folderId: formData.folderId,
        spreadsheetId: formData.spreadsheetId,
      });
      setTestUploadResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestUploadError(msg);
    } finally {
      setTestUploading(false);
      e.target.value = '';
    }
  };

  const isConfigured = Boolean(formData.webAppUrl && formData.webAppUrl.trim().length > 15);

  return (
    <div id="admin-apps-script-tab" className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-blue-800/50">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-xs font-semibold backdrop-blur-xs">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Solusi Tanpa Pop-up & Tanpa Login Akun</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Integrasi Google Drive & Spreadsheet (Apps Script)
          </h2>

          <p className="text-sm text-blue-100/90 leading-relaxed">
            Metode ini menggantikan pop-up login Google OAuth browser yang sering terblokir. 
            Semua unggahan gambar berita, fasilitas, logo, dan dokumen akan otomatis ditampung ke Google Drive akun Anda dan dicatat ke Google Sheets tanpa perlu login berulang kali.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Bebas Blokir Pop-up Browser
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-blue-300 font-medium bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-500/30">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" /> Terhubung Google Sheets
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-medium bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> CDN Gambar Google Cepat
            </span>
          </div>
        </div>
      </div>

      {/* Connection Status Badge */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
          isConfigured && formData.testStatus === 'success'
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
            : isConfigured
            ? 'bg-blue-50/90 border-blue-200 text-blue-900'
            : 'bg-amber-50/90 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isConfigured && formData.testStatus === 'success'
                ? 'bg-emerald-600 text-white'
                : isConfigured
                ? 'bg-blue-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {isConfigured && formData.testStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">
              {isConfigured && formData.testStatus === 'success'
                ? 'Google Apps Script Siap & Terhubung'
                : isConfigured
                ? 'URL Web App Terisi (Perlu Pengujian)'
                : 'Belum Dikonfigurasi'}
            </h3>
            <p className="text-xs opacity-90 mt-0.5">
              {isConfigured && formData.testStatus === 'success'
                ? `Semua tombol upload di website ini kini ditangani otomatis oleh Apps Script. Terakhir dites: ${formData.lastTestedAt || 'Baru saja'}.`
                : isConfigured
                ? 'Klik tombol "Tes Koneksi Sekarang" di bawah untuk memverifikasi respon dari Google Apps Script Anda.'
                : 'Ikuti 4 langkah mudah di bawah untuk membuat Web App di script.google.com dan menyalin URL-nya ke sini.'}
            </p>
          </div>
        </div>

        {isConfigured && (
          <button
            type="button"
            onClick={handleRunTest}
            disabled={testing}
            className="px-4 py-2 text-xs font-bold bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Menguji...' : 'Tes Ulang Koneksi'}</span>
          </button>
        )}
      </div>

      {/* Main Settings Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pengaturan Endpoint Google Apps Script
              </h3>
              <p className="text-xs text-slate-500">
                Data URL dan parameter target penyimpanan Google Drive & Spreadsheet Anda.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-bold text-slate-600">Aktifkan</span>
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => handleFieldChange('enabled', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
          </label>
        </div>

        <div className="space-y-4">
          {/* Web App URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              URL Web App Google Apps Script <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.webAppUrl}
                onChange={(e) => handleFieldChange('webAppUrl', e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              Diperoleh setelah Anda menekan tombol <strong>Deploy &gt; New deployment &gt; Web app</strong> di Google Apps Script.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Folder ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>ID Folder Google Drive (Opsional)</span>
                <span className="text-[10px] text-slate-400 font-normal">Kosong = Otomatis</span>
              </label>
              <div className="relative">
                <Folder className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.folderId || ''}
                  onChange={(e) => handleFieldChange('folderId', e.target.value)}
                  placeholder="Contoh: 1vJ8_kL9mOpQrStUv..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Bila dikosongkan, script otomatis membuat folder bernama <code>[SMPN 1 Bengkalis] Web Assets</code> di Google Drive Anda.
              </p>
            </div>

            {/* Spreadsheet ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>ID Google Spreadsheet Log (Opsional)</span>
                <span className="text-[10px] text-slate-400 font-normal">Pencatatan Riwayat</span>
              </label>
              <div className="relative">
                <FileSpreadsheet className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.spreadsheetId || ''}
                  onChange={(e) => handleFieldChange('spreadsheetId', e.target.value)}
                  placeholder="Contoh: 1BxiMVs0XRA5nFMdKv..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Jika diisi, setiap file foto/dokumen yang diunggah akan otomatis dicatat tanggal, link, dan ukurannya ke Spreadsheet ini.
              </p>
            </div>
          </div>

          {/* Test connection result notice */}
          {testResult && (
            <div
              className={`p-4 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{testResult.message}</p>
                {testResult.latencyMs && (
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Waktu respon server: {testResult.latencyMs} ms
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRunTest}
              disabled={testing || !formData.webAppUrl.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Menguji Koneksi...' : 'Uji Koneksi Web App'}</span>
            </button>

            <span className="text-xs text-slate-400">
              Pengaturan otomatis tersimpan saat Anda mengubah kolom input.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Upload Tester */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Uji Coba Unggah File ke Google Drive Sekarang
            </h3>
            <p className="text-xs text-slate-500">
              Pilih foto uji coba untuk memastikan Apps Script Anda berhasil menyimpan file ke Google Drive dan mengembalikan link CDN.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
          <label className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow flex items-center gap-2 shrink-0">
            <CloudUpload className={`w-4 h-4 ${testUploading ? 'animate-bounce' : ''}`} />
            <span>{testUploading ? 'Sedang Mengunggah...' : 'Pilih Gambar untuk Tes Upload'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={testUploading || !formData.webAppUrl.trim()}
              onChange={handleTestUpload}
              className="hidden"
            />
          </label>

          {!formData.webAppUrl.trim() && (
            <span className="text-xs text-amber-600 font-medium">
              * Isi URL Web App di atas terlebih dahulu untuk mencoba fitur ini.
            </span>
          )}
        </div>

        {testUploadError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{testUploadError}</span>
          </div>
        )}

        {testUploadResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>File Berhasil Diunggah ke Google Drive Anda!</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-3 rounded-lg border border-emerald-100 text-xs">
              <img
                src={testUploadResult.fileUrl}
                alt="Preview Tes"
                className="w-20 h-20 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
              />
              <div className="space-y-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{testUploadResult.fileName}</p>
                <p className="text-[11px] text-slate-500">
                  Ukuran: {Math.round(testUploadResult.size / 1024)} KB | Folder: {testUploadResult.folderName || 'Default'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Log Spreadsheet:{' '}
                  {testUploadResult.sheetLogged ? (
                    <span className="text-emerald-600 font-semibold">Tercatat</span>
                  ) : (
                    <span className="text-slate-400">Tidak disetel</span>
                  )}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={testUploadResult.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>Buka di Google Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={testUploadResult.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>Buka CDN Gambar Langsung</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4-Step Tutorial Deployment Guide */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Panduan 4 Langkah Deploy Google Apps Script
              </h3>
              <p className="text-xs text-slate-500">
                Cukup lakukan sekali saja. Script akan berjalan selamanya dengan akun Google Anda.
              </p>
            </div>
          </div>

          <a
            href="https://script.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Buka script.google.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <h4 className="font-bold text-xs text-slate-800">
                Buat Proyek Baru di Google Apps Script
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Buka <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">script.google.com</a> dengan akun Google sekolah Anda, lalu klik <strong>New Project (Proyek Baru)</strong>. Beri nama proyek misalnya <em>"SMPN 1 Bengkalis Drive API"</em>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <h4 className="font-bold text-xs text-slate-800">
                Salin & Tempel Kode Script
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Hapus isi file <code>Code.gs</code> yang sudah ada, lalu klik tombol <strong>"Salin Seluruh Kode Apps Script"</strong> di bawah dan tempelkan (Paste) seluruh kode tersebut ke editor. Simpan dengan menekan ikon Disket (Save).
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <h4 className="font-bold text-xs text-amber-950">
                Deploy Sebagai Web App (Kunci Utama)
              </h4>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed pl-8">
              Klik menu <strong>Deploy (Terapkan) &gt; New deployment (Penerapan baru)</strong>.
              Pilih tipe ikon roda gigi <strong>Web app (Aplikasi web)</strong>.
              <br />
              Atur tepat seperti ini:
              <br />
              • <strong>Execute as:</strong> <code>Me (Akun saya)</code>
              <br />
              • <strong>Who has access:</strong> <code>Anyone (Siapa saja)</code>
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <h4 className="font-bold text-xs text-emerald-950">
                Salin URL Web App & Selesai!
              </h4>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed pl-8">
              Klik <strong>Deploy</strong>, lalu berikan izin akses Google Drive Anda (klik <em>Advanced &gt; Go to ... (unsafe)</em>). Salin <strong>Web App URL</strong> yang dihasilkan (akhiran <code>/exec</code>), lalu tempelkan ke kolom URL di atas.
            </p>
          </div>
        </div>
      </div>

      {/* Code Snippet Box with 1-Click Copy */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 overflow-hidden shadow-lg space-y-0">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-mono text-slate-400 ml-2">Code.gs (Google Apps Script)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {showCode ? 'Sembunyikan Kode' : 'Tampilkan Kode'}
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Kode Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Seluruh Kode Apps Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showCode && (
          <div className="p-4 overflow-x-auto max-h-96 text-xs font-mono leading-relaxed text-slate-300 bg-slate-950/90 select-all">
            <pre>{SAMPLE_APPS_SCRIPT_CODE}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
