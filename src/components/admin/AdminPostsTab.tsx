import React, { useState } from 'react';
import { NewsArticle } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  BookmarkCheck,
  Search,
  FileText,
  Calendar,
  User,
  Image as ImageIcon,
  Eye,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ExternalLink,
  Code2,
  Link as LinkIcon,
  Globe,
  Sparkles,
  Maximize2,
  HardDrive,
  CloudUpload,
} from 'lucide-react';
import { ImageUploadButton } from './ImageUploadButton';
import { MultiImageUploader } from './MultiImageUploader';
import { parseEmbedUrl } from '../../lib/embedHelper';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

interface AdminPostsTabProps {
  articles: NewsArticle[];
  onSaveArticle: (article: NewsArticle) => Promise<void>;
  onSaveArticleLocally?: (article: NewsArticle) => Promise<void>;
  onDeleteArticle: (articleId: string) => Promise<void>;
}

export const AdminPostsTab: React.FC<AdminPostsTabProps> = ({
  articles,
  onSaveArticle,
  onSaveArticleLocally,
  onDeleteArticle,
}) => {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'drafts' | 'cloud'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Prestasi');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('Humas Sekolah');
  const [date, setDate] = useState('06 September 2026');
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [saving, setSaving] = useState(false);
  const [savingLocal, setSavingLocal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Multi-image, link, & embed states
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [actionLinkLabel, setActionLinkLabel] = useState('');
  const [actionLinkUrl, setActionLinkUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedTitle, setEmbedTitle] = useState('');
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);

  // Delete modal states
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Lock body scroll when delete confirmation modal is open
  useBodyScrollLock(!!articleToDelete);

  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const resetForm = () => {
    setTitle('');
    setCategory('Prestasi');
    setSummary('');
    setContent('');
    setCoverImage('');
    setAuthor('Humas Sekolah');
    setDate('06 September 2026');
    setIsPinned(false);
    setStatus('published');
    setGalleryImages([]);
    setActionLinkLabel('');
    setActionLinkUrl('');
    setEmbedUrl('');
    setEmbedTitle('');
    setShowEmbedPreview(false);
    setEditingArticleId(null);
    setIsEditing(false);
    setFormError(null);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleStartEdit = (art: NewsArticle) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setCategory(art.category);
    setSummary(art.summary);
    setContent(art.content);
    setCoverImage(art.coverImage);
    setAuthor(art.author);
    setDate(art.date);
    setIsPinned(art.isPinned);
    setStatus(art.status);
    setGalleryImages(art.galleryImages || []);
    setActionLinkLabel(art.actionLink?.label || '');
    setActionLinkUrl(art.actionLink?.url || '');
    setEmbedUrl(art.embedUrl || '');
    setEmbedTitle(art.embedTitle || '');
    setShowEmbedPreview(Boolean(art.embedUrl));
    setFormError(null);
    setIsEditing(true);
  };

  // Save to Local Draft only (0 Firebase write operations)
  const handleSaveLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Judul berita tidak boleh kosong.');
      return;
    }
    if (!content.trim()) {
      setFormError('Konten lengkap berita tidak boleh kosong.');
      return;
    }

    setFormError(null);
    setSavingLocal(true);
    const localArticle: NewsArticle = {
      id: editingArticleId || `news-${Date.now()}`,
      title: title.trim(),
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
      category,
      summary: summary.trim(),
      content: content.trim(),
      coverImage:
        coverImage.trim() ||
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      author: author.trim() || 'Humas Sekolah',
      date: date.trim() || '06 September 2026',
      isPinned,
      views: editingArticleId ? articles.find((a) => a.id === editingArticleId)?.views || 10 : 1,
      status,
      galleryImages: galleryImages.filter(Boolean),
      actionLink: actionLinkUrl.trim()
        ? {
            label: actionLinkLabel.trim() || 'Kunjungi Tautan Terkait',
            url: actionLinkUrl.trim(),
          }
        : undefined,
      embedUrl: embedUrl.trim() || undefined,
      embedTitle: embedTitle.trim() || undefined,
      isLocalDraft: true,
    };

    try {
      if (onSaveArticleLocally) {
        await onSaveArticleLocally(localArticle);
      } else {
        await onSaveArticle(localArticle);
      }
      resetForm();
      setFeedbackToast({
        type: 'success',
        message: 'Tersimpan di DRAF LOKAL (0 kuota Firebase terpakai). Anda bisa mengeditnya kapan saja di perangkat ini.',
      });
      setTimeout(() => setFeedbackToast(null), 5000);
    } catch (err) {
      setFeedbackToast({
        type: 'error',
        message: 'Gagal menyimpan draf lokal: ' + String(err),
      });
    } finally {
      setSavingLocal(false);
    }
  };

  // Save and Upload directly to Cloud Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Judul berita tidak boleh kosong.');
      return;
    }
    if (!content.trim()) {
      setFormError('Konten lengkap berita tidak boleh kosong.');
      return;
    }

    setFormError(null);
    setSaving(true);
    const newArticle: NewsArticle = {
      id: editingArticleId || `news-${Date.now()}`,
      title: title.trim(),
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
      category,
      summary: summary.trim(),
      content: content.trim(),
      coverImage:
        coverImage.trim() ||
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      author: author.trim() || 'Humas Sekolah',
      date: date.trim() || '06 September 2026',
      isPinned,
      views: editingArticleId ? articles.find((a) => a.id === editingArticleId)?.views || 10 : 1,
      status,
      galleryImages: galleryImages.filter(Boolean),
      actionLink: actionLinkUrl.trim()
        ? {
            label: actionLinkLabel.trim() || 'Kunjungi Tautan Terkait',
            url: actionLinkUrl.trim(),
          }
        : undefined,
      embedUrl: embedUrl.trim() || undefined,
      embedTitle: embedTitle.trim() || undefined,
      isLocalDraft: false,
    };

    await onSaveArticle(newArticle);
    setSaving(false);
    resetForm();
    setFeedbackToast({
      type: 'success',
      message: editingArticleId ? 'Perubahan berita berhasil disimpan dan diunggah ke Cloud Firestore.' : 'Berita baru berhasil diterbitkan dan diunggah ke Cloud Firestore.',
    });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Quick 1-click upload from table for any local draft
  const handleQuickUploadToCloud = async (art: NewsArticle) => {
    setSaving(true);
    try {
      await onSaveArticle({
        ...art,
        isLocalDraft: false,
      });
      setFeedbackToast({
        type: 'success',
        message: `Draf "${art.title}" berhasil diunggah dan disinkronkan ke Cloud Firebase!`,
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err) {
      setFeedbackToast({
        type: 'error',
        message: 'Gagal mengunggah ke Cloud: ' + String(err),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    setDeleting(true);
    try {
      await onDeleteArticle(articleToDelete.id);
      if (editingArticleId === articleToDelete.id) {
        resetForm();
      }
      setFeedbackToast({
        type: 'success',
        message: `Berita "${articleToDelete.title}" berhasil dihapus.`,
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err) {
      setFeedbackToast({
        type: 'error',
        message: 'Gagal menghapus berita: ' + String(err),
      });
    } finally {
      setDeleting(false);
      setArticleToDelete(null);
    }
  };

  const handleTogglePin = async (art: NewsArticle) => {
    await onSaveArticle({
      ...art,
      isPinned: !art.isPinned,
    });
  };

  const sampleImages = [
    { label: 'Prestasi Sains', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80' },
    { label: 'PPDB & Ujian', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80' },
    { label: 'Kegiatan Belajar', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80' },
    { label: 'Seni Musik & Choir', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80' },
  ];

  const localDrafts = articles.filter((a) => Boolean(a.isLocalDraft));
  const cloudArticles = articles.filter((a) => !a.isLocalDraft);

  const filtered = articles
    .filter((a) => {
      if (filterTab === 'drafts') return Boolean(a.isLocalDraft);
      if (filterTab === 'cloud') return !a.isLocalDraft;
      return true;
    })
    .filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase()) ||
        a.author.toLowerCase().includes(search.toLowerCase())
    );

  const currentEditingArt = editingArticleId ? articles.find((a) => a.id === editingArticleId) : null;
  const isCurrentDraftLocal = currentEditingArt ? Boolean(currentEditingArt.isLocalDraft) : false;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Feedback Toast Notification */}
      {feedbackToast && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition-all ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackToast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedbackToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="p-1 hover:bg-black/5 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Manajemen Postingan &amp; Berita Sekolah</span>
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tersinkron ke Cloud (Firebase)
            </span>
            {localDrafts.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                {localDrafts.length} Draf di Perangkat Ini
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gunakan opsi <strong className="text-amber-700">Simpan Draf Lokal</strong> untuk menulis dan mengedit berita kapan saja di perangkat ini tanpa menghabiskan kuota Firebase. Kuota Firebase hanya terpakai jika Anda menekan <strong className="text-blue-700">Simpan/Terbitkan ke Cloud</strong>.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Berita Baru</span>
          </button>
        )}
      </div>

      {/* Editor Modal / Inline Form */}
      {isEditing && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-blue-600 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-600" />
                  <span>{editingArticleId ? 'Edit Postingan Berita' : 'Tulis Postingan Berita Baru'}</span>
                </h4>
                {editingArticleId && (
                  isCurrentDraftLocal ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      <HardDrive className="w-3 h-3 text-amber-600" />
                      Status: Draf Lokal (Belum di Cloud)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Status: Tersimpan di Cloud
                    </span>
                  )
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih <strong className="text-amber-700">"Simpan ke Draf Lokal"</strong> (0 kuota Firebase) untuk diedit kapan saja di perangkat ini, atau <strong className="text-blue-700">"Simpan &amp; Unggah ke Cloud"</strong> untuk menerbitkan ke database online.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Judul Berita *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul berita yang jelas dan menarik..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Kategori Berita
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                >
                  <option value="Prestasi">Prestasi</option>
                  <option value="Pengumuman">Pengumuman</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                  <option value="Alumni">Alumni</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Penulis / Sumber
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Humas Sekolah"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Publikasi
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="06 September 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Cover Image Upload / Google Drive Converter */}
            <div className="space-y-2">
              <ImageUploadButton
                label="Gambar Sampul Berita (Cover Image / Google Drive)"
                value={coverImage}
                onChange={(url) => setCoverImage(url)}
                preset="post"
                aspectRatio="wide"
                placeholder="https://... atau tempel link Google Drive"
                allowDriveConverter={true}
              />

              {/* Sample Quick Picker */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400">Pilihan cepat:</span>
                {sampleImages.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImage(s.url)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Ringkasan Berita (Excerpt / Lead Paragraph)
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Ringkasan singkat 1-2 kalimat yang tampil di kartu berita..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Full Content */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Konten / Isi Lengkap Berita *
              </label>
              <textarea
                rows={8}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan berita lengkap di sini (mendukung beberapa paragraf, format link [Teks](url) atau tautan langsung)..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Multiple Gallery Images */}
            <MultiImageUploader
              images={galleryImages}
              onChange={setGalleryImages}
              label="Galeri Foto Tambahan (Bisa Unggah Banyak Sekaligus)"
            />

            {/* Action Link / Tautan Halaman Tertentu */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  <span>Tautan Khusus / Tombol Halaman Tertentu (Opsional)</span>
                </label>
                {actionLinkUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setActionLinkLabel('');
                      setActionLinkUrl('');
                    }}
                    className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Hapus Tautan
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Tambahkan tombol aksi khusus pada artikel, misalnya link pengumuman, download formulir/surat edaran, atau tautan ke halaman internal/eksternal.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Label Tombol Tautan:
                  </label>
                  <input
                    type="text"
                    value={actionLinkLabel}
                    onChange={(e) => setActionLinkLabel(e.target.value)}
                    placeholder="Contoh: Unduh Formulir PPDB / Link Pengumuman"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    URL Tautan Tujuan:
                  </label>
                  <input
                    type="text"
                    value={actionLinkUrl}
                    onChange={(e) => setActionLinkUrl(e.target.value)}
                    placeholder="https://... atau #agenda"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Embed (Google Apps Script, YouTube, Google Forms/Docs, etc.) */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                    Embed Konten Interaktif &amp; Google Apps Script (Opsional)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {embedUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowEmbedPreview(!showEmbedPreview)}
                        className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{showEmbedPreview ? 'Tutup Pratinjau' : 'Pratinjau Embed'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmbedUrl('');
                          setEmbedTitle('');
                          setShowEmbedPreview(false);
                        }}
                        className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                      >
                        Hapus Embed
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Mendukung <strong>link hasil deploy Google Apps Script</strong> (<code>https://script.google.com/macros/s/.../exec</code>), video YouTube, Google Forms, Google Sheets, Canva, atau kode <code>&lt;iframe&gt;</code>. Di halaman publik, pengunjung dapat berinteraksi langsung atau membuka di tab baru untuk tampilan yang lebih leluasa dan layar penuh.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Judul Embed (Opsional):
                  </label>
                  <input
                    type="text"
                    value={embedTitle}
                    onChange={(e) => setEmbedTitle(e.target.value)}
                    placeholder="Contoh: Aplikasi Kelulusan Siswa / Formulir PPDB"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    URL Embed / Link Deploy Apps Script:
                  </label>
                  <input
                    type="text"
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec atau https://youtube.com/..."
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Preset Tips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                <span className="font-semibold">Format didukung:</span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                  Google Apps Script (/exec)
                </span>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-medium">
                  YouTube Video / Shorts
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                  Google Forms / Docs / Sheets
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-medium">
                  Kode &lt;iframe&gt; HTML
                </span>
              </div>

              {/* Live Preview Inside Editor */}
              {showEmbedPreview && embedUrl && (
                <div className="mt-3 border border-purple-200 rounded-xl bg-white overflow-hidden shadow-xs">
                  {(() => {
                    const parsed = parseEmbedUrl(embedUrl);
                    if (!parsed) return <div className="p-3 text-xs text-red-600">Format URL tidak valid.</div>;

                    return (
                      <div>
                        <div className="px-3 py-2 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            {embedTitle || parsed.label}
                          </span>
                          <a
                            href={parsed.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
                          >
                            <span>Uji Buka di Tab Baru</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="h-80 w-full bg-slate-100">
                          <iframe
                            src={parsed.embedUrl}
                            title="Pratinjau Embed Admin"
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                  />
                  <span>Pasang sebagai Berita Unggulan (Pinned)</span>
                </label>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>Status:</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="published">Tayang (Published)</option>
                    <option value="draft">Draf (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                {editingArticleId && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentArt = articles.find((a) => a.id === editingArticleId);
                      if (currentArt) setArticleToDelete(currentArt);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 mr-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Berita Ini</span>
                  </button>
                )}
                <div className="flex items-center gap-2.5 ml-auto flex-wrap">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 bg-white rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLocal}
                    disabled={saving || savingLocal}
                    className="px-4 py-2.5 text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-2xs"
                    title="Simpan hanya di perangkat ini tanpa koneksi Firebase (0 kuota Firebase terpakai)"
                  >
                    <HardDrive className={`w-4 h-4 text-amber-700 ${savingLocal ? 'animate-pulse' : ''}`} />
                    <span>{savingLocal ? 'Menyimpan Draf...' : 'Simpan ke Draf Lokal'}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={saving || savingLocal}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    title="Kirim dan simpan permanen ke Firebase Cloud Firestore"
                  >
                    <CloudUpload className={`w-4 h-4 ${saving ? 'animate-bounce' : ''}`} />
                    <span>
                      {saving
                        ? 'Menyimpan ke Cloud...'
                        : editingArticleId
                        ? 'Simpan & Unggah ke Cloud'
                        : 'Terbitkan & Unggah ke Cloud'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Articles Table & Search */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Daftar Berita ({articles.length})
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({articles.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('drafts')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'drafts'
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Draf Lokal</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    filterTab === 'drafts'
                      ? 'bg-amber-950/20 text-amber-950'
                      : localDrafts.length > 0
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {localDrafts.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('cloud')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'cloud'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Cloud ({cloudArticles.length})</span>
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berita..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3">Berita</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Penulis</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Status Simpan</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={art.coverImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 line-clamp-1 text-sm">{art.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{art.summary}</p>
                        
                        {/* Tags for multi-image, embed, link */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {art.galleryImages && art.galleryImages.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              <ImageIcon className="w-2.5 h-2.5 text-blue-600" />
                              {art.galleryImages.length} Foto
                            </span>
                          )}
                          {art.embedUrl && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              <Code2 className="w-2.5 h-2.5 text-purple-600" />
                              Embed
                            </span>
                          )}
                          {art.actionLink?.url && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              <LinkIcon className="w-2.5 h-2.5 text-blue-600" />
                              Link
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700">
                      {art.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 text-xs">
                    {art.author}
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 text-xs whitespace-nowrap">
                    {art.date}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            art.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span className="text-xs font-medium text-slate-700 capitalize">
                          {art.status}
                        </span>
                      </div>
                      {art.isLocalDraft ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          <HardDrive className="w-2.5 h-2.5 text-amber-600" />
                          Draf Lokal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          Cloud
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {art.isLocalDraft && (
                        <button
                          type="button"
                          onClick={() => handleQuickUploadToCloud(art)}
                          disabled={saving}
                          title="Unggah draf lokal ini ke Firebase Cloud sekarang"
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all cursor-pointer mr-1 disabled:opacity-50"
                        >
                          <CloudUpload className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Unggah Cloud</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleTogglePin(art)}
                        title={art.isPinned ? 'Lepas Pin' : 'Pasang Pin Unggulan'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          art.isPinned
                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <BookmarkCheck className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(art)}
                        title="Edit Berita"
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setArticleToDelete(art)}
                        title="Hapus Berita"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-UI Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overscroll-contain touch-none animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 overscroll-contain space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Postingan Berita?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus postingan berita ini? Data akan dihapus secara permanen dari browser lokal dan cloud Firebase.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <p className="font-bold text-slate-900 text-xs line-clamp-2">{articleToDelete.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-semibold text-blue-600">{articleToDelete.category}</span>
                <span>•</span>
                <span>{articleToDelete.date}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
