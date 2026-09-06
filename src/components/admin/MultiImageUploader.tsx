import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  Link as LinkIcon,
  X,
  Sparkles,
} from 'lucide-react';
import {
  compressAndResizeImage,
  convertGoogleDriveUrl,
  formatFileSize,
} from '../../lib/imageOptimizer';

interface MultiImageUploaderProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  label = 'Galeri Foto Tambahan (Bisa Lebih Dari Satu)',
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

  // Process multiple files
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    if (images.length + fileArray.length > maxImages) {
      alert(`Maksimal ${maxImages} gambar dalam satu artikel berita.`);
    }

    const filesToProcess = fileArray.slice(0, maxImages - images.length);
    if (filesToProcess.length === 0) return;

    setIsProcessing(true);
    const newImages: string[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      setProgressText(`Mengompres foto ${i + 1} dari ${filesToProcess.length}...`);
      try {
        const result = await compressAndResizeImage(file, {
          maxWidth: 1200,
          maxHeight: 800,
          quality: 0.8,
          format: 'image/webp',
        });
        newImages.push(result.dataUrl);
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    }

    onChange([...images, ...newImages]);
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

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>{label}</span>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {images.length} / {maxImages} Foto
            </span>
          </label>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Unggah dokumentasi foto kegiatan, infografis, atau album berita. Semua foto otomatis dikompres ringan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              Hapus Semua Foto
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Tutup Input URL' : 'Tambah via URL / Drive'}</span>
          </button>
        </div>
      </div>

      {/* URL Input Form */}
      {showUrlInput && (
        <div className="flex items-center gap-2 pt-1 pb-2">
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
            placeholder="Tempel URL gambar online atau tautan berbagi Google Drive..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Tambah Foto
          </button>
        </div>
      )}

      {/* Dropzone & Upload Button */}
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
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/80'
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
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs py-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{progressText || 'Memproses foto...'}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <Upload className="w-4 h-4" />
              <span>Klik di sini untuk pilih banyak foto sekaligus</span>
              <span className="text-slate-400 font-normal">atau seret beberapa foto</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mendukung JPG, PNG, WebP • Otomatis dioptimalkan untuk penyimpanan Firebase &amp; pembacaan offline
            </p>
          </>
        )}
      </div>

      {/* Grid of Uploaded Images */}
      {images.length > 0 && (
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Pratinjau Galeri Foto ({images.length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className="group relative rounded-lg overflow-hidden border border-slate-200 bg-white aspect-4/3 shadow-2xs"
              >
                <img
                  src={imgUrl}
                  alt={`Galeri ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />

                {/* Badge Number */}
                <span className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  #{index + 1}
                </span>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  title="Hapus gambar ini"
                  className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-md transition-colors cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Reorder buttons */}
                <div className="absolute bottom-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/75 p-0.5 rounded text-white text-[10px]">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveImage(index, index - 1);
                      }}
                      className="px-1 hover:text-blue-300 cursor-pointer"
                      title="Geser ke kiri"
                    >
                      ◀
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveImage(index, index + 1);
                      }}
                      className="px-1 hover:text-blue-300 cursor-pointer"
                      title="Geser ke kanan"
                    >
                      ▶
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
