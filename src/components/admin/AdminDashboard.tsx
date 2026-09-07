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
  ShieldCheck,
  LogOut,
  PanelLeftOpen,
  X,
  ChevronRight,
  Menu,
  Calendar,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { AdminHeaderTab } from './AdminHeaderTab';
import { AdminMenusTab } from './AdminMenusTab';
import { AdminPPDBTab } from './AdminPPDBTab';
import { AdminPostsTab } from './AdminPostsTab';
import { AdminAgendaTab } from './AdminAgendaTab';
import { AdminFacilitiesEkskulTab } from './AdminFacilitiesEkskulTab';
import { AdminLayoutTab } from './AdminLayoutTab';
import { AdminPrincipalTab } from './AdminPrincipalTab';
import { AdminEmbedsTab } from './AdminEmbedsTab';
import { AdminFooterTab } from './AdminFooterTab';
import { AdminSyncTab } from './AdminSyncTab';
import { saveSchoolConfig } from '../../lib/firebase';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

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
  | 'ppdb'
  | 'posts'
  | 'agenda'
  | 'facilities'
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
  const [savingTab, setSavingTab] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Perubahan Tersimpan!');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Lock body scroll when mobile sidebar drawer is open to prevent background scrolling
  useBodyScrollLock(isMobileSidebarOpen);

  const handleSaveClick = async () => {
    setSavingAll(true);
    try {
      await onManualSaveAll();
      setToastMessage('Semua Konfigurasi & Berita Tersinkron ke Cloud!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setToastMessage(`Gagal sinkron Cloud: ${msg}`);
    }
    setSavingAll(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleSaveCurrentTab = async () => {
    setSavingTab(true);
    try {
      await saveSchoolConfig(config);
      setToastMessage(`Perubahan tab ${tabs.find((t) => t.id === activeTab)?.label} berhasil disimpan ke Cloud!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setToastMessage(`Gagal ke Cloud: ${msg}`);
    }
    setSavingTab(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'header', label: 'Header & Identitas', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'menus', label: 'Menu & Dropdown', icon: <Layers className="w-4 h-4" /> },
    { id: 'ppdb', label: 'PPDB Online', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'posts', label: 'Postingan Berita', icon: <FileText className="w-4 h-4" /> },
    { id: 'agenda', label: 'Agenda & Jadwal', icon: <Calendar className="w-4 h-4" /> },
    { id: 'facilities', label: 'Fasilitas & Ekskul', icon: <Building2 className="w-4 h-4" /> },
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
            <div className="font-bold text-sm">{toastMessage}</div>
            <div className="text-xs text-slate-400">Tersinkron ke penyimpanan offline &amp; database Firebase Firestore.</div>
          </div>
        </div>
      )}

      {/* Admin Top Appbar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left Actions & Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Mobile Sidebar Button in Header */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 cursor-pointer"
                title="Buka Menu Tab"
                aria-label="Buka Menu Tab"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onCloseAdmin}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Lihat</span>
                <span>Website</span>
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
                <span className="text-xs text-slate-400 font-medium truncate max-w-xs">
                  {config.identity.name}
                </span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onCloseAdmin}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Buka tampilan publik"
              >
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Pratinjau Live</span>
              </button>

              <button
                type="button"
                onClick={handleSaveClick}
                disabled={savingAll}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className={`w-4 h-4 ${savingAll ? 'animate-spin' : ''}`} />
                <span>{savingAll ? 'Menyimpan...' : 'Simpan ke Cloud'}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Kunci & Keluar dari sesi admin"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Kunci / Keluar</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Floating Trigger Button on the Middle-Left of Mobile Screen (HP) */}
      <button
        type="button"
        id="mobile-sidebar-middle-trigger"
        onClick={() => setIsMobileSidebarOpen(true)}
        className="fixed top-1/2 -translate-y-1/2 left-0 z-40 md:hidden w-[28px] h-[120px] bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white border-y border-r border-blue-500/70 rounded-r-xl shadow-2xl shadow-blue-950/80 flex flex-col items-center justify-center gap-3 group transition-all duration-200 active:scale-95 cursor-pointer hover:bg-slate-800 animate-in slide-in-from-left"
        title="Buka Menu Tab Admin"
        aria-label="Buka Menu Tab Admin"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
        <Menu className="w-4 h-4 text-blue-200 stroke-[2.5] group-hover:text-white transition-transform group-hover:scale-110" />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></span>
      </button>

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 transition-opacity md:hidden overscroll-contain touch-none animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sliding Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-900 text-white z-50 flex flex-col shadow-2xl border-r border-slate-800 overscroll-contain transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                CMS Admin Sekolah
              </h2>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[170px]">
                {config.identity.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Tab Navigation List */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Pilih Tab Pengaturan
          </div>

          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`p-1.5 rounded-lg ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>

                {isActive ? (
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsMobileSidebarOpen(false);
              handleSaveClick();
            }}
            disabled={savingAll}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingAll ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileSidebarOpen(false);
                onCloseAdmin();
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Lihat Web</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileSidebarOpen(false);
                onLogout();
              }}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-semibold border border-red-500/30 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container: Desktop Persistent Sidebar + Workspace Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        
        {/* Desktop Persistent Sidebar (Un-hidden on >= md screens) */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 sticky top-24 space-y-4 self-start">
          
          {/* Navigation Card */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Menu Navigasi CMS</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                11 Tab
              </span>
            </div>

            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </div>

                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick System Info Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Status Sistem CMS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Perubahan otomatis tersimpan ke cache offline &amp; database Firebase Firestore.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Sekolah:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[130px]" title={config.identity.name}>
                {config.identity.name}
              </span>
            </div>
          </div>

        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 w-full">
          
          {/* Active Tab Header Badge for Mobile/Tablet */}
          <div className="md:hidden mb-4 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                {tabs.find((t) => t.id === activeTab)?.icon}
              </span>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Tab Aktif
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Ganti Tab →
            </button>
          </div>

          {/* Dynamic Tab Views */}
          {activeTab === 'header' && (
            <AdminHeaderTab config={config} onChange={onChangeConfig} />
          )}

          {activeTab === 'menus' && (
            <AdminMenusTab config={config} onChange={onChangeConfig} />
          )}

          {activeTab === 'ppdb' && (
            <AdminPPDBTab config={config} onChange={onChangeConfig} />
          )}

          {activeTab === 'posts' && (
            <AdminPostsTab
              articles={articles}
              onSaveArticle={onSaveArticle}
              onDeleteArticle={onDeleteArticle}
            />
          )}

          {activeTab === 'agenda' && (
            <AdminAgendaTab config={config} onChange={onChangeConfig} />
          )}

          {activeTab === 'facilities' && (
            <AdminFacilitiesEkskulTab config={config} onChange={onChangeConfig} />
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

          {/* Granular Quick-Save Bar for Non-Sync and Non-Posts Tabs */}
          {activeTab !== 'sync' && activeTab !== 'posts' && (
            <div className="mt-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Save className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Simpan Perubahan Tab {tabs.find((t) => t.id === activeTab)?.label}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Simpan langsung ke Firestore (~100ms) tanpa memproses postingan atau tab lain.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveCurrentTab}
                disabled={savingTab}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-xs sm:text-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingTab ? 'Menyimpan...' : `Simpan Tab ${tabs.find((t) => t.id === activeTab)?.label}`}</span>
              </button>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};

