import React from 'react';
import { SchoolConfig, LayoutSections } from '../../types';
import { Layout, Check, Eye } from 'lucide-react';

interface AdminLayoutTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminLayoutTab: React.FC<AdminLayoutTabProps> = ({ config, onChange }) => {
  const { layoutSections } = config;

  const toggleSection = (key: keyof LayoutSections) => {
    onChange({
      ...config,
      layoutSections: {
        ...layoutSections,
        [key]: !layoutSections[key],
      },
    });
  };

  const sectionsList: Array<{
    key: keyof LayoutSections;
    title: string;
    description: string;
  }> = [
    {
      key: 'showHero',
      title: 'Hero Banner & Gambar Header',
      description: 'Seksi gambar besar pembuka dengan judul, deskripsi, dan tombol aksi utama.',
    },
    {
      key: 'showQuickStats',
      title: 'Kartu Statistik Cepat',
      description: 'Baris 4 angka statistik penting (akreditasi, siswa, rasio, guru) di bawah banner.',
    },
    {
      key: 'showPrincipalSpeech',
      title: 'Sambutan Kepala Sekolah',
      description: 'Foto pimpinan, kutipan pembuka inspiratif, serta modal isi sambutan lengkap.',
    },
    {
      key: 'showNews',
      title: 'Berita & Pengumuman Terkini (CMS)',
      description: 'Koleksi postingan artikel sekolah, prestasi siswa, filter kategori, dan pencarian.',
    },
    {
      key: 'showAgenda',
      title: 'Agenda & Kalender Kegiatan',
      description: 'Jadwal ujian, perayaan sekolah, dan acara penting mendatang.',
    },
    {
      key: 'showFacilities',
      title: 'Fasilitas Kampus Unggulan',
      description: 'Galeri fasilitas modern seperti laboratorium sains, perpustakaan, dan gedung olahraga.',
    },
    {
      key: 'showExtracurriculars',
      title: 'Ekstrakurikuler & Minat Bakat Siswa',
      description: 'Daftar ekskul (Robotik, Paskibra, Musik, PMR, Futsal) beserta pembina dan jadwal.',
    },
    {
      key: 'showVideoEmbed',
      title: 'Video Profil Sekolah (YouTube Embed)',
      description: 'Tayangan video profil yang tersemat langsung di halaman portal.',
    },
    {
      key: 'showMapEmbed',
      title: 'Peta Lokasi Kampus (Google Maps Embed)',
      description: 'Peta interaktif lokasi sekolah lengkap dengan tombol petunjuk arah.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600" />
            <span>Pengaturan Tata Letak &amp; Komponen Halaman Publik</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Aktifkan atau nonaktifkan seksi-seksi yang ingin Anda tampilkan kepada pengunjung website.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionsList.map((sec) => {
            const isEnabled = layoutSections[sec.key];
            return (
              <div
                key={sec.key}
                onClick={() => toggleSection(sec.key)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isEnabled
                    ? 'bg-blue-50/50 border-blue-200 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{sec.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {sec.description}
                  </p>
                </div>

                <div className="shrink-0 pt-0.5">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      isEnabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isEnabled && <Check className="w-4 h-4 stroke-[3]" />}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
