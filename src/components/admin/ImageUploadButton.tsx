import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  CheckCircle2,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
  HardDrive,
  CloudUpload,
  ExternalLink,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  compressAndResizeImage,
  convertGoogleDriveUrl,
  formatFileSize,
  CompressionOptions,
} from '../../lib/imageOptimizer';
import {
  uploadFileViaAppsScript,
  getStoredAppsScriptConfig,
} from '../../lib/googleAppsScript';

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
  allowDriveConverter = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check stored Google Apps Script configuration
  const [gasConfig, setGasConfig] = useState(getStoredAppsScriptConfig());
  const isGasAvailable = Boolean(gasConfig?.webAppUrl && gasConfig?.webAppUrl.trim().length > 15 && gasConfig.enabled !== false);

  // Default to Google Drive (Apps Script) if configured, else local compression
  const [uploadMode, setUploadMode] = useState<'gas' | 'local'>('gas');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    // Refresh configuration from storage
    const current = getStoredAppsScriptConfig();
    setGasConfig(current);
    if (!current?.webAppUrl) {
      setUploadMode('local');
    }
  }, []);

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

  /**
   * Handle Upload via Google Apps Script (NO POPUP, NO OAUTH LOGIN NEEDED)
   */
  const handleGasUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Pilih file gambar yang valid.');
      return;
    }

    const currentConfig = getStoredAppsScriptConfig();
    if (!currentConfig || !currentConfig.webAppUrl) {
      setUploadError(
        'Google Apps Script belum dikonfigurasi. Silakan buka tab "Google Drive & Sheets" di menu Admin untuk memasukkan URL Web App Anda.'
      );
      return;
    }

    setIsProcessing(true);
    setUploadError(null);
    setSuccessInfo(null);
    setProcessingStatus('Mengunggah ke Google Drive via Apps Script...');

    try {
      const result = await uploadFileViaAppsScript(file, {
        webAppUrl: currentConfig.webAppUrl,
        folderId: currentConfig.folderId,
        spreadsheetId: currentConfig.spreadsheetId,
        onProgress: (status) => setProcessingStatus(status),
      });

      onChange(result.fileUrl);
      setSuccessInfo(`Tersimpan di Google Drive (${formatFileSize(result.size)}) - Bebas Login`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setUploadError(`Gagal ke Google Drive via Apps Script: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  /**
   * Handle Fast Local WebP Compression
   */
  const handleLocalCompression = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Pilih file gambar yang valid.');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);
    setSuccessInfo(null);
    setProcessingStatus('Mengompresi gambar ke WebP...');

    try {
      const compressed = await compressAndResizeImage(file, getPresetOptions());
      onChange(compressed.dataUrl);
      setSuccessInfo(`Kompresi selesai (${formatFileSize(compressed.compressedSize)})`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setUploadError(`Gagal kompresi: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleProcessFile = (file: File) => {
    if (uploadMode === 'gas') {
      if (isGasAvailable) {
        handleGasUpload(file);
      } else {
        // If user tries gas upload but it's not set up, prompt and fallback
        setUploadError(
          'Google Apps Script belum dikonfigurasi. Atur di tab "Google Drive & Sheets", atau gunakan Kompresi Cepat Lokal.'
        );
      }
    } else {
      handleLocalCompression(file);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleUrlChange = (newText: string) => {
    if (allowDriveConverter && newText.includes('drive.google.com')) {
      const converted = convertGoogleDriveUrl(newText);
      if (converted !== newText) {
        setSuccessInfo('Tautan Google Drive otomatis dikonversi ke CDN publik.');
        onChange(converted);
        return;
      }
    }
    onChange(newText);
  };

  const getPreviewClasses = () => {
    if (aspectRatio === 'square') return 'w-20 h-20 rounded-xl';
    if (aspectRatio === 'banner') return 'w-full h-36 rounded-xl';
    return 'w-full sm:w-40 h-28 rounded-xl';
  };

  const isGoogleDriveUrl = value?.includes('googleusercontent.com') || value?.includes('drive.google.com');

  return (
    <div className="space-y-2.5">
      {/* Label & Quick Actions */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase">
          {label}
        </label>
        <div className="flex items-center gap-3">
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <HardDrive className="w-3 h-3" />
            <span>Google Drive ↗</span>
          </a>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Tutup URL' : 'Tempel Link'}</span>
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setSuccessInfo(null);
                setUploadError(null);
              }}
              className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              Hapus
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* Preview Thumbnail */}
        {value && (
          <div className={`relative overflow-hidden border border-slate-200 bg-slate-100 shrink-0 ${getPreviewClasses()}`}>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <span className="absolute bottom-1 right-1 text-white text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-900/80">
              {isGoogleDriveUrl ? 'Google Drive' : value.startsWith('data:') ? 'WebP Lokal' : 'URL'}
            </span>
          </div>
        )}

        {/* Upload Controls */}
        <div className="flex-1 w-full space-y-2">
          {/* Method Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setUploadMode('gas')}
              className={`flex-1 py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                uploadMode === 'gas'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Drive (Apps Script)</span>
              {isGasAvailable && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Apps Script Siap" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('local')}
              className={`flex-1 py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                uploadMode === 'local'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Kompresi WebP</span>
            </button>
          </div>

          {/* Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileInputChange}
          />

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (isProcessing) return;
              fileInputRef.current?.click();
            }}
            className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : uploadMode === 'gas'
                ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs py-1">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{processingStatus || 'Memproses...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                {uploadMode === 'gas' ? (
                  <CloudUpload className="w-4 h-4 text-blue-600" />
                ) : (
                  <Upload className="w-4 h-4 text-slate-600" />
                )}
                <span className="font-bold text-slate-800">
                  {uploadMode === 'gas'
                    ? 'Pilih Gambar ke Google Drive (Tanpa Login)'
                    : 'Pilih Gambar untuk Kompresi Cepat'}
                </span>
                <span className="text-slate-400">atau seret ke sini</span>
              </div>
            )}
          </div>

          {/* Apps Script Status Banner */}
          {uploadMode === 'gas' && (
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
              <div className="flex items-center gap-1.5 truncate">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isGasAvailable ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                />
                <span className="text-slate-600 truncate">
                  {isGasAvailable
                    ? 'Apps Script Terhubung: Unggah langsung ke Google Drive'
                    : 'Apps Script belum diatur (Buka tab "Google Drive & Sheets")'}
                </span>
              </div>

              <span className="text-[10px] font-bold text-blue-600 shrink-0 ml-2">
                {isGasAvailable ? 'Bebas Pop-up' : 'Perlu Setup'}
              </span>
            </div>
          )}

          {/* Feedback messages */}
          {uploadError && (
            <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span>{uploadError}</span>
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('local');
                      fileInputRef.current?.click();
                    }}
                    className="underline font-bold text-red-800 cursor-pointer"
                  >
                    Gunakan Kompresi Cepat WebP
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    className="underline font-bold text-red-800 cursor-pointer"
                  >
                    Tempel Link URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {successInfo && (
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* Optional Direct URL Input */}
          {showUrlInput && (
            <div className="pt-1">
              <input
                type="text"
                value={value.startsWith('data:') ? '' : value}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Tempel link Google Drive atau URL gambar..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
