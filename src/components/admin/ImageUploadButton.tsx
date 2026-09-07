import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
  HardDrive,
  CloudUpload,
  ExternalLink,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import {
  compressAndResizeImage,
  convertGoogleDriveUrl,
  formatFileSize,
  CompressionOptions,
} from '../../lib/imageOptimizer';
import {
  uploadImageToDrive,
  signInWithGoogleDrive,
  getDriveAccessToken,
  signOutGoogleDrive,
  initDriveAuth,
} from '../../lib/googleDrive';
import { User } from 'firebase/auth';

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
  const fileInputDriveRef = useRef<HTMLInputElement | null>(null);
  const fileInputLocalRef = useRef<HTMLInputElement | null>(null);

  const [uploadMode, setUploadMode] = useState<'drive' | 'local'>('drive');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  // Google Drive user & token state
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [isLoggedInDrive, setIsLoggedInDrive] = useState<boolean>(false);

  const [compressionInfo, setCompressionInfo] = useState<{
    original: string;
    compressed: string;
    savings: number;
  } | null>(null);

  const [driveUploadInfo, setDriveUploadInfo] = useState<{
    fileId: string;
    cdnUrl: string;
    fileName: string;
    size: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(!value?.startsWith('data:'));
  const [driveConvertedNotice, setDriveConvertedNotice] = useState(false);

  // Monitor Google Auth state
  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, token) => {
        setDriveUser(user);
        setIsLoggedInDrive(Boolean(token));
      },
      () => {
        setDriveUser(null);
        setIsLoggedInDrive(Boolean(getDriveAccessToken()));
      }
    );
    return () => unsubscribe();
  }, []);

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

  /**
   * Handle Direct Upload to Google Drive
   */
  const handleDriveUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WebP, SVG).');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Menghubungkan ke Google Drive...');
    setCompressionInfo(null);
    setDriveUploadInfo(null);
    setDriveConvertedNotice(false);

    try {
      const result = await uploadImageToDrive(file, file.name, (status) => {
        setProcessingStatus(status);
      });

      // Apply CDN URL to form/post
      onChange(result.cdnUrl);
      setDriveUploadInfo({
        fileId: result.fileId,
        cdnUrl: result.cdnUrl,
        fileName: result.fileName,
        size: formatFileSize(result.size),
      });
      setIsLoggedInDrive(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert('Gagal mengunggah ke Google Drive: ' + errorMsg);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  /**
   * Handle Local Browser Compression (Base64/Data URL)
   */
  const handleLocalFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WebP, SVG).');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Mengompresi gambar untuk database lokal...');
    setCompressionInfo(null);
    setDriveUploadInfo(null);
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
      setProcessingStatus('');
    }
  };

  const handleDriveLogin = async () => {
    try {
      setIsProcessing(true);
      setProcessingStatus('Membuka jendela login Google...');
      const authData = await signInWithGoogleDrive();
      if (authData) {
        setDriveUser(authData.user);
        setIsLoggedInDrive(true);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert('Gagal menghubungkan Google Drive: ' + errorMsg);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleDriveLogout = async () => {
    await signOutGoogleDrive();
    setDriveUser(null);
    setIsLoggedInDrive(false);
  };

  const onDriveFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleDriveUpload(file);
    if (fileInputDriveRef.current) fileInputDriveRef.current.value = '';
  };

  const onLocalFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLocalFile(file);
    if (fileInputLocalRef.current) fileInputLocalRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (uploadMode === 'drive') {
        handleDriveUpload(file);
      } else {
        handleLocalFile(file);
      }
    }
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

  const isGoogleDriveUrl = value?.includes('googleusercontent.com') || value?.includes('drive.google.com');

  return (
    <div className="space-y-3">
      {/* Top Header Label & Controls */}
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
                setDriveUploadInfo(null);
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
            <span>{showUrlInput ? 'Tutup Input URL' : 'Tempel URL / Drive'}</span>
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
            <span
              className={`absolute bottom-2 right-2 text-white text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-xs flex items-center gap-1 ${
                isGoogleDriveUrl
                  ? 'bg-blue-600/90'
                  : value.startsWith('data:')
                  ? 'bg-slate-900/80'
                  : 'bg-emerald-700/90'
              }`}
            >
              {isGoogleDriveUrl ? (
                <>
                  <HardDrive className="w-3 h-3" />
                  <span>Google Drive CDN</span>
                </>
              ) : value.startsWith('data:') ? (
                'Data URL Lokal'
              ) : (
                'URL Eksternal'
              )}
            </span>
          </div>
        )}

        {/* Right / Upload Action Box */}
        <div
          className={`space-y-3 ${
            value && aspectRatio !== 'banner' ? 'sm:col-span-8' : 'sm:col-span-12'
          }`}
        >
          {/* Method Selector Tabs: Google Drive vs Local */}
          <div className="flex items-center justify-between p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setUploadMode('drive')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                uploadMode === 'drive'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Unggah ke Google Drive (Disarankan)</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('local')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                uploadMode === 'local'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Kompresi Lokal</span>
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputDriveRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onDriveFileInputChange}
          />
          <input
            ref={fileInputLocalRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onLocalFileInputChange}
          />

          {/* DRAG & DROP ZONE FOR GOOGLE DRIVE UPLOAD */}
          {uploadMode === 'drive' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (!isProcessing) fileInputDriveRef.current?.click();
              }}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                  : 'border-blue-200 hover:border-blue-400 bg-gradient-to-b from-blue-50/50 to-white hover:bg-blue-50/30'
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2 text-blue-600 font-bold text-xs py-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-slate-700">{processingStatus || 'Memproses unggahan Google Drive...'}</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                    <CloudUpload className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-blue-700 hover:underline">
                      Pilih Foto untuk Diunggah ke Google Drive
                    </span>{' '}
                    <span className="text-slate-500">atau seret gambar ke sini</span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-md">
                    Otomatis disimpan di folder <strong>[SMPN 1 Bengkalis] Web Assets</strong> di Google Drive Anda &amp; dikonversi ke CDN publik berkecepatan tinggi.
                  </p>
                </>
              )}
            </div>
          )}

          {/* DRAG & DROP ZONE FOR LOCAL COMPRESSION */}
          {uploadMode === 'local' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (!isProcessing) fileInputLocalRef.current?.click();
              }}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-slate-400 bg-slate-100'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/70'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs py-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{processingStatus || 'Mengompresi gambar...'}</span>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 hover:underline">
                      Pilih foto untuk kompresi lokal
                    </span>{' '}
                    <span className="text-slate-500">atau seret gambar ke sini</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Otomatis dikompresi ke WebP/PNG (~30-80 KB) tersimpan di basis data internal.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Drive Account Status Bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLoggedInDrive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className="text-slate-600">
                {isLoggedInDrive ? (
                  <>
                    Akun Google Terhubung: <strong className="text-slate-800">{driveUser?.email || 'Aktif'}</strong>
                  </>
                ) : (
                  'Google Drive siap terhubung saat mengunggah foto'
                )}
              </span>
            </div>

            {isLoggedInDrive ? (
              <button
                type="button"
                onClick={handleDriveLogout}
                className="text-slate-400 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
                title="Keluar dari Google Drive"
              >
                <LogOut className="w-3 h-3" />
                <span>Putuskan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDriveLogin}
                className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <HardDrive className="w-3 h-3" />
                <span>Hubungkan Akun Google</span>
              </button>
            )}
          </div>

          {/* Drive Upload Success Badge */}
          {driveUploadInfo && (
            <div className="flex items-center justify-between text-[11px] text-blue-900 bg-blue-50 border border-blue-200 p-2.5 rounded-lg animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Berhasil diunggah ke Google Drive: <strong>{driveUploadInfo.fileName}</strong> ({driveUploadInfo.size})
                </span>
              </div>
              <a
                href={driveUploadInfo.cdnUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline font-bold flex items-center gap-1 shrink-0 ml-2"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Buka CDN</span>
              </a>
            </div>
          )}

          {/* Local Compression Success Badge */}
          {compressionInfo && (
            <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Dioptimasi: <strong>{compressionInfo.original}</strong> →{' '}
                <strong>{compressionInfo.compressed}</strong> (Hemat {compressionInfo.savings}%)
              </span>
            </div>
          )}

          {/* Google Drive Converted Notice */}
          {driveConvertedNotice && (
            <div className="flex items-center gap-2 text-[11px] text-blue-800 bg-blue-50 border border-blue-200 p-2.5 rounded-lg animate-in fade-in">
              <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Tautan Google Drive Terdeteksi!</strong> Otomatis dikonversi ke gambar CDN berkecepatan tinggi &amp; siap tayang di web publik.
              </span>
            </div>
          )}

          {/* Optional Direct URL or Google Drive Link Input */}
          {showUrlInput && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Tempel URL Gambar Eksternal / Tautan Google Drive Manual:
                </label>
                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <HardDrive className="w-3 h-3" />
                  <span>Buka Google Drive ↗</span>
                </a>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={value.startsWith('data:') ? '' : value}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing atau https://..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
