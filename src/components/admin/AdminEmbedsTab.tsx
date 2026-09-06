import React, { useState } from 'react';
import { SchoolConfig, EmbedsConfig } from '../../types';
import {
  Video,
  MapPin,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Compass,
  RotateCcw,
  Sparkles,
  Save,
  Search,
  ZoomIn,
  ZoomOut,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  convertToGoogleMapsEmbedUrl,
  buildGoogleMapsEmbedUrl,
  extractMapDetails,
  ParsedGoogleMapResult,
} from '../../lib/embedHelper';

interface AdminEmbedsTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminEmbedsTab: React.FC<AdminEmbedsTabProps> = ({ config, onChange }) => {
  const { embeds, footer, identity } = config;

  // Extract initial details from saved mapIframeUrl
  const initialDetails = extractMapDetails(
    embeds.mapIframeUrl,
    identity.name ? `${identity.name}, Bengkalis` : 'SMPN 1 Bengkalis'
  );

  const [searchLocation, setSearchLocation] = useState<string>(
    initialDetails.query || 'SMPN 1 Bengkalis'
  );
  const [zoomLevel, setZoomLevel] = useState<number>(initialDetails.zoom || 17);
  const [previewMapUrl, setPreviewMapUrl] = useState<string>(
    embeds.mapIframeUrl || buildGoogleMapsEmbedUrl('SMPN 1 Bengkalis', 17)
  );

  const [manualIframeInput, setManualIframeInput] = useState<string>(embeds.mapIframeUrl);
  const [showManualSection, setShowManualSection] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
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

  // Perform search and update preview map
  const handlePerformSearch = (queryOverride?: string, zoomOverride?: number) => {
    const q = (queryOverride !== undefined ? queryOverride : searchLocation).trim();
    const z = zoomOverride !== undefined ? zoomOverride : zoomLevel;

    if (!q) return;

    const newUrl = buildGoogleMapsEmbedUrl(q, z);
    setPreviewMapUrl(newUrl);
    setManualIframeInput(newUrl);
  };

  // Handle zoom adjustments
  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(10, Math.min(20, newZoom));
    setZoomLevel(clamped);
    if (searchLocation.trim()) {
      const newUrl = buildGoogleMapsEmbedUrl(searchLocation.trim(), clamped);
      setPreviewMapUrl(newUrl);
      setManualIframeInput(newUrl);
    }
  };

  // Save current previewed map to public configuration
  const handleSaveMapToPublic = () => {
    const finalUrl = previewMapUrl || buildGoogleMapsEmbedUrl(searchLocation, zoomLevel);
    onChange({
      ...config,
      embeds: {
        ...embeds,
        mapIframeUrl: finalUrl,
      },
    });
    showTemporaryFeedback(
      `✓ Peta lokasi "${searchLocation}" (Zoom: ${zoomLevel}x) berhasil disimpan dan langsung aktif di halaman utama publik!`
    );
  };

  // Handle manual input
  const handleManualMapInput = (raw: string) => {
    setManualIframeInput(raw);
    const parsed = convertToGoogleMapsEmbedUrl(raw, footer.address || identity.name);
    if (parsed.embedUrl) {
      setPreviewMapUrl(parsed.embedUrl);
      if (parsed.detectedLocation) {
        setSearchLocation(parsed.detectedLocation);
      }
    }
  };

  const handleResetDefaultMap = () => {
    const defaultQuery = 'SMPN 1 Bengkalis';
    const defaultZoom = 17;
    setSearchLocation(defaultQuery);
    setZoomLevel(defaultZoom);
    const defaultUrl = buildGoogleMapsEmbedUrl(defaultQuery, defaultZoom);
    setPreviewMapUrl(defaultUrl);
    setManualIframeInput(defaultUrl);
    onChange({
      ...config,
      embeds: {
        ...embeds,
        mapIframeUrl: defaultUrl,
      },
    });
    showTemporaryFeedback('Peta direset ke lokasi SMPN 1 Bengkalis (Zoom: 17x).');
  };

  const showTemporaryFeedback = (msg: string) => {
    setSaveFeedback(msg);
    setTimeout(() => {
      setSaveFeedback(null);
    }, 4500);
  };

  const zoomLabels: Record<number, string> = {
    10: 'Kabupaten / Pulau',
    11: 'Wilayah Sekitar',
    12: 'Tingkat Kota',
    13: 'Kecamatan Luas',
    14: 'Kecamatan / Kelurahan',
    15: 'Area Sekitar Sekolah',
    16: 'Jalan & Lingkungan (Standar)',
    17: 'Kompleks Sekolah (Direkomendasikan)',
    18: 'Gedung Sekolah Fokus',
    19: 'Close-Up Bangunan',
    20: 'Sangat Dekat',
  };

  const isCurrentSaved = embeds.mapIframeUrl === previewMapUrl;

  const sampleVideos = [
    { label: 'Video Tur Kampus (Demo)', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { label: 'Dokumenter Pendidikan', url: 'https://www.youtube.com/embed/ScMzIvxBSi4' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Google Maps Search & Zoom Interactive Builder */}
      <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Header with Title & Help */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <MapPin className="w-5 h-5" />
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Pencari &amp; Penyetel Peta Lokasi Sekolah
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Cari nama atau alamat sekolah (misal: <strong>SMPN 1 Bengkalis</strong>), atur tingkat perbesaran (zoom) hingga pas, lalu tekan <strong>Simpan ke Publik</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{showGuide ? 'Tutup Tips' : 'Tips Pencarian'}</span>
            </button>
          </div>
        </div>

        {/* Tutorial Tips Box */}
        {showGuide && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2 animate-in fade-in duration-150">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900 text-sm">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>Tips Pencarian Cepat Lokasi Sekolah:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-emerald-900 leading-relaxed">
              <li>
                Ketik nama sekolah spesifik beserta kotanya, contoh: <strong>SMPN 1 Bengkalis</strong> atau <strong>SMP Negeri 1 Bengkalis Riau</strong>.
              </li>
              <li>
                Gunakan slider <strong>Tingkat Zoom</strong> di bawah untuk mendekatkan tampilan ke atap gedung sekolah (zoom 17–18) atau menjauhkan agar terlihat jalan utamanya (zoom 15–16).
              </li>
              <li>
                Setelah lokasi dan zoom pas di layar pratinjau, klik tombol hijau <strong>"Simpan &amp; Terapkan Peta Ini ke Publik"</strong>.
              </li>
            </ul>
          </div>
        )}

        {/* Section 1: Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Judul Seksi Peta di Halaman Publik
          </label>
          <input
            type="text"
            value={embeds.mapTitle}
            onChange={(e) => updateEmbed('mapTitle', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            placeholder="Lokasi Kampus SMPN 1 Bengkalis"
          />
        </div>

        {/* Section 2: Search Location Box */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Kolom Pencarian Lokasi Peta Sekolah</span>
              </span>
              <span className="text-[11px] text-slate-500 font-normal">Ketik lalu tekan Cari atau Enter</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <div className="relative flex-1">
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs"
                  placeholder="Contoh: SMPN 1 Bengkalis, Riau atau Jl. Merpati Bengkalis"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="button"
                onClick={() => handlePerformSearch()}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Cari &amp; Muat Peta</span>
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Rekomendasi Cepat:</span>
            
            <button
              type="button"
              onClick={() => {
                const target = 'SMPN 1 Bengkalis';
                setSearchLocation(target);
                handlePerformSearch(target);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold border border-emerald-300 transition-colors cursor-pointer"
            >
              📍 SMPN 1 Bengkalis
            </button>

            <button
              type="button"
              onClick={() => {
                const target = 'SMP Negeri 1 Bengkalis, Riau';
                setSearchLocation(target);
                handlePerformSearch(target);
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-300 transition-colors cursor-pointer"
            >
              SMP Negeri 1 Bengkalis, Riau
            </button>

            {footer.address && (
              <button
                type="button"
                onClick={() => {
                  const target = footer.address;
                  setSearchLocation(target);
                  handlePerformSearch(target);
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-300 transition-colors cursor-pointer truncate max-w-xs"
                title={footer.address}
              >
                Alamat: {footer.address}
              </button>
            )}

            {identity.name && identity.name !== 'SMPN 1 Bengkalis' && (
              <button
                type="button"
                onClick={() => {
                  const target = `${identity.name}, Bengkalis`;
                  setSearchLocation(target);
                  handlePerformSearch(target);
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-300 transition-colors cursor-pointer"
              >
                {identity.name}
              </button>
            )}
          </div>

          {/* Section 3: Interactive Zoom Adjuster */}
          <div className="pt-3 border-t border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Tingkat Perbesaran (Zoom):</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-xs">
                  {zoomLevel}x
                </span>
                <span className="text-slate-500 font-normal text-xs ml-1">
                  ({zoomLabels[zoomLevel] || 'Kustom'})
                </span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoomLevel - 1)}
                  disabled={zoomLevel <= 10}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors cursor-pointer"
                  title="Jauhkan Peta (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoomLevel + 1)}
                  disabled={zoomLevel >= 20}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors cursor-pointer"
                  title="Dekatkan Peta (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-400">Jauh (10x)</span>
              <input
                type="range"
                min={10}
                max={20}
                step={1}
                value={zoomLevel}
                onChange={(e) => handleZoomChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-[11px] font-bold text-slate-400">Dekat (20x)</span>
            </div>

            {/* Preset Zoom Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-slate-500 text-[11px]">Preset Zoom:</span>
              {[
                { z: 12, label: 'Kota (12x)' },
                { z: 14, label: 'Kecamatan (14x)' },
                { z: 16, label: 'Jalan (16x)' },
                { z: 17, label: 'Sekolah (17x Rekomendasi)' },
                { z: 18, label: 'Gedung Fokus (18x)' },
              ].map((p) => (
                <button
                  key={p.z}
                  type="button"
                  onClick={() => handleZoomChange(p.z)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    zoomLevel === p.z
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Live Map Preview */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pratinjau Hasil Peta:</span>
              <span className="text-emerald-700 font-bold ml-1">
                "{searchLocation}" • Zoom {zoomLevel}x
              </span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  searchLocation
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <span>Buka di Google Maps Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-md relative group">
            {previewMapUrl ? (
              <iframe
                key={previewMapUrl}
                src={previewMapUrl}
                title="Google Maps Location Preview"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <MapPin className="w-10 h-10 text-slate-300 mb-2 animate-bounce" />
                <p className="text-sm font-semibold">Masukkan lokasi sekolah lalu tekan Cari</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Primary Action - Simpan ke Publik */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {isCurrentSaved ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aktif Ditampilkan ke Publik
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Pratinjau Belum Disimpan
                </span>
              )}
              <span className="text-xs font-bold text-slate-700">
                {searchLocation} (Zoom {zoomLevel}x)
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Tekan tombol di samping untuk mengunci lokasi dan zoom ini agar tampil di website utama sekolah.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveMapToPublic}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer text-sm sm:text-base"
            >
              <Save className="w-5 h-5 text-white" />
              <span>Simpan &amp; Terapkan Peta Ini ke Publik</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveFeedback && (
          <div className="flex items-center gap-3 p-4 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg animate-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="flex-1">{saveFeedback}</span>
          </div>
        )}

        {/* Section 6: Advanced Option Accordion (Paste Manual Iframe) */}
        <div className="border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => setShowManualSection(!showManualSection)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-600 hover:text-slate-900 py-1.5 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>Opsi Lanjutan: Tempel Tautan Web atau Kode Iframe HTML Manual</span>
              <span className="text-[10px] font-normal text-slate-400">(Opsional)</span>
            </span>
            {showManualSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showManualSection && (
            <div className="mt-3 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-slate-700">
                Kode HTML Iframe atau URL Embed Google Maps
              </label>
              <textarea
                rows={3}
                value={manualIframeInput}
                onChange={(e) => handleManualMapInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetDefaultMap}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default (SMPN 1 Bengkalis)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveMapToPublic}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Hasil Manual</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

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
              placeholder="Saksikan suasana belajar dan fasilitas kampus..."
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
              placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">Contoh video cepat:</span>
            {sampleVideos.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateEmbed('youtubeUrl', item.url)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Video Preview */}
          {embeds.youtubeUrl && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 block mb-2">Pratinjau Video:</span>
              <div className="max-w-2xl aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
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
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

