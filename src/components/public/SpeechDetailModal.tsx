import React from 'react';
import { PrincipalConfig } from '../../types';
import { X, Award } from 'lucide-react';

interface SpeechDetailModalProps {
  principal: PrincipalConfig;
  schoolName: string;
  onClose: () => void;
}

export const SpeechDetailModal: React.FC<SpeechDetailModalProps> = ({
  principal,
  schoolName,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-300">
              <img
                src={principal.imageUrl}
                alt={principal.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Sambutan Kepala {schoolName}
              </h3>
              <p className="text-xs text-slate-500">{principal.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-blue-900 font-medium italic">
            "{principal.quote}"
          </div>

          <div className="whitespace-pre-line space-y-3 text-slate-700">
            {principal.fullSpeech}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{principal.name}</p>
              <p className="text-xs text-slate-500">{principal.title}</p>
              {principal.nip && <p className="text-xs text-slate-400">NIP. {principal.nip}</p>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1 rounded-full">
              <Award className="w-4 h-4" />
              <span>Pimpinan {schoolName}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
