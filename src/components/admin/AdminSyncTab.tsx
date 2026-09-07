import React, { useState, useEffect } from 'react';
import { SchoolConfig, NewsArticle } from '../../types';
import {
  checkFirebaseConnection,
  resetAllDataToDefault,
  saveCurrentAsNewDefault,
  getCustomDefaultMeta,
} from '../../lib/firebase';
import { clearOfflineStorage } from '../../lib/offlineStorage';
import {
  signInWithGoogleDrive,
  signOutGoogleDrive,
  initDriveAuth,
  getDriveAccessToken,
} from '../../lib/googleDrive';
import { User } from 'firebase/auth';
import {
  Database,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  HardDrive,
  Zap,
  Sparkles,
  Trash2,
  BookmarkCheck,
  Server,
  Lock,
  Info,
  ExternalLink,
  LogOut,
  FolderCheck,
} from 'lucide-react';

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
  const [savingDefault, setSavingDefault] = useState(false);

  // Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSetDefaultModal, setShowSetDefaultModal] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);

  // Password verification for reset
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Admin password change
  const [newPassword, setNewPassword] = useState(config.adminPassword || 'smpn1bks');
  const [showPwd, setShowPwd] = useState(false);
  const [savedPwdNotice, setSavedPwdNotice] = useState(false);

  // Custom default meta
  const [defaultMeta, setDefaultMeta] = useState<{
    hasCustomDefault: boolean;
    savedAt?: string;
  }>({ hasCustomDefault: false });

  const [toastNotice, setToastNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Google Drive state
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(false);
  const [connectingDrive, setConnectingDrive] = useState(false);

  const runConnectionCheck = async () => {
    setLoadingCheck(true);
    const result = await checkFirebaseConnection();
    setFirebaseStatus(result);
    setLoadingCheck(false);
  };

  const loadDefaultMetadata = async () => {
    const meta = await getCustomDefaultMeta();
    setDefaultMeta(meta);
  };

  useEffect(() => {
    runConnectionCheck();
    loadDefaultMetadata();

    const unsubscribe = initDriveAuth(
      (user, token) => {
        setDriveUser(user);
        setIsDriveConnected(Boolean(token));
      },
      () => {
        setDriveUser(null);
        setIsDriveConnected(Boolean(getDriveAccessToken()));
      }
    );

    return () => unsubscribe();
  }, []);

  const handleConnectDrive = async () => {
    setConnectingDrive(true);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setDriveUser(res.user);
        setIsDriveConnected(true);
        setToastNotice({
          type: 'success',
          message: `Google Drive berhasil dihubungkan (${res.user.email})!`,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setToastNotice({
        type: 'error',
        message: 'Gagal menghubungkan Google Drive: ' + errorMsg,
      });
    } finally {
      setConnectingDrive(false);
      setTimeout(() => setToastNotice(null), 4000);
    }
  };

  const handleDisconnectDrive = async () => {
    await signOutGoogleDrive();
    setDriveUser(null);
    setIsDriveConnected(false);
    setToastNotice({
      type: 'success',
      message: 'Akun Google Drive berhasil diputuskan.',
    });
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleExportJson = () => {
    const backupData = {
      version: '3.0',
      school: 'SMP Negeri 1 Bengkalis',
      npsn: '10495146',
      exportedAt: new Date().toISOString(),
      schoolConfig: config,
      newsArticles: articles,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-smpn1-bengkalis-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToastNotice({
      type: 'success',
      message: 'File cadangan .JSON SMP Negeri 1 Bengkalis berhasil diunduh.',
    });
    setTimeout(() => setToastNotice(null), 4000);
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
            setToastNotice({
              type: 'success',
              message: 'Data cadangan berhasil dipulihkan ke website!',
            });
          } else {
            setToastNotice({
              type: 'error',
              message: 'Format file cadangan tidak valid atau tidak lengkap.',
            });
          }
        } catch (err) {
          setToastNotice({
            type: 'error',
            message: 'Gagal membaca file JSON: ' + String(err),
          });
        }
        setTimeout(() => setToastNotice(null), 4000);
      };
    }
  };

  // Handle "Jadikan Default" (Save current state as new active default template)
  const handleConfirmSetDefault = async () => {
    setSavingDefault(true);
    try {
      const res = await saveCurrentAsNewDefault(config, articles);
      if (res.success) {
        setDefaultMeta({
          hasCustomDefault: true,
          savedAt: res.savedAt,
        });
        setToastNotice({
          type: 'success',
          message: `Pengaturan dan isi saat ini berhasil dijadikan sebagai Default Baru (${res.savedAt})!`,
        });
      }
    } catch (err) {
      setToastNotice({
        type: 'error',
        message: 'Gagal menetapkan default baru: ' + String(err),
      });
    } finally {
      setSavingDefault(false);
      setShowSetDefaultModal(false);
      setTimeout(() => setToastNotice(null), 5000);
    }
  };

  // Handle Reset with Password
  const handleConfirmResetWithPassword = async () => {
    const validPassword = (config.adminPassword || 'smpn1bks').trim();
    if (resetPasswordInput.trim() !== validPassword) {
      setResetPasswordError('Kata sandi admin salah! Reset dibatalkan demi keamanan.');
      return;
    }

    setResetting(true);
    setResetPasswordError('');
    try {
      const res = await resetAllDataToDefault();
      onDataRestored(res.config, res.articles);
      setToastNotice({
        type: 'success',
        message: res.isCustomDefault
          ? `Semua data berhasil di-reset ke Default Terakhir yang pernah disimpan (${res.savedAt || 'Tersimpan'})!`
          : 'Semua data berhasil di-reset ke Data Standar Awal SMP Negeri 1 Bengkalis!',
      });
      setShowResetModal(false);
      setResetPasswordInput('');
      loadDefaultMetadata();
    } catch (err) {
      setToastNotice({
        type: 'error',
        message: 'Gagal mereset data: ' + String(err),
      });
    } finally {
      setResetting(false);
      setTimeout(() => setToastNotice(null), 5000);
    }
  };

  const handleConfirmClearCache = async () => {
    await clearOfflineStorage();
    localStorage.removeItem('smpn1_bengkalis_config_v3');
    localStorage.removeItem('smpn1_bengkalis_news_v3');
    window.location.reload();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notice */}
      {toastNotice && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition-all ${
            toastNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{toastNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastNotice(null)}
            className="p-1 hover:bg-black/5 rounded-md cursor-pointer"
          >
            <EyeOff className="w-4 h-4 opacity-0" />
          </button>
        </div>
      )}

      {/* Identitas Default Sekolah Info Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-blue-500/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Data Dasar Sekolah
              </span>
              <span className="text-xs text-slate-300 font-mono">NPSN: 10495146</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              SMP Negeri 1 Bengkalis
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Alamat: Jl. Pertanian, Bengkalis Kota, Kec. Bengkalis, Kab. Bengkalis, Riau 28712
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-400 block">Status Template Default:</span>
              <span className="text-xs font-bold text-emerald-400">
                {defaultMeta.hasCustomDefault
                  ? `Kustom (${defaultMeta.savedAt})`
                  : 'Standar SMPN 1 Bengkalis'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Firebase Status & Kapasitas Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <span>Konektivitas &amp; Kapasitas Firebase Firestore</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Status konektivitas dan rincian kuota kapasitas Google Cloud Firebase Firestore untuk website sekolah.
          </p>
        </div>

        {/* Live Status */}
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
                {firebaseStatus.connected ? 'Firestore Cloud Aktif' : 'Penyimpanan Offline Aktif'}
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sinkronkan Sekarang</span>
            </button>
          </div>
        </div>

        {/* Rincian Kapasitas Firebase */}
        <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-700" />
            <h4 className="font-bold text-sm text-blue-950">
              Rincian Kapasitas &amp; Kuota Firebase Firestore (Spark Plan Gratis):
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-blue-100/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Penyimpanan (Storage)
              </span>
              <div className="text-base font-extrabold text-blue-700">1 GB (Gratis)</div>
              <p className="text-[11px] text-slate-500">
                Mampu menampung puluhan ribu artikel berita dan data konfigurasi teks sekolah.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Baca Harian (Reads)
              </span>
              <div className="text-base font-extrabold text-emerald-700">50.000 Dokumen / Hari</div>
              <p className="text-[11px] text-slate-500">
                Didukung cache IndexedDB sehingga pengunjung berulang memakai 0 kuota baca.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tulis Harian (Writes)
              </span>
              <div className="text-base font-extrabold text-indigo-700">20.000 Dokumen / Hari</div>
              <p className="text-[11px] text-slate-500">
                Sangat melimpah untuk publikasi berita, pembaruan agenda, dan konfigurasi.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Bandwidth Keluar (Egress)
              </span>
              <div className="text-base font-extrabold text-purple-700">10 GB / Bulan</div>
              <p className="text-[11px] text-slate-500">
                Kapasitas transfer data bulanan serverless Google Cloud tingkat enterprise.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Drive Cloud Storage Integration Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-600" />
              <span>Integrasi Google Drive (Penyimpanan Foto &amp; Media)</span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Foto postingan dan aset media otomatis diunggah ke Google Drive Anda (15 GB gratis) dan dikonversi ke CDN publik, menjaga kuota Firestore tetap hemat 100%.
            </p>
          </div>

          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 self-start sm:self-auto bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Google Drive ↗</span>
          </a>
        </div>

        {/* Live Drive Status Box */}
        <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/50 to-slate-50 border-blue-100">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDriveConnected
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>{isDriveConnected ? 'Google Drive Terhubung' : 'Google Drive Belum Terhubung'}</span>
                {isDriveConnected && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Aktif
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {isDriveConnected ? (
                  <>
                    Akun: <strong className="text-slate-800">{driveUser?.email || 'Akun Google Anda'}</strong> • Folder:{' '}
                    <strong className="text-blue-700 font-mono">[SMPN 1 Bengkalis] Web Assets</strong>
                  </>
                ) : (
                  'Hubungkan akun Google untuk mengaktifkan unggah gambar otomatis 1-klik dari panel admin.'
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDriveConnected ? (
              <button
                type="button"
                onClick={handleDisconnectDrive}
                className="px-3.5 py-2 bg-white hover:bg-red-50 border border-slate-300 hover:border-red-200 text-slate-700 hover:text-red-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Putuskan Akun</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectDrive}
                disabled={connectingDrive}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>{connectingDrive ? 'Menghubungkan...' : 'Hubungkan Google Drive'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Keunggulan Arsitektur Google Drive + Firebase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <FolderCheck className="w-4 h-4 text-emerald-600" />
              <span>Otomatis Buat Folder &amp; Izin</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Sistem otomatis membuat folder <strong>[SMPN 1 Bengkalis] Web Assets</strong> di Google Drive Anda dan mengatur izin tayang publik secara otomatis.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Auto-Converter CDN Publik</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Setiap foto yang diunggah langsung diubah ke tautan CDN berkecepatan tinggi (<code>lh3.googleusercontent.com</code>) sehingga dapat dilihat langsung oleh publik tanpa login.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>15 GB Ruang Bebas Biaya</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Memanfaatkan 15 GB kuota Google Drive Anda untuk menampung ribuan foto beresolusi tinggi tanpa membebani kuota Firebase Firestore.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-600" />
            <span>Manajemen Template Default &amp; Reset Sistem</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Jadikan kondisi web saat ini sebagai patokan default baru, atau reset sistem kembali ke snapshot default yang dilindungi kata sandi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card: Jadikan Default Baru */}
          <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-2xs">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-indigo-950">
                  Jadikan Pengaturan Saat Ini Sebagai Default
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Menyimpan seluruh konfigurasi sekolah, susunan menu, tautan, dan seluruh berita saat ini sebagai <strong>patokan Template Default yang Baru</strong>. Template lama akan digantikan. Jika di kemudian hari dilakukan reset, website akan kembali ke snapshot ini.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-indigo-100">
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Snapshot Aktif Saat Ini:</span>
                <span className="font-bold text-indigo-700">
                  {defaultMeta.hasCustomDefault ? defaultMeta.savedAt : 'SMP Negeri 1 Bengkalis (Standar)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSetDefaultModal(true)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Jadikan Default Baru</span>
              </button>
            </div>
          </div>

          {/* Card: Reset ke Default dengan Password */}
          <div className="p-5 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50/50 to-white flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-600 text-white shadow-2xs">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-red-950">
                  Reset ke Data Default (Dilindungi Sandi)
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mengembalikan seluruh data, berita, dan konfigurasi website ke <strong>Template Default Terakhir</strong> (yang pernah Anda tetapkan sebagai default baru). Diwajibkan memasukkan kata sandi admin untuk mencegah ketidaksengajaan.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-red-100">
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Keamanan Reset:</span>
                <span className="font-bold text-red-700 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Wajib Password Admin
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetPasswordInput('');
                  setResetPasswordError('');
                  setShowResetModal(true);
                }}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset ke Default (Password)</span>
              </button>
            </div>
          </div>
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
            Kata sandi yang digunakan staf atau administrator untuk membuka portal CMS dan mereset data.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                Kata Sandi Admin
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
              <span className="font-mono bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">smpn1bks</span> (aktif untuk SMP Negeri 1 Bengkalis).
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
            <span>Cadangan &amp; Pemulihan Berkas Offline (.JSON)</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Ekspor seluruh konfigurasi dan berita ke file JSON untuk cadangan manual di komputer, atau pulihkan kembali kapan saja.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Ekspor Data Sekolah
            </span>
            <p className="text-xs text-slate-500">
              Unduh seluruh konfigurasi header, menu, berita, dan footer SMPN 1 Bengkalis ke komputer Anda (.JSON).
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

        {/* Clear Cache Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Ingin mengosongkan cache browser dan memuat ulang data segar dari Firestore?
          </span>
          <button
            type="button"
            onClick={() => setShowClearCacheModal(true)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
          >
            Bersihkan Cache Lokal &amp; Muat Ulang
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi "Jadikan Default Baru" */}
      {showSetDefaultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Jadikan Pengaturan Saat Ini Sebagai Default?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Semua isi, profil SMP Negeri 1 Bengkalis, berita, agenda, dan tata letak saat ini akan dijadikan sebagai <strong>patokan Template Default yang Baru</strong>.
                </p>
                <div className="p-3 bg-indigo-50 rounded-lg text-[11px] text-indigo-900 border border-indigo-100">
                  <Info className="w-3.5 h-3.5 inline mr-1 text-indigo-600" />
                  Jika di kemudian hari Anda menekan tombol <strong>Reset Default</strong>, data website akan kembali persis seperti kondisi saat ini.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSetDefaultModal(false)}
                disabled={savingDefault}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSetDefault}
                disabled={savingDefault}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {savingDefault ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan Default...</span>
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Ya, Jadikan Default Baru</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Reset Data dengan Validasi Password */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Reset Semua Data ke Default?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Data website akan dikembalikan ke <strong>{defaultMeta.hasCustomDefault ? `Template Default Baru (${defaultMeta.savedAt})` : 'Data Standar SMP Negeri 1 Bengkalis'}</strong>.
                </p>
              </div>
            </div>

            {/* Password verification input */}
            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
              <label className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-600" />
                <span>Masukkan Kata Sandi Admin untuk Konfirmasi:</span>
              </label>
              
              <div className="relative">
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  value={resetPasswordInput}
                  onChange={(e) => {
                    setResetPasswordInput(e.target.value);
                    setResetPasswordError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirmResetWithPassword();
                    }
                  }}
                  placeholder="Masukkan kata sandi admin..."
                  className="w-full px-3 py-2 bg-white border border-red-300 rounded-lg text-xs font-mono font-bold text-slate-800 pr-10 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {resetPasswordError && (
                <div className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{resetPasswordError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetPasswordInput('');
                  setResetPasswordError('');
                }}
                disabled={resetting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmResetWithPassword}
                disabled={resetting || !resetPasswordInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {resetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mereset Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Konfirmasi &amp; Reset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Bersihkan Cache Browser */}
      {showClearCacheModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Bersihkan Cache &amp; Muat Ulang?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Cache memori lokal browser Anda (IndexedDB &amp; LocalStorage) akan dikosongkan, lalu halaman akan dimuat ulang untuk mengambil versi terbaru langsung dari cloud Firebase.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearCacheModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClearCache}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Bersihkan &amp; Muat Ulang</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
