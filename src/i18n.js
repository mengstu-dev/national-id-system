import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      title: "National ID System"
    }
  },
  am: {
    translation: {
      welcome: "እንኳን ደህና መጡ",
      title: "የብሔራዊ መታወቂያ ስርዓት"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;