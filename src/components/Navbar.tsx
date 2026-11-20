import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, ChevronDown, Globe, Menu, Search, Settings, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { LanguageCode, PageView, StatusLevel } from '../i18n/types';
import { NotificationItem } from '../data/geoData';
import { StatusLabel } from './StatusLabel';

interface NavbarProps {
  activePage: PageView;
  onNavigate: (page: PageView) => void;
  onOpenSearch: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onDismissNotification: (id: string) => void;
  onSelectCountryFromNotification: (countryId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  onOpenSearch,
  notifications,
  onMarkAllRead,
  onDismissNotification,
  onSelectCountryFromNotification,
}) => {
  const { language, setLanguage, t, languages } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navItems: { id: PageView; label: string }[] = [
    { id: 'map', label: t.nav.map },
    { id: 'statistics', label: t.nav.statistics },
    { id: 'analysis', label: t.nav.analysis },
    { id: 'regions', label: t.nav.regions },
    { id: 'settings', label: t.nav.settings },
  ];

  const activeLangObj = languages.find((l) => l.code === language) ?? languages[0];

  const filteredNotifications = notifications.filter((item) => {
    if (notifFilter === 'unread') return !item.read;
    if (notifFilter === 'critical') return item.severity === 'critical' || item.severity === 'moderate';
    return true;
  });

  const handleLanguagePick = (code: LanguageCode) => {
    setLanguage(code);
    setLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('map')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 rounded-md"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-teal-700 dark:text-teal-400 shrink-0"
          >
            <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.75" />
            <ellipse cx="12" cy="12" rx="4.2" ry="9.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2.5 12h19" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {t.nav.brand}
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {item.id === 'settings' ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                ) : (
                  item.label
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[15px] h-0.5 bg-teal-700 dark:bg-teal-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Utility Actions (Search, Notifications, Language Selector Icon) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label={t.nav.searchButton}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white whitespace-nowrap shrink-0"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden xl:inline max-w-[160px] truncate">{t.nav.searchButton}</span>
            <kbd className="hidden xl:inline-block rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[11px] text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
              /
            </kbd>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setLangOpen(false);
              }}
              aria-label={t.nav.notifications}
              aria-expanded={notifOpen}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-700 px-1 font-mono text-[10px] font-semibold text-white dark:bg-teal-500 dark:text-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                role="dialog"
                aria-label={t.notifications.title}
                className="absolute right-0 mt-2 w-[340px] sm:w-[390px] rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50"
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.notifications.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {unreadCount} {t.notifications.unreadCountLabel}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 whitespace-nowrap"
                    >
                      {t.notifications.markAllRead}
                    </button>
                  )}
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60">
                  {(['all', 'unread', 'critical'] as const).map((filterKey) => {
                    const labels = {
                      all: t.notifications.filterAll,
                      unread: t.notifications.filterUnread,
                      critical: t.notifications.filterCritical,
                    };
                    const active = notifFilter === filterKey;
                    return (
                      <button
                        key={filterKey}
                        type="button"
                        onClick={() => setNotifFilter(filterKey)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {labels[filterKey]}
                      </button>
                    );
                  })}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredNotifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t.notifications.emptyTitle}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t.notifications.emptyBody}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((item) => (
                      <div
                        key={item.id}
                        className={`px-4 py-3 transition-colors ${
                          item.read ? 'bg-white dark:bg-slate-900' : 'bg-teal-50/40 dark:bg-teal-950/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCountryFromNotification(item.countryId);
                              setNotifOpen(false);
                            }}
                            className="text-left group flex-1"
                          >
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <StatusLabel status={item.severity as StatusLevel} />
                              <span aria-hidden="true">·</span>
                              <span>{item.timestamp[language]}</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400">
                              {item.title[language]}
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                              {item.body[language]}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDismissNotification(item.id)}
                            aria-label={t.notifications.dismiss}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector Icon Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => {
                setLangOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              aria-label={t.nav.languageSelector}
              aria-expanded={langOpen}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-teal-600/40 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500/40 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Globe className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
              <span className="font-mono tracking-wide">{activeLangObj.shortCode}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${
                  langOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {langOpen && (
              <div
                role="menu"
                aria-label={t.nav.languageSelector}
                className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50"
              >
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                  {t.nav.languageSelector}
                </div>
                {languages.map((lang) => {
                  const isSelected = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      role="menuitemradio"
                      aria-checked={isSelected}
                      onClick={() => handleLanguagePick(lang.code)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-6 w-7 items-center justify-center rounded border border-slate-200 bg-white font-mono text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                          {lang.shortCode}
                        </span>
                        <div>
                          <div className="font-medium leading-tight">{lang.nativeName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {lang.isDefault ? t.common.defaultBadge : lang.scriptLabel}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
                <div className="mt-1 border-t border-slate-100 pt-1 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setLangOpen(false);
                      onNavigate('settings');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  >
                    <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.nav.settings}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? t.nav.menuClose : t.nav.menuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span aria-hidden="true">●</span>}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
