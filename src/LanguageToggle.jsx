import { useLanguage } from './LanguageContext';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50"
      title={language === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu'}
    >
      {language === 'ms' ? '🇬🇧 EN' : '🇲🇾 MS'}
    </button>
  );
}
