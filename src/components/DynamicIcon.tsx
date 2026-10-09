import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  showDot?: boolean;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  className = 'w-5 h-5 text-lavender-700',
  size = 20,
  showDot = true
}) => {
  // @ts-expect-error Lucide icons index signature
  const IconComponent = Icons[name] || Icons.Sparkles;

  return (
    <div className="relative inline-flex items-center justify-center">
      <IconComponent size={size} className={className} />
      {showDot && (
        <span 
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold border border-white"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
