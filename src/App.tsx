/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AccountModal } from './components/AccountModal';
import { AdminDrawer, TaxonomyGroupKey } from './components/AdminDrawer';
import { ConciergeChatDrawer } from './components/ConciergeChatDrawer';
import { ConservatorySection } from './components/ConservatorySection';
import { FaqAccordion } from './components/FaqAccordion';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { ServicesSection } from './components/ServicesSection';
import { SpecimenCard } from './components/SpecimenCard';
import { SpecimenDetailView } from './components/SpecimenDetailView';
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import {
  DEFAULT_HERO_BANNER,
  DEFAULT_TAXONOMIES,
  INITIAL_SPECIMENS,
  PLANTER_PAIRINGS,
} from './data/specimens';
import {
  auth,
  formatAuthErrorMessage,
  refreshCurrentUser,
  registerWithEmail,
  resendVerificationEmail,
  sendResetPasswordEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
} from './firebase';
import {
  checkIsAdminUser,
  deleteSpecimenInFirestore,
  resetCatalogInFirestore,
  saveBannerInFirestore,
  saveOrderInquiryInFirestore,
  saveSpecimenInFirestore,
  saveTaxonomiesInFirestore,
  seedDefaultsIfNeeded,
  sendConciergeMessageInFirestore,
  subscribeToAllConciergeThreadsForAdmin,
  subscribeToAllEnquiriesForAdmin,
  subscribeToBannerConfig,
  subscribeToConciergeMessages,
  subscribeToConciergeThreadHeader,
  subscribeToSpecimens,
  subscribeToTaxonomyConfig,
  subscribeToUserEnquiries,
  syncUserAccountDocuments,
  updateConciergeThreadStatus,
  updateInquiryStatusInFirestore,
  updateUserProfileDetails,
} from './services/firestoreService';
import {
  BotanicalCategory,
  BotanicalTaxonomies,
  ConciergeMessage,
  ConciergeThread,
  HeroBannerConfig,
  InquiryStatus,
  OrderInquiry,
  PlanterPairing,
  Specimen,
  UserProfile,
} from './types/botanical';

const FIELD_BY_GROUP: Record<TaxonomyGroupKey, 'category' | 'light' | 'water'> = {
  categories: 'category',
  lightOptions: 'light',
  waterOptions: 'water',
};

export default function App() {
  const [specimens, setSpecimens] = useState<Specimen[]>(INITIAL_SPECIMENS);
  const [taxonomies, setTaxonomies] = useState<BotanicalTaxonomies>(DEFAULT_TAXONOMIES);
  const [heroBanner, setHeroBanner] = useState<HeroBannerConfig>(DEFAULT_HERO_BANNER);
  const [recentInquiries, setRecentInquiries] = useState<OrderInquiry[]>([]);

  // Auth & User State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const pendingRegDetailsRef = useRef<{
    displayName?: string;
    phone?: string;
    neighborhood?: string;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const prevUserUidRef = useRef<string | null>(null);

  // User Chat & Admin Inbox State
  const [conciergeThread, setConciergeThread] = useState<ConciergeThread | null>(null);
  const [conciergeMessages, setConciergeMessages] = useState<ConciergeMessage[]>([]);
  const [adminInquiries, setAdminInquiries] = useState<OrderInquiry[]>([]);
  const [adminThreads, setAdminThreads] = useState<ConciergeThread[]>([]);

  // Filters & Navigation State
  const [selectedCategory, setSelectedCategory] = useState<string>(BotanicalCategory.ALL);
  const [selectedLight, setSelectedLight] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSpecimenId, setActiveSpecimenId] = useState<string | null>(null);

  // Modals & Drawers
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isConciergeChatOpen, setIsConciergeChatOpen] = useState<boolean>(false);

  const [whatsAppModalState, setWhatsAppModalState] = useState<{
    isOpen: boolean;
    specimen: Specimen | null;
    planter?: PlanterPairing;
    quantity?: number;
    mode?: 'WhatsApp' | 'Pickup';
  }>({
    isOpen: false,
    specimen: null,
  });

  // Subscribe to public botanical catalogue, banner & taxonomies from Firestore
  useEffect(() => {
    const unsubSpecimens = subscribeToSpecimens(setSpecimens);
    const unsubBanner = subscribeToBannerConfig(setHeroBanner);
    const unsubTaxonomies = subscribeToTaxonomyConfig(setTaxonomies);
    return () => {
      unsubSpecimens();
      unsubBanner();
      unsubTaxonomies();
    };
  }, []);

  // Auth State Listener & Account Sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUserProfile(null);
        setPendingVerificationEmail(null);
        setIsAdmin(false);
        setRecentInquiries([]);
        setConciergeThread(null);
        setConciergeMessages([]);
        setAdminInquiries([]);
        setAdminThreads([]);
        return;
      }

      if (!firebaseUser.emailVerified) {
        setUserProfile(null);
        setIsAdmin(false);
        setPendingVerificationEmail(firebaseUser.email || 'your email');
        return;
      }

      setPendingVerificationEmail(null);

      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        if (!tokenResult.claims.email_verified) {
          await firebaseUser.getIdToken(true);
        }
        const [profile, adminFlag] = await Promise.all([
          syncUserAccountDocuments(firebaseUser, pendingRegDetailsRef.current ?? undefined),
          checkIsAdminUser(firebaseUser),
        ]);
        pendingRegDetailsRef.current = null;
        setUserProfile(profile);
        setIsAdmin(adminFlag);
        setAuthError(null);

        if (adminFlag) {
          void seedDefaultsIfNeeded(
            INITIAL_SPECIMENS,
            DEFAULT_HERO_BANNER,
            DEFAULT_TAXONOMIES,
            firebaseUser.uid
          );
        }
      } catch (err) {
        setAuthError(
          err instanceof Error ? err.message : 'Unable to sync account with Firestore.'
        );
      }
    });

    return () => unsub();
  }, []);

  // Signed-in User Enquiries & Concierge Chat Subscriptions
  useEffect(() => {
    if (!userProfile?.uid) return;
    const unsubEnquiries = subscribeToUserEnquiries(userProfile.uid, setRecentInquiries);
    const unsubThreadHeader = subscribeToConciergeThreadHeader(
      userProfile.uid,
      setConciergeThread
    );
    const unsubMessages = subscribeToConciergeMessages(
      userProfile.uid,
      setConciergeMessages
    );
    return () => {
      unsubEnquiries();
      unsubThreadHeader();
      unsubMessages();
    };
  }, [userProfile?.uid]);

  // Ensure Admin Drawer is never open for non-admin accounts
  useEffect(() => {
    if (!isAdmin && isAdminDrawerOpen) {
      setIsAdminDrawerOpen(false);
    }
  }, [isAdmin, isAdminDrawerOpen]);

  // Automatically close login modal and return to home page after successful login
  useEffect(() => {
    const currentUid = userProfile?.uid ?? null;
    const justLoggedIn = prevUserUidRef.current === null && currentUid !== null;
    prevUserUidRef.current = currentUid;

    if (justLoggedIn && isAccountModalOpen) {
      setIsAccountModalOpen(false);
      setActiveSpecimenId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [userProfile?.uid, isAccountModalOpen]);

  // Admin All-Enquiries & All-Threads Subscriptions
  useEffect(() => {
    if (!isAdmin) {
      setAdminInquiries([]);
      setAdminThreads([]);
      return;
    }
    const unsubAllEnq = subscribeToAllEnquiriesForAdmin(setAdminInquiries);
    const unsubAllThreads = subscribeToAllConciergeThreadsForAdmin(setAdminThreads);
    return () => {
      unsubAllEnq();
      unsubAllThreads();
    };
  }, [isAdmin]);

  const handleSignInWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = formatAuthErrorMessage(err);
      if (!msg.includes('closed before completion')) {
        setAuthError(msg);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setAuthError(formatAuthErrorMessage(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterWithEmail = async (details: {
    displayName: string;
    email: string;
    password: string;
    phone: string;
    neighborhood: string;
  }) => {
    setAuthLoading(true);
    setAuthError(null);
    pendingRegDetailsRef.current = {
      displayName: details.displayName,
      phone: details.phone,
      neighborhood: details.neighborhood,
    };
    try {
      await registerWithEmail(details.displayName, details.email, details.password);
    } catch (err) {
      pendingRegDetailsRef.current = null;
      setAuthError(formatAuthErrorMessage(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRefreshVerification = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const refreshed = await refreshCurrentUser();
      if (!refreshed) {
        setAuthError('No active sign-in session found.');
        return;
      }
      if (!refreshed.emailVerified) {
        setAuthError('Your email is still unverified. Please click the verification link in your inbox first.');
        return;
      }
      setPendingVerificationEmail(null);
      const [profile, adminFlag] = await Promise.all([
        syncUserAccountDocuments(refreshed, pendingRegDetailsRef.current ?? undefined),
        checkIsAdminUser(refreshed),
      ]);
      pendingRegDetailsRef.current = null;
      setUserProfile(profile);
      setIsAdmin(adminFlag);
    } catch (err) {
      setAuthError(formatAuthErrorMessage(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await sendResetPasswordEmail(email);
    } catch (err) {
      setAuthError(formatAuthErrorMessage(err));
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    pendingRegDetailsRef.current = null;
    setPendingVerificationEmail(null);
    setAuthError(null);
    await signOutUser();
  };

  const handleSaveUserProfile = async (
    displayName: string,
    phone: string,
    neighborhood: string
  ) => {
    if (!userProfile) return;
    await updateUserProfileDetails(
      userProfile.uid,
      userProfile.email,
      displayName,
      phone,
      neighborhood
    );
    setUserProfile((prev) =>
      prev ? { ...prev, displayName, phone, neighborhood } : null
    );
  };

  const handleSendCustomerChatMessage = async (text: string, specimenRef: string) => {
    if (!userProfile) return;
    await sendConciergeMessageInFirestore({
      threadUserId: userProfile.uid,
      customerName: userProfile.displayName,
      senderUid: userProfile.uid,
      senderName: userProfile.displayName,
      senderRole: 'customer',
      text,
      specimenRef,
    });
  };

  const handleSendAdminReply = async (
    threadUserId: string,
    customerName: string,
    text: string
  ) => {
    if (!userProfile || !isAdmin) return;
    await sendConciergeMessageInFirestore({
      threadUserId,
      customerName,
      senderUid: userProfile.uid,
      senderName: userProfile.displayName || 'Farmers Friend Showroom',
      senderRole: 'admin',
      text,
    });
  };

  const activeSpecimen = useMemo(
    () => specimens.find((s) => s.id === activeSpecimenId) ?? null,
    [specimens, activeSpecimenId]
  );

  const filteredSpecimens = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return specimens.filter((item) => {
      const matchesCategory =
        selectedCategory === BotanicalCategory.ALL || item.category === selectedCategory;
      const matchesLight = selectedLight === 'ALL' || item.light === selectedLight;
      const matchesQuery =
        !query ||
        item.commonName.toLowerCase().includes(query) ||
        item.latinName.toLowerCase().includes(query) ||
        item.family.toLowerCase().includes(query);
      return matchesCategory && matchesLight && matchesQuery;
    });
  }, [specimens, selectedCategory, selectedLight, searchQuery]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenSpecimenDetail = (specimen: Specimen) => {
    setActiveSpecimenId(specimen.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDirectWhatsAppFromCard = (specimen: Specimen) => {
    setWhatsAppModalState({
      isOpen: true,
      specimen,
      planter: PLANTER_PAIRINGS[0],
      quantity: 1,
      mode: 'WhatsApp',
    });
  };

  const handleOrderFromDetail = (
    specimen: Specimen,
    planter: PlanterPairing,
    quantity: number,
    mode: 'WhatsApp' | 'Pickup'
  ) => {
    setWhatsAppModalState({
      isOpen: true,
      specimen,
      planter,
      quantity,
      mode,
    });
  };

  const handleConfirmInquiry = async (
    inquiry: OrderInquiry,
    specimenId?: string,
    quantityReserved = 0
  ) => {
    if (userProfile?.uid) {
      await saveOrderInquiryInFirestore(inquiry, userProfile.uid);
    } else {
      setRecentInquiries((prev) => [inquiry, ...prev].slice(0, 12));
    }

    if (isAdmin && userProfile?.uid && specimenId && quantityReserved > 0) {
      const target = specimens.find((s) => s.id === specimenId);
      if (target) {
        const updated = {
          ...target,
          stock: Math.max(0, target.stock - quantityReserved),
        };
        await saveSpecimenInFirestore(updated, userProfile.uid);
      }
    }
  };

  const handleSaveSpecimen = (saved: Specimen, isNew: boolean) => {
    setSpecimens((prev) =>
      isNew ? [saved, ...prev] : prev.map((item) => (item.id === saved.id ? saved : item))
    );
    if (isAdmin && userProfile?.uid) {
      void saveSpecimenInFirestore(saved, userProfile.uid);
    }
  };

  const handleUpdateStock = (id: string, delta: number) => {
    const target = specimens.find((item) => item.id === id);
    if (!target) return;
    const updated = { ...target, stock: Math.max(0, target.stock + delta) };
    setSpecimens((prev) => prev.map((item) => (item.id === id ? updated : item)));
    if (isAdmin && userProfile?.uid) {
      void saveSpecimenInFirestore(updated, userProfile.uid);
    }
  };

  const handleDeleteSpecimen = (id: string) => {
    setSpecimens((prev) => prev.filter((item) => item.id !== id));
    if (activeSpecimenId === id) {
      setActiveSpecimenId(null);
    }
    if (isAdmin) {
      void deleteSpecimenInFirestore(id);
    }
  };

  const handleResetCatalog = () => {
    setSpecimens(INITIAL_SPECIMENS);
    if (isAdmin && userProfile?.uid) {
      void resetCatalogInFirestore(INITIAL_SPECIMENS, userProfile.uid);
    }
  };

  const handleSaveBanner = (updatedBanner: HeroBannerConfig) => {
    setHeroBanner(updatedBanner);
    if (isAdmin && userProfile?.uid) {
      void saveBannerInFirestore(updatedBanner, userProfile.uid);
    }
  };

  const handleResetBanner = () => {
    setHeroBanner(DEFAULT_HERO_BANNER);
    if (isAdmin && userProfile?.uid) {
      void saveBannerInFirestore(DEFAULT_HERO_BANNER, userProfile.uid);
    }
  };

  const handleAddTaxonomyItem = (group: TaxonomyGroupKey, value: string) => {
    const updatedTaxonomies: BotanicalTaxonomies = {
      ...taxonomies,
      [group]: [...taxonomies[group], value],
    };
    setTaxonomies(updatedTaxonomies);
    if (isAdmin && userProfile?.uid) {
      void saveTaxonomiesInFirestore(updatedTaxonomies, userProfile.uid);
    }
  };

  const handleRenameTaxonomyItem = (
    group: TaxonomyGroupKey,
    oldValue: string,
    newValue: string
  ) => {
    const field = FIELD_BY_GROUP[group];
    const updatedTaxonomies: BotanicalTaxonomies = {
      ...taxonomies,
      [group]: taxonomies[group].map((item) => (item === oldValue ? newValue : item)),
    };
    const affectedSpecimens = specimens
      .filter((s) => s[field] === oldValue)
      .map((s) => ({ ...s, [field]: newValue }));

    setTaxonomies(updatedTaxonomies);
    setSpecimens((prev) =>
      prev.map((s) => (s[field] === oldValue ? { ...s, [field]: newValue } : s))
    );
    if (group === 'categories' && selectedCategory === oldValue) {
      setSelectedCategory(newValue);
    }
    if (group === 'lightOptions' && selectedLight === oldValue) {
      setSelectedLight(newValue);
    }

    if (isAdmin && userProfile?.uid) {
      void saveTaxonomiesInFirestore(updatedTaxonomies, userProfile.uid, affectedSpecimens);
    }
  };

  const handleDeleteTaxonomyItem = (group: TaxonomyGroupKey, value: string) => {
    const currentList = taxonomies[group];
    if (currentList.length <= 1) return;
    const remaining = currentList.filter((item) => item !== value);
    const fallbackValue = remaining[0];
    const field = FIELD_BY_GROUP[group];

    const updatedTaxonomies: BotanicalTaxonomies = {
      ...taxonomies,
      [group]: remaining,
    };
    const affectedSpecimens = specimens
      .filter((s) => s[field] === value)
      .map((s) => ({ ...s, [field]: fallbackValue }));

    setTaxonomies(updatedTaxonomies);
    setSpecimens((prev) =>
      prev.map((s) => (s[field] === value ? { ...s, [field]: fallbackValue } : s))
    );
    if (group === 'categories' && selectedCategory === value) {
      setSelectedCategory(BotanicalCategory.ALL);
    }
    if (group === 'lightOptions' && selectedLight === value) {
      setSelectedLight('ALL');
    }

    if (isAdmin && userProfile?.uid) {
      void saveTaxonomiesInFirestore(updatedTaxonomies, userProfile.uid, affectedSpecimens);
    }
  };

  const handleResetTaxonomies = () => {
    setTaxonomies(DEFAULT_TAXONOMIES);
    setSelectedCategory(BotanicalCategory.ALL);
    setSelectedLight('ALL');
    if (isAdmin && userProfile?.uid) {
      void saveTaxonomiesInFirestore(DEFAULT_TAXONOMIES, userProfile.uid);
    }
  };

  const resetFilters = () => {
    setSelectedCategory(BotanicalCategory.ALL);
    setSelectedLight('ALL');
    setSearchQuery('');
  };

  const filterCategories = [BotanicalCategory.ALL, ...taxonomies.categories];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#222222] flex flex-col">
      <Navbar
        onNavigateSection={scrollToSection}
        onOpenAdminDrawer={() => {
          if (isAdmin) setIsAdminDrawerOpen(true);
        }}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenConciergeChat={() => setIsConciergeChatOpen(true)}
        userProfile={userProfile}
        isAdmin={isAdmin}
        isDetailView={Boolean(activeSpecimen)}
        onBackToStorefront={() => setActiveSpecimenId(null)}
      />

      <main className="flex-1">
        {activeSpecimen ? (
          <SpecimenDetailView
            specimen={activeSpecimen}
            relatedSpecimens={specimens.filter((s) => s.id !== activeSpecimen.id)}
            onBack={() => setActiveSpecimenId(null)}
            onSelectSpecimen={handleOpenSpecimenDetail}
            onOrderViaWhatsApp={handleOrderFromDetail}
          />
        ) : (
          <>
            <Hero
              specimenCount={specimens.length}
              banner={heroBanner}
              onExploreCatalog={() => scrollToSection('catalog')}
              onExploreServices={() => scrollToSection('services')}
            />

            {/* Curated Specimen Collection Section */}
            <section
              id="catalog"
              className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-12 lg:py-16 border-t border-[#E8E5DF]"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 mb-6 sm:mb-8">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                    Seasonally Acclimatised Collection
                  </p>
                  <h2 className="mt-2 font-display text-[28px] sm:text-[40px] font-medium leading-[1.2] tracking-[-0.015em] text-[#222222]">
                    Our Collection
                  </h2>
                </div>

                {/* Search & Light Requirement Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative w-full sm:min-w-[240px]">
                    <Search className="w-4 h-4 text-[#5A685F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search plant or variety name..."
                      aria-label="Search our collection"
                      className="w-full bg-white border border-[#E8E5DF] rounded-lg pl-10 pr-9 py-2.5 text-sm text-[#222222] placeholder:text-[#5A685F]/60 focus:border-[#2E5A44] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/15"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A685F] hover:text-[#222222] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <SlidersHorizontal className="w-4 h-4 text-[#5A685F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedLight}
                      onChange={(e) => setSelectedLight(e.target.value)}
                      aria-label="Filter by light requirement"
                      className="w-full sm:w-auto bg-white border border-[#E8E5DF] rounded-lg pl-9 pr-8 py-2.5 text-sm text-[#222222] focus:border-[#2E5A44] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/15 cursor-pointer"
                    >
                      <option value="ALL">All Light Profiles</option>
                      {taxonomies.lightOptions.map((light) => (
                        <option key={light} value={light}>
                          {light}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Interactive Botanical Category Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-4 mb-5 sm:mb-6">
                {filterCategories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`min-h-[38px] px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#2E5A44] text-white'
                          : 'bg-white border border-[#E8E5DF] text-[#5A685F] hover:border-[#2E5A44] hover:text-[#2E5A44]'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* 3-Column Botanical Product Grid */}
              {filteredSpecimens.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {filteredSpecimens.map((specimen) => (
                    <SpecimenCard
                      key={specimen.id}
                      specimen={specimen}
                      onSelectSpecimen={handleOpenSpecimenDetail}
                      onDirectWhatsAppOrder={handleDirectWhatsAppFromCard}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#E8E5DF] rounded-2xl p-12 text-center">
                  <p className="font-display text-xl font-medium text-[#222222]">
                    No items in our collection match those light or category filters.
                  </p>
                  <p className="mt-2 text-sm text-[#5A685F]">
                    Adjust your search terms or reset filters to browse the full conservatory catalogue.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors cursor-pointer"
                  >
                    Reset Catalogue Filters
                  </button>
                </div>
              )}
            </section>

            <ServicesSection />
            <FaqAccordion />
          </>
        )}
      </main>

      <ConservatorySection
        recentInquiries={recentInquiries}
        onOpenGeneralWhatsApp={() =>
          setWhatsAppModalState({
            isOpen: true,
            specimen: null,
            mode: 'WhatsApp',
          })
        }
        onOpenConciergeChat={() => setIsConciergeChatOpen(true)}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        userProfile={userProfile}
        pendingVerificationEmail={pendingVerificationEmail}
        isAdmin={isAdmin}
        authLoading={authLoading}
        authError={authError}
        userEnquiries={recentInquiries}
        onClose={() => setIsAccountModalOpen(false)}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignInWithEmail={handleSignInWithEmail}
        onRegisterWithEmail={handleRegisterWithEmail}
        onResendVerification={resendVerificationEmail}
        onRefreshVerification={handleRefreshVerification}
        onSendPasswordReset={handleSendPasswordReset}
        onSignOut={handleSignOut}
        onSaveProfile={handleSaveUserProfile}
        onOpenConciergeChat={() => setIsConciergeChatOpen(true)}
        onOpenAdminPanel={() => {
          if (isAdmin) setIsAdminDrawerOpen(true);
        }}
      />

      <ConciergeChatDrawer
        isOpen={isConciergeChatOpen}
        userProfile={userProfile}
        authLoading={authLoading}
        specimens={specimens}
        threadHeader={conciergeThread}
        messages={conciergeMessages}
        onClose={() => setIsConciergeChatOpen(false)}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSendMessage={handleSendCustomerChatMessage}
      />

      {isAdmin && (
        <AdminDrawer
          isOpen={isAdminDrawerOpen}
          isAdmin={isAdmin}
          specimens={specimens}
          banner={heroBanner}
          taxonomies={taxonomies}
          adminInquiries={adminInquiries}
          adminThreads={adminThreads}
          onClose={() => setIsAdminDrawerOpen(false)}
          onSaveSpecimen={handleSaveSpecimen}
          onUpdateStock={handleUpdateStock}
          onDeleteSpecimen={handleDeleteSpecimen}
          onResetCatalog={handleResetCatalog}
          onSaveBanner={handleSaveBanner}
          onResetBanner={handleResetBanner}
          onAddTaxonomyItem={handleAddTaxonomyItem}
          onRenameTaxonomyItem={handleRenameTaxonomyItem}
          onDeleteTaxonomyItem={handleDeleteTaxonomyItem}
          onResetTaxonomies={handleResetTaxonomies}
          onUpdateInquiryStatus={(enquiryId, status: InquiryStatus) =>
            updateInquiryStatusInFirestore(enquiryId, status)
          }
          onSendAdminReply={handleSendAdminReply}
          onToggleThreadStatus={(threadUserId, status) =>
            updateConciergeThreadStatus(threadUserId, status)
          }
        />
      )}

      <WhatsAppOrderModal
        isOpen={whatsAppModalState.isOpen}
        specimen={whatsAppModalState.specimen}
        initialPlanter={whatsAppModalState.planter}
        initialQuantity={whatsAppModalState.quantity}
        initialMode={whatsAppModalState.mode}
        userProfile={userProfile}
        onSignInWithGoogle={handleSignInWithGoogle}
        onClose={() => setWhatsAppModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirmInquiry={handleConfirmInquiry}
      />
    </div>
  );
}
