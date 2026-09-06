import React from 'react';
import { SchoolConfig, EmbedsConfig } from '../../types';
import { Video, MapPin, ExternalLink, HelpCircle } from 'lucide-react';

interface AdminEmbedsTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminEmbedsTab: React.FC<AdminEmbedsTabProps> = ({ config, onChange }) => {
  const { embeds } = config;

  const updateEmbed = (key: keyof EmbedsConfig, value: string) => {
    onChange({
      ...config,
      embeds: {
        ...embeds,
        [key]: value,
      },
    });
  };

  const sampleVideos = [
    { label: 'Video Tur Kampus (Demo)', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { label: 'Dokumenter Pendidikan', url: 'https://www.youtube.com/embed/ScMzIvxBSi4' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* YouTube Video Embed */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-red-600" />
            <span>Embed Video Profil Sekolah (YouTube)</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Sematkan video profil, tur virtual, atau dokumenter sekolah langsung dari YouTube.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Judul Seksi Video
            </label>
            <input
              type="text"
              value={embeds.youtubeTitle}
              onChange={(e) => updateEmbed('youtubeTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Profil & Tur Virtual Kampus..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Deskripsi Singkat Video
            </label>
            <input
              type="text"
              value={embeds.youtubeSubtitle}
              onChange={(e) => updateEmbed('youtubeSubtitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Saksikan suasana belajar dan fasilitas..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              URL Video YouTube (Mendukung link biasa watch?v= atau embed/)
            </label>
            <input
              type="text"
              value={embeds.youtubeUrl}
              onChange={(e) => updateEmbed('youtubeUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono text-xs"
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">Contoh link cepat:</span>
            {sampleVideos.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateEmbed('youtubeUrl', item.url)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Video Preview */}
          {embeds.youtubeUrl && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 block mb-2">Pratinjau Video:</span>
              <div className="max-w-md aspect-16/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
                <iframe
                  src={
                    embeds.youtubeUrl.includes('watch?v=')
                      ? `https://www.youtube.com/embed/${embeds.youtubeUrl.split('watch?v=')[1]?.split('&')[0]}`
                      : embeds.youtubeUrl
                  }
                  title="Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Embed Peta Lokasi (Google Maps)</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Salin tautan embed iframe dari Google Maps agar calon murid dan wali murid mudah menemukan lokasi sekolah.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Judul Seksi Peta
            </label>
            <input
              type="text"
              value={embeds.mapTitle}
              onChange={(e) => updateEmbed('mapTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Lokasi Kampus SMAN 1 Nusantara"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              URL Iframe Google Maps (src attribute)
            </label>
            <textarea
              rows={3}
              value={embeds.mapIframeUrl}
              onChange={(e) => updateEmbed('mapIframeUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </div>

          {/* Maps Preview */}
          {embeds.mapIframeUrl && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 block mb-2">Pratinjau Peta:</span>
              <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <iframe
                  src={embeds.mapIframeUrl}
                  title="Map Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
