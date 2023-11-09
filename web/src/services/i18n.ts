import type { Locale } from '@databank/types';
import { i18n as i18nLib } from '@douglasneuroinformatics/ui';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

void i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    defaultNS: 'translation',
    fallbackLng: 'en' satisfies Locale,
    interpolation: {
      escapeValue: false
    },
    returnObjects: true,
    supportedLngs: ['en', 'fr'] satisfies Locale[]
  });

i18n.on('languageChanged', (lang) => {
  i18nLib.changeLanguage(lang).catch(console.error);
});

export default i18n;
