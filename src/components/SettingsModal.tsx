import { useState, useEffect } from 'react';
import { X, KeyRound, ExternalLink, ShieldCheck } from 'lucide-react';
import { getApiKey, setApiKey as saveApiKey, removeApiKey } from '../lib/storage';
import { translations, type Language } from '../lib/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function SettingsModal({ isOpen, onClose, lang }: SettingsModalProps) {
  const t = translations[lang];
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existingKey = getApiKey();
      setHasKey(!!existingKey);
      if (existingKey) {
        setKeyInput(existingKey.substring(0, 8) + '...' + existingKey.substring(existingKey.length - 4));
      } else {
        setKeyInput('');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (keyInput && !keyInput.includes('...')) {
      saveApiKey(keyInput);
      setHasKey(true);
      onClose();
    } else if (!keyInput) {
      removeApiKey();
      setHasKey(false);
    }
  };

  const handleClear = () => {
    removeApiKey();
    setKeyInput('');
    setHasKey(false);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <KeyRound size={20} className="text-primary" /> {t.apiSettings}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-xl bg-primary/5 border border-primary/20 p-4">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" /> {t.howToGet}
            </h3>
            <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
              <li>{lang === 'en' ? 'Go to' : 'اذهب إلى'} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">{t.googleStudio} <ExternalLink size={10} /></a></li>
              <li>{lang === 'en' ? 'Click on the' : 'انقر على'} <span className="text-white font-bold">"{t.createKey}"</span> {lang === 'en' ? 'button' : 'زر'}.</li>
              <li>{t.copyKey}</li>
              <li>{t.pasteKey}</li>
            </ol>
            <div className="mt-4 p-2 bg-danger/10 border border-danger/20 rounded text-[10px] text-danger font-bold flex items-center gap-1">
              ⚠️ {t.systemNote}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.apiKeyLabel}
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className={`w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-primary transition-all font-mono text-sm ${lang === 'ar' ? 'text-right' : ''}`}
            />
            {hasKey && (
              <p className="flex items-center gap-1 text-xs text-success mt-1">
                <ShieldCheck size={14} /> {t.keySaved}
              </p>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            {hasKey && (
              <button
                onClick={handleClear}
                className="rounded-lg px-4 py-2 font-bold text-danger hover:bg-danger/10 transition-all text-sm"
              >
                {t.clearKey}
              </button>
            )}
            <button
              onClick={handleSave}
              className="rounded-lg bg-primary px-6 py-2 font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
            >
              {t.saveConfig}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
