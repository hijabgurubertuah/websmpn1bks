export interface DropdownItem {
  id: string;
  label: string;
  path: string;
  description?: string;
}

export interface NavMenu {
  id: string;
  label: string;
  path: string;
  isDropdown: boolean;
  dropdownItems?: DropdownItem[];
  enabled: boolean;
}

export interface HighlightStat {
  id: string;
  icon: string;
  label: string;
  value: string;
}

export interface SchoolIdentity {
  name: string;
  tagline: string;
  npsn: string;
  akreditasi: string;
  logoUrl: string;
  faviconUrl: string;
  tickerEnabled: boolean;
  tickerText: string;
  primaryColor: string;
}

export interface HeaderConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroCtaText: string;
  heroCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  highlights: HighlightStat[];
}

export interface LayoutSections {
  showHero: boolean;
  showQuickStats: boolean;
  showPrincipalSpeech: boolean;
  showNews: boolean;
  showAgenda: boolean;
  showFacilities: boolean;
  showExtracurriculars: boolean;
  showVideoEmbed: boolean;
  showMapEmbed: boolean;
}

export interface PrincipalConfig {
  name: string;
  title: string;
  nip: string;
  imageUrl: string;
  quote: string;
  fullSpeech: string;
}

export interface EmbedsConfig {
  youtubeTitle: string;
  youtubeUrl: string;
  youtubeSubtitle: string;
  mapIframeUrl: string;
  mapTitle: string;
}

export interface FacilityItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
}

export interface ExtracurricularItem {
  id: string;
  name: string;
  category: string;
  coach: string;
  schedule: string;
  icon: string;
  description: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
}

export interface FooterConfig {
  aboutText: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  openingHours: string;
  socialLinks: {
    instagram: string;
    youtube: string;
    facebook: string;
    twitter: string;
  };
  copyright: string;
}

export interface SchoolConfig {
  adminPassword?: string;
  identity: SchoolIdentity;
  header: HeaderConfig;
  navMenus: NavMenu[];
  layoutSections: LayoutSections;
  principal: PrincipalConfig;
  embeds: EmbedsConfig;
  facilities: FacilityItem[];
  extracurriculars: ExtracurricularItem[];
  agendas: AgendaItem[];
  footer: FooterConfig;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: 'Prestasi' | 'Kegiatan' | 'Akademik' | 'Pengumuman' | 'Ekstrakurikuler' | string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  date: string;
  isPinned: boolean;
  views: number;
  status: 'published' | 'draft';
}
