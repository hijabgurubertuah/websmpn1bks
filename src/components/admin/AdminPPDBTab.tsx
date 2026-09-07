import React from 'react';
import { SchoolConfig, PPDBConfig } from '../../types';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Link2,
  ExternalLink,
  Calendar,
  Phone,
  FileText,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AdminPPDBTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminPPDBTab: React.FC<AdminPPDBTabProps> = ({ config, onChange }) => {
  // Default values fallback
  const ppdb: PPDBConfig = config.ppdb || {
    enabled: true,
    buttonLabel: 'Info PPDB 2026',
    buttonLink: '#berita',
    openInNewTab: false,
    academicYear: '2026/2027',
    statusText: 'Pendaftaran Dibuka',
    badgeText: 'Tahun Ajaran 2026/2027',
    announcement: 'Penerimaan Peserta Didik Baru (PPDB) SMP Negeri 1 Bengkalis melalui jalur Zonasi, Afirmasi, dan Prestasi.',
    contactPerson: '0812-7561-8899 (Panitia PPDB)',
    brochureUrl: '',
  };

  const updatePPDB = (updates: Partial<PPDBConfig>) => {
    onChange({
      ...config,
      ppdb: {
        ...ppdb,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Overview & Master Switch Banner */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border shadow-xs transition-all ${
          ppdb.enabled
            ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white border-blue-200'
            : 'bg-slate-50 border-slate-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Penerimaan Peserta Didik Baru (PPDB)</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Status Tombol &amp; Fitur PPDB di Website</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Karena PPDB bersifat musiman dan tidak dibuka sepanjang tahun, Anda dapat menyembunyikan tombol PPDB di bilah menu atas dengan sekali klik tanpa perlu menghapus pengaturan menu.
            </p>
          </div>

          {/* Master Toggle Button */}
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => updatePPDB({ enabled: !ppdb.enabled })}
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer ${
                ppdb.enabled
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-slate-700 hover:bg-slate-800 text-white shadow-slate-700/20'
              }`}
            >
              {ppdb.enabled ? (
                <>
                  <Eye className="w-5 h-5" />
                  <span>PPDB Aktif (Tombol Tampil)</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-5 h-5" />
                  <span>PPDB Sembunyi (Tombol Disembunyikan)</span>
                </>
              )}
            </button>
            <span className="text-[11px] font-semibold text-slate-500">
              Status website: {ppdb.enabled ? '🟢 Tampil di Navbar' : '⚪ Disembunyikan dari Publik'}
            </span>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="mt-6 pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Tampilan Saat Ini:</span>
            {ppdb.enabled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tombol PPDB muncul di Header &amp; Menu Mobile
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200 text-slate-700 font-bold border border-slate-300">
                <EyeOff className="w-3.5 h-3.5" />
                Tombol PPDB disembunyikan (Tidak terlihat oleh pengunjung)
              </span>
            )}
          </div>
          <span className="text-slate-400">•</span>
          <div className="text-slate-600">
            Tahun Ajaran: <strong className="text-slate-900">{ppdb.academicYear || '-'}</strong>
          </div>
          <span className="text-slate-400">•</span>
          <div className="text-slate-600">
            Status: <strong className="text-slate-900">{ppdb.statusText || '-'}</strong>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
        
        {/* Section 1: Button Display & Target */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Link2 className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-base">
              Pengaturan Tombol Navigasi PPDB
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Teks / Label Tombol di Menu Atas</span>
                <span className="text-slate-400 font-normal text-[11px]">Wajib diisi</span>
              </label>
              <input
                type="text"
                value={ppdb.buttonLabel}
                onChange={(e) => updatePPDB({ buttonLabel: e.target.value })}
                placeholder="Contoh: Info PPDB 2026 atau Pendaftaran PPDB"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500">
                Label tombol yang akan terlihat di pojok kanan bilah navigasi website.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Link Target / URL Tujuan Tombol</span>
                <span className="text-slate-400 font-normal text-[11px]">Bisa hash (#) atau link web</span>
              </label>
              <input
                type="text"
                value={ppdb.buttonLink}
                onChange={(e) => updatePPDB({ buttonLink: e.target.value })}
                placeholder="Contoh: #berita atau https://siap-ppdb.com/ atau Google Form"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500">
                Gunakan <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">#berita</code> untuk mengarahkan ke postingan berita, atau masukkan link formulir eksternal.
              </p>
            </div>
          </div>

          {/* Open in New Tab Toggle */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>Buka Tautan di Tab Baru (target="_blank")</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Aktifkan jika link tujuan adalah formulir Google Form, link Google Drive, atau website luar agar pengunjung tidak meninggalkan website sekolah.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ppdb.openInNewTab || false}
                onChange={(e) => updatePPDB({ openInNewTab: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Section 2: Info & Informasi Tambahan */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-slate-900 text-base">
              Detail Status &amp; Informasi PPDB
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tahun Ajaran PPDB</label>
              <input
                type="text"
                value={ppdb.academicYear}
                onChange={(e) => updatePPDB({ academicYear: e.target.value })}
                placeholder="Contoh: 2026/2027"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Status Pendaftaran</label>
              <select
                value={ppdb.statusText}
                onChange={(e) => updatePPDB({ statusText: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Pendaftaran Dibuka">Pendaftaran Dibuka (Aktif)</option>
                <option value="Segera Dibuka">Segera Dibuka (Persiapan)</option>
                <option value="Tahap Seleksi Berkas">Tahap Seleksi Berkas</option>
                <option value="Pengumuman Hasil Kelulusan">Pengumuman Hasil Kelulusan</option>
                <option value="Pendaftaran Ditutup">Pendaftaran Ditutup</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Ringkasan Pengumuman / Jalur PPDB</label>
            <textarea
              rows={3}
              value={ppdb.announcement || ''}
              onChange={(e) => updatePPDB({ announcement: e.target.value })}
              placeholder="Contoh: Jalur Zonasi (70%), Jalur Afirmasi (15%), Perpindahan Orang Tua (5%), Jalur Prestasi (10%)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Kontak Layanan / Panitia PPDB (WhatsApp / HP)</span>
              </label>
              <input
                type="text"
                value={ppdb.contactPerson || ''}
                onChange={(e) => updatePPDB({ contactPerson: e.target.value })}
                placeholder="Contoh: 0812-7561-8899 (Bpk. Ahmad / Panitia PPDB)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Link Brosur / Petunjuk Teknis PPDB (Opsional)</span>
              </label>
              <input
                type="text"
                value={ppdb.brochureUrl || ''}
                onChange={(e) => updatePPDB({ brochureUrl: e.target.value })}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Live Preview Box */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pratinjau Tombol di Bilah Navigasi
            </span>
            <span className="text-[11px] text-slate-400">
              {ppdb.enabled ? 'Status: Ditampilkan' : 'Status: Disembunyikan'}
            </span>
          </div>

          <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Posisi di sebelah tombol cari berita:
            </span>

            {ppdb.enabled ? (
              <div className="inline-flex items-center gap-2 bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm">
                <GraduationCap className="w-4 h-4" />
                <span>{ppdb.buttonLabel || 'Info PPDB 2026'}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5" /> (Tombol tidak akan muncul)
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
