import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { PageView } from '../i18n/types';

interface FooterProps {
  onNavigate: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t, languages } = useI18n();
  const activeLang = languages.find((l) => l.code === language) ?? languages[0];

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <div className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {t.nav.brand}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.footer.tagline}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{t.footer.copyright}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-teal-700 dark:text-teal-400">
              {t.footer.creatorLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="hover:text-slate-900 dark:hover:text-white"
          >
            {t.nav.map}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('statistics')}
            className="hover:text-slate-900 dark:hover:text-white"
          >
            {t.nav.statistics}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('analysis')}
            className="hover:text-slate-900 dark:hover:text-white"
          >
            {t.nav.analysis}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('regions')}
            className="hover:text-slate-900 dark:hover:text-white"
          >
            {t.footer.methodologyLink}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {t.footer.activeLanguageLabel}: {activeLang.nativeName}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};
