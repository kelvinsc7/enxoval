import React from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { CategorySummary, EnxovalItem } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface CategoryCardProps {
  category: CategorySummary;
  items: EnxovalItem[];
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  items,
  onClick,
}) => {
  // Calculate acquired count and total count
  const activeItems = items.filter(it => !it.isDismissed);
  
  let acquiredCount = 0;
  let totalCount = 0;

  activeItems.forEach(item => {
    if (item.subItems && item.subItems.length > 0) {
      item.subItems.forEach(sub => {
        totalCount += (sub.recommendedQty || 1);
        acquiredCount += sub.isAcquired ? (sub.recommendedQty || 1) : (sub.currentQty || 0);
      });
    } else if (item.recommendedQty !== undefined) {
      totalCount += item.recommendedQty;
      acquiredCount += Math.min(item.currentQty || 0, item.recommendedQty);
    } else {
      totalCount += 1;
      if (item.isAcquired) acquiredCount += 1;
    }
  });

  const percentage = totalCount > 0 ? Math.round((acquiredCount / totalCount) * 100) : 0;
  const isComplete = percentage === 100 && totalCount > 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 p-3.5 bg-white rounded-[20px] shadow-soft hover:shadow-float active:scale-[0.99] transition-all border border-lavender-100/60 text-left"
    >
      {/* Icon badge */}
      <div className="w-12 h-12 rounded-[16px] bg-lavender-100/80 flex items-center justify-center shrink-0">
        <DynamicIcon name={category.iconName} size={22} className="text-lavender-700" />
      </div>

      {/* Title & Progress bar */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold text-baby-dark truncate">
            {category.title}
          </h3>
          {isComplete ? (
            <div className="flex items-center gap-1 text-baby-green font-bold text-xs">
              <CheckCircle2 size={16} />
            </div>
          ) : (
            <span className="text-xs font-bold text-lavender-700 tabular-nums">
              {percentage}%
            </span>
          )}
        </div>

        <span className="block text-xs text-baby-muted mt-0.5 tabular-nums">
          {acquiredCount} de {totalCount} peças
        </span>

        {/* Progress bar line */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-lavender-50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-baby-green' : 'bg-lavender-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <ChevronRight size={18} className="text-baby-muted shrink-0" />
    </button>
  );
};
