import React from 'react';
import { EmbedsConfig } from '../../types';
import { Video, MapPin, ExternalLink, Navigation } from 'lucide-react';
import { convertToGoogleMapsEmbedUrl } from '../../lib/embedHelper';

interface EmbedMediaSectionProps {
  embeds: EmbedsConfig;
  schoolAddress: string;
  showVideo: boolean;
  showMap: boolean;
}

export const EmbedMediaSection: React.FC<EmbedMediaSectionProps> = ({
  embeds,
  schoolAddress,
  showVideo,
  showMap,
}) => {
  if (!showVideo && !showMap) return null;

  // Safe Google Maps URL parsing
  const mapResult = convertToGoogleMapsEmbedUrl(embeds.mapIframeUrl, schoolAddress);
  const effectiveMapUrl = mapResult.embedUrl;

  // Convert standard YouTube watch URLs to embed URLs if needed
  const getCleanEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('watch?v=')) {
      const videoId = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const cleanVideoUrl = getCleanEmbedUrl(embeds.youtubeUrl);

  return (
    <section id="media-lokasi" className="py-12 sm:py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Video Profil Section (Minimalist) */}
        {showVideo && cleanVideoUrl && (
          <div id="video-profil" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-100 text-red-600">
                <Video className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {embeds.youtubeTitle || 'Video Profil'}
              </h2>
            </div>

            <div className="w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-16/9 bg-slate-900 max-w-4xl mx-auto">
              <iframe
                src={cleanVideoUrl}
                title={embeds.youtubeTitle || 'Video Profil'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {/* Google Maps Section (Ultra Minimalist) */}
        {showMap && effectiveMapUrl && (
          <div id="lokasi" className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <div className="truncate">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    {embeds.mapTitle || 'Lokasi Sekolah'}
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    {schoolAddress}
                  </p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  mapResult.detectedLocation || schoolAddress
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Buka Peta</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

            <div className="w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
              <iframe
                src={effectiveMapUrl}
                title={embeds.mapTitle || 'Peta Lokasi'}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
