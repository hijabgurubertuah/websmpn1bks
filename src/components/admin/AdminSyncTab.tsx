import React, { useState, useEffect } from 'react';
import { SchoolConfig, NewsArticle } from '../../types';
import { checkFirebaseConnection, resetAllDataToDefault } from '../../lib/firebase';
import { Database, Cloud, Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AdminSyncTabProps {
  config: SchoolConfig;
  articles: NewsArticle[];
  onChangeConfig?: (newConfig: SchoolConfig) => void;
  onManualSave: () => Promise<void>;
  onDataRestored: (newConfig: SchoolConfig, newArticles: NewsArticle[]) => void;
}

export const AdminSyncTab: React.FC<AdminSyncTabProps> = ({
  config,
  articles,
  onChangeConfig,
  onManualSave,
  onDataRestored,
}) => {
  const [firebaseStatus, setFirebaseStatus] = useState<{
    connected: boolean;
    message: string;
  }>({ connected: true, message: 'Memeriksa status database...' });
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState(config.adminPassword || 'smpn1bks');
  const [showPwd, setShowPwd] = useState(false);
  const [savedPwdNotice, setSavedPwdNotice] = useState(false);

  const runConnectionCheck = async () => {
    setLoadingCheck(true);
    const result = await checkFirebaseConnection();
    setFirebaseStatus(result);
    setLoadingCheck(false);
  };

  useEffect(() => {
    runConnectionCheck();
  }, []);

  const handleExportJson = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      schoolConfig: config,
      newsArticles: articles,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-portal-sekolah-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.schoolConfig && Array.isArray(parsed.newsArticles)) {
            onDataRestored(parsed.schoolConfig, parsed.newsArticles);
            alert('Data backup berhasil dipulihkan!');
          } else {
            alert('Format file cadangan tidak valid.');
          }
        } catch (err) {
          alert('Gagal membaca file JSON: ' + String(err));
        }
      };
    }
  };

  const handleReset = async () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengatur ulang semua data website kembali ke setelan default awal? Perubahan kustom yang belum diekspor akan hilang.'
      )
    ) {
      setResetting(true);
      const { config: defConfig, articles: defArticles } = await resetAllDataToDefault();
      onDataRestored(defConfig, defArticles);
      setResetting(false);
      alert('Semua data berhasil di-reset ke pengaturan standar sekolah!');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Firebase Status */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <span>Konektivitas Firebase Firestore</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Status penyimpanan cloud Firestore untuk sinkronisasi data antar perangkat dan pengunjung.
          </p>
        </div>

        <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                firebaseStatus.connected
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {firebaseStatus.connected ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">
                {firebaseStatus.connected ? 'Firestore Cloud Aktif' : 'Penyimpanan Lokal Aktif'}
              </div>
              <div className="text-xs text-slate-500">{firebaseStatus.message}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runConnectionCheck}
              disabled={loadingCheck}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCheck ? 'animate-spin' : ''}`} />
              <span>Tes Koneksi</span>
            </button>
            <button
              type="button"
              onClick={onManualSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sinkronkan Sekarang</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-1">
          <span className="font-bold text-blue-900 block">Informasi Sinkronisasi Hybrid:</span>
          <p>
            Sistem ini menggunakan arsitektur hybrid cerdas. Setiap kali Anda mengubah isi web atau mengunggah berita, data langsung tersimpan di penyimpanan browser lokal dan secara paralel disinkronkan ke dokumen Firestore di Firebase.
          </p>
        </div>
      </div>

      {/* Admin Password Management Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <span>Kata Sandi Login Portal Admin</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Kata sandi yang digunakan staf atau administrator untuk membuka portal CMS pengelola web.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                Kata Sandi Saat Ini
              </span>
              <div className="flex items-center gap-2">
                <div className="relative inline-block">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="smpn1bks"
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-800 pr-10 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onChangeConfig) {
                      onChangeConfig({
                        ...config,
                        adminPassword: newPassword.trim() || 'smpn1bks',
                      });
                    }
                    setSavedPwdNotice(true);
                    setTimeout(() => setSavedPwdNotice(false), 3000);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Perbarui Sandi
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-white/80 p-3 rounded-lg border border-amber-200/60 max-w-sm">
              <span className="font-bold text-slate-800 block mb-0.5">Password Default:</span>
              <span className="font-mono bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">smpn1bks</span> (aktif dan dapat digunakan langsung untuk login).
            </div>
          </div>

          {savedPwdNotice && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100/80 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Kata sandi admin berhasil diperbarui dan disinkronkan ke sistem!</span>
            </div>
          )}
        </div>
      </div>

      {/* Backup & Restore JSON */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Cadangan &amp; Pemulihan Data (Backup &amp; Restore)</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Ekspor seluruh konfigurasi dan berita ke file JSON untuk cadangan, atau pulihkan kembali kapan saja.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Ekspor Data
            </span>
            <p className="text-xs text-slate-500">
              Unduh seluruh konfigurasi header, menu, berita, dan footer ke komputer Anda dalam format file .JSON.
            </p>
            <button
              type="button"
              onClick={handleExportJson}
              className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Unduh Cadangan (.JSON)</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Impor / Pulihkan
            </span>
            <p className="text-xs text-slate-500">
              Unggah file cadangan .JSON yang pernah Anda ekspor sebelumnya untuk memulihkan seluruh konten.
            </p>
            <label className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Pilih File Cadangan</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Reset to Default */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-red-600 text-sm block">Setel Ulang ke Pengaturan Default</span>
            <span className="text-xs text-slate-500">
              Kembalikan semua teks, menu, dan berita ke data template awal SMAN 1 Nusantara.
            </span>
          </div>
          <button
            type="button"
            disabled={resetting}
            onClick={handleReset}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            {resetting ? 'Mereset...' : 'Reset ke Data Awal'}
          </button>
        </div>

      </div>

    </div>
  );
};
