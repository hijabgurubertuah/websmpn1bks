import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, X } from 'lucide-react';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  configuredPassword?: string;
  schoolName: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  configuredPassword = 'smpn1bks',
  schoolName,
}) => {
  // Lock body scroll while login modal is open
  useBodyScrollLock(isOpen);

  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    // Target password (configured or default 'smpn1bks')
    const targetPassword = (configuredPassword || 'smpn1bks').trim();

    setTimeout(() => {
      if (inputPassword.trim() === targetPassword) {
        // Save session state
        if (rememberSession) {
          localStorage.setItem('admin_authenticated', 'true');
        } else {
          sessionStorage.setItem('admin_authenticated', 'true');
        }
        setIsSubmitting(false);
        setInputPassword('');
        onSuccess();
      } else {
        setIsSubmitting(false);
        setErrorMsg('Kata sandi salah. Silakan coba kembali.');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overscroll-contain touch-none animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative overscroll-contain animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 mb-4 shadow-inner">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Keamanan Administrator
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
              <ShieldCheck className="w-3 h-3" />
              Terkunci
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Login Portal Admin
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {schoolName} — Masukkan kata sandi administrator untuk mengelola konten, tata letak, dan berita.
          </p>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium animate-in shake duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="admin-password-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Kata Sandi Admin *
            </label>
            <div className="relative">
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
              <span>Akses dibatasi khusus staf pengelola web sekolah.</span>
            </p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Ingat sesi masuk di browser ini</span>
            </label>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer order-2 sm:order-1"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !inputPassword}
              className="w-full sm:w-2/3 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
            >
              <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk Panel Admin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
