import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import {
  compressAndResizeImage,
  convertGoogleDriveUrl,
  formatFileSize,
  CompressionOptions,
} from '../../lib/imageOptimizer';

interface ImageUploadButtonProps {
  label: string;
  value: string;
  onChange: (newUrl: string) => void;
  preset?: 'favicon' | 'logo' | 'avatar' | 'banner' | 'post';
  aspectRatio?: 'square' | 'wide' | 'banner';
  placeholder?: string;
  allowDriveConverter?: boolean;
}

export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  label,
  value,
  onChange,
  preset = 'banner',
  aspectRatio = 'wide',
  placeholder = 'https://...',
  allowDriveConverter = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    original: string;
    compressed: string;
    savings: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(!value?.startsWith('data:'));
  const [driveConvertedNotice, setDriveConvertedNotice] = useState(false);

  // Preset configurations for optimal compression
  const getPresetOptions = (): CompressionOptions => {
    switch (preset) {
      case 'favicon':
        return { maxWidth: 128, maxHeight: 128, quality: 0.85, format: 'image/png' };
      case 'logo':
        return { maxWidth: 400, maxHeight: 400, quality: 0.85, format: 'image/png' };
      case 'avatar':
        return { maxWidth: 600, maxHeight: 600, quality: 0.82, format: 'image/webp' };
      case 'banner':
        return { maxWidth: 1400, maxHeight: 800, quality: 0.8, format: 'image/webp' };
      case 'post':
      default:
        return { maxWidth: 1200, maxHeight: 800, quality: 0.8, format: 'image/webp' };
    }
  };

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WebP, SVG).');
      return;
    }

    setIsProcessing(true);
    setCompressionInfo(null);
    setDriveConvertedNotice(false);

    try {
      const result = await compressAndResizeImage(file, getPresetOptions());
      onChange(result.dataUrl);
      setCompressionInfo({
        original: formatFileSize(result.originalSize),
        compressed: formatFileSize(result.compressedSize),
        savings: result.reductionPercentage,
      });
    } catch (err) {
      alert('Gagal mengompres gambar: ' + String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlChange = (newText: string) => {
    if (allowDriveConverter && newText.includes('drive.google.com')) {
      const converted = convertGoogleDriveUrl(newText);
      if (converted !== newText) {
        setDriveConvertedNotice(true);
        onChange(converted);
        return;
      }
    }
    setDriveConvertedNotice(false);
    onChange(newText);
  };

  // Determine preview container class
  const getPreviewClasses = () => {
    if (aspectRatio === 'square') {
      return 'w-24 h-24 rounded-2xl';
    }
    if (aspectRatio === 'banner') {
      return 'w-full h-40 sm:h-48 rounded-xl';
    }
    return 'w-full sm:w-48 h-32 rounded-xl';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setCompressionInfo(null);
              }}
              className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              Hapus Gambar
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Sembunyikan Input URL' : 'Input URL / Drive'}</span>
          </button>
        </div>
      </div>

      {/* Main Upload Dropzone & Preview Box */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
        {/* Left / Thumbnail Preview */}
        {value && (
          <div
            className={`relative overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs group ${getPreviewClasses()} ${
              aspectRatio === 'banner' ? 'sm:col-span-12' : 'sm:col-span-4'
            }`}
          >
            <img
              src={value}
              alt="Pratinjau Gambar"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium">
              {value.startsWith('data:') ? 'Firebase (Data URL)' : 'Cloud URL'}
            </span>
          </div>
        )}

        {/* Right / Upload Action Box */}
        <div
          className={`space-y-2 ${
            value && aspectRatio !== 'banner' ? 'sm:col-span-8' : 'sm:col-span-12'
          }`}
        >
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/70'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileInputChange}
            />

            {isProcessing ? (
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mengompres & Mengoptimasi Gambar...</span>
              </div>
            ) : (
              <>
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-blue-700 hover:underline">
                    Klik untuk unggah file
                  </span>{' '}
                  <span className="text-slate-500">atau seret gambar ke sini</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  JPG, PNG, WebP, SVG • Otomatis dioptimalkan untuk Firebase & Browser Lokal
                </p>
              </>
            )}
          </div>

          {/* Compression Success Badge */}
          {compressionInfo && (
            <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Dioptimasi: <strong>{compressionInfo.original}</strong> →{' '}
                <strong>{compressionInfo.compressed}</strong> (Hemat {compressionInfo.savings}%) • Tersimpan di Firebase
              </span>
            </div>
          )}

          {/* Google Drive Converted Notice */}
          {driveConvertedNotice && (
            <div className="flex items-center gap-2 text-[11px] text-blue-800 bg-blue-50 border border-blue-200 p-2.5 rounded-lg">
              <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Tautan Google Drive berhasil dikonversi ke tautan CDN gambar langsung!
              </span>
            </div>
          )}

          {/* Optional Direct URL or Google Drive Link Input */}
          {showUrlInput && (
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-semibold text-slate-500 block">
                Atau masukkan URL gambar / Tautan Google Drive:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={value.startsWith('data:') ? '' : value}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Mendukung tautan foto online atau tautan Google Drive (akan otomatis diubah ke tampilan langsung).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
