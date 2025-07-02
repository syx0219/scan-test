import { Locale } from 'vant';
import { createI18n } from 'vue-i18n';
import ZH from './zh.js';
import EN from './en.js';
import enUS from 'vant/es/locale/lang/en-US';
import zhUS from 'vant/es/locale/lang/zh-CN';
const messages = {
  'zh-CN': { ...ZH,zhUS },
  'en-US': { ...EN,enUS  },
};

// 智能获取上次用户选择的语言
const savedLang = localStorage.getItem('lang') || 'en-US';
Locale.use(savedLang,messages[savedLang]);
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: savedLang,
  fallbackLocale: 'en-US',
  messages
});
// 导出语言选项（用于下拉菜单）
export default i18n;