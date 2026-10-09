import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Minus, 
  Check, 
  ChevronRight, 
  Info, 
  Eye, 
  Trash2,
  SlidersHorizontal
} from 'lucide-react';
import { CategorySummary, EnxovalItem, BabyProfile } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { calculatePhases } from '../utils/climateCalculator';

interface CategoryDetailViewProps {
  category: CategorySummary;
  items: EnxovalItem[];
  currentBaby: BabyProfile;
  onBack: () => void;
  onUpdateItem: (updatedItem: EnxovalItem) => void;
  onOpenSubSheet: (item: EnxovalItem) => void;
  onAddItem: (categoryId: string, subcategory: string, name: string) => void;
}

type FilterMode = 'all' | 'pending' | 'acquired';

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  items,
  currentBaby,
  onBack,
  onUpdateItem,
  onOpenSubSheet,
  onAddItem,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [activeSubTab, setActiveSubTab] = useState<string>(category.subcategories[0] || 'Todos');
  const [showDismissedModal, setShowDismissedModal] = useState<boolean>(false);
  const [addingToSubcategory, setAddingToSubcategory] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');

  // Calculate climate phases for age tabs if category is 'vestir'
  const phases = useMemo(() => {
    return calculatePhases(currentBaby.dueDate, currentBaby.city);
  }, [currentBaby.dueDate, currentBaby.city]);

  // Map subcategory to phase info
  const phaseMap = useMemo(() => {
    return {
      'Recém-nascido': phases.find(p => p.size === 'RN'),
      '3 meses': phases.find(p => p.size === '3M'),
      '6 meses': phases.find(p => p.size === '6M'),
      '9 meses': phases.find(p => p.size === '9M'),
      '12 meses': phases.find(p => p.size === '12M'),
    };
  }, [phases]);

  // Filter items in this category
  const categoryItems = useMemo(() => {
    return items.filter(it => it.categoryId === category.id);
  }, [items, category.id]);

  const activeItems = useMemo(() => {
    return categoryItems.filter(it => !it.isDismissed);
  }, [categoryItems]);

  const dismissedItems = useMemo(() => {
    return categoryItems.filter(it => it.isDismissed);
  }, [categoryItems]);

  // Overall counts for filter pills
  const { totalCount, pendingCount, acquiredCount, percentage } = useMemo(() => {
    let tot = 0;
    let acq = 0;

    activeItems.forEach(item => {
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach(sub => {
          const target = sub.recommendedQty || 1;
          tot += target;
          acq += sub.isAcquired ? target : (sub.currentQty || 0);
        });
      } else if (item.recommendedQty !== undefined) {
        tot += item.recommendedQty;
        acq += Math.min(item.currentQty || 0, item.recommendedQty);
      } else {
        tot += 1;
        if (item.isAcquired) acq += 1;
      }
    });

    const pct = tot > 0 ? Math.round((acq / tot) * 100) : 0;
    return {
      totalCount: tot,
      acquiredCount: acq,
      pendingCount: tot - acq,
      percentage: pct
    };
  }, [activeItems]);

  // Helper to determine if an item is completely acquired
  const isItemAcquired = (item: EnxovalItem): boolean => {
    if (item.subItems && item.subItems.length > 0) {
      return item.subItems.every(sub => sub.isAcquired);
    }
    if (item.recommendedQty !== undefined) {
      return (item.currentQty || 0) >= item.recommendedQty;
    }
    return !!item.isAcquired;
  };

  // Group items by subcategory
  const groupedItems = useMemo(() => {
    // If user clicked a specific tab, show only items in that subcategory
    const relevantSubcategories = activeSubTab === 'Todos' 
      ? category.subcategories 
      : [activeSubTab];

    const result: { subcategory: string; regularItems: EnxovalItem[]; optionalItems: EnxovalItem[] }[] = [];

    relevantSubcategories.forEach(sub => {
      let list = activeItems.filter(it => it.subcategory === sub);

      // Apply filter pills
      if (filterMode === 'pending') {
        list = list.filter(it => !isItemAcquired(it));
      } else if (filterMode === 'acquired') {
        list = list.filter(it => isItemAcquired(it));
      }

      const regular = list.filter(it => !it.isOptional);
      const optional = list.filter(it => it.isOptional);

      if (regular.length > 0 || optional.length > 0 || activeSubTab === sub) {
        result.push({
          subcategory: sub,
          regularItems: regular,
          optionalItems: optional
        });
      }
    });

    return result;
  }, [activeItems, activeSubTab, category.subcategories, filterMode]);

  // Stepper quantity increment/decrement
  const handleStep = (item: EnxovalItem, delta: number) => {
    const current = item.currentQty || 0;
    const max = item.recommendedQty || 99;
    const next = Math.max(0, Math.min(max, current + delta));
    onUpdateItem({
      ...item,
      currentQty: next,
      isAcquired: next >= max
    });
  };

  // Toggle single item checkbox
  const handleToggleAcquired = (item: EnxovalItem) => {
    onUpdateItem({
      ...item,
      isAcquired: !item.isAcquired
    });
  };

  // Handle adding new item
  const handleSaveNewItem = (subcategory: string) => {
    if (!newItemName.trim()) return;
    onAddItem(category.id, subcategory, newItemName.trim());
    setNewItemName('');
    setAddingToSubcategory(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7FC] pb-24">
      {/* Top sticky bar */}
      <div className="sticky top-0 z-30 bg-[#FAF7FC]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-lavender-100/50 max-w-lg mx-auto">
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="w-10 h-10 rounded-full bg-white shadow-soft border border-baby-border/70 flex items-center justify-center text-baby-dark hover:bg-lavender-50 active:scale-95 transition-all"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="font-heading italic text-2xl font-bold text-baby-dark tracking-tight">
          {category.title}
        </h1>

        <button
          onClick={() => alert(`Dica: A lista de ${category.title} foi ajustada para o perfil de ${currentBaby.name}.`)}
          className="w-10 h-10 rounded-full bg-white shadow-soft border border-baby-border/70 flex items-center justify-center text-baby-dark hover:bg-lavender-50"
        >
          <Info size={18} />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-3">
        {/* Header Progress Banner (Exact match from IMG_6302/IMG_6304) */}
        <div className="rounded-[24px] bg-gradient-to-br from-[#8E6BB8] via-[#7B59A5] to-[#674492] p-5 text-white shadow-float relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="font-heading text-4xl font-semibold tracking-tight tabular-nums block">
                {percentage}%
              </span>
              <p className="text-xs text-white/85 mt-1 leading-snug line-clamp-2">
                {category.description}
              </p>
            </div>

            <button
              onClick={() => setFilterMode(filterMode === 'all' ? 'pending' : 'all')}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/20"
            >
              <SlidersHorizontal size={13} />
              <span>Revisar itens</span>
            </button>
          </div>

          {/* Progress bar line */}
          <div className="mt-4 h-1.5 w-full rounded-full bg-black/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#D5C2EE] transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Filter Pills: Todos, Faltando, Já tenho (IMG_6302) */}
        <div className="mt-4 flex items-center justify-between gap-2 bg-white/70 p-1 rounded-full border border-lavender-100/80 shadow-sm">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
              filterMode === 'all'
                ? 'bg-white text-lavender-800 shadow-sm'
                : 'text-baby-muted hover:text-baby-dark'
            }`}
          >
            Todos <span className="text-[11px] font-normal opacity-80">{totalCount}</span>
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
              filterMode === 'pending'
                ? 'bg-white text-lavender-800 shadow-sm'
                : 'text-baby-muted hover:text-baby-dark'
            }`}
          >
            Faltando <span className="text-[11px] font-normal opacity-80">{pendingCount}</span>
          </button>
          <button
            onClick={() => setFilterMode('acquired')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
              filterMode === 'acquired'
                ? 'bg-white text-lavender-800 shadow-sm'
                : 'text-baby-muted hover:text-baby-dark'
            }`}
          >
            Já tenho <span className="text-[11px] font-normal opacity-80">{acquiredCount}</span>
          </button>
        </div>

        {/* Horizontal Scrollable Subcategory Tabs (IMG_6302, IMG_6304, IMG_6306) */}
        <div className="mt-4 border-b border-lavender-200/60 overflow-x-auto no-scrollbar flex items-center gap-6 px-1">
          {category.subcategories.map(sub => {
            const isActive = activeSubTab === sub;
            return (
              <button
                key={sub}
                onClick={() => setActiveSubTab(sub)}
                className={`pb-2.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
                  isActive
                    ? 'border-lavender-700 text-lavender-800'
                    : 'border-transparent text-baby-muted hover:text-baby-dark'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Sections and Items List */}
        <div className="mt-5 space-y-6">
          {groupedItems.map(group => {
            const phaseInfo = phaseMap[group.subcategory as keyof typeof phaseMap];

            return (
              <div key={group.subcategory} className="space-y-3">
                {/* Section Header */}
                <div className="flex items-baseline justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-lavender-800 flex items-center gap-1.5">
                      {group.subcategory.toUpperCase()}
                      <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                    </h2>

                    {/* Phase badge for baby clothing (IMG_6306: RN, P, M, etc.) */}
                    {phaseInfo && (
                      <span className="bg-lavender-100 text-lavender-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {phaseInfo.size}
                      </span>
                    )}
                  </div>

                  {/* Subtitle with month: e.g. "0 a 1 mês · fev" */}
                  {phaseInfo && (
                    <span className="text-xs text-baby-muted font-medium">
                      {phaseInfo.ageLabel} · <strong className="text-lavender-800">{phaseInfo.monthsLabel}</strong>
                    </span>
                  )}
                </div>

                {/* Regular Items Card Container */}
                <div className="bg-white rounded-[22px] shadow-soft border border-lavender-100/70 divide-y divide-lavender-50 overflow-hidden">
                  {group.regularItems.map(item => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-3">
                      {/* Left: Icon & Name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-[14px] bg-lavender-100 flex items-center justify-center shrink-0">
                          <DynamicIcon name={item.iconName} size={18} className="text-lavender-700" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-baby-dark truncate block">
                            {item.name}
                          </span>
                          {item.recommendedNote && (
                            <span className="text-xs text-baby-muted block">
                              {item.recommendedNote}
                            </span>
                          )}
                          {item.subItems && item.subItems.length > 0 && (
                            <span className="text-xs text-lavender-700 font-medium block">
                              {item.subItems.filter(s => s.isAcquired).length}/{item.subItems.length} itens prontos
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Interactive Control */}
                      <div className="shrink-0 flex items-center">
                        {/* Case 1: SubItems -> Button to open SubItemSheet */}
                        {item.subItems && item.subItems.length > 0 ? (
                          <button
                            onClick={() => onOpenSubSheet(item)}
                            className="flex items-center gap-1 text-xs font-bold text-lavender-700 bg-lavender-50 px-3 py-1.5 rounded-full hover:bg-lavender-100 transition-colors"
                          >
                            <span>Ver itens</span>
                            <ChevronRight size={14} />
                          </button>
                        ) : item.recommendedQty !== undefined ? (
                          /* Case 2: Stepper [-] current/recommended [+] */
                          <div className="flex items-center gap-1.5 bg-lavender-50/90 rounded-full px-2 py-1 border border-lavender-100">
                            <button
                              onClick={() => handleStep(item, -1)}
                              aria-label="Diminuir"
                              className="w-6 h-6 rounded-full flex items-center justify-center text-lavender-700 hover:bg-white active:scale-90 transition-all"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="text-xs font-bold text-baby-dark tabular-nums px-1.5">
                              {item.currentQty || 0}/{item.recommendedQty}
                            </span>
                            <button
                              onClick={() => handleStep(item, 1)}
                              aria-label="Aumentar"
                              className="w-6 h-6 rounded-full flex items-center justify-center text-lavender-700 hover:bg-white active:scale-90 transition-all"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        ) : (
                          /* Case 3: Circular Checkbox Toggle */
                          <button
                            onClick={() => handleToggleAcquired(item)}
                            aria-label={`Marcar ${item.name}`}
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                              item.isAcquired
                                ? 'bg-lavender-700 border-lavender-700 text-white shadow-sm'
                                : 'border-lavender-300 hover:border-lavender-500 bg-white'
                            }`}
                          >
                            {item.isAcquired && <Check size={14} strokeWidth={3} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Opcionais Subsection (IMG_6302, IMG_6304, etc.) */}
                  {group.optionalItems.length > 0 && (
                    <div className="bg-lavender-50/40 p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-lavender-700/80">
                        <span>OPCIONAIS</span>
                        <span className="bg-lavender-200/60 px-2 py-0.5 rounded-full text-[11px] text-lavender-800">
                          {group.optionalItems.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {group.optionalItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between gap-3 py-1">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-9 h-9 rounded-[12px] bg-white border border-lavender-200/60 flex items-center justify-center shrink-0">
                                <DynamicIcon name={item.iconName} size={16} className="text-lavender-600" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-sm font-medium text-baby-dark truncate block">
                                  {item.name}
                                </span>
                                {item.recommendedNote && (
                                  <span className="text-xs text-baby-muted block">
                                    {item.recommendedNote}
                                  </span>
                                )}
                              </div>
                            </div>

                            {item.recommendedQty !== undefined ? (
                              <div className="flex items-center gap-1.5 bg-white rounded-full px-2 py-1 border border-lavender-200">
                                <button
                                  onClick={() => handleStep(item, -1)}
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-lavender-700 hover:bg-lavender-100"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-xs font-bold tabular-nums px-1">
                                  {item.currentQty || 0}/{item.recommendedQty}
                                </span>
                                <button
                                  onClick={() => handleStep(item, 1)}
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-lavender-700 hover:bg-lavender-100"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleToggleAcquired(item)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  item.isAcquired
                                    ? 'bg-lavender-700 border-lavender-700 text-white'
                                    : 'border-lavender-300 bg-white hover:border-lavender-500'
                                }`}
                              >
                                {item.isAcquired && <Check size={12} strokeWidth={3} />}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Item Trigger / Form in this section */}
                  {addingToSubcategory === group.subcategory ? (
                    <div className="p-3 bg-lavender-50 flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        placeholder="Nome do item personalizado..."
                        onKeyDown={e => e.key === 'Enter' && handleSaveNewItem(group.subcategory)}
                        className="flex-1 bg-white border border-lavender-200 rounded-xl px-3 py-2 text-xs text-baby-dark focus:outline-none focus:ring-2 focus:ring-lavender-400"
                      />
                      <button
                        onClick={() => handleSaveNewItem(group.subcategory)}
                        className="px-3 py-2 bg-lavender-700 text-white text-xs font-bold rounded-xl hover:bg-lavender-800"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setAddingToSubcategory(null)}
                        className="px-2.5 py-2 text-xs text-baby-muted hover:text-baby-dark"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingToSubcategory(group.subcategory);
                        setNewItemName('');
                      }}
                      className="w-full py-3 px-4 flex items-center gap-2 text-xs font-bold text-lavender-700 hover:bg-lavender-50/80 transition-colors"
                    >
                      <Plus size={15} className="text-lavender-600" />
                      <span>Adicionar item</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Dismissed Items Card (IMG_6302: "2 itens dispensados - Guarda-roupa...") */}
          {dismissedItems.length > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-white/80 border border-lavender-200/60 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-lavender-100 flex items-center justify-center shrink-0 text-lavender-700">
                  <Eye size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-baby-dark">
                    {dismissedItems.length} {dismissedItems.length === 1 ? 'item dispensado' : 'itens dispensados'}
                  </h4>
                  <p className="text-xs text-baby-muted truncate">
                    {dismissedItems.map(d => d.name).join(', ')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDismissedModal(true)}
                className="text-xs font-bold text-lavender-700 underline hover:text-lavender-900 shrink-0"
              >
                Ver
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dismissed items review modal */}
      {showDismissedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] p-6 space-y-4 shadow-float animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-baby-dark">
                Itens dispensados do enxoval
              </h3>
              <button
                onClick={() => setShowDismissedModal(false)}
                className="text-xs font-bold text-baby-muted hover:text-baby-dark"
              >
                Fechar
              </button>
            </div>
            <p className="text-xs text-baby-muted">
              Você marcou estes itens como dispensados para evitar exageros. Você pode restaurá-los a qualquer momento:
            </p>

            <div className="space-y-2">
              {dismissedItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-lavender-50">
                  <span className="text-sm font-semibold text-baby-dark">{item.name}</span>
                  <button
                    onClick={() => {
                      onUpdateItem({ ...item, isDismissed: false });
                    }}
                    className="text-xs font-bold text-lavender-700 bg-white px-3 py-1.5 rounded-full border border-lavender-200 hover:bg-lavender-100"
                  >
                    Restaurar à lista
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
