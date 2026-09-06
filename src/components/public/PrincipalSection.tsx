import React, { useState } from 'react';
import { PrincipalConfig } from '../../types';
import { Quote, BookOpen, ChevronRight, Award } from 'lucide-react';
import { SpeechDetailModal } from './SpeechDetailModal';

interface PrincipalSectionProps {
  principal: PrincipalConfig;
  schoolName: string;
}

export const PrincipalSection: React.FC<PrincipalSectionProps> = ({ principal, schoolName }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="sambutan" className="py-16 sm:py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Principal Photo */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-xl overflow-hidden shadow-lg border-4 border-white bg-slate-200">
                  <img
                    src={principal.imageUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80'}
                    alt={principal.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 text-white">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-0.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>Pimpinan Sekolah</span>
                    </div>
                    <div className="font-bold text-sm leading-tight text-white">
                      {principal.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content & Quote */}
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Prakata Pimpinan</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Sambutan Kepala {schoolName}
              </h2>

              <div className="relative pl-6 border-l-4 border-blue-600 space-y-3">
                <Quote className="w-8 h-8 text-blue-400/40 absolute -top-2 -left-3" />
                <p className="text-base sm:text-lg text-slate-700 font-medium italic leading-relaxed">
                  "{principal.quote}"
                </p>
              </div>

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base line-clamp-4 whitespace-pre-line">
                {principal.fullSpeech}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{principal.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{principal.title}</p>
                  {principal.nip && (
                    <p className="text-xs text-slate-400 font-mono mt-0.5">NIP. {principal.nip}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer self-start sm:self-auto"
                >
                  <span>Baca Sambutan Lengkap</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Speech Modal */}
      {modalOpen && (
        <SpeechDetailModal
          principal={principal}
          schoolName={schoolName}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
};
