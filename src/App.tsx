/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { I18nProvider } from './i18n/I18nContext';
import { PageView } from './i18n/types';
import { INITIAL_NOTIFICATIONS, NotificationItem } from './data/geoData';
import { Navbar } from './components/Navbar';
import { WorldMapView } from './components/WorldMapView';
import { StatisticsView } from './components/StatisticsView';
import { AnalysisView } from './components/AnalysisView';
import { CountriesCitiesView } from './components/CountriesCitiesView';
import { SettingsView } from './components/SettingsView';
import { SearchModal } from './components/SearchModal';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<PageView>('map');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('uzb');
  const [selectedCityId, setSelectedCityId] = useState<string | null>('tashkent');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const handleNavigate = (page: PageView) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCountry = (countryId: string, navigateTo?: PageView) => {
    setSelectedCountryId(countryId);
    setSelectedCityId(null);
    if (navigateTo) {
      handleNavigate(navigateTo);
    }
  };

  const handleSelectCity = (countryId: string, cityId: string, navigateTo?: PageView) => {
    setSelectedCountryId(countryId);
    setSelectedCityId(cityId);
    if (navigateTo) {
      handleNavigate(navigateTo);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchOpen(true)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onDismissNotification={handleDismissNotification}
        onSelectCountryFromNotification={(countryId) => {
          handleSelectCountry(countryId, 'map');
        }}
      />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {activePage === 'map' && (
          <WorldMapView
            selectedCountryId={selectedCountryId}
            selectedCityId={selectedCityId}
            onSelectCountry={(id) => handleSelectCountry(id)}
            onSelectCity={(cId, cityId) => handleSelectCity(cId, cityId)}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'statistics' && (
          <StatisticsView
            onSelectCountry={(id, nav) => handleSelectCountry(id, nav)}
          />
        )}

        {activePage === 'analysis' && (
          <AnalysisView
            selectedCountryId={selectedCountryId}
            onSelectCountry={(id) => handleSelectCountry(id)}
          />
        )}

        {activePage === 'regions' && (
          <CountriesCitiesView
            selectedCountryId={selectedCountryId}
            selectedCityId={selectedCityId}
            onSelectCountry={(id) => handleSelectCountry(id)}
            onSelectCity={(cId, cityId) => handleSelectCity(cId, cityId)}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'settings' && <SettingsView />}
      </main>

      <Footer onNavigate={handleNavigate} />

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectCountry={(id, nav) => handleSelectCountry(id, nav)}
        onSelectCity={(cId, cityId) => handleSelectCity(cId, cityId, 'regions')}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
