import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import { SchoolConfig, NewsArticle } from '../types';
import { DEFAULT_SCHOOL_CONFIG, DEFAULT_NEWS_ARTICLES } from './defaultData';
import { getOfflineItem, setOfflineItem } from './offlineStorage';

// Silence internal retry and connection warning logs from Firestore in browser/iframe environments
try {
  setLogLevel('silent');
} catch {
  // ignore
}

const FIREBASE_CONFIG = {
  projectId: 'gen-lang-client-0999699449',
  appId: '1:319360539506:web:894f0f9c3612848f8a9beb',
  apiKey: 'AIzaSyCOZgLPjDQ61WyWptoYS1tVH_zZLsNVeFQ',
  authDomain: 'gen-lang-client-0999699449.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-e8590637-9651-4312-9d0c-eb416143de72',
  storageBucket: 'gen-lang-client-0999699449.firebasestorage.app',
  messagingSenderId: '319360539506',
};

const LOCAL_STORAGE_CONFIG_KEY = 'smpn1_bengkalis_config_v3';
const LOCAL_STORAGE_NEWS_KEY = 'smpn1_bengkalis_news_v3';
const CUSTOM_DEFAULT_CONFIG_KEY = 'smpn1_bengkalis_custom_default_config_v1';
const CUSTOM_DEFAULT_NEWS_KEY = 'smpn1_bengkalis_custom_default_news_v1';
const CUSTOM_DEFAULT_META_KEY = 'smpn1_bengkalis_custom_default_meta_v1';

export let app: FirebaseApp | null = null;
export let db: Firestore | null = null;

// Safe promise timeout helper to prevent hanging if connection is offline/slow
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 3500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore connection timeout')), timeoutMs)
    ),
  ]);
}

try {
  if (!getApps().length) {
    app = initializeApp({
      apiKey: FIREBASE_CONFIG.apiKey,
      authDomain: FIREBASE_CONFIG.authDomain,
      projectId: FIREBASE_CONFIG.projectId,
      storageBucket: FIREBASE_CONFIG.storageBucket,
      messagingSenderId: FIREBASE_CONFIG.messagingSenderId,
      appId: FIREBASE_CONFIG.appId,
    });
  } else {
    app = getApp();
  }

  // Use initializeFirestore with experimentalAutoDetectLongPolling (cannot be combined with experimentalForceLongPolling)
  const firestoreSettings = {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  };

  try {
    if (FIREBASE_CONFIG.firestoreDatabaseId) {
      db = initializeFirestore(app, firestoreSettings, FIREBASE_CONFIG.firestoreDatabaseId);
    } else {
      db = initializeFirestore(app, firestoreSettings);
    }
  } catch {
    // If already initialized, fallback gracefully
    db = FIREBASE_CONFIG.firestoreDatabaseId
      ? getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId)
      : getFirestore(app);
  }
} catch (err) {
  console.info('Firebase running in local storage offline mode:', err);
}

export async function checkFirebaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  if (!db || typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      connected: false,
      message: 'Mode Offline Aktif (Data tersimpan aman di IndexedDB & browser)',
    };
  }
  try {
    const testDoc = doc(db, 'system_health', 'ping');
    // READ ONLY check to avoid consuming write quota on simple ping checks
    await withTimeout(getDoc(testDoc), 3000);
    return {
      connected: true,
      message: 'Terhubung ke Google Cloud Firebase Firestore',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `Mode Offline Aktif (${message})`,
    };
  }
}

/**
 * Recursively sanitizes data to ensure NO raw base64 image data (data:image/...) is ever uploaded to Firebase.
 * Only external/cloud link URLs (https://, http://, //) are permitted.
 * If a base64 string is detected, it is stripped so Firebase never receives image binaries.
 */
export function sanitizeNoBase64<T>(data: T): T {
  if (!data) return data;
  if (typeof data === 'string') {
    if (data.startsWith('data:image/')) {
      console.warn('Deteksi data base64 gambar dicegah. Hanya link URL gambar yang diunggah ke Firebase.');
      return '' as unknown as T;
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeNoBase64(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = sanitizeNoBase64(value);
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Save configuration purely to local browser storage (IndexedDB & localStorage).
 * STRICTLY ZERO writes to Firebase Firestore to prevent consuming database write quotas during typing/editing.
 */
export async function saveLocalDraftConfig(config: SchoolConfig): Promise<void> {
  try {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
    await setOfflineItem('school_config', config);
  } catch (e) {
    console.error('Error saving school config locally', e);
  }
}

/**
 * Save ONLY the specific tab data that was edited to Firebase Firestore.
 * Ultra-lightweight payload (saving only the changed fields), ensuring fast network sync,
 * preventing database limit exhaustion, and strictly ensuring only image URL links are sent.
 */
export async function saveSchoolTabConfig(tab: string, config: SchoolConfig): Promise<boolean> {
  // Always update local cache first so drafts are preserved instantly
  await saveLocalDraftConfig(config);

  if (!db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return true; // Saved locally
  }

  // Determine the granular payload for only this specific tab
  let tabPayload: Record<string, unknown> = {};

  switch (tab) {
    case 'header':
      tabPayload = {
        header: config.header,
        identity: config.identity,
      };
      break;
    case 'menus':
      tabPayload = {
        navMenus: config.navMenus,
      };
      break;
    case 'ppdb':
      tabPayload = {
        ppdb: config.ppdb,
      };
      break;
    case 'agenda':
      tabPayload = {
        agendas: config.agendas,
      };
      break;
    case 'facilities':
      tabPayload = {
        facilities: config.facilities,
        extracurriculars: config.extracurriculars,
      };
      break;
    case 'layout':
      tabPayload = {
        layoutSections: config.layoutSections,
      };
      break;
    case 'principal':
      tabPayload = {
        principal: config.principal,
      };
      break;
    case 'embeds':
      tabPayload = {
        embeds: config.embeds,
      };
      break;
    case 'footer':
      tabPayload = {
        footer: config.footer,
      };
      break;
    default:
      tabPayload = config as unknown as Record<string, unknown>;
  }

  // Ensure absolutely NO base64 image strings exist in the cloud payload (only link URLs allowed)
  const cleanedPayload = sanitizeNoBase64(tabPayload);

  try {
    const configDocRef = doc(db, 'school_portal', 'main_config');
    await withTimeout(setDoc(configDocRef, cleanedPayload, { merge: true }), 4000);
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('resource-exhausted') || msg.includes('Quota')) {
      console.warn('Kuota harian Firestore tercapai (Free Tier). Data tersimpan aman di penyimpanan lokal browser Anda.');
      return true;
    }
    console.info(`Tab ${tab} tersimpan secara lokal (sinkronisasi cloud ditunda):`, msg);
    return false;
  }
}

/**
 * Save school general configuration to Cloud Firestore.
 * Triggered ONLY when the user explicitly clicks a save/sync button.
 */
export async function saveSchoolConfig(config: SchoolConfig): Promise<boolean> {
  // Always persist locally first for instant offline loading & zero data loss
  await saveLocalDraftConfig(config);

  // Sync to Firebase Firestore (single document to save write quota and prevent rate limits)
  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const cleanedConfig = sanitizeNoBase64(config);
      const jsonString = JSON.stringify(cleanedConfig);
      if (jsonString.length > 950 * 1024) {
        throw new Error('Ukuran data konfigurasi melebihi batas 1MB Firestore. Harap gunakan URL gambar eksternal (Google Drive / link publik) untuk foto kepala sekolah atau logo.');
      }
      const configDocRef = doc(db, 'school_portal', 'main_config');
      await withTimeout(setDoc(configDocRef, cleanedConfig, { merge: true }), 4000);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('resource-exhausted') || msg.includes('Quota')) {
        console.warn('Kuota harian Firestore tercapai (Free Tier). Data tersimpan aman di penyimpanan lokal browser Anda.');
        return true; // Return true so user experience is smooth and local save succeeds
      }
      console.info('Config tersimpan secara lokal (sinkronisasi cloud ditunda):', msg);
    }
  }
  return true;
}

/**
 * Load school general configuration.
 * Read-only from cache/cloud without automatic background write seeds.
 */
export async function loadSchoolConfig(): Promise<SchoolConfig> {
  // 1. First check IndexedDB for super-fast offline startup
  try {
    const cached = await getOfflineItem<SchoolConfig>('school_config');
    if (cached) {
      // Background revalidate from Firestore if online (read-only)
      if (db && typeof navigator !== 'undefined' && navigator.onLine) {
        const configDocRef = doc(db, 'school_portal', 'main_config');
        withTimeout(getDoc(configDocRef), 3000)
          .then((snap) => {
            if (snap.exists()) {
              const cloudData = snap.data() as SchoolConfig;
              setOfflineItem('school_config', cloudData);
              localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(cloudData));
            }
          })
          .catch(() => {});
      }
      return cached;
    }
  } catch {
    // fallback
  }

  // 2. Check localStorage fallback
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    if (local) {
      const parsed = JSON.parse(local) as SchoolConfig;
      setOfflineItem('school_config', parsed);
      return parsed;
    }
  } catch (e) {
    console.error('Error reading local config', e);
  }

  // 3. Try Firebase Firestore if local cache is completely empty (read-only, no auto-seed writes)
  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const configDocRef = doc(db, 'school_portal', 'main_config');
      const snap = await withTimeout(getDoc(configDocRef), 3500);
      if (snap.exists()) {
        const cloudData = snap.data() as SchoolConfig;
        localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(cloudData));
        await setOfflineItem('school_config', cloudData);
        return cloudData;
      } else {
        // Cloud is empty, use default config locally. NO automatic Firestore write on load.
        localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(DEFAULT_SCHOOL_CONFIG));
        await setOfflineItem('school_config', DEFAULT_SCHOOL_CONFIG);
        return DEFAULT_SCHOOL_CONFIG;
      }
    } catch (err) {
      console.info('Firestore fetch skipped, falling back to default seed:', err);
    }
  }

  return DEFAULT_SCHOOL_CONFIG;
}

/**
 * Save an article ONLY locally on this device as a draft (0 Firebase operations, 0 quota used)
 */
export async function saveNewsArticleLocally(article: NewsArticle): Promise<boolean> {
  const localArticle: NewsArticle = {
    ...article,
    isLocalDraft: true,
  };
  try {
    const articles = await loadNewsArticles();
    const existingIndex = articles.findIndex((a) => a.id === localArticle.id);
    let updated: NewsArticle[];
    if (existingIndex >= 0) {
      updated = [...articles];
      updated[existingIndex] = localArticle;
    } else {
      updated = [localArticle, ...articles];
    }
    localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(updated));
    await setOfflineItem('news_articles', updated);
    return true;
  } catch (e) {
    console.error('Error saving article locally', e);
    return false;
  }
}

/**
 * Save or update a single news article to Cloud Firestore (and update local cache)
 */
export async function saveNewsArticle(article: NewsArticle): Promise<boolean> {
  // Mark as no longer a local draft since it's uploaded to Cloud
  const cloudArticle: NewsArticle = {
    ...article,
    isLocalDraft: false,
  };

  // Update local cache first
  try {
    const articles = await loadNewsArticles();
    const existingIndex = articles.findIndex((a) => a.id === cloudArticle.id);
    let updated: NewsArticle[];
    if (existingIndex >= 0) {
      updated = [...articles];
      updated[existingIndex] = cloudArticle;
    } else {
      updated = [cloudArticle, ...articles];
    }
    localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(updated));
    await setOfflineItem('news_articles', updated);
  } catch (e) {
    console.error('Error saving article locally', e);
  }

  // Firestore sync - ensure strictly NO base64 images (only URL links)
  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const cleanedArticle = sanitizeNoBase64(cloudArticle);
      const articleDoc = doc(db, 'news_articles', cloudArticle.id);
      await withTimeout(setDoc(articleDoc, cleanedArticle, { merge: true }), 3500);
      return true;
    } catch (err) {
      console.info('Firestore article sync deferred, saved locally:', err);
    }
  }

  return true;
}

/**
 * Delete a news article
 */
export async function deleteNewsArticle(articleId: string): Promise<boolean> {
  try {
    const articles = await loadNewsArticles();
    const filtered = articles.filter((a) => a.id !== articleId);
    localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(filtered));
    await setOfflineItem('news_articles', filtered);
  } catch (e) {
    console.error('Error deleting article locally', e);
  }

  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const articleDoc = doc(db, 'news_articles', articleId);
      await withTimeout(deleteDoc(articleDoc), 3500);
    } catch (err) {
      console.info('Firestore article delete deferred, applied locally:', err);
    }
  }

  return true;
}

/**
 * Load all news articles
 */
export async function loadNewsArticles(): Promise<NewsArticle[]> {
  // 1. First check IndexedDB for offline access
  try {
    const cached = await getOfflineItem<NewsArticle[]>('news_articles');
    if (cached !== null && Array.isArray(cached)) {
      // Background revalidate from Firestore if online, preserving any local drafts
      if (db && typeof navigator !== 'undefined' && navigator.onLine) {
        const colRef = collection(db, 'news_articles');
        withTimeout(getDocs(colRef), 3000)
          .then((snap) => {
            const cloudArticles: NewsArticle[] = [];
            snap.forEach((d) => {
              cloudArticles.push(d.data() as NewsArticle);
            });
            if (cloudArticles.length > 0) {
              // Preserve any articles that are marked as local drafts on this device
              const localDrafts = cached.filter((a) => a.isLocalDraft);
              const cloudIds = new Set(cloudArticles.map((c) => c.id));
              const merged = [
                ...localDrafts.filter((ld) => !cloudIds.has(ld.id)),
                ...cloudArticles,
              ];
              merged.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
              setOfflineItem('news_articles', merged);
              localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(merged));
            }
          })
          .catch(() => {});
      }
      return cached;
    }
  } catch {
    // fallback
  }

  // 2. Check localStorage fallback
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_NEWS_KEY);
    if (local !== null) {
      const parsed = JSON.parse(local) as NewsArticle[];
      if (Array.isArray(parsed)) {
        setOfflineItem('news_articles', parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading local news', e);
  }

  // 3. Try Firebase Firestore if local cache is empty
  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const colRef = collection(db, 'news_articles');
      const snap = await withTimeout(getDocs(colRef), 3500);
      if (!snap.empty) {
        const cloudArticles: NewsArticle[] = [];
        snap.forEach((d) => {
          cloudArticles.push(d.data() as NewsArticle);
        });
        cloudArticles.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(cloudArticles));
        await setOfflineItem('news_articles', cloudArticles);
        return cloudArticles;
      } else {
        // Cloud collection is empty, use default articles locally without automatic Firestore writes
        localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(DEFAULT_NEWS_ARTICLES));
        await setOfflineItem('news_articles', DEFAULT_NEWS_ARTICLES);
        return DEFAULT_NEWS_ARTICLES;
      }
    } catch (err) {
      console.info('Firestore news load skipped, using local storage:', err);
    }
  }

  return DEFAULT_NEWS_ARTICLES;
}

/**
 * Get Custom Default metadata (timestamp and existence)
 */
export async function getCustomDefaultMeta(): Promise<{
  hasCustomDefault: boolean;
  savedAt?: string;
}> {
  // Check local meta
  try {
    const metaStr = localStorage.getItem(CUSTOM_DEFAULT_META_KEY);
    if (metaStr) {
      const parsed = JSON.parse(metaStr);
      return { hasCustomDefault: true, savedAt: parsed.savedAt };
    }
  } catch {
    // ignore
  }

  // Check IndexedDB
  try {
    const cachedMeta = await getOfflineItem<{ hasCustomDefault: boolean; savedAt?: string }>('custom_default_meta');
    if (cachedMeta && cachedMeta.hasCustomDefault) {
      return cachedMeta;
    }
  } catch {
    // ignore
  }

  // Check Firestore
  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const docRef = doc(db, 'school_portal', 'custom_defaults');
      const snap = await withTimeout(getDoc(docRef), 2500);
      if (snap.exists()) {
        const data = snap.data();
        const savedAt = data.savedAt || new Date().toISOString();
        const meta = { hasCustomDefault: true, savedAt };
        localStorage.setItem(CUSTOM_DEFAULT_META_KEY, JSON.stringify(meta));
        await setOfflineItem('custom_default_meta', meta);
        return meta;
      }
    } catch {
      // ignore
    }
  }

  return { hasCustomDefault: false };
}

/**
 * "Jadikan Default" - Save current configuration & news as the new active default template.
 * Any old defaults are replaced. Future resets will revert to this exact snapshot.
 */
export async function saveCurrentAsNewDefault(
  config: SchoolConfig,
  articles: NewsArticle[]
): Promise<{ success: boolean; savedAt: string }> {
  const savedAt = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const meta = { hasCustomDefault: true, savedAt };

  // 1. Save to localStorage
  try {
    localStorage.setItem(CUSTOM_DEFAULT_CONFIG_KEY, JSON.stringify(config));
    localStorage.setItem(CUSTOM_DEFAULT_NEWS_KEY, JSON.stringify(articles));
    localStorage.setItem(CUSTOM_DEFAULT_META_KEY, JSON.stringify(meta));

    // Also ensure current active storage is in sync
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
    localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error('Error saving custom default to localStorage', e);
  }

  // 2. Save to IndexedDB
  try {
    await setOfflineItem('custom_default_config', config);
    await setOfflineItem('custom_default_articles', articles);
    await setOfflineItem('custom_default_meta', meta);
    await setOfflineItem('school_config', config);
    await setOfflineItem('news_articles', articles);
  } catch (e) {
    console.error('Error saving custom default to IndexedDB', e);
  }

  // 3. Save to Firestore Cloud
  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      // Save custom default master document
      const defaultDocRef = doc(db, 'school_portal', 'custom_defaults');
      await withTimeout(
        setDoc(defaultDocRef, {
          config,
          articles,
          savedAt,
          updatedAt: Date.now(),
        }),
        3500
      );

      // Overwrite main active config
      const mainConfigRef = doc(db, 'school_portal', 'main_config');
      await withTimeout(setDoc(mainConfigRef, config), 3500);

      // Clean obsolete news in Firestore and write current articles
      const colRef = collection(db, 'news_articles');
      const currentSnap = await withTimeout(getDocs(colRef), 3000);
      const newArticleIds = new Set(articles.map((a) => a.id));

      for (const d of currentSnap.docs) {
        if (!newArticleIds.has(d.id)) {
          await withTimeout(deleteDoc(doc(db, 'news_articles', d.id)), 2000).catch(() => {});
        }
      }

      for (const art of articles) {
        await withTimeout(setDoc(doc(db, 'news_articles', art.id), art), 2000).catch(() => {});
      }
    } catch (err) {
      console.info('Custom default saved locally (cloud sync deferred):', err);
    }
  }

  return { success: true, savedAt };
}

/**
 * Reset data back to default template.
 * If user previously clicked "Jadikan Default", it resets to that last custom default snapshot!
 * Otherwise, it resets to the baseline SMP Negeri 1 Bengkalis default.
 */
export async function resetAllDataToDefault(): Promise<{
  config: SchoolConfig;
  articles: NewsArticle[];
  isCustomDefault: boolean;
  savedAt?: string;
}> {
  let targetConfig: SchoolConfig = DEFAULT_SCHOOL_CONFIG;
  let targetArticles: NewsArticle[] = DEFAULT_NEWS_ARTICLES;
  let isCustomDefault = false;
  let savedAt: string | undefined;

  // 1. Check IndexedDB custom default
  try {
    const customConfig = await getOfflineItem<SchoolConfig>('custom_default_config');
    const customArticles = await getOfflineItem<NewsArticle[]>('custom_default_articles');
    const customMeta = await getOfflineItem<{ hasCustomDefault: boolean; savedAt?: string }>('custom_default_meta');

    if (customConfig && customArticles && Array.isArray(customArticles)) {
      targetConfig = customConfig;
      targetArticles = customArticles;
      isCustomDefault = true;
      savedAt = customMeta?.savedAt;
    }
  } catch {
    // ignore
  }

  // 2. Check localStorage custom default if not found in IndexedDB
  if (!isCustomDefault) {
    try {
      const localCustomCfg = localStorage.getItem(CUSTOM_DEFAULT_CONFIG_KEY);
      const localCustomNews = localStorage.getItem(CUSTOM_DEFAULT_NEWS_KEY);
      const localMeta = localStorage.getItem(CUSTOM_DEFAULT_META_KEY);

      if (localCustomCfg && localCustomNews) {
        targetConfig = JSON.parse(localCustomCfg);
        targetArticles = JSON.parse(localCustomNews);
        isCustomDefault = true;
        if (localMeta) {
          savedAt = JSON.parse(localMeta).savedAt;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Check Firestore custom default if still not found
  if (!isCustomDefault && db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const defaultDocRef = doc(db, 'school_portal', 'custom_defaults');
      const snap = await withTimeout(getDoc(defaultDocRef), 3000);
      if (snap.exists()) {
        const data = snap.data();
        if (data.config && Array.isArray(data.articles)) {
          targetConfig = data.config as SchoolConfig;
          targetArticles = data.articles as NewsArticle[];
          isCustomDefault = true;
          savedAt = data.savedAt;
        }
      }
    } catch {
      // ignore
    }
  }

  // Apply to active localStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(targetConfig));
    localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(targetArticles));
    await setOfflineItem('school_config', targetConfig);
    await setOfflineItem('news_articles', targetArticles);
  } catch (e) {
    console.error('Error overwriting local state on reset', e);
  }

  // Apply to active Firestore
  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      await withTimeout(setDoc(doc(db, 'school_portal', 'main_config'), targetConfig), 3500);

      const colRef = collection(db, 'news_articles');
      const snap = await withTimeout(getDocs(colRef), 3000);
      const targetIds = new Set(targetArticles.map((a) => a.id));

      for (const d of snap.docs) {
        if (!targetIds.has(d.id)) {
          await withTimeout(deleteDoc(doc(db, 'news_articles', d.id)), 2000).catch(() => {});
        }
      }

      for (const art of targetArticles) {
        await withTimeout(setDoc(doc(db, 'news_articles', art.id), art), 2000).catch(() => {});
      }
    } catch (err) {
      console.info('Reset Firestore applied locally:', err);
    }
  }

  return {
    config: targetConfig,
    articles: targetArticles,
    isCustomDefault,
    savedAt,
  };
}
