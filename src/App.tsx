import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORIES } from './data/categories';
import { INITIAL_ENXOVAL_ITEMS } from './data/initialEnxovalData';
import { BabyProfile, EnxovalItem, SubItem } from './types';
import { HeaderNav } from './components/HeaderNav';
import { HeroProgressCard } from './components/HeroProgressCard';
import { CategoryCard } from './components/CategoryCard';
import { CategoryDetailView } from './components/CategoryDetailView';
import { SubItemSheet } from './components/SubItemSheet';
import { ClosetModal } from './components/ClosetModal';
import { ChaDeBebeModal } from './components/ChaDeBebeModal';
import { LiaChatModal } from './components/LiaChatModal';
import { ProfileModal } from './components/ProfileModal';
import { SearchModal } from './components/SearchModal';

const DEFAULT_BABIES: BabyProfile[] = [
  {
    id: 'baby-aurora',
    name: 'Aurora',
    dueDate: '2027-02-15',
    city: 'Curitiba',
    state: 'PR',
    gender: 'girl',
    gestationalWeek: 32,
  },
  {
    id: 'baby-theo',
    name: 'Theo',
    dueDate: '2027-06-20',
    city: 'São Paulo',
    state: 'SP',
    gender: 'boy',
    gestationalWeek: 16,
  }
];

export function App() {
  // Baby Profiles State
  const [babies, setBabies] = useState<BabyProfile[]>(() => {
    const saved = localStorage.getItem('enxoval_babies');
    return saved ? JSON.parse(saved) : DEFAULT_BABIES;
  });
  const [selectedBabyId, setSelectedBabyId] = useState<string>(DEFAULT_BABIES[0].id);

  // Enxoval Items State
  const [items, setItems] = useState<EnxovalItem[]>(() => {
    const saved = localStorage.getItem('enxoval_items');
    return saved ? JSON.parse(saved) : INITIAL_ENXOVAL_ITEMS;
  });

  // Navigation & Modals State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [subSheetItem, setSubSheetItem] = useState<EnxovalItem | null>(null);
  const [isClosetOpen, setIsClosetOpen] = useState(false);
  const [isChaDeBebeOpen, setIsChaDeBebeOpen] = useState(false);
  const [isLiaOpen, setIsLiaOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewBabyOpen, setIsNewBabyOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mainFilter, setMainFilter] = useState<'all' | 'pending' | 'done'>('all');

  const currentBaby = useMemo(() => {
    return babies.find(b => b.id === selectedBabyId) || babies[0];
  }, [babies, selectedBabyId]);

  // Persist items
  useEffect(() => {
    localStorage.setItem('enxoval_items', JSON.stringify(items));
  }, [items]);

  // Persist babies
  useEffect(() => {
    localStorage.setItem('enxoval_babies', JSON.stringify(babies));
  }, [babies]);

  // Total Global Progress Calculation
  const totalPercentage = useMemo(() => {
    const active = items.filter(i => !i.isDismissed);
    let totalTarget = 0;
    let totalAcquired = 0;

    active.forEach(item => {
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach(sub => {
          const target = sub.recommendedQty || 1;
          totalTarget += target;
          totalAcquired += sub.isAcquired ? target : (sub.currentQty || 0);
        });
      } else if (item.recommendedQty !== undefined) {
        totalTarget += item.recommendedQty;
        totalAcquired += Math.min(item.currentQty || 0, item.recommendedQty);
      } else {
        totalTarget += 1;
        if (item.isAcquired) totalAcquired += 1;
      }
    });

    return totalTarget > 0 ? Math.round((totalAcquired / totalTarget) * 100) : 0;
  }, [items]);

  // Update item handler
  const handleUpdateItem = (updated: EnxovalItem) => {
    setItems(prev => prev.map(it => it.id === updated.id ? updated : it));

    // Celebrate if an item was completed
    if (updated.isAcquired) {
      confetti({
        particleCount: 28,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#7C5BA6', '#E0C887', '#A480D0']
      });
    }
  };

  // Update sub-items inside a sheet
  const handleUpdateSubItems = (parentId: string, updatedSubs: SubItem[]) => {
    setItems(prev => prev.map(item => {
      if (item.id === parentId) {
        const isAllDone = updatedSubs.every(s => s.isAcquired);
        return {
          ...item,
          subItems: updatedSubs,
          isAcquired: isAllDone
        };
      }
      return item;
    }));

    if (subSheetItem && subSheetItem.id === parentId) {
      setSubSheetItem(prev => prev ? { ...prev, subItems: updatedSubs } : null);
    }
  };

  // Add new custom item
  const handleAddNewItem = (categoryId: string, subcategory: string, name: string) => {
    const newItem: EnxovalItem = {
      id: `custom-${Date.now()}`,
      name,
      categoryId,
      subcategory,
      iconName: 'Sparkles',
      isAcquired: false,
      isOptional: false,
    };
    setItems(prev => [...prev, newItem]);
  };

  // Profile save
  const handleSaveProfile = (savedBaby: BabyProfile) => {
    if (babies.some(b => b.id === savedBaby.id)) {
      setBabies(prev => prev.map(b => b.id === savedBaby.id ? savedBaby : b));
    } else {
      setBabies(prev => [...prev, savedBaby]);
      setSelectedBabyId(savedBaby.id);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-[#FAF7FC] text-baby-dark">
      {/* If a category is selected, render CategoryDetailView (IMG_6302-6317) */}
      {selectedCategory ? (
        <CategoryDetailView
          category={selectedCategory}
          items={items}
          currentBaby={currentBaby}
          onBack={() => setSelectedCategoryId(null)}
          onUpdateItem={handleUpdateItem}
          onOpenSubSheet={(item) => setSubSheetItem(item)}
          onAddItem={handleAddNewItem}
        />
      ) : (
        /* Main Home Dashboard */
        <div className="pb-24">
          <HeaderNav
            currentBaby={currentBaby}
            babyList={babies}
            onSelectBaby={(b) => setSelectedBabyId(b.id)}
            onOpenAddBaby={() => setIsNewBabyOpen(true)}
            onOpenChaDeBebe={() => setIsChaDeBebeOpen(true)}
            onOpenLia={() => setIsLiaOpen(true)}
            onOpenCloset={() => setIsClosetOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          <main>
            {/* Hero Progress Banner */}
            <HeroProgressCard
              currentBaby={currentBaby}
              totalPercentage={totalPercentage}
              onOpenChaDeBebe={() => setIsChaDeBebeOpen(true)}
              onOpenLinks={() => alert('Seus links de lojas salvos: Amazon, Grão de Gente e Shopee.')}
              onOpenFases={() => alert('Fase 1: Essenciais para o parto e primeiros 3 meses.\nFase 2: Introdução alimentar e fases de 6 a 12 meses.')}
              onEditProfile={() => setIsProfileOpen(true)}
            />

            {/* Category Listing Section */}
            <section className="max-w-lg mx-auto px-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-lg font-bold text-baby-dark">
                  Suas listas
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMainFilter('all')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all border ${
                      mainFilter === 'all'
                        ? 'bg-lavender-700 text-white border-lavender-700'
                        : 'bg-white text-baby-muted border-baby-border hover:bg-lavender-50'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setMainFilter('pending')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all border ${
                      mainFilter === 'pending'
                        ? 'bg-lavender-700 text-white border-lavender-700'
                        : 'bg-white text-baby-muted border-baby-border hover:bg-lavender-50'
                    }`}
                  >
                    Faltando
                  </button>
                  <button
                    onClick={() => setMainFilter('done')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all border ${
                      mainFilter === 'done'
                        ? 'bg-lavender-700 text-white border-lavender-700'
                        : 'bg-white text-baby-muted border-baby-border hover:bg-lavender-50'
                    }`}
                  >
                    Já tenho
                  </button>
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-3">
                {CATEGORIES.map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    items={items.filter(i => i.categoryId === category.id)}
                    onClick={() => setSelectedCategoryId(category.id)}
                  />
                ))}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* Drawer Bottom Sheet for Sub-Items (IMG_6318/6319/6320) */}
      {subSheetItem && (
        <SubItemSheet
          item={subSheetItem}
          onClose={() => setSubSheetItem(null)}
          onUpdateSubItem={handleUpdateSubItems}
        />
      )}

      {/* Virtual Closet Modal */}
      {isClosetOpen && (
        <ClosetModal
          babyName={currentBaby.name}
          onClose={() => setIsClosetOpen(false)}
        />
      )}

      {/* Chá de Bebê Share Modal */}
      {isChaDeBebeOpen && (
        <ChaDeBebeModal
          baby={currentBaby}
          items={items}
          onClose={() => setIsChaDeBebeOpen(false)}
        />
      )}

      {/* Lia AI Assistant Modal */}
      {isLiaOpen && (
        <LiaChatModal
          baby={currentBaby}
          items={items}
          onClose={() => setIsLiaOpen(false)}
        />
      )}

      {/* Profile Edit Modal */}
      {isProfileOpen && (
        <ProfileModal
          currentBaby={currentBaby}
          onSave={handleSaveProfile}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* New Baby Modal */}
      {isNewBabyOpen && (
        <ProfileModal
          currentBaby={{
            id: `baby-${Date.now()}`,
            name: '',
            dueDate: '2027-04-10',
            city: 'São Paulo',
            state: 'SP',
            gender: 'neutral',
            gestationalWeek: 20
          }}
          isNewBaby={true}
          onSave={handleSaveProfile}
          onClose={() => setIsNewBabyOpen(false)}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal
          items={items}
          onClose={() => setIsSearchOpen(false)}
          onSelectItem={(item) => {
            setIsSearchOpen(false);
            setSelectedCategoryId(item.categoryId);
          }}
        />
      )}
    </div>
  );
}

export default App;
