import React from 'react';
import { SchoolConfig, PrincipalConfig } from '../../types';
import { Award, Image } from 'lucide-react';

interface AdminPrincipalTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminPrincipalTab: React.FC<AdminPrincipalTabProps> = ({ config, onChange }) => {
  const { principal } = config;

  const updatePrincipal = (key: keyof PrincipalConfig, value: string) => {
    onChange({
      ...config,
      principal: {
        ...principal,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>Sambutan &amp; Profil Kepala Sekolah</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data kepala sekolah, foto pimpinan, kutipan pembuka, dan teks amanat sambutan lengkap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nama Lengkap &amp; Gelar
            </label>
            <input
              type="text"
              value={principal.name}
              onChange={(e) => updatePrincipal('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Drs. H. Bambang Suryanto, M.Pd."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Jabatan Resmi
            </label>
            <input
              type="text"
              value={principal.title}
              onChange={(e) => updatePrincipal('title', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Kepala Sekolah SMA Negeri 1 Nusantara"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nomor Induk Pegawai (NIP)
            </label>
            <input
              type="text"
              value={principal.nip}
              onChange={(e) => updatePrincipal('nip', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="19710815 199702 1 003"
            />
          </div>

          {/* Photo URL with Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              URL Foto Kepala Sekolah
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={principal.imageUrl}
                onChange={(e) => updatePrincipal('imageUrl', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="https://images.unsplash.com/..."
              />
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-300 shrink-0 bg-slate-100 flex items-center justify-center">
                {principal.imageUrl ? (
                  <img
                    src={principal.imageUrl}
                    alt="Kepala Sekolah"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Short Quote */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Kutipan Inspiratif Pimpinan (Quote Singkat)
          </label>
          <textarea
            rows={2}
            value={principal.quote}
            onChange={(e) => updatePrincipal('quote', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none italic"
            placeholder="Pendidikan bukan sekadar mengisi wadah..."
          />
        </div>

        {/* Full Speech */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Isi Teks Sambutan Lengkap
          </label>
          <textarea
            rows={8}
            value={principal.fullSpeech}
            onChange={(e) => updatePrincipal('fullSpeech', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
            placeholder="Tuliskan amanat dan sambutan lengkap kepala sekolah..."
          />
        </div>

      </div>
    </div>
  );
};
