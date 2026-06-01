import { useI18n } from '../i18n/I18nContext';
import type { Lang } from '../i18n/translations';

export function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();

  const options: { value: Lang; flag: string; label: string }[] = [
    { value: 'en', flag: '🇬🇧', label: 'EN' },
    { value: 'fr', flag: '🇫🇷', label: 'FR' },
  ];

  return (
    <div className="flex items-center gap-1 bg-gaming-dark-700 border border-gaming-dark-500 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLang(opt.value)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
            lang === opt.value
              ? 'bg-gaming-dark-500 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label={opt.label}
        >
          <span>{opt.flag}</span>
          {!compact && <span>{opt.label}</span>}
        </button>
      ))}
    </div>
  );
}
