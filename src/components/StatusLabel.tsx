import React from 'react';
import { StatusLevel } from '../i18n/types';
import { useI18n } from '../i18n/I18nContext';

interface StatusLabelProps {
  status: StatusLevel;
  className?: string;
}

const GLYPHS: Record<StatusLevel, string> = {
  good: '●',
  moderate: '▲',
  critical: '✖',
};

const TONES: Record<StatusLevel, string> = {
  good: 'text-emerald-700 dark:text-emerald-400',
  moderate: 'text-amber-700 dark:text-amber-400',
  critical: 'text-rose-700 dark:text-rose-400',
};

export const StatusLabel: React.FC<StatusLabelProps> = ({ status, className = '' }) => {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${TONES[status]} ${className}`}>
      <span aria-hidden="true" className="text-[10px] leading-none">
        {GLYPHS[status]}
      </span>
      <span>{t.statusLabels[status]}</span>
    </span>
  );
};
