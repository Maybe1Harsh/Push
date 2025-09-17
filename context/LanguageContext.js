import * as React from 'react';
import { translations } from '../i18n/translations';

export const LanguageContext = React.createContext({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

export function LanguageProvider({ children, initial = 'en' }) {
  const [language, setLanguage] = React.useState(initial);
  const t = translations[language] || translations.en;
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}


