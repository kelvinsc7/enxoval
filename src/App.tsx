import { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORIES } from './data/categories';
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
import { AuthScreen } from './components/AuthScreen';
import { NewBabyOnboarding } from './components/NewBabyOnboarding';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { enxovalService } from './services/enxovalService';

export function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string; name?: string } | null>(() => {
    const saved = localStorage.getItem('enxoval_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Baby Profiles State for current user
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [loadingBabies, setLoadingBabies] = useState(false);

  // Enxoval Items State for selected baby
  const [items, setItems] = useState<EnxovalItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

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

  // Supabase Auth Listener
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted && session?.user) {
            const user = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
            };
            setCurrentUser(user);
            localStorage.setItem('enxoval_current_user', JSON.stringify(user));
          }
        } catch (err) {
          console.warn('Erro ao verificar sessão Supabase:', err);
        }
      }
      if (mounted) setIsAuthChecking(false);
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
          };
          setCurrentUser(user);
          localStorage.setItem('enxoval_current_user', JSON.stringify(user));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('enxoval_current_user');
          setBabies([]);
          setItems([]);
          setSelectedBabyId(null);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => { mounted = false; };
  }, []);

  // Load user's babies whenever currentUser changes
  const loadUserBabies = useCallback(async (userId: string) => {
    setLoadingBabies(true);
    try {
      const userBabies = await enxovalService.getUserBabies(userId);
      setBabies(userBabies);

      if (userBabies.length > 0) {
        // Retrieve last selected baby or default to the first one
        const lastSelected = localStorage.getItem(`enxoval_selected_baby_${userId}`);
        const found = userBabies.find(b => b.id === lastSelected);
        setSelectedBabyId(found ? found.id : userBabies[0].id);
      } else {
        setSelectedBabyId(null);
      }
    } finally {
      setLoadingBabies(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      loadUserBabies(currentUser.id);
    } else {
      setBabies([]);
      setSelectedBabyId(null);
      setItems([]);
    }
  }, [currentUser?.id, loadUserBabies]);

  // Current selected baby
  const currentBaby = useMemo(() => {
    if (!selectedBabyId || babies.length === 0) return null;
    return babies.find(b => b.id === selectedBabyId) || babies[0];
  }, [babies, selectedBabyId]);

  // Load items whenever selectedBabyId changes
  useEffect(() => {
    let mounted = true;
    if (!currentBaby?.id) {
      setItems([]);
      return;
    }

    // Remember selected baby for this user
    if (currentUser?.id) {
      localStorage.setItem(`enxoval_selected_baby_${currentUser.id}`, currentBaby.id);
    }

    setLoadingItems(true);
    enxovalService.getItems(currentBaby.id).then(babyItems => {
      if (mounted) {
        setItems(babyItems);
        setLoadingItems(false);
      }
    });

    return () => { mounted = false; };
  }, [currentBaby?.id, currentUser?.id]);

  // Handle Auth Success
  const handleAuthSuccess = (user: { id: string; email?: string; name?: string }) => {
    setCurrentUser(user);
    localStorage.setItem('enxoval_current_user', JSON.stringify(user));
    loadUserBabies(user.id);
  };

  // Sign out
  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('enxoval_current_user');
    setBabies([]);
    setItems([]);
    setSelectedBabyId(null);
  };

  // Create First Baby from Onboarding
  const handleCreateFirstBaby = async (babyData: Omit<BabyProfile, 'id'>) => {
    if (!currentUser) return;
    const created = await enxovalService.createBaby(currentUser.id, babyData);
    setBabies([created]);
    setSelectedBabyId(created.id);
  };

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
    if (currentBaby) {
      enxovalService.saveItem(currentBaby.id, updated);
    }

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
        const updatedItem = {
          ...item,
          subItems: updatedSubs,
          isAcquired: isAllDone
        };
        if (currentBaby) {
          enxovalService.saveItem(currentBaby.id, updatedItem);
        }
        return updatedItem;
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
    if (currentBaby) {
      enxovalService.saveItem(currentBaby.id, newItem);
    }
  };

  // Profile save (edit existing or add additional baby)
  const handleSaveProfile = async (babyData: BabyProfile) => {
    if (!currentUser) return;

    if (babies.some(b => b.id === babyData.id)) {
      // Update existing baby
      setBabies(prev => prev.map(b => b.id === babyData.id ? babyData : b));
      await enxovalService.updateBaby(babyData);
    } else {
      // Create new baby
      const created = await enxovalService.createBaby(currentUser.id, {
        name: babyData.name,
        dueDate: babyData.dueDate,
        city: babyData.city,
        state: babyData.state,
        gender: babyData.gender,
        gestationalWeek: babyData.gestationalWeek
      });
      setBabies(prev => [...prev, created]);
      setSelectedBabyId(created.id);
    }
  };

  // Delete baby
  const handleDeleteBaby = async (babyId: string) => {
    if (!currentUser) return;
    await enxovalService.deleteBaby(currentUser.id, babyId);
    const remaining = babies.filter(b => b.id !== babyId);
    setBabies(remaining);
    setSelectedBabyId(remaining.length > 0 ? remaining[0].id : null);
  };

  // Loading Screen
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#FAF7FC] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-lavender-700 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-lavender-800">Carregando EnxovalFácil...</p>
      </div>
    );
  }

  // Not Logged In: Show Auth Screen
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Logged In, but 0 babies: Show Clean Onboarding
  if (!loadingBabies && babies.length === 0) {
    return (
      <NewBabyOnboarding
        userName={currentUser.name}
        onSaveFirstBaby={handleCreateFirstBaby}
        onSignOut={handleSignOut}
      />
    );
  }

  // Still loading babies
  if (loadingBabies || !currentBaby) {
    return (
      <div className="min-h-screen bg-[#FAF7FC] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-lavender-700 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-lavender-800">Buscando bebês da sua conta...</p>
      </div>
    );
  }

  const selectedCategory = CATEGORIES.find(c => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-[#FAF7FC] text-baby-dark">
      {/* If a category is selected, render CategoryDetailView */}
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
            userName={currentUser.name}
            onSelectBaby={(b) => setSelectedBabyId(b.id)}
            onOpenAddBaby={() => setIsNewBabyOpen(true)}
            onOpenChaDeBebe={() => setIsChaDeBebeOpen(true)}
            onOpenLia={() => setIsLiaOpen(true)}
            onOpenCloset={() => setIsClosetOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onSignOut={handleSignOut}
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
              {loadingItems ? (
                <div className="py-12 text-center text-xs text-baby-muted">
                  Carregando lista de itens do bebê...
                </div>
              ) : (
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
              )}
            </section>
          </main>
        </div>
      )}

      {/* Drawer Bottom Sheet for Sub-Items */}
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
          babyId={currentBaby.id}
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
          onDelete={babies.length > 1 ? handleDeleteBaby : undefined}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* New Baby Modal (When clicking + to add twin or next baby) */}
      {isNewBabyOpen && (
        <ProfileModal
          currentBaby={{
            id: `baby-${Date.now()}`,
            name: '',
            dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            city: currentBaby.city,
            state: currentBaby.state,
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
