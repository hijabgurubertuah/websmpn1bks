import React from 'react';
import { SchoolConfig } from '../../types';
import { Award, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';

interface AccreditationRibbonProps {
  config: SchoolConfig;
}

export const AccreditationRibbon: React.FC<AccreditationRibbonProps> = ({ config }) => {
  const { identity } = config;

  return (
    <section
      id="akreditasi-unggulan"
      className="relative z-20 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-y border-blue-700/40 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Main Accreditation Badge & Text */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/20 font-black">
              <Award className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950" />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Akreditasi A Unggul
                </span>
                <span className="text-xs text-blue-200 font-semibold">
                  Sertifikasi Resmi BAN-S/M
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                Peringkat Akreditasi Tertinggi dengan Predikat <strong className="text-amber-300">A (Unggul)</strong> • NPSN: <span className="font-mono text-blue-300 font-bold">{identity.npsn}</span>
              </p>
            </div>
          </div>

          {/* Quality Standards Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standar Nasional Pendidikan</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Kurikulum Merdeka</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Sekolah Ramah Anak</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
