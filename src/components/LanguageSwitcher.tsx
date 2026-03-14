import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ps', label: 'پښتو', flag: '🇦🇫' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200 text-emerald-700">
        <Globe className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium">{languages.find(l => l.code === language)?.flag}</span>
      </button>
      <div className="absolute top-full end-0 mt-1 bg-white rounded-xl shadow-lg border border-emerald-100 p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[140px]">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
              language === lang.code 
                ? 'bg-emerald-600 text-white' 
                : 'text-gray-700 hover:bg-emerald-50'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;