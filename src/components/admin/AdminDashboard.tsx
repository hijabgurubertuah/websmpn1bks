import React, { useState } from 'react';
import { SchoolConfig, NewsArticle } from '../../types';
import {
  Sparkles,
  Layers,
  FileText,
  Layout,
  Award,
  Video,
  Share2,
  Database,
  ArrowLeft,
  Save,
  CheckCircle2,
  Eye,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { AdminHeaderTab } from './AdminHeaderTab';
import { AdminMenusTab } from './AdminMenusTab';
import { AdminPostsTab } from './AdminPostsTab';
import { AdminLayoutTab } from './AdminLayoutTab';
import { AdminPrincipalTab } from './AdminPrincipalTab';
import { AdminEmbedsTab } from './AdminEmbedsTab';
import { AdminFooterTab } from './AdminFooterTab';
import { AdminSyncTab } from './AdminSyncTab';

interface AdminDashboardProps {
  config: SchoolConfig;
  articles: NewsArticle[];
  onChangeConfig: (newConfig: SchoolConfig) => void;
  onSaveArticle: (article: NewsArticle) => Promise<void>;
  onDeleteArticle: (articleId: string) => Promise<void>;
  onManualSaveAll: () => Promise<void>;
  onCloseAdmin: () => void;
  onLogout: () => void;
  onDataRestored: (newConfig: SchoolConfig, newArticles: NewsArticle[]) => void;
}

export type AdminTab =
  | 'header'
  | 'menus'
  | 'posts'
  | 'layout'
  | 'principal'
  | 'embeds'
  | 'footer'
  | 'sync';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  config,
  articles,
  onChangeConfig,
  onSaveArticle,
  onDeleteArticle,
  onManualSaveAll,
  onCloseAdmin,
  onLogout,
  onDataRestored,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('header');
  const [savingAll, setSavingAll] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSaveClick = async () => {
    setSavingAll(true);
    await onManualSaveAll();
    setSavingAll(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'header', label: 'Header & Identitas', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'menus', label: 'Menu & Dropdown', icon: <Layers className="w-4 h-4" /> },
    { id: 'posts', label: 'Postingan Berita', icon: <FileText className="w-4 h-4" /> },
    { id: 'layout', label: 'Tata Letak', icon: <Layout className="w-4 h-4" /> },
    { id: 'principal', label: 'Sambutan Kepsek', icon: <Award className="w-4 h-4" /> },
    { id: 'embeds', label: 'Embed Video & Peta', icon: <Video className="w-4 h-4" /> },
    { id: 'footer', label: 'Footer & Kontak', icon: <Share2 className="w-4 h-4" /> },
    { id: 'sync', label: 'Firebase & Backup', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-sm">Perubahan Tersimpan!</div>
            <div className="text-xs text-slate-400">Tersinkron ke penyimpanan dan database Firebase Firestore.</div>
          </div>
        </div>
      )}

      {/* Admin Top Appbar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left Title & Status */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onCloseAdmin}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Lihat Website</span>
              </button>

              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base tracking-tight">
                    CMS Admin Sekolah
                  </span>
                  <span className="inline-flex items-center gap-1 bg-blue-900/80 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-700">
                    <ShieldCheck className="w-3 h-3" />
                    v2.0
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {config.identity.name}
                </span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onCloseAdmin}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Buka tampilan publik"
              >
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Pratinjau Live</span>
              </button>

              <button
                type="button"
                onClick={handleSaveClick}
                disabled={savingAll}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className={`w-4 h-4 ${savingAll ? 'animate-spin' : ''}`} />
                <span>{savingAll ? 'Menyimpan...' : 'Simpan ke Cloud'}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Kunci & Keluar dari sesi admin"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Kunci / Keluar</span>
              </button>
            </div>

          </div>

          {/* Tab Navigation Scrollable Bar */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Dynamic Tab Views */}
        {activeTab === 'header' && (
          <AdminHeaderTab config={config} onChange={onChangeConfig} />
        )}

        {activeTab === 'menus' && (
          <AdminMenusTab config={config} onChange={onChangeConfig} />
        )}

        {activeTab === 'posts' && (
          <AdminPostsTab
            articles={articles}
            onSaveArticle={onSaveArticle}
            onDeleteArticle={onDeleteArticle}
          />
        )}

        {activeTab === 'layout' && (
          <AdminLayoutTab config={config} onChange={onChangeConfig} />
        )}

        {activeTab === 'principal' && (
          <AdminPrincipalTab config={config} onChange={onChangeConfig} />
        )}

        {activeTab === 'embeds' && (
          <AdminEmbedsTab config={config} onChange={onChangeConfig} />
        )}

        {activeTab === 'footer' && (
          <AdminFooterTab config={config} onChange={onChangeConfig} />
        )}

        {activeTab === 'sync' && (
          <AdminSyncTab
            config={config}
            articles={articles}
            onChangeConfig={onChangeConfig}
            onManualSave={handleSaveClick}
            onDataRestored={onDataRestored}
          />
        )}

      </main>

    </div>
  );
};
