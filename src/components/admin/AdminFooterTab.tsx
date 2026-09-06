import React from 'react';
import { SchoolConfig, FooterConfig } from '../../types';
import { Phone, Mail, MapPin, Clock, Share2 } from 'lucide-react';

interface AdminFooterTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminFooterTab: React.FC<AdminFooterTabProps> = ({ config, onChange }) => {
  const { footer } = config;

  const updateFooter = (key: keyof FooterConfig, value: any) => {
    onChange({
      ...config,
      footer: {
        ...footer,
        [key]: value,
      },
    });
  };

  const updateSocial = (key: keyof typeof footer.socialLinks, value: string) => {
    onChange({
      ...config,
      footer: {
        ...footer,
        socialLinks: {
          ...footer.socialLinks,
          [key]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <span>Pengaturan Footer &amp; Informasi Kontak Resmi</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Ubah deskripsi tentang sekolah di bagian bawah halaman, kontak telepon, WhatsApp, email, dan link sosial media.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Deskripsi Singkat Sekolah (Tentang Kami di Footer)
            </label>
            <textarea
              rows={3}
              value={footer.aboutText}
              onChange={(e) => updateFooter('aboutText', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Alamat Lengkap Fisik Kampus
            </label>
            <textarea
              rows={2}
              value={footer.address}
              onChange={(e) => updateFooter('address', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nomor Telepon Kantor
              </label>
              <input
                type="text"
                value={footer.phone}
                onChange={(e) => updateFooter('phone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nomor WhatsApp Layanan PPDB / Sekolah
              </label>
              <input
                type="text"
                value={footer.whatsapp}
                onChange={(e) => updateFooter('whatsapp', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Resmi Sekolah
              </label>
              <input
                type="email"
                value={footer.email}
                onChange={(e) => updateFooter('email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Jam Operasional Pelayanan
              </label>
              <input
                type="text"
                value={footer.openingHours}
                onChange={(e) => updateFooter('openingHours', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Tautan Media Sosial Sekolah</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={footer.socialLinks.instagram}
                  onChange={(e) => updateSocial('instagram', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={footer.socialLinks.youtube}
                  onChange={(e) => updateSocial('youtube', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={footer.socialLinks.facebook}
                  onChange={(e) => updateSocial('facebook', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">Twitter / X URL</label>
                <input
                  type="text"
                  value={footer.socialLinks.twitter}
                  onChange={(e) => updateSocial('twitter', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
          </div>

          {/* Copyright text */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Teks Hak Cipta (Copyright Notice)
            </label>
            <input
              type="text"
              value={footer.copyright}
              onChange={(e) => updateFooter('copyright', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

        </div>
      </div>
    </div>
  );
};
