import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 번역 파일들
import koCommon from '../locales/ko/common.json';
import enCommon from '../locales/en/common.json';

const resources = {
  ko: {
    common: koCommon,
  },
  en: {
    common: enCommon,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko', // 기본 언어를 한국어로 설정
    fallbackLng: 'en', // 번역이 없을 때 사용할 언어
    
    ns: ['common'],
    defaultNS: 'common',
    
    keySeparator: '.', // key separator (예: 'app.name')
    
    interpolation: {
      escapeValue: false, // React에서는 이미 XSS 보호가 되어 있음
    },
    
    react: {
      useSuspense: false, // React Native에서는 Suspense를 사용하지 않음
    },
  });

export default i18n;
