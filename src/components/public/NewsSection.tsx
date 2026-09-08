import React, { useState, useMemo } from 'react';
import { NewsArticle } from '../../types';
import {
  Calendar,
  User,
  ChevronRight,
  BookmarkCheck,
  Newspaper,
  Search,
  Eye,
  Image as ImageIcon,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { NewsDetailModal } from './NewsDetailModal';

interface NewsSectionProps {
  articles: NewsArticle[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ articles }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Available categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['Semua', ...Array.from(set)];
  }, [articles]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((a) => a.status === 'published' && !a.isLocalDraft)
      .filter((a) => {
        if (selectedCategory === 'Semua') return true;
        return a.category.toLowerCase() === selectedCategory.toLowerCase();
      })
      .filter((a) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
        );
      });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <section id="berita" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Kabar Sekolah</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Berita, Prestasi &amp; Informasi Terkini
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Ikuti kabar terhangat seputar prestasi siswa, kegiatan kurikuler, dan agenda pengumuman sekolah.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berita..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">Tidak ada berita yang ditemukan.</p>
            <p className="text-xs text-slate-400 mt-1">
              Coba gunakan kata kunci lain atau pilih kategori yang berbeda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
              >
                {/* Thumbnail Image */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                  <img
                    src={
                      article.coverImage ||
                      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="bg-blue-700/90 backdrop-blur-md text-white font-bold text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {article.category}
                    </span>
                    {article.isPinned && (
                      <span className="bg-amber-500/95 backdrop-blur-md text-slate-950 font-bold text-[11px] px-2 py-1 rounded-md flex items-center gap-1 shadow-xs">
                        <BookmarkCheck className="w-3 h-3 text-slate-950" />
                        Unggulan
                      </span>
                    )}
                  </div>

                  {/* Badges for gallery and embed */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    {article.galleryImages && article.galleryImages.length > 0 && (
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {article.galleryImages.length} Foto
                      </span>
                    )}
                    {article.embedUrl && (
                      <span className="bg-purple-900/80 backdrop-blur-md text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Code2 className="w-3 h-3" />
                        Interaktif
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {article.views} views
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">
                    {article.summary}
                  </p>

                  {/* Author & Read More */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1 truncate max-w-[150px]">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      {article.author}
                    </span>
                    <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Baca Berita
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Detail Modal */}
      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </section>
  );
};
