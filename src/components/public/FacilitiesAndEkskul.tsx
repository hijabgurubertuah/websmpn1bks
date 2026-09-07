import React, { useState } from 'react';
import { FacilityItem, ExtracurricularItem } from '../../types';
import {
  Building2,
  Trophy,
  Clock,
  UserCheck,
  Sparkles,
  Cpu,
  Flag,
  Music,
  HeartHandshake,
  MessageSquare,
  Award,
  BookOpen,
  Users,
  Target,
} from 'lucide-react';

interface FacilitiesAndEkskulProps {
  facilities: FacilityItem[];
  extracurriculars: ExtracurricularItem[];
}

export const FacilitiesAndEkskul: React.FC<FacilitiesAndEkskulProps> = ({
  facilities,
  extracurriculars,
}) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'ekskul'>('facilities');

  const getEkskulIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'cpu':
        return <Cpu className="w-6 h-6 text-blue-600" />;
      case 'flag':
        return <Flag className="w-6 h-6 text-red-600" />;
      case 'music':
        return <Music className="w-6 h-6 text-purple-600" />;
      case 'hearthandshake':
        return <HeartHandshake className="w-6 h-6 text-emerald-600" />;
      case 'messagesquare':
        return <MessageSquare className="w-6 h-6 text-indigo-600" />;
      case 'bookopen':
        return <BookOpen className="w-6 h-6 text-teal-600" />;
      case 'users':
        return <Users className="w-6 h-6 text-cyan-600" />;
      case 'target':
        return <Target className="w-6 h-6 text-rose-600" />;
      case 'award':
        return <Award className="w-6 h-6 text-yellow-600" />;
      case 'trophy':
      default:
        return <Trophy className="w-6 h-6 text-amber-600" />;
    }
  };

  return (
    <section id="fasilitas" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sarana &amp; Potensi Siswa</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Fasilitas Modern &amp; Ekstrakurikuler
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Dukungan penuh sarana fisik berstandar tinggi serta wadah pengembangan talenta generasi muda.
            </p>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('facilities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'facilities'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Fasilitas Kampus</span>
            </button>
            <button
              onClick={() => setActiveTab('ekskul')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'ekskul'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Ekstrakurikuler</span>
            </button>
          </div>
        </div>

        {/* Facilities Tab Content */}
        {activeTab === 'facilities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {facilities.map((fac) => (
              <div
                key={fac.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={fac.imageUrl}
                    alt={fac.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                    {fac.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 text-base leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                    {fac.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed flex-1">
                    {fac.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Extracurriculars Tab Content */}
        {activeTab === 'ekskul' && (
          <div id="ekskul" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {extracurriculars.map((ekskul) => (
              <div
                key={ekskul.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      {getEkskulIcon(ekskul.icon)}
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      {ekskul.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {ekskul.name}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {ekskul.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pembina: {ekskul.coach}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Jadwal: {ekskul.schedule}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
