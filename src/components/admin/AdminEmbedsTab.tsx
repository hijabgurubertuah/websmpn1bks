import React, { useState } from 'react';
import { SchoolConfig, EmbedsConfig } from '../../types';
import {
  Video,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Save,
  Search,
  RotateCcw,
} from 'lucide-react';
import {
  buildGoogleMapsEmbedUrl,
  extractMapDetails,
} from '../../lib/embedHelper';

interface AdminEmbedsTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminEmbedsTab: React.FC<AdminEmbedsTabProps> = ({ config, onChange }) => {
  const { embeds, identity } = config;

  const initialDetails = extractMapDetails(
    embeds.mapIframeUrl,
    identity.name ? `${identity.name}, Bengkalis` : 'SMPN 1 Bengkalis'
  );

  const [searchLocation, setSearchLocation] = useState<string>(
    initialDetails.query || 'SMPN 1 Bengkalis'
  );
  const [previewMapUrl, setPreviewMapUrl] = useState<string>(
    embeds.mapIframeUrl || buildGoogleMapsEmbedUrl('SMPN 1 Bengkalis', 17)
  );
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const updateEmbed = (key: keyof EmbedsConfig, value: string) => {
    onChange({
      ...config,
      embeds: {
        ...embeds,
        [key]: value,
      },
    });
  };

  const handlePerformSearch = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : searchLocation).trim();
    if (!q) return;
    const newUrl = buildGoogleMapsEmbedUrl(q, 17);
    setPreviewMapUrl(newUrl);
    onChange({
      ...config,
      embeds: {
        ...embeds,
        mapIframeUrl: newUrl,
      },
    });
    setSaveFeedback('Pratinjau peta diperbarui.');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleReset = () => {
    const defaultQuery = 'SMPN 1 Bengkalis';
    setSearchLocation(defaultQuery);
    const defaultUrl = buildGoogleMapsEmbedUrl(defaultQuery, 17);
    setPreviewMapUrl(defaultUrl);
    onChange({
      ...config,
      embeds: {
        ...embeds,
        mapIframeUrl: defaultUrl,
      },
    });
    setSaveFeedback('Peta direset ke default.');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Google Maps Embed Minimalist */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <MapPin className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Peta Lokasi
            </h3>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Judul Seksi
            </label>
            <input
              type="text"
              value={embeds.mapTitle}
              onChange={(e) => updateEmbed('mapTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              placeholder="Lokasi Sekolah"
            />
          </div>

          <div className="sm:col-span-7">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Cari Lokasi / Alamat
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePerformSearch();
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="Contoh: SMPN 1 Bengkalis"
              />
              <button
                type="button"
                onClick={() => handlePerformSearch()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div className="w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
          {previewMapUrl && (
            <iframe
              src={previewMapUrl}
              title="Google Maps Preview"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
            />
          )}
        </div>

        {/* Action & Feedback */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {saveFeedback ? (
            <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveFeedback}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              {searchLocation}
            </span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchLocation)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* YouTube Video Embed Minimalist */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-red-100 text-red-600 rounded-xl">
            <Video className="w-5 h-5" />
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Video YouTube
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Judul Video
            </label>
            <input
              type="text"
              value={embeds.youtubeTitle}
              onChange={(e) => updateEmbed('youtubeTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="Video Profil Sekolah"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              URL Video YouTube
            </label>
            <input
              type="text"
              value={embeds.youtubeUrl}
              onChange={(e) => updateEmbed('youtubeUrl', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>

        {/* Video Preview */}
        {embeds.youtubeUrl && (
          <div className="w-full max-w-lg aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <iframe
              src={
                embeds.youtubeUrl.includes('embed/')
                  ? embeds.youtubeUrl
                  : `https://www.youtube.com/embed/${
                      embeds.youtubeUrl.includes('watch?v=')
                        ? embeds.youtubeUrl.split('watch?v=')[1]?.split('&')[0]
                        : embeds.youtubeUrl.split('youtu.be/')[1]?.split('?')[0] || ''
                    }`
              }
              title="YouTube Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        )}
      </div>

    </div>
  );
};
