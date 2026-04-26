import { History, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { translations, type Language } from '../lib/translations';
import type { PredictionHistoryItem } from '../lib/storage';

interface HistoryTableProps {
  history: PredictionHistoryItem[];
  onClear: () => void;
  lang: Language;
}

export function HistoryTable({ history, onClear, lang }: HistoryTableProps) {
  const t = translations[lang];
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="glass rounded-2xl overflow-hidden mt-8">
      <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="text-primary" size={20} /> {t.history}
        </h3>
        <button 
          onClick={onClear}
          className="text-xs font-bold text-slate-400 hover:text-danger flex items-center gap-1 transition-colors"
        >
          <Trash2 size={14} /> {t.clear}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-black/20 text-xs uppercase font-bold text-slate-400">
            <tr>
              <th className="px-6 py-4">{t.time}</th>
              <th className="px-6 py-4">{t.asset}</th>
              <th className="px-6 py-4">{t.timeframe}</th>
              <th className="px-6 py-4 text-center">{t.prediction}</th>
              <th className="px-6 py-4 text-right">{t.confidence}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-bold text-white">{item.pair}</span>
                  <span className="ml-2 text-xs text-slate-500 bg-black/40 px-2 py-0.5 rounded">{item.assetType}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                  {item.timeframe}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className={`inline-flex items-center gap-1 font-bold px-3 py-1 rounded-full ${
                    item.direction === 'UP' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}>
                    {item.direction === 'UP' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {item.direction}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                  {item.confidence}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
