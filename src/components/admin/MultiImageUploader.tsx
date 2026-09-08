import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Trash2,
  RefreshCw,
  HardDrive,
  Link as LinkIcon,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { convertGoogleDriveUrl } from '../../lib/imageOptimizer';
import {
  uploadFileViaAppsScript,
  getStoredAppsScriptConfig,
} from '../../lib/googleAppsScript';

interface MultiImageUploaderProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  label = 'Galeri Foto Tambahan',
  images = [],
  onChange,
  maxImages = 15,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [singleUrlInput, setSingleUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploaderNotice, setUploaderNotice] = useState<string | null>(null);

  const [gasConfig, setGasConfig] = useState(getStoredAppsScriptConfig());
  const isGasAvailable = Boolean(gasConfig?.webAppUrl && gasConfig.webAppUrl.trim().length > 15 && gasConfig.enabled !== false);

  useEffect(() => {
    setGasConfig(getStoredAppsScriptConfig());
  }, []);

  // Process multiple files - uploads to Google Drive via Apps Script
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    if (images.length + fileArray.length > maxImages) {
      alert(`Maksimal ${maxImages} gambar.`);
    }

    const filesToProcess = fileArray.slice(0, maxImages - images.length);
    if (filesToProcess.length === 0) return;

    const currentConfig = getStoredAppsScriptConfig();
    if (!currentConfig || !currentConfig.webAppUrl) {
      setUploaderNotice(
        'Google Apps Script belum dikonfigurasi. Silakan buka tab "Google Drive & Sheets" di Admin untuk setup, atau tempel tautan gambar manual di tombol "Tambah Link".'
      );
      setShowUrlInput(true);
      return;
    }

    setIsProcessing(true);
    setUploaderNotice(null);

    const newImageUrls: string[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      setProgressText(`Mengunggah ke Drive via Apps Script (${i + 1}/${filesToProcess.length}): ${file.name}...`);
      try {
        const uploadResult = await uploadFileViaAppsScript(file, {
          webAppUrl: currentConfig.webAppUrl,
          folderId: currentConfig.folderId,
          spreadsheetId: currentConfig.spreadsheetId,
        });
        newImageUrls.push(uploadResult.fileUrl);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Failed to upload image to Drive via Apps Script:', err);
        setUploaderNotice(`Gagal mengunggah ${file.name}: ${errorMsg}`);
      }
    }

    if (newImageUrls.length > 0) {
      onChange([...images, ...newImageUrls]);
    }

    setIsProcessing(false);
    setProgressText('');
  };

  const handleAddUrl = () => {
    if (!singleUrlInput.trim()) return;
    let url = singleUrlInput.trim();
    if (url.includes('drive.google.com')) {
      url = convertGoogleDriveUrl(url);
    }
    onChange([...images, url]);
    setSingleUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-800 uppercase">
            {label}
          </label>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
            {images.length}/{maxImages}
          </span>
          {isGasAvailable && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <Zap className="w-2.5 h-2.5" />
              Apps Script Aktif
            </span>
          )}
        </div>

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
            <span>{showUrlInput ? 'Tutup URL' : 'Tambah Link'}</span>
          </button>
          {images.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="flex items-center gap-2 pt-1 pb-1">
          <input
            type="text"
            value={singleUrlInput}
            onChange={(e) => setSingleUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="Tempel tautan gambar atau Google Drive..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Tambah
          </button>
        </div>
      )}

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        {isProcessing ? (
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs py-1">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{progressText || 'Memproses...'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Upload className="w-4 h-4 text-blue-600" />
            <span className="font-bold">Pilih Banyak Foto Sekaligus</span>
            <span className="text-slate-400 text-[11px]">(Langsung ke Drive via Apps Script)</span>
          </div>
        )}
      </div>

      {uploaderNotice && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{uploaderNotice}</span>
        </div>
      )}

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
              <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-90 transition-opacity cursor-pointer"
                title="Hapus foto ini"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
