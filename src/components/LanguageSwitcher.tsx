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
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-muted transition-colors">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{languages.find(l => l.code === language)?.flag}</span>
      </button>
      <div className="absolute top-full end-0 mt-1 bg-card rounded-xl shadow-card-hover border p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[140px]">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
              language === lang.code ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
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
