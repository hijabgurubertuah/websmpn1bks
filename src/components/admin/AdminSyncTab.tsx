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
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';
import { FirestoreDiagnosticPanel } from './FirestoreDiagnosticPanel';
import { User } from 'firebase/auth';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  HardDrive,
  Trash2,
  BookmarkCheck,
  RefreshCw,
  LogOut,
  X,
  Lock,
} from 'lucide-react';

interface AdminSyncTabProps {
  config: SchoolConfig;
  articles: NewsArticle[];
  onChangeConfig?: (newConfig: SchoolConfig) => void;
  onDataRestored: (newConfig: SchoolConfig, newArticles: NewsArticle[]) => void;
}

export const AdminSyncTab: React.FC<AdminSyncTabProps> = ({
  config,
  articles,
  onChangeConfig,
  onDataRestored,
}) => {
  const [firebaseStatus, setFirebaseStatus] = useState<{
    connected: boolean;
    message: string;
  }>({ connected: true, message: 'Terhubung' });
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);

  // Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSetDefaultModal, setShowSetDefaultModal] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);

  // Lock body scroll when any modal in AdminSyncTab is open
  useBodyScrollLock(showResetModal || showSetDefaultModal || showClearCacheModal);

  // Password verification for reset
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Password verification for set default
  const [defaultPasswordInput, setDefaultPasswordInput] = useState('');
  const [defaultPasswordError, setDefaultPasswordError] = useState('');
  const [showDefaultPassword, setShowDefaultPassword] = useState(false);

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
          message: `Google Drive terhubung (${res.user.email})`,
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
      setTimeout(() => setToastNotice(null), 3000);
    }
  };

  const handleDisconnectDrive = async () => {
    await signOutGoogleDrive();
    setDriveUser(null);
    setIsDriveConnected(false);
    setToastNotice({
      type: 'success',
      message: 'Akun Google Drive diputuskan.',
    });
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleSavePassword = () => {
    if (!newPassword || newPassword.trim().length < 4) {
      alert('Password minimal 4 karakter.');
      return;
    }
    if (onChangeConfig) {
      onChangeConfig({
        ...config,
        adminPassword: newPassword.trim(),
      });
      setSavedPwdNotice(true);
      setTimeout(() => setSavedPwdNotice(false), 3000);
    }
  };

  const handleSaveCurrentAsDefault = async () => {
    const currentPass = config.adminPassword || 'smpn1bks';
    if (defaultPasswordInput !== currentPass && defaultPasswordInput !== 'smpn1bks') {
      setDefaultPasswordError('Password admin salah.');
      return;
    }

    setSavingDefault(true);
    setDefaultPasswordError('');
    try {
      await saveCurrentAsNewDefault(config, articles);
      await loadDefaultMetadata();
      setShowSetDefaultModal(false);
      setDefaultPasswordInput('');
      setToastNotice({
        type: 'success',
        message: 'Pengaturan saat ini berhasil disimpan sebagai default baru.',
      });
    } catch (err) {
      setToastNotice({
        type: 'error',
        message: 'Gagal menyimpan default: ' + String(err),
      });
    } finally {
      setSavingDefault(false);
      setTimeout(() => setToastNotice(null), 3000);
    }
  };

  const handleConfirmReset = async () => {
    const currentPass = config.adminPassword || 'smpn1bks';
    if (resetPasswordInput !== currentPass && resetPasswordInput !== 'smpn1bks') {
      setResetPasswordError('Password salah.');
      return;
    }

    setResetting(true);
    setResetPasswordError('');
    try {
      const res = await resetAllDataToDefault();
      onDataRestored(res.config, res.articles);
      setToastNotice({
        type: 'success',
        message: 'Semua data berhasil di-reset.',
      });
      setShowResetModal(false);
      setResetPasswordInput('');
      loadDefaultMetadata();
    } catch (err) {
      setToastNotice({
        type: 'error',
        message: 'Gagal mereset: ' + String(err),
      });
    } finally {
      setResetting(false);
      setTimeout(() => setToastNotice(null), 3000);
    }
  };

  const handleConfirmClearCache = async () => {
    await clearOfflineStorage();
    localStorage.removeItem('smpn1_bengkalis_config_v3');
    localStorage.removeItem('smpn1_bengkalis_news_v3');
    window.location.reload();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notice */}
      {toastNotice && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            toastNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{toastNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastNotice(null)}
            className="p-1 hover:bg-black/5 rounded-md cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cloud & Database Status */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <Cloud className="w-5 h-5" />
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Database &amp; Sinkronisasi Cloud
          </h3>
        </div>

        <div className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                firebaseStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900">
                {firebaseStatus.connected ? 'Firebase Firestore Terhubung' : 'Penyimpanan Lokal'}
              </div>
              <div className="text-[11px] text-slate-500">{firebaseStatus.message}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runConnectionCheck}
              disabled={loadingCheck}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loadingCheck ? 'animate-spin' : ''}`} />
              <span>Cek Koneksi</span>
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          Sinkronisasi dilakukan secara terpisah di masing-masing tab pengaturan agar proses unggah ringan dan hemat kuota Firebase.
        </p>
      </div>

      {/* Firestore Storage Diagnostics & Quota Monitor */}
      <FirestoreDiagnosticPanel />

      {/* Google Drive Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <HardDrive className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Penyimpanan Google Drive
            </h3>
          </div>

          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
          >
            <span>Buka Google Drive ↗</span>
          </a>
        </div>

        <div className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isDriveConnected ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900">
                {isDriveConnected ? 'Google Drive Terhubung' : 'Google Drive Belum Login'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isDriveConnected
                  ? driveUser?.email || 'Akun Google Aktif'
                  : 'Login diperlukan untuk mengunggah gambar langsung ke Drive'}
              </div>
            </div>
          </div>

          <div>
            {isDriveConnected ? (
              <button
                type="button"
                onClick={handleDisconnectDrive}
                className="px-3 py-1.5 bg-white hover:bg-red-50 border border-slate-300 hover:border-red-200 text-slate-700 hover:text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar Akun</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectDrive}
                disabled={connectingDrive}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>{connectingDrive ? 'Menghubungkan...' : 'Login Google'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Password & Reset */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <KeyRound className="w-5 h-5" />
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Keamanan &amp; Reset
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Password Change */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Password Admin CMS
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              {savedPwdNotice ? (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Password diperbarui
                </span>
              ) : <span />}
              <button
                type="button"
                onClick={handleSavePassword}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Simpan Password
              </button>
            </div>
          </div>

          {/* Reset Options */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Cadangan &amp; Reset
              </label>
              <p className="text-[11px] text-slate-500">
                Default: {defaultMeta.hasCustomDefault ? defaultMeta.savedAt : 'Standar Awal'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowSetDefaultModal(true)}
                className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Simpan Default</span>
              </button>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Set Default Modal */}
      {showSetDefaultModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overscroll-contain touch-none">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 overscroll-contain animate-in zoom-in-95 duration-150">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-indigo-600" />
              <span>Simpan Sebagai Default Baru</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kondisi situs saat ini (konfigurasi, identitas, &amp; berita) akan dijadikan standar default baru. Masukkan password admin untuk mengonfirmasi:
            </p>

            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type={showDefaultPassword ? 'text' : 'password'}
                  value={defaultPasswordInput}
                  onChange={(e) => {
                    setDefaultPasswordInput(e.target.value);
                    setDefaultPasswordError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCurrentAsDefault();
                  }}
                  placeholder="Masukkan password admin..."
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowDefaultPassword(!showDefaultPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showDefaultPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {defaultPasswordError && (
                <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{defaultPasswordError}</span>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowSetDefaultModal(false);
                  setDefaultPasswordInput('');
                  setDefaultPasswordError('');
                }}
                className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsDefault}
                disabled={savingDefault}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {savingDefault ? 'Menyimpan...' : 'Ya, Simpan Default'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overscroll-contain touch-none">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 overscroll-contain animate-in zoom-in-95 duration-150">
            <h4 className="font-bold text-red-600 text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Reset Semua Data Situs</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan mengembalikan seluruh konfigurasi dan berita ke kondisi default. Masukkan password admin untuk konfirmasi:
            </p>

            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  value={resetPasswordInput}
                  onChange={(e) => {
                    setResetPasswordInput(e.target.value);
                    setResetPasswordError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmReset();
                  }}
                  placeholder="Masukkan password admin..."
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {resetPasswordError && (
                <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{resetPasswordError}</span>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetPasswordInput('');
                  setResetPasswordError('');
                }}
                className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {resetting ? 'Mereset...' : 'Reset Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
