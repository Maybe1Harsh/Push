import * as React from 'react';
import { LanguageContext } from '../context/LanguageContext';

export function useTranslation() {
  const { t, language, setLanguage } = React.useContext(LanguageContext);
  return { t, language, setLanguage };
}



