import React, { useState } from 'react';
import { NewsArticle } from '../../types';
import {
  X,
  Calendar,
  User,
  Eye,
  Tag,
  BookmarkCheck,
  Share2,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Code2,
  Globe,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { parseEmbedUrl } from '../../lib/embedHelper';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

interface NewsDetailModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ article, onClose }) => {
  // Prevent background scrolling while the news modal or lightbox is open
  useBodyScrollLock(!!article);

  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
  const [isEmbedExpanded, setIsEmbedExpanded] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [copiedNotice, setCopiedNotice] = useState(false);

  if (!article) return null;

  const parsedEmbed = article.embedUrl ? parseEmbedUrl(article.embedUrl) : null;
  const gallery = article.galleryImages || [];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeGalleryIndex === null) return;
    setActiveGalleryIndex((activeGalleryIndex - 1 + gallery.length) % gallery.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeGalleryIndex === null) return;
    setActiveGalleryIndex((activeGalleryIndex + 1) % gallery.length);
  };

  // Helper to render content with clickable links
  const renderFormattedContent = (text: string) => {
    // Regex matches markdown links [text](url) or standalone URLs http(s)://...
    const parts = text.split(/(https?:\/\/[^\s]+|\[[^\]]+\]\([^\)]+\))/g);

    return parts.map((part, i) => {
      // Markdown link [Label](url)
      const mdMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if (mdMatch) {
        return (
          <a
            key={i}
            href={mdMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-semibold inline-flex items-center gap-0.5"
          >
            <span>{mdMatch[1]}</span>
            <ExternalLink className="w-3 h-3 inline-block" />
          </a>
        );
      }

      // Standalone URL
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium break-all inline-flex items-center gap-0.5"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 inline-block" />
          </a>
        );
      }

      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overscroll-contain touch-none animate-in fade-in duration-200">
      <div
        className={`relative w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col overscroll-contain transition-all duration-300 ${
          isEmbedExpanded ? 'max-w-6xl h-[96vh]' : 'max-w-4xl max-h-[92vh]'
        }`}
      >
        {/* Toast Share Notification */}
        {copiedNotice && (
          <div className="absolute top-16 right-6 z-50 bg-slate-900 text-white text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tautan artikel berhasil disalin!</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
            {article.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                <BookmarkCheck className="w-3 h-3 text-amber-600" />
                Unggulan
              </span>
            )}
            {parsedEmbed && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                <Code2 className="w-3 h-3" />
                {parsedEmbed.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {parsedEmbed && (
              <a
                href={parsedEmbed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Aplikasi / Embed di Tab Baru (Layar Penuh)"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di Tab Baru</span>
              </a>
            )}

            <button
              onClick={handleShare}
              title="Bagikan Artikel"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto overscroll-contain touch-pan-y space-y-6 flex-1">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pb-4 border-b border-slate-100">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <User className="w-4 h-4 text-blue-600" />
              {article.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {article.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              {article.views + 1} dibaca
            </span>
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="rounded-xl overflow-hidden max-h-96 w-full bg-slate-100 shadow-sm border border-slate-200">
              <img
                src={article.coverImage}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Summary Quote Box */}
          {article.summary && (
            <div className="bg-blue-50/60 border-l-4 border-blue-600 p-4 rounded-r-xl text-slate-700 text-sm sm:text-base italic font-medium leading-relaxed">
              {article.summary}
            </div>
          )}

          {/* Body Content */}
          <div className="text-slate-800 text-base leading-relaxed whitespace-pre-line space-y-4">
            {renderFormattedContent(article.content)}
          </div>

          {/* Custom Action Link Button / Link Tertentu */}
          {article.actionLink && article.actionLink.url && (
            <div className="p-4 sm:p-5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  Tautan Khusus / Akses Terkait
                </span>
                <p className="font-bold text-slate-900 text-sm sm:text-base">
                  {article.actionLink.label || 'Kunjungi Halaman / Tautan Terkait'}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-md">
                  {article.actionLink.url}
                </p>
              </div>

              <a
                href={article.actionLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
              >
                <span>Buka Tautan</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Full Embed Section (Apps Script, YouTube, Google Forms/Docs, Web) */}
          {parsedEmbed && (
            <div className="rounded-2xl border border-slate-300 bg-slate-900 overflow-hidden shadow-md">
              {/* Embed Toolbar */}
              <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-xs sm:text-sm tracking-wide">
                    {article.embedTitle || parsedEmbed.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reload iframe */}
                  <button
                    type="button"
                    onClick={() => setIframeKey((k) => k + 1)}
                    title="Muat ulang embed"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {/* Toggle expand height inside modal */}
                  <button
                    type="button"
                    onClick={() => setIsEmbedExpanded(!isEmbedExpanded)}
                    title={isEmbedExpanded ? 'Kecilkan Tampilan' : 'Perbesar Tampilan'}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    {isEmbedExpanded ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Open in New Tab - User requested for full freedom and unconstrained view */}
                  <a
                    href={parsedEmbed.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Tab Baru (Layar Penuh)</span>
                  </a>
                </div>
              </div>

              {/* Iframe Viewport */}
              <div
                className={`w-full bg-white relative transition-all duration-200 ${
                  parsedEmbed.kind === 'youtube'
                    ? 'aspect-video'
                    : isEmbedExpanded
                    ? 'h-[75vh]'
                    : 'h-[480px] sm:h-[550px]'
                }`}
              >
                <iframe
                  key={iframeKey}
                  src={parsedEmbed.embedUrl}
                  title={article.embedTitle || article.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
                />
              </div>

              {/* Embed Footer helper note */}
              <div className="px-4 py-2 bg-slate-950 text-slate-400 text-[11px] flex items-center justify-between">
                <span>
                  Sumber: <strong className="text-slate-300">{parsedEmbed.label}</strong>
                </span>
                <a
                  href={parsedEmbed.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Jika embed terkendala, buka tautan langsung</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Multiple Image Gallery Section */}
          {gallery.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Dokumentasi &amp; Galeri Foto ({gallery.length} Foto)</span>
                </h3>
                <span className="text-xs text-slate-400">Klik foto untuk perbesar</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveGalleryIndex(idx)}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 cursor-pointer shadow-xs hover:shadow-md transition-all"
                  >
                    <img
                      src={imgUrl}
                      alt={`Dokumentasi ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        Lihat Foto
                      </span>
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-medium truncate mr-2">
            Kategori: {article.category} • Publikasi Resmi Sekolah
          </span>
          <div className="flex items-center gap-2">
            {parsedEmbed && (
              <a
                href={parsedEmbed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Embed Tab Baru</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Lightbox Modal for Gallery Fullscreen View */}
        {activeGalleryIndex !== null && (
          <div
            onClick={() => setActiveGalleryIndex(null)}
            className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveGalleryIndex(null)}
                className="absolute top-2 right-2 z-20 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Prev Button */}
              {gallery.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 z-20 p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              {gallery.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 z-20 p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Main Image */}
              <div className="max-h-[80vh] overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-black/50">
                <img
                  src={gallery[activeGalleryIndex]}
                  alt={`Galeri ${activeGalleryIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="max-h-[80vh] w-auto object-contain mx-auto"
                />
              </div>

              {/* Counter Indicator */}
              <div className="mt-3 text-white text-xs font-semibold bg-white/15 px-3 py-1 rounded-full">
                Foto {activeGalleryIndex + 1} dari {gallery.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

