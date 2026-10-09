import React, { useState, useMemo } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';
import { EnxovalItem } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface SearchModalProps {
  items: EnxovalItem[];
  onClose: () => void;
  onSelectItem: (item: EnxovalItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  items,
  onClose,
  onSelectItem,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return items.filter(
      item => item.name.toLowerCase().includes(q) || item.subcategory.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-12 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[28px] p-5 shadow-pop animate-slide-up space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading italic text-lg font-bold text-baby-dark">
            Buscar no Enxoval
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-lavender-50 hover:bg-lavender-100 flex items-center justify-center text-baby-muted"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lavender-600" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por body, banheira, berço, fralda..."
            className="w-full bg-lavender-50 border border-lavender-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-baby-dark focus:outline-none focus:ring-2 focus:ring-lavender-400"
          />
        </div>

        <div className="max-h-80 overflow-y-auto no-scrollbar space-y-2">
          {query.trim() === '' ? (
            <p className="text-center text-xs text-baby-muted py-6">
              Digite o nome de uma peça ou categoria para encontrar.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-baby-muted py-6">
              Nenhum item encontrado para "{query}".
            </p>
          ) : (
            filtered.map(item => (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="w-full p-3 rounded-xl bg-white hover:bg-lavender-50 border border-lavender-100 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-lavender-100 flex items-center justify-center text-lavender-700 shrink-0">
                    <DynamicIcon name={item.iconName} size={15} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-baby-dark block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-baby-muted block">
                      {item.subcategory}
                    </span>
                  </div>
                </div>

                <ChevronRight size={15} className="text-baby-muted shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
