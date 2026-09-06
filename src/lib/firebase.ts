import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
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

const FIREBASE_CONFIG = {
  projectId: 'gen-lang-client-0999699449',
  appId: '1:319360539506:web:894f0f9c3612848f8a9beb',
  apiKey: 'AIzaSyCOZgLPjDQ61WyWptoYS1tVH_zZLsNVeFQ',
  authDomain: 'gen-lang-client-0999699449.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-e8590637-9651-4312-9d0c-eb416143de72',
  storageBucket: 'gen-lang-client-0999699449.firebasestorage.app',
  messagingSenderId: '319360539506',
};

const LOCAL_STORAGE_CONFIG_KEY = 'sman1_nusantara_config_v2';
const LOCAL_STORAGE_NEWS_KEY = 'sman1_nusantara_news_v2';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Safe promise timeout helper to prevent hanging if connection is offline/slow
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 3500): Promise<T> {
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

  // Use initializeFirestore with experimentalForceLongPolling to prevent WebChannel stream disconnects
  const firestoreSettings = {
    experimentalForceLongPolling: true,
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
    await withTimeout(setDoc(testDoc, { ping: Date.now() }, { merge: true }), 3000);
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
 * Save school general configuration (header, identity, layout, menus, embeds, etc.)
 */
export async function saveSchoolConfig(config: SchoolConfig): Promise<boolean> {
  // Always persist to IndexedDB and localStorage for instant offline loading & zero data loss
  try {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
    await setOfflineItem('school_config', config);
  } catch (e) {
    console.error('Failed to save to local cache', e);
  }

  // Sync to Firebase Firestore
  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const configDocRef = doc(db, 'school_portal', 'main_config');
      await withTimeout(setDoc(configDocRef, config, { merge: true }), 3500);
      return true;
    } catch (err) {
      console.info('Config tersimpan secara lokal (sinkronisasi cloud ditunda):', err);
    }
  }
  return true;
}

/**
 * Load school general configuration (Offline-first)
 */
export async function loadSchoolConfig(): Promise<SchoolConfig> {
  // 1. Check offline IndexedDB cache first for instant load and zero data consumption
  try {
    const cached = await getOfflineItem<SchoolConfig>('school_config');
    if (cached) {
      // Background revalidate from Firestore if online
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
    console.error('Error parsing local config', e);
  }

  // 3. Try Firebase Firestore if local cache is completely empty
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
        // First-time cloud init: seed default school configuration to Firestore
        withTimeout(setDoc(configDocRef, DEFAULT_SCHOOL_CONFIG), 3000).catch(() => {});
        localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(DEFAULT_SCHOOL_CONFIG));
        await setOfflineItem('school_config', DEFAULT_SCHOOL_CONFIG);
        return DEFAULT_SCHOOL_CONFIG;
      }
    } catch (err) {
      console.info('Firestore fetch skipped, falling back to default seed:', err);
    }
  }

  // Default seed
  return DEFAULT_SCHOOL_CONFIG;
}

/**
 * Save or update a news article
 */
export async function saveNewsArticle(article: NewsArticle): Promise<boolean> {
  // Local storage & IndexedDB save
  try {
    const existing = await loadNewsArticles();
    const index = existing.findIndex((a) => a.id === article.id);
    let updated: NewsArticle[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = article;
    } else {
      updated = [article, ...existing];
    }
    localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(updated));
    await setOfflineItem('news_articles', updated);
  } catch (e) {
    console.error('Error saving article locally', e);
  }

  // Firestore sync
  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const articleDoc = doc(db, 'news_articles', article.id);
      await withTimeout(setDoc(articleDoc, article, { merge: true }), 3500);
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
    const existing = await loadNewsArticles();
    const updated = existing.filter((a) => a.id !== articleId);
    localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(updated));
    await setOfflineItem('news_articles', updated);
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
 * Load all news articles (Offline-first)
 */
export async function loadNewsArticles(): Promise<NewsArticle[]> {
  // 1. Check IndexedDB offline cache first
  try {
    const cached = await getOfflineItem<NewsArticle[]>('news_articles');
    if (cached !== null && Array.isArray(cached)) {
      // Background revalidate from Firestore if online
      if (db && typeof navigator !== 'undefined' && navigator.onLine) {
        const colRef = collection(db, 'news_articles');
        withTimeout(getDocs(colRef), 3000)
          .then((snap) => {
            const cloudArticles: NewsArticle[] = [];
            snap.forEach((d) => {
              cloudArticles.push(d.data() as NewsArticle);
            });
            cloudArticles.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
            setOfflineItem('news_articles', cloudArticles);
            localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(cloudArticles));
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
        // First-time cloud init: seed default news articles to Firestore
        for (const art of DEFAULT_NEWS_ARTICLES) {
          withTimeout(setDoc(doc(db, 'news_articles', art.id), art), 2000).catch(() => {});
        }
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
 * Reset data back to default initial seed
 */
export async function resetAllDataToDefault(): Promise<{
  config: SchoolConfig;
  articles: NewsArticle[];
}> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_CONFIG_KEY);
    localStorage.removeItem(LOCAL_STORAGE_NEWS_KEY);
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(DEFAULT_SCHOOL_CONFIG));
    localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(DEFAULT_NEWS_ARTICLES));
    await setOfflineItem('school_config', DEFAULT_SCHOOL_CONFIG);
    await setOfflineItem('news_articles', DEFAULT_NEWS_ARTICLES);
  } catch (e) {
    console.error(e);
  }

  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      await withTimeout(setDoc(doc(db, 'school_portal', 'main_config'), DEFAULT_SCHOOL_CONFIG), 3000);
      for (const art of DEFAULT_NEWS_ARTICLES) {
        await withTimeout(setDoc(doc(db, 'news_articles', art.id), art), 2000);
      }
    } catch (err) {
      console.info('Reset Firestore skipped, applied locally:', err);
    }
  }

  return {
    config: DEFAULT_SCHOOL_CONFIG,
    articles: DEFAULT_NEWS_ARTICLES,
  };
}

