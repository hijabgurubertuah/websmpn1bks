import React from 'react';
import { SchoolConfig } from '../../types';
import { Award, GraduationCap, Users, BookOpen, ChevronRight, PlayCircle } from 'lucide-react';

interface HeroSectionProps {
  config: SchoolConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config }) => {
  const { header, identity, layoutSections } = config;

  // Icon mapping helper
  const getStatIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'award':
        return <Award className="w-6 h-6 text-amber-400" />;
      case 'graduationcap':
        return <GraduationCap className="w-6 h-6 text-blue-400" />;
      case 'users':
        return <Users className="w-6 h-6 text-emerald-400" />;
      case 'bookopen':
      default:
        return <BookOpen className="w-6 h-6 text-purple-400" />;
    }
  };

  const handleScrollTo = (target: string) => {
    if (target.startsWith('#')) {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="beranda" className="relative overflow-hidden bg-slate-950 text-white">
      
      {/* Background Hero Image with Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={header.heroImageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80'}
          alt={identity.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-105 duration-1000 ease-out"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-14 sm:pb-24">
        <div className="max-w-3xl space-y-5">
          
          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {header.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
            {header.heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            {header.heroCtaText && (
              <button
                type="button"
                onClick={() => handleScrollTo(header.heroCtaLink)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all text-sm sm:text-base cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>{header.heroCtaText}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {header.secondaryCtaText && (
              <button
                type="button"
                onClick={() => handleScrollTo(header.secondaryCtaLink)}
                className="inline-flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500 font-semibold px-5 py-3.5 rounded-xl backdrop-blur-sm transition-all text-sm sm:text-base cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 text-blue-400" />
                <span>{header.secondaryCtaText}</span>
              </button>
            )}
          </div>

        </div>

        {/* Highlights Stat Bar */}
        {layoutSections.showQuickStats && header.highlights && header.highlights.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {header.highlights.map((stat) => (
              <div
                key={stat.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-md hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-slate-800/80">
                    {getStatIcon(stat.icon)}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
