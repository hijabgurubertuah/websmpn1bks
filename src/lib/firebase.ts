import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
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

  // Pass custom databaseId if configured
  if (FIREBASE_CONFIG.firestoreDatabaseId) {
    db = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
} catch (err) {
  console.warn('Firebase init warning (running in local storage fallback):', err);
}

export async function checkFirebaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  if (!db) {
    return {
      connected: false,
      message: 'Mode Lokal Aktif (Data tersimpan di penyimpanan browser)',
    };
  }
  try {
    const testDoc = doc(db, 'system_health', 'ping');
    await setDoc(testDoc, { ping: Date.now() }, { merge: true });
    return {
      connected: true,
      message: 'Terhubung ke Google Cloud Firebase Firestore',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `Tersimpan Lokal (Sync Cloud: ${message})`,
    };
  }
}

/**
 * Save school general configuration (header, identity, layout, menus, embeds, etc.)
 */
export async function saveSchoolConfig(config: SchoolConfig): Promise<boolean> {
  // Always persist to localStorage for instant loading & resilience
  try {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }

  // Sync to Firebase Firestore
  if (db) {
    try {
      const configDocRef = doc(db, 'school_portal', 'main_config');
      await setDoc(configDocRef, config, { merge: true });
      return true;
    } catch (err) {
      console.warn('Could not sync config to Firestore, saved locally instead:', err);
    }
  }
  return true;
}

/**
 * Load school general configuration
 */
export async function loadSchoolConfig(): Promise<SchoolConfig> {
  // Try Firebase first
  if (db) {
    try {
      const configDocRef = doc(db, 'school_portal', 'main_config');
      const snap = await getDoc(configDocRef);
      if (snap.exists()) {
        const cloudData = snap.data() as SchoolConfig;
        localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(cloudData));
        return cloudData;
      } else {
        // First-time cloud init: seed default school configuration to Firestore
        await setDoc(configDocRef, DEFAULT_SCHOOL_CONFIG);
        localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(DEFAULT_SCHOOL_CONFIG));
        return DEFAULT_SCHOOL_CONFIG;
      }
    } catch (err) {
      console.warn('Firestore fetch failed, falling back to local storage:', err);
    }
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    if (local) {
      return JSON.parse(local) as SchoolConfig;
    }
  } catch (e) {
    console.error('Error parsing local config', e);
  }

  // Default seed
  return DEFAULT_SCHOOL_CONFIG;
}

/**
 * Save or update a news article
 */
export async function saveNewsArticle(article: NewsArticle): Promise<boolean> {
  // Local storage save
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
  } catch (e) {
    console.error('Error saving article locally', e);
  }

  // Firestore sync
  if (db) {
    try {
      const articleDoc = doc(db, 'news_articles', article.id);
      await setDoc(articleDoc, article, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore article sync error, saved locally:', err);
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
  } catch (e) {
    console.error('Error deleting article locally', e);
  }

  if (db) {
    try {
      const articleDoc = doc(db, 'news_articles', articleId);
      await deleteDoc(articleDoc);
    } catch (err) {
      console.warn('Firestore article delete error:', err);
    }
  }

  return true;
}

/**
 * Load all news articles
 */
export async function loadNewsArticles(): Promise<NewsArticle[]> {
  if (db) {
    try {
      const colRef = collection(db, 'news_articles');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const cloudArticles: NewsArticle[] = [];
        snap.forEach((d) => {
          cloudArticles.push(d.data() as NewsArticle);
        });
        // Sort pinned first, then by date/id
        cloudArticles.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(cloudArticles));
        return cloudArticles;
      } else {
        // First-time cloud init: seed default news articles to Firestore
        for (const art of DEFAULT_NEWS_ARTICLES) {
          await setDoc(doc(db, 'news_articles', art.id), art);
        }
        localStorage.setItem(LOCAL_STORAGE_NEWS_KEY, JSON.stringify(DEFAULT_NEWS_ARTICLES));
        return DEFAULT_NEWS_ARTICLES;
      }
    } catch (err) {
      console.warn('Firestore news load error, using local storage:', err);
    }
  }

  // Local storage fallback
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_NEWS_KEY);
    if (local) {
      const parsed = JSON.parse(local) as NewsArticle[];
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading local news', e);
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
  } catch (e) {
    console.error(e);
  }

  if (db) {
    try {
      await setDoc(doc(db, 'school_portal', 'main_config'), DEFAULT_SCHOOL_CONFIG);
      for (const art of DEFAULT_NEWS_ARTICLES) {
        await setDoc(doc(db, 'news_articles', art.id), art);
      }
    } catch (err) {
      console.warn('Reset Firestore failed, applied locally:', err);
    }
  }

  return {
    config: DEFAULT_SCHOOL_CONFIG,
    articles: DEFAULT_NEWS_ARTICLES,
  };
}
