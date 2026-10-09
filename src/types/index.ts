export type Gender = 'girl' | 'boy' | 'neutral';

export interface BabyProfile {
  id: string;
  userId?: string;
  name: string;
  dueDate: string; // YYYY-MM-DD
  city: string;
  state: string;
  gender: Gender;
  isTwin?: boolean;
  gestationalWeek: number;
}

export type SizeCategory = 'RN' | 'P' | 'M' | 'G' | 'GG';

export interface SubItem {
  id: string;
  name: string;
  isAcquired: boolean;
  isOptional?: boolean;
  recommendedQty?: number;
  currentQty?: number;
  note?: string;
}

export interface EnxovalItem {
  id: string;
  name: string;
  categoryId: string;
  subcategory: string;
  iconName: string;
  recommendedQty?: number;
  currentQty?: number;
  isAcquired?: boolean;
  isOptional?: boolean;
  isDismissed?: boolean;
  recommendedNote?: string;
  ageRange?: 'RN' | '3M' | '6M' | '9M' | '12M';
  ageMonthsLabel?: string;
  subItems?: SubItem[];
}

export interface CategorySummary {
  id: string;
  title: string;
  description: string;
  iconName: string;
  subcategories: string[];
}

export interface ClosetItem {
  id: string;
  name: string;
  type: string;
  size: SizeCategory;
  color: string;
  status: 'comprado' | 'presente' | 'emprestado';
  image?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  itemAction?: {
    type: 'added' | 'checked';
    itemName: string;
    details?: string;
  };
}
