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
  Image,
  Eye,
  CheckCircle,
  X,
} from 'lucide-react';

interface AdminPostsTabProps {
  articles: NewsArticle[];
  onSaveArticle: (article: NewsArticle) => Promise<void>;
  onDeleteArticle: (articleId: string) => Promise<void>;
}

export const AdminPostsTab: React.FC<AdminPostsTabProps> = ({
  articles,
  onSaveArticle,
  onDeleteArticle,
}) => {
  const [search, setSearch] = useState('');
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
    setEditingArticleId(null);
    setIsEditing(false);
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
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Mohon lengkapi judul dan konten berita.');
      return;
    }

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
    };

    await onSaveArticle(newArticle);
    setSaving(false);
    resetForm();
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus berita "${title}"?`)) {
      await onDeleteArticle(id);
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

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Manajemen Postingan &amp; Berita Sekolah (CMS)</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Unggah berita baru, perbarui artikel, atur pin unggulan, dan pantau status terbit.
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
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>{editingArticleId ? 'Edit Postingan Berita' : 'Tulis Postingan Berita Baru'}</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan informasi akurat sebelum menerbitkan ke halaman publik.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                URL Gambar Sampul (Cover Image)
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                {coverImage && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-slate-100">
                    <img
                      src={coverImage}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

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
                placeholder="Tuliskan berita lengkap di sini (mendukung beberapa paragraf)..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
              />
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

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 bg-white rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Postingan'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Articles Table & Search */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Daftar Berita Terdaftar ({articles.length})
          </span>

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
                <th className="py-3 px-3">Status</th>
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          art.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span className="text-xs font-medium text-slate-700 capitalize">
                        {art.status}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
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
                        onClick={() => handleDelete(art.id, art.title)}
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

    </div>
  );
};
