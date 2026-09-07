import React from 'react';
import { SchoolConfig } from '../../types';
import { Image, Sparkles, Sliders, Eye } from 'lucide-react';
import { ImageUploadButton } from './ImageUploadButton';

interface AdminHeaderTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminHeaderTab: React.FC<AdminHeaderTabProps> = ({ config, onChange }) => {
  const { identity, header } = config;

  const updateIdentity = (key: keyof typeof identity, value: any) => {
    onChange({
      ...config,
      identity: {
        ...identity,
        [key]: value,
      },
    });
  };

  const updateHeader = (key: keyof typeof header, value: any) => {
    onChange({
      ...config,
      header: {
        ...header,
        [key]: value,
      },
    });
  };

  const updateHighlight = (id: string, field: 'label' | 'value', value: string) => {
    const updated = header.highlights.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateHeader('highlights', updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Identitas Sekolah & Logo */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Identitas Sekolah &amp; Logo</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Atur nama sekolah, akreditasi, logo utama, dan favicon browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nama Sekolah (Website &amp; Aplikasi PWA)
            </label>
            <input
              type="text"
              value={identity.name}
              onChange={(e) => updateIdentity('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Contoh: SMP Negeri 1 Bengkalis"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nama Singkat (Ikon Layar HP / Home Screen)
            </label>
            <input
              type="text"
              value={identity.shortName || ''}
              onChange={(e) => updateIdentity('shortName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Contoh: SMPN 1 Bengkalis"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tagline / Motto Sekolah
            </label>
            <input
              type="text"
              value={identity.tagline}
              onChange={(e) => updateIdentity('tagline', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Motto pendidikan..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nomor Pokok Sekolah Nasional (NPSN)
            </label>
            <input
              type="text"
              value={identity.npsn}
              onChange={(e) => updateIdentity('npsn', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="10495146"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Status Akreditasi
            </label>
            <input
              type="text"
              value={identity.akreditasi}
              onChange={(e) => updateIdentity('akreditasi', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Akreditasi A (Unggul)"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload with Compression & Live Preview */}
            <ImageUploadButton
              label="Logo Sekolah & Ikon Aplikasi PWA"
              value={identity.logoUrl}
              onChange={(url) => updateIdentity('logoUrl', url)}
              preset="logo"
              aspectRatio="square"
              placeholder="https://..."
            />

            {/* Favicon Upload with Compression & Live Preview */}
            <ImageUploadButton
              label="Favicon Tab Browser"
              value={identity.faviconUrl}
              onChange={(url) => updateIdentity('faviconUrl', url)}
              preset="favicon"
              aspectRatio="square"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Running Ticker Setting */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Pengumuman Berjalan (Ticker Bar)</h4>
              <p className="text-xs text-slate-500">Tampilkan teks kabar penting di baris paling atas website.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={identity.tickerEnabled}
                onChange={(e) => updateIdentity('tickerEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {identity.tickerEnabled && (
            <div>
              <textarea
                rows={2}
                value={identity.tickerText}
                onChange={(e) => updateIdentity('tickerText', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="Tuliskan pengumuman berjalan di sini..."
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Hero Banner & Header Image */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-600" />
            <span>Header &amp; Gambar Banner Utama (Hero)</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Ubah gambar background header sekolah, judul sambutan, serta tautan tombol ajakan (CTA).
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Judul Utama Banner (H1)
            </label>
            <input
              type="text"
              value={header.heroTitle}
              onChange={(e) => updateHeader('heroTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Subjudul / Deskripsi Banner
            </label>
            <textarea
              rows={3}
              value={header.heroSubtitle}
              onChange={(e) => updateHeader('heroSubtitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Header Image with Upload & Compression */}
          <ImageUploadButton
            label="Gambar Header Background (Hero Banner)"
            value={header.heroImageUrl}
            onChange={(url) => updateHeader('heroImageUrl', url)}
            preset="banner"
            aspectRatio="banner"
            placeholder="https://images.unsplash.com/... atau tautan Google Drive"
          />

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Tombol CTA Utama
              </span>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Teks Tombol</label>
                <input
                  type="text"
                  value={header.heroCtaText}
                  onChange={(e) => updateHeader('heroCtaText', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Link Target (# atau URL)</label>
                <input
                  type="text"
                  value={header.heroCtaLink}
                  onChange={(e) => updateHeader('heroCtaLink', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tombol CTA Sekunder
              </span>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Teks Tombol</label>
                <input
                  type="text"
                  value={header.secondaryCtaText}
                  onChange={(e) => updateHeader('secondaryCtaText', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Link Target (# atau URL)</label>
                <input
                  type="text"
                  value={header.secondaryCtaLink}
                  onChange={(e) => updateHeader('secondaryCtaLink', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Highlight Stats */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Kartu Sorotan Statistik di Bawah Banner</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {header.highlights.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Kartu #{item.id}
                </span>
                <div>
                  <label className="text-[11px] text-slate-500 block">Label</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateHighlight(item.id, 'label', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block">Nilai</label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => updateHighlight(item.id, 'value', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white font-bold text-blue-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
