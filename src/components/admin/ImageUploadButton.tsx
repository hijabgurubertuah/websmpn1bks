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
  LogOut,
  AlertTriangle,
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
  allowDriveConverter = true,
}) => {
  const fileInputDriveRef = useRef<HTMLInputElement | null>(null);
  const fileInputLocalRef = useRef<HTMLInputElement | null>(null);

  const [uploadMode, setUploadMode] = useState<'drive' | 'local'>('local');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Google Drive user & token state
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [isLoggedInDrive, setIsLoggedInDrive] = useState<boolean>(false);

  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

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
      setUploadError('Pilih file gambar yang valid.');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);
    setSuccessInfo(null);
    setProcessingStatus('Menghubungkan ke Google Drive...');

    try {
      const result = await uploadImageToDrive(file, file.name, (status) => {
        setProcessingStatus(status);
      });

      onChange(result.cdnUrl);
      setSuccessInfo(`Tersimpan di Google Drive (${formatFileSize(result.size)})`);
      setIsLoggedInDrive(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setUploadError(
        errorMsg.includes('popup')
          ? 'Popup login terhalang browser. Klik tombol Login Akun Google atau gunakan Kompresi Lokal.'
          : `Gagal ke Google Drive: ${errorMsg}`
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  /**
   * Handle Local File Selection
   * Enforces user requirement: NO binary or base64 images uploaded to Firebase, ONLY link URLs.
   * Uploads file to Google Drive to obtain a public CDN link.
   */
  const handleLocalFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Pilih file gambar yang valid.');
      return;
    }

    // Automatically route to Google Drive to obtain a lightweight CDN URL link
    try {
      await handleDriveUpload(file);
    } catch {
      setUploadError('Firebase hanya menyimpan tautan (link URL) gambar. Silakan login ke Google Drive untuk unggah otomatis, atau tempel tautan URL gambar.');
      setShowUrlInput(true);
    }
  };

  const handleDriveLogin = async () => {
    try {
      setIsProcessing(true);
      setUploadError(null);
      setProcessingStatus('Membuka login Google...');
      const authData = await signInWithGoogleDrive();
      if (authData) {
        setDriveUser(authData.user);
        setIsLoggedInDrive(true);
        setSuccessInfo(`Google Drive terhubung: ${authData.user.email}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setUploadError('Gagal login Google: ' + errorMsg);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleDriveLogout = async () => {
    await signOutGoogleDrive();
    setDriveUser(null);
    setIsLoggedInDrive(false);
    setSuccessInfo(null);
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
            <span>Buka Google Drive ↗</span>
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
              {isGoogleDriveUrl ? 'Google Drive' : value.startsWith('data:') ? 'Lokal' : 'URL'}
            </span>
          </div>
        )}

        {/* Upload Controls */}
        <div className="flex-1 w-full space-y-2">
          {/* Method Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setUploadMode('drive')}
              className={`flex-1 py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                uploadMode === 'drive'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardDrive className="w-3 h-3" />
              <span>Google Drive</span>
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
              <span>Kompresi Cepat</span>
            </button>
          </div>

          {/* Hidden Inputs */}
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
              if (uploadMode === 'drive') {
                fileInputDriveRef.current?.click();
              } else {
                fileInputLocalRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : uploadMode === 'drive'
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
                {uploadMode === 'drive' ? (
                  <CloudUpload className="w-4 h-4 text-blue-600" />
                ) : (
                  <Upload className="w-4 h-4 text-slate-600" />
                )}
                <span className="font-bold text-slate-800">
                  {uploadMode === 'drive' ? 'Pilih Gambar ke Google Drive' : 'Pilih Gambar untuk Kompresi Cepat'}
                </span>
                <span className="text-slate-400">atau seret ke sini</span>
              </div>
            )}
          </div>

          {/* Account Status / Login */}
          {uploadMode === 'drive' && (
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
              <div className="flex items-center gap-1.5 truncate">
                <div className={`w-2 h-2 rounded-full shrink-0 ${isLoggedInDrive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <span className="text-slate-600 truncate">
                  {isLoggedInDrive ? driveUser?.email || 'Akun Google Terhubung' : 'Perlu login Google untuk unggah'}
                </span>
              </div>

              {isLoggedInDrive ? (
                <button
                  type="button"
                  onClick={handleDriveLogout}
                  className="text-slate-400 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer shrink-0 ml-2"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Keluar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDriveLogin}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                >
                  <HardDrive className="w-3 h-3" />
                  <span>Login Google</span>
                </button>
              )}
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
                      fileInputLocalRef.current?.click();
                    }}
                    className="underline font-bold text-red-800 cursor-pointer"
                  >
                    Gunakan Kompresi Cepat
                  </button>
                  <span>•</span>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold text-red-800"
                  >
                    Buka Drive ↗
                  </a>
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
