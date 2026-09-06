import React from 'react';
import { SchoolConfig } from '../../types';
import { Volume2, Phone, Mail, Shield, ExternalLink, Settings } from 'lucide-react';

interface TopBarProps {
  config: SchoolConfig;
  onOpenAdmin: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ config, onOpenAdmin }) => {
  const { identity, footer } = config;

  return (
    <div id="top-bar" className="bg-slate-900 text-slate-200 text-xs sm:text-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          
          {/* Running announcement ticker */}
          {identity.tickerEnabled && identity.tickerText && (
            <div className="flex items-center gap-2 overflow-hidden flex-1 mr-0 md:mr-4">
              <span className="inline-flex items-center gap-1 bg-blue-600/90 text-white font-semibold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider shrink-0 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" /> Info
              </span>
              <div className="overflow-hidden whitespace-nowrap text-slate-300 font-medium">
                <div className="inline-block animate-marquee hover:pause">
                  {identity.tickerText}
                </div>
              </div>
            </div>
          )}

          {/* Quick contact & Admin trigger */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 border-t border-slate-800/80 md:border-t-0 pt-1 md:pt-0">
            <div className="hidden lg:flex items-center gap-4 text-slate-400">
              <span className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                {footer.phone}
              </span>
              <span className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                {footer.email}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                <Shield className="w-3 h-3" />
                {identity.akreditasi}
              </span>

              <button
                id="btn-admin-access"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white px-2.5 py-1 rounded transition-colors text-xs font-semibold cursor-pointer border border-slate-700 hover:border-blue-500 shadow-sm"
                title="Akses Panel Pengelola Admin CMS"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Panel Admin</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
