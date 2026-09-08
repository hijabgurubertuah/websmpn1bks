/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SchoolConfig, NewsArticle } from './types';
import { DEFAULT_SCHOOL_CONFIG, DEFAULT_NEWS_ARTICLES } from './lib/defaultData';
import {
  loadSchoolConfig,
  saveSchoolConfig,
  saveLocalDraftConfig,
  loadNewsArticles,
  saveNewsArticle,
  saveNewsArticleLocally,
  deleteNewsArticle,
} from './lib/firebase';
import { TopBar } from './components/public/TopBar';
import { Navbar } from './components/public/Navbar';
import { HeroSection } from './components/public/HeroSection';
import { PrincipalSection } from './components/public/PrincipalSection';
import { NewsSection } from './components/public/NewsSection';
import { AgendaSection } from './components/public/AgendaSection';
import { FacilitiesAndEkskul } from './components/public/FacilitiesAndEkskul';
import { EmbedMediaSection } from './components/public/EmbedMediaSection';
import { FooterSection } from './components/public/FooterSection';
import { AccreditationRibbon } from './components/public/AccreditationRibbon';
import { OfflineIndicator } from './components/public/OfflineIndicator';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { syncPWAManifest } from './lib/usePWAInstall';

export default function App() {
  const [config, setConfig] = useState<SchoolConfig>(DEFAULT_SCHOOL_CONFIG);
  const [articles, setArticles] = useState<NewsArticle[]>(DEFAULT_NEWS_ARTICLES);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from Firebase / localStorage
  useEffect(() => {
    async function initData() {
      try {
        const [cloudConfig, cloudArticles] = await Promise.all([
          loadSchoolConfig(),
          loadNewsArticles(),
        ]);
        setConfig(cloudConfig);
        setArticles(cloudArticles);
      } catch (err) {
        console.warn('Init error, using defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Synchronize document title, favicon, and PWA Manifest
  useEffect(() => {
    syncPWAManifest(config.identity);
  }, [config.identity]);

  // Request open admin mode with password protection
  const handleOpenAdmin = () => {
    const isAuth =
      localStorage.getItem('admin_authenticated') === 'true' ||
      sessionStorage.getItem('admin_authenticated') === 'true';
    if (isAuth) {
      setIsAdminMode(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Logout and lock admin session
  const handleLogoutAdmin = () => {
    localStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_authenticated');
    setIsAdminMode(false);
  };

  // Handle configuration update from Admin
  // Strictly saves to local state & browser storage (IndexedDB/localStorage).
  // ZERO writes to Firebase Firestore occur during typing/toggling to preserve write quota!
  const handleConfigChange = (newConfig: SchoolConfig) => {
    setConfig(newConfig);
    saveLocalDraftConfig(newConfig);
  };

  // Handle article save to Cloud from Admin
  const handleSaveArticle = async (article: NewsArticle) => {
    await saveNewsArticle(article);
    const updated = await loadNewsArticles();
    setArticles(updated);
  };

  // Handle article save to Local Draft only from Admin (0 Firebase writes)
  const handleSaveArticleLocally = async (article: NewsArticle) => {
    await saveNewsArticleLocally(article);
    const updated = await loadNewsArticles();
    setArticles(updated);
  };

  // Handle article delete from Admin
  const handleDeleteArticle = async (articleId: string) => {
    // Immediate state update
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    await deleteNewsArticle(articleId);
  };

  // Handle backup restore / reset
  const handleDataRestored = (newConfig: SchoolConfig, newArticles: NewsArticle[]) => {
    setConfig(newConfig);
    setArticles(newArticles);
    saveSchoolConfig(newConfig);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-base font-bold text-slate-200">Memuat Portal Sekolah...</p>
        <p className="text-xs text-slate-400 mt-1">Menghubungkan ke database Firebase</p>
      </div>
    );
  }

  // Admin CMS Mode View
  if (isAdminMode) {
    return (
      <AdminDashboard
        config={config}
        articles={articles}
        onChangeConfig={handleConfigChange}
        onSaveArticle={handleSaveArticle}
        onSaveArticleLocally={handleSaveArticleLocally}
        onDeleteArticle={handleDeleteArticle}
        onCloseAdmin={() => setIsAdminMode(false)}
        onLogout={handleLogoutAdmin}
        onDataRestored={handleDataRestored}
      />
    );
  }

  // Public School Portal View
  const { layoutSections } = config;

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      
      {/* Admin Password Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          setIsAdminMode(true);
        }}
        configuredPassword={config.adminPassword || 'smpn1bks'}
        schoolName={config.identity.name}
      />

      {/* Top Bar with Announcement Ticker & Quick Contacts */}
      <TopBar config={config} />

      {/* Main Navigation Bar with Dynamic Dropdown Menus and Single Gear Admin Button */}
      <Navbar config={config} onOpenAdmin={handleOpenAdmin} />

      {/* Hero Banner Section */}
      {layoutSections.showHero && <HeroSection config={config} />}

      {/* Akreditasi A Unggul Bar (Placed Directly Below Header) */}
      <AccreditationRibbon config={config} />

      {/* Sambutan Kepala Sekolah */}
      {layoutSections.showPrincipalSpeech && (
        <PrincipalSection
          principal={config.principal}
          schoolName={config.identity.name}
        />
      )}

      {/* Berita, Prestasi & Pengumuman Sekolah */}
      {layoutSections.showNews && <NewsSection articles={articles} />}

      {/* Agenda & Kalender Kegiatan */}
      {layoutSections.showAgenda && (
        <AgendaSection agendas={config.agendas || []} />
      )}

      {/* Fasilitas Kampus & Ekstrakurikuler */}
      {(layoutSections.showFacilities || layoutSections.showExtracurriculars) && (
        <FacilitiesAndEkskul
          facilities={config.facilities || []}
          extracurriculars={config.extracurriculars || []}
        />
      )}

      {/* Embed Media: YouTube Video & Google Maps */}
      {(layoutSections.showVideoEmbed || layoutSections.showMapEmbed) && (
        <EmbedMediaSection
          embeds={config.embeds}
          schoolAddress={config.footer.address}
          showVideo={layoutSections.showVideoEmbed}
          showMap={layoutSections.showMapEmbed}
        />
      )}

      {/* Footer Section */}
      <FooterSection config={config} />

      {/* Offline Status Notification Indicator for PWA */}
      <OfflineIndicator />

    </div>
  );
}
