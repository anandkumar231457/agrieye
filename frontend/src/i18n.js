import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';
import ta from './locales/ta.json';

// Initialize i18next
i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            pa: { translation: pa },
            ta: { translation: ta }
        },
        lng: 'en', // default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
