import React from 'react';
import { EmbedsConfig } from '../../types';
import { Video, MapPin, ExternalLink, Navigation } from 'lucide-react';

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
    <section id="media-lokasi" className="py-16 sm:py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* YouTube Video Section */}
        {showVideo && cleanVideoUrl && (
          <div id="video-profil" className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
                <Video className="w-3.5 h-3.5 text-red-600" />
                <span>Video Profil &amp; Tur Kampus</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {embeds.youtubeTitle || 'Kenali Lingkungan & Suasana SMAN 1 Nusantara'}
              </h2>
              {embeds.youtubeSubtitle && (
                <p className="text-slate-500 text-sm sm:text-base">
                  {embeds.youtubeSubtitle}
                </p>
              )}
            </div>

            <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-16/9 bg-slate-900">
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

        {/* Google Maps Embed Section */}
        {showMap && embeds.mapIframeUrl && (
          <div id="lokasi" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Akses &amp; Lokasi Kampus</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {embeds.mapTitle || 'Denah & Peta Lokasi Sekolah'}
                </h2>
                <p className="text-slate-500 text-sm sm:text-base mt-1">
                  {schoolAddress}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  schoolAddress
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Petunjuk Arah (Navigasi)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
              <iframe
                src={embeds.mapIframeUrl}
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
