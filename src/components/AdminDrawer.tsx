import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  MessageSquare,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Sliders,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { formatINR, NURSERY_PRESET_IMAGES } from '../data/specimens';
import { compressImageFileToDataUrl } from '../services/firestoreService';
import {
  BotanicalTaxonomies,
  ConciergeThread,
  HeroBannerConfig,
  InquiryStatus,
  OrderInquiry,
  Specimen,
} from '../types/botanical';
import { AdminInboxTab } from './AdminInboxTab';

export type TaxonomyGroupKey = keyof BotanicalTaxonomies;

interface AdminDrawerProps {
  isOpen: boolean;
  isAdmin: boolean;
  specimens: Specimen[];
  banner: HeroBannerConfig;
  taxonomies: BotanicalTaxonomies;
  adminInquiries: OrderInquiry[];
  adminThreads: ConciergeThread[];
  onClose: () => void;
  onSaveSpecimen: (specimen: Specimen, isNew: boolean) => void;
  onUpdateStock: (id: string, delta: number) => void;
  onDeleteSpecimen: (id: string) => void;
  onResetCatalog: () => void;
  onSaveBanner: (banner: HeroBannerConfig) => void;
  onResetBanner: () => void;
  onAddTaxonomyItem: (group: TaxonomyGroupKey, value: string) => void;
  onRenameTaxonomyItem: (group: TaxonomyGroupKey, oldValue: string, newValue: string) => void;
  onDeleteTaxonomyItem: (group: TaxonomyGroupKey, value: string) => void;
  onResetTaxonomies: () => void;
  onUpdateInquiryStatus: (enquiryId: string, status: InquiryStatus) => Promise<void>;
  onSendAdminReply: (threadUserId: string, customerName: string, text: string) => Promise<void>;
  onToggleThreadStatus: (threadUserId: string, status: 'open' | 'resolved') => Promise<void>;
}

const createBlankSpecimen = (taxonomies: BotanicalTaxonomies): Specimen => ({
  id: `spec-${Date.now()}`,
  commonName: '',
  latinName: '',
  family: 'Tropical Foliage',
  category: taxonomies.categories[0] ?? 'Architectural Flora',
  price: 5200,
  stock: 3,
  light: taxonomies.lightOptions[0] ?? 'Bright Indirect',
  water: taxonomies.waterOptions[0] ?? 'Weekly Mist & Soak',
  heightRange: '80 – 100 cm',
  potDiameter: '24 cm',
  origin: 'Farmers Friend Glasshouse · Acclimatised',
  humidity: '50% – 65% RH',
  soilMix: 'Coarse bark, pumice & structured loam',
  petSafe: false,
  isRareSeasonal: false,
  provenanceNote: 'Hand-selected for Our Collection.',
  careGuide:
    'Place in bright, filtered daylight away from harsh afternoon draughts. Water thoroughly once the top third of potting mix feels dry.',
  imageUrl: NURSERY_PRESET_IMAGES[0].url,
});

const TAXONOMY_SECTIONS: Array<{
  key: TaxonomyGroupKey;
  title: string;
  placeholder: string;
  specimenField: 'category' | 'light' | 'water';
}> = [
  {
    key: 'categories',
    title: 'Botanical Category',
    placeholder: 'Add category (e.g. Indoor Palms)...',
    specimenField: 'category',
  },
  {
    key: 'lightOptions',
    title: 'Light Requirement',
    placeholder: 'Add light profile (e.g. Morning Direct Sun)...',
    specimenField: 'light',
  },
  {
    key: 'waterOptions',
    title: 'Watering Cadence',
    placeholder: 'Add watering cadence (e.g. Twice Weekly)...',
    specimenField: 'water',
  },
];

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  isAdmin,
  specimens,
  banner,
  taxonomies,
  adminInquiries,
  adminThreads,
  onClose,
  onSaveSpecimen,
  onUpdateStock,
  onDeleteSpecimen,
  onResetCatalog,
  onSaveBanner,
  onResetBanner,
  onAddTaxonomyItem,
  onRenameTaxonomyItem,
  onDeleteTaxonomyItem,
  onResetTaxonomies,
  onUpdateInquiryStatus,
  onSendAdminReply,
  onToggleThreadStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'specimens' | 'taxonomies' | 'banner' | 'inbox'>('specimens');
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [editingSpecimen, setEditingSpecimen] = useState<Specimen>(() =>
    createBlankSpecimen(taxonomies)
  );
  const [isNewRecord, setIsNewRecord] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [draftBanner, setDraftBanner] = useState<HeroBannerConfig>(banner);
  const [isBannerDragging, setIsBannerDragging] = useState<boolean>(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSavedNotice, setBannerSavedNotice] = useState<boolean>(false);

  // Taxonomy editor state
  const [newInputs, setNewInputs] = useState<Record<TaxonomyGroupKey, string>>({
    categories: '',
    lightOptions: '',
    waterOptions: '',
  });
  const [editingItem, setEditingItem] = useState<{
    group: TaxonomyGroupKey;
    originalValue: string;
    draftValue: string;
  } | null>(null);
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraftBanner(banner);
  }, [banner]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isAdmin) return null;

  const startCreate = () => {
    setValidationError(null);
    setIsNewRecord(true);
    setEditingSpecimen(createBlankSpecimen(taxonomies));
    setMode('form');
  };

  const startEdit = (specimen: Specimen) => {
    setValidationError(null);
    setIsNewRecord(false);
    setEditingSpecimen({ ...specimen });
    setMode('form');
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setValidationError('Please upload a valid PNG, JPG, or WebP botanical image.');
      return;
    }
    try {
      const dataUrl = await compressImageFileToDataUrl(file, 960, 1200);
      setEditingSpecimen((prev) => ({ ...prev, imageUrl: dataUrl }));
      setValidationError(null);
    } catch {
      setValidationError('Could not process the selected image. Please try another file.');
    }
  };

  const handleBannerFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setBannerError('Please upload a valid JPG, PNG, or WebP banner image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setBannerError('Banner file size exceeds 8 MB. Please choose a smaller image.');
      return;
    }
    try {
      const dataUrl = await compressImageFileToDataUrl(file, 1440, 1080);
      setDraftBanner((prev) => ({ ...prev, imageUrl: dataUrl }));
      setBannerError(null);
      setBannerSavedNotice(false);
    } catch {
      setBannerError('Could not process the selected banner image.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleBannerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsBannerDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleBannerFile(file);
  };

  const handleSubmitSpecimen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecimen.commonName.trim() || !editingSpecimen.latinName.trim()) {
      setValidationError('Both Plant Name and Variety / Subtitle are required.');
      return;
    }
    if (editingSpecimen.price <= 0) {
      setValidationError('Price must be greater than ₹0.');
      return;
    }
    onSaveSpecimen(
      {
        ...editingSpecimen,
        commonName: editingSpecimen.commonName.trim(),
        latinName: editingSpecimen.latinName.trim(),
      },
      isNewRecord
    );
    setMode('list');
    setValidationError(null);
  };

  const handleSubmitBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftBanner.captionTitle.trim()) {
      setBannerError('Banner title cannot be empty.');
      return;
    }
    onSaveBanner({
      ...draftBanner,
      eyebrow: draftBanner.eyebrow.trim() || 'Farmers Friend · One Stop Botanical Solution',
      captionTitle: draftBanner.captionTitle.trim(),
      captionLatin: draftBanner.captionLatin.trim(),
      locationTag: draftBanner.locationTag.trim(),
    });
    setBannerError(null);
    setBannerSavedNotice(true);
    setTimeout(() => setBannerSavedNotice(false), 3000);
  };

  const handleCreateTaxonomy = (group: TaxonomyGroupKey) => {
    const trimmed = newInputs[group].trim();
    if (!trimmed) {
      setTaxonomyError('Please enter a label before adding.');
      return;
    }
    const exists = taxonomies[group].some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setTaxonomyError(`"${trimmed}" already exists in this list.`);
      return;
    }
    onAddTaxonomyItem(group, trimmed);
    setNewInputs((prev) => ({ ...prev, [group]: '' }));
    setTaxonomyError(null);
  };

  const handleSaveRename = () => {
    if (!editingItem) return;
    const trimmed = editingItem.draftValue.trim();
    if (!trimmed) {
      setTaxonomyError('Label cannot be empty.');
      return;
    }
    if (trimmed !== editingItem.originalValue) {
      const duplicate = taxonomies[editingItem.group].some(
        (item) =>
          item !== editingItem.originalValue &&
          item.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) {
        setTaxonomyError(`"${trimmed}" already exists in this list.`);
        return;
      }
      onRenameTaxonomyItem(editingItem.group, editingItem.originalValue, trimmed);
    }
    setEditingItem(null);
    setTaxonomyError(null);
  };

  const inputClassName =
    'w-full bg-white border border-[#E8E5DF] rounded-lg px-4 py-2.5 text-[15px] text-[#222222] placeholder:text-[#5A685F]/60 focus:border-[#2E5A44] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/15 transition-colors';

  const labelClassName =
    'block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F] mb-1.5';

  // Ensure select dropdowns include current specimen value even if edited externally
  const categorySelectOptions = taxonomies.categories.includes(editingSpecimen.category)
    ? taxonomies.categories
    : [editingSpecimen.category, ...taxonomies.categories];

  const lightSelectOptions = taxonomies.lightOptions.includes(editingSpecimen.light)
    ? taxonomies.lightOptions
    : [editingSpecimen.light, ...taxonomies.lightOptions];

  const waterSelectOptions = taxonomies.waterOptions.includes(editingSpecimen.water)
    ? taxonomies.waterOptions
    : [editingSpecimen.water, ...taxonomies.waterOptions];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Admin Panel"
    >
      {/* Backdrop Veil */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#222222]/35 backdrop-blur-[4px] transition-opacity"
      />

      {/* Slide-over Panel */}
      <aside className="relative z-10 w-full max-w-[540px] h-full bg-white border-l border-[#E8E5DF] flex flex-col">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E8E5DF] px-4 sm:px-6 py-4 sm:py-5 space-y-3.5 sm:space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {activeTab === 'specimens' && mode === 'form' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('list');
                    setValidationError(null);
                  }}
                  aria-label="Back to Our Collection inventory"
                  className="w-9 h-9 rounded-lg border border-[#E8E5DF] flex items-center justify-center text-[#5A685F] hover:text-[#222222] hover:bg-[#F9F8F6] cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F] truncate">
                  Farmers Friend Studio
                </p>
                <h2 className="font-display text-[22px] sm:text-[28px] font-medium leading-[1.2] text-[#222222] truncate">
                  {activeTab === 'specimens' && mode === 'form'
                    ? isNewRecord
                      ? 'Add to Our Collection'
                      : 'Edit Collection Item'
                    : 'Admin Panel'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && activeTab === 'specimens' && mode === 'list' && (
                <button
                  type="button"
                  onClick={startCreate}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Collection</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close admin panel"
                className="w-9 h-9 rounded-lg border border-[#E8E5DF] flex items-center justify-center text-[#5A685F] hover:text-[#222222] hover:bg-[#F9F8F6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Segmented Section Tabs */}
          {isAdmin && mode === 'list' && (
            <div className="flex items-center gap-1 p-1 bg-[#F4F3F1] rounded-lg overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('specimens')}
                className={`flex-1 py-2 px-2.5 rounded-md text-[11px] sm:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'specimens'
                    ? 'bg-white text-[#222222] shadow-xs'
                    : 'text-[#5A685F] hover:text-[#222222]'
                }`}
              >
                Our Collection ({specimens.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('taxonomies');
                  setTaxonomyError(null);
                }}
                className={`flex-1 py-2 px-2.5 rounded-md text-[11px] sm:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1.5 ${
                  activeTab === 'taxonomies'
                    ? 'bg-white text-[#222222] shadow-xs'
                    : 'text-[#5A685F] hover:text-[#222222]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 shrink-0" />
                <span>Care &amp; Categories</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('banner')}
                className={`flex-1 py-2 px-2.5 rounded-md text-[11px] sm:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1.5 ${
                  activeTab === 'banner'
                    ? 'bg-white text-[#222222] shadow-xs'
                    : 'text-[#5A685F] hover:text-[#222222]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Hero Banner</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 py-2 px-2.5 rounded-md text-[11px] sm:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1.5 ${
                  activeTab === 'inbox'
                    ? 'bg-white text-[#222222] shadow-xs'
                    : 'text-[#5A685F] hover:text-[#222222]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Inbox ({adminThreads.length + adminInquiries.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Drawer Body */}
        {activeTab === 'inbox' ? (
          <AdminInboxTab
            inquiries={adminInquiries}
            threads={adminThreads}
            onUpdateInquiryStatus={onUpdateInquiryStatus}
            onSendAdminReply={onSendAdminReply}
            onToggleThreadStatus={onToggleThreadStatus}
          />
        ) : activeTab === 'taxonomies' ? (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs leading-relaxed text-[#5A685F]">
                Edit existing labels or create new options. Changes update Our Collection dropdowns and storefront filters immediately.
              </p>
              <button
                type="button"
                onClick={() => {
                  onResetTaxonomies();
                  setEditingItem(null);
                  setTaxonomyError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A685F] hover:text-[#2E5A44] cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Defaults</span>
              </button>
            </div>

            {taxonomyError && (
              <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-medium">
                {taxonomyError}
              </div>
            )}

            {TAXONOMY_SECTIONS.map((section, idx) => {
              const items = taxonomies[section.key];
              const canDelete = items.length > 1;
              return (
                <div
                  key={section.key}
                  className={idx > 0 ? 'pt-6 border-t border-[#E8E5DF]' : ''}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-medium text-[#222222]">
                      {section.title}
                    </h3>
                    <span className="text-xs text-[#5A685F] tabular-nums">
                      {items.length} options
                    </span>
                  </div>

                  {/* Existing Options List */}
                  <div className="space-y-2 mb-3">
                    {items.map((item) => {
                      const isEditingThis =
                        editingItem?.group === section.key &&
                        editingItem.originalValue === item;
                      const usageCount = specimens.filter(
                        (s) => s[section.specimenField] === item
                      ).length;

                      return (
                        <div
                          key={item}
                          className="border border-[#E8E5DF] rounded-xl px-3.5 py-2.5 bg-[#F9F8F6]/60 flex items-center justify-between gap-2.5"
                        >
                          {isEditingThis ? (
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <input
                                type="text"
                                autoFocus
                                value={editingItem.draftValue}
                                onChange={(e) =>
                                  setEditingItem((prev) =>
                                    prev ? { ...prev, draftValue: e.target.value } : null
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveRename();
                                  } else if (e.key === 'Escape') {
                                    setEditingItem(null);
                                  }
                                }}
                                aria-label={`Rename ${item}`}
                                className="flex-1 min-w-0 bg-white border border-[#2E5A44] rounded-lg px-3 py-1.5 text-sm text-[#222222] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleSaveRename}
                                aria-label="Save label"
                                className="w-8 h-8 rounded-lg bg-[#2E5A44] text-white hover:bg-[#4A7C59] inline-flex items-center justify-center cursor-pointer shrink-0"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItem(null);
                                  setTaxonomyError(null);
                                }}
                                aria-label="Cancel rename"
                                className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white text-[#5A685F] hover:text-[#222222] inline-flex items-center justify-center cursor-pointer shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#222222] truncate">
                                  {item}
                                </p>
                                <p className="text-[11px] text-[#5A685F] tabular-nums">
                                  {usageCount}{' '}
                                  {usageCount === 1 ? 'item' : 'items'}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTaxonomyError(null);
                                    setEditingItem({
                                      group: section.key,
                                      originalValue: item,
                                      draftValue: item,
                                    });
                                  }}
                                  aria-label={`Edit ${item}`}
                                  className="px-2.5 py-1.5 rounded-lg border border-[#E8E5DF] bg-white text-xs font-medium text-[#222222] hover:border-[#2E5A44] hover:text-[#2E5A44] inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={!canDelete}
                                  onClick={() => {
                                    onDeleteTaxonomyItem(section.key, item);
                                    setTaxonomyError(null);
                                  }}
                                  title={
                                    canDelete
                                      ? `Delete ${item}`
                                      : 'At least one option must remain'
                                  }
                                  aria-label={`Delete ${item}`}
                                  className="p-1.5 rounded-lg border border-[#E8E5DF] bg-white text-[#5A685F] hover:border-[#ba1a1a] hover:text-[#ba1a1a] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Create New Option Row */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={section.placeholder}
                      value={newInputs[section.key]}
                      onChange={(e) =>
                        setNewInputs((prev) => ({
                          ...prev,
                          [section.key]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateTaxonomy(section.key);
                        }
                      }}
                      className="flex-1 min-w-0 bg-white border border-[#E8E5DF] rounded-lg px-3.5 py-2 text-sm text-[#222222] placeholder:text-[#5A685F]/60 focus:border-[#2E5A44] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/15"
                    />
                    <button
                      type="button"
                      onClick={() => handleCreateTaxonomy(section.key)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === 'banner' ? (
          <form onSubmit={handleSubmitBanner} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Banner Size Specification Box */}
              <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2E5A44]">
                  Recommended Banner Size &amp; Ratio
                </p>
                <p className="text-sm font-medium text-[#222222] tabular-nums">
                  1600 × 1200 px (4:3 Landscape)
                </p>
                <p className="text-xs leading-relaxed text-[#5A685F]">
                  Minimum crisp resolution: 1200 × 900 px · Accepted formats: JPG, PNG or WebP · Max file size: 5 MB.
                </p>
              </div>

              {bannerError && (
                <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-medium">
                  {bannerError}
                </div>
              )}

              {bannerSavedNotice && (
                <div className="p-3 rounded-lg bg-[#bdeed0] text-[#002113] text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Hero banner updated on the storefront.</span>
                </div>
              )}

              {/* Live 4:3 Banner Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={labelClassName}>Live Banner Preview (4:3)</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetBanner();
                      setBannerError(null);
                      setBannerSavedNotice(false);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#5A685F] hover:text-[#2E5A44] cursor-pointer mb-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Default</span>
                  </button>
                </div>
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#E8E5DF] bg-[#EFEEEC]">
                  <img
                    src={draftBanner.imageUrl}
                    alt={draftBanner.captionTitle}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80 truncate">
                        {draftBanner.eyebrow}
                      </p>
                      <p className="mt-0.5 font-display text-base text-white truncate">
                        {draftBanner.captionTitle}
                        {draftBanner.captionLatin && (
                          <span className="font-sans text-xs text-white/90">
                            {' '}
                            · {draftBanner.captionLatin}
                          </span>
                        )}
                      </p>
                    </div>
                    {draftBanner.locationTag && (
                      <span className="px-2.5 py-1 rounded-full bg-white/95 text-[#222222] text-[11px] font-medium shrink-0">
                        {draftBanner.locationTag}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Banner Image Dropzone */}
              <div>
                <span className={labelClassName}>Upload Custom Banner Image</span>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsBannerDragging(true);
                  }}
                  onDragLeave={() => setIsBannerDragging(false)}
                  onDrop={handleBannerDrop}
                  onClick={() => bannerFileInputRef.current?.click()}
                  className={`border-[1.5px] border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    isBannerDragging
                      ? 'border-[#2E5A44] bg-[#F9F8F6]'
                      : 'border-[#E8E5DF] hover:bg-[#F9F8F6]'
                  }`}
                >
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-[#2E5A44]">
                    <Upload className="w-4 h-4" />
                    <span>Upload banner photo (1600 × 1200 px)</span>
                  </div>
                  <p className="mt-1 text-xs text-[#5A685F]">
                    Drag and drop a 4:3 landscape photo here, or click to browse.
                  </p>
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBannerFile(file);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Preset Gallery Quick Picker */}
                <div className="mt-2.5">
                  <span className="block text-[11px] font-medium text-[#5A685F] mb-1.5">
                    Or pick from studio glasshouse photographs:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {NURSERY_PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setDraftBanner((prev) => ({ ...prev, imageUrl: preset.url }));
                          setBannerSavedNotice(false);
                        }}
                        title={preset.label}
                        className={`w-14 h-11 rounded-md overflow-hidden border-2 shrink-0 cursor-pointer ${
                          draftBanner.imageUrl === preset.url
                            ? 'border-[#2E5A44]'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banner Overlay Caption Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="banner-eyebrow" className={labelClassName}>
                    Banner Eyebrow
                  </label>
                  <input
                    id="banner-eyebrow"
                    type="text"
                    value={draftBanner.eyebrow}
                    onChange={(e) =>
                      setDraftBanner((prev) => ({ ...prev, eyebrow: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="banner-location" className={labelClassName}>
                    Showroom Badge
                  </label>
                  <input
                    id="banner-location"
                    type="text"
                    value={draftBanner.locationTag}
                    onChange={(e) =>
                      setDraftBanner((prev) => ({ ...prev, locationTag: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="banner-title" className={labelClassName}>
                    Caption Title
                  </label>
                  <input
                    id="banner-title"
                    type="text"
                    required
                    value={draftBanner.captionTitle}
                    onChange={(e) =>
                      setDraftBanner((prev) => ({ ...prev, captionTitle: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="banner-latin" className={labelClassName}>
                    Banner Subtitle (Optional)
                  </label>
                  <input
                    id="banner-latin"
                    type="text"
                    value={draftBanner.captionLatin}
                    onChange={(e) =>
                      setDraftBanner((prev) => ({ ...prev, captionLatin: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[#E8E5DF] px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-[#E8E5DF] text-sm font-medium text-[#5A685F] hover:text-[#222222] hover:bg-[#F9F8F6] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors cursor-pointer"
              >
                Save Banner
              </button>
            </div>
          </form>
        ) : mode === 'list' ? (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs text-[#5A685F] tabular-nums">
                {specimens.length} items in Our Collection
              </p>
              <button
                type="button"
                onClick={onResetCatalog}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A685F] hover:text-[#2E5A44] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Defaults</span>
              </button>
            </div>

            {specimens.map((item) => (
              <div
                key={item.id}
                className="border border-[#E8E5DF] rounded-xl p-3.5 bg-white flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.commonName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-16 rounded-lg object-cover bg-[#F4F3F1] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold text-[#222222] truncate">
                      {item.commonName}
                    </p>
                    <p className="text-xs text-[#5A685F] truncate">{item.latinName}</p>
                    <p className="mt-1 text-xs font-medium text-[#222222] tabular-nums">
                      {formatINR(item.price)} · {item.category}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {/* Inline Stock Counter */}
                  <div className="inline-flex items-center border border-[#E8E5DF] rounded-lg bg-[#F9F8F6]">
                    <button
                      type="button"
                      onClick={() => onUpdateStock(item.id, -1)}
                      aria-label={`Decrease stock for ${item.commonName}`}
                      className="w-7 h-7 inline-flex items-center justify-center text-[#5A685F] hover:text-[#222222] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-semibold text-[#222222] tabular-nums">
                      {item.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateStock(item.id, 1)}
                      aria-label={`Increase stock for ${item.commonName}`}
                      className="w-7 h-7 inline-flex items-center justify-center text-[#5A685F] hover:text-[#222222] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit / Delete Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      aria-label={`Edit ${item.commonName}`}
                      className="px-2.5 py-1 rounded-md border border-[#E8E5DF] text-xs font-medium text-[#222222] hover:border-[#2E5A44] hover:text-[#2E5A44] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSpecimen(item.id)}
                      aria-label={`Delete ${item.commonName}`}
                      className="p-1.5 rounded-md border border-[#E8E5DF] text-[#5A685F] hover:border-[#ba1a1a] hover:text-[#ba1a1a] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmitSpecimen} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {validationError && (
                <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-medium">
                  {validationError}
                </div>
              )}

              {/* Dropzone Image Uploader */}
              <div>
                <span className={labelClassName}>Our Collection Portrait (4:5 · 1200 × 1500 px)</span>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-[1.5px] border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#2E5A44] bg-[#F9F8F6]'
                      : 'border-[#E8E5DF] hover:bg-[#F9F8F6]'
                  }`}
                >
                  <img
                    src={editingSpecimen.imageUrl}
                    alt="Collection item preview"
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 rounded-lg object-cover bg-[#F4F3F1] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2E5A44]">
                      <Upload className="w-4 h-4" />
                      <span>Upload portrait photo</span>
                    </div>
                    <p className="mt-1 text-xs text-[#5A685F]">
                      Drag and drop JPG/PNG here, or click to select from device.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Preset Nursery Studio Photography Picker */}
                <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
                  {NURSERY_PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setEditingSpecimen((prev) => ({ ...prev, imageUrl: preset.url }))
                      }
                      title={preset.label}
                      className={`w-10 h-12 rounded-md overflow-hidden border-2 shrink-0 cursor-pointer ${
                        editingSpecimen.imageUrl === preset.url
                          ? 'border-[#2E5A44]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="spec-common" className={labelClassName}>
                    Plant Name
                  </label>
                  <input
                    id="spec-common"
                    type="text"
                    required
                    placeholder="e.g. Variegated Thai Monstera"
                    value={editingSpecimen.commonName}
                    onChange={(e) =>
                      setEditingSpecimen((prev) => ({ ...prev, commonName: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="spec-latin" className={labelClassName}>
                    Variety / Subtitle
                  </label>
                  <input
                    id="spec-latin"
                    type="text"
                    required
                    placeholder="e.g. Cream-Marbled Swiss Cheese Plant"
                    value={editingSpecimen.latinName}
                    onChange={(e) =>
                      setEditingSpecimen((prev) => ({ ...prev, latinName: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="spec-price" className={labelClassName}>
                    Price (INR ₹)
                  </label>
                  <input
                    id="spec-price"
                    type="number"
                    min={1}
                    required
                    value={editingSpecimen.price}
                    onChange={(e) =>
                      setEditingSpecimen((prev) => ({
                        ...prev,
                        price: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className={`${inputClassName} tabular-nums`}
                  />
                </div>

                <div>
                  <span className={labelClassName}>Stock Available</span>
                  <div className="h-[46px] border border-[#E8E5DF] rounded-lg px-2 flex items-center justify-between bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSpecimen((prev) => ({
                          ...prev,
                          stock: Math.max(0, prev.stock - 1),
                        }))
                      }
                      className="w-8 h-8 rounded-md hover:bg-[#F9F8F6] inline-flex items-center justify-center text-[#5A685F] cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold text-[#222222] tabular-nums">
                      {editingSpecimen.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSpecimen((prev) => ({ ...prev, stock: prev.stock + 1 }))
                      }
                      className="w-8 h-8 rounded-md hover:bg-[#F9F8F6] inline-flex items-center justify-center text-[#5A685F] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="spec-category" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                    Botanical Category
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('list');
                      setActiveTab('taxonomies');
                    }}
                    className="text-[11px] font-medium text-[#2E5A44] hover:underline cursor-pointer"
                  >
                    Edit / Add Categories
                  </button>
                </div>
                <select
                  id="spec-category"
                  value={editingSpecimen.category}
                  onChange={(e) =>
                    setEditingSpecimen((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className={inputClassName}
                >
                  {categorySelectOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="spec-light" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                      Light Requirement
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('list');
                        setActiveTab('taxonomies');
                      }}
                      className="text-[11px] font-medium text-[#2E5A44] hover:underline cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                  <select
                    id="spec-light"
                    value={editingSpecimen.light}
                    onChange={(e) =>
                      setEditingSpecimen((prev) => ({
                        ...prev,
                        light: e.target.value,
                      }))
                    }
                    className={inputClassName}
                  >
                    {lightSelectOptions.map((light) => (
                      <option key={light} value={light}>
                        {light}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="spec-water" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                      Watering Cadence
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('list');
                        setActiveTab('taxonomies');
                      }}
                      className="text-[11px] font-medium text-[#2E5A44] hover:underline cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                  <select
                    id="spec-water"
                    value={editingSpecimen.water}
                    onChange={(e) =>
                      setEditingSpecimen((prev) => ({
                        ...prev,
                        water: e.target.value,
                      }))
                    }
                    className={inputClassName}
                  >
                    {waterSelectOptions.map((water) => (
                      <option key={water} value={water}>
                        {water}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="spec-height" className={labelClassName}>
                    Height Range
                  </label>
                  <input
                    id="spec-height"
                    type="text"
                    value={editingSpecimen.heightRange}
                    onChange={(e) =>
                      setEditingSpecimen((prev) => ({ ...prev, heightRange: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="spec-pot" className={labelClassName}>
                    Pot Diameter
                  </label>
                  <input
                    id="spec-pot"
                    type="text"
                    value={editingSpecimen.potDiameter}
                    onChange={(e) =>
                      setEditingSpecimen((prev) => ({ ...prev, potDiameter: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2.5 text-sm text-[#222222] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSpecimen.isRareSeasonal}
                    onChange={(e) =>
                      setEditingSpecimen((prev) => ({
                        ...prev,
                        isRareSeasonal: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-[#D97757] rounded"
                  />
                  <span>Mark as Seasonal Drop</span>
                </label>

                <label className="inline-flex items-center gap-2.5 text-sm text-[#222222] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSpecimen.petSafe}
                    onChange={(e) =>
                      setEditingSpecimen((prev) => ({ ...prev, petSafe: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#2E5A44] rounded"
                  />
                  <span>Pet-safe foliage</span>
                </label>
              </div>

              <div>
                <label htmlFor="spec-care" className={labelClassName}>
                  Horticultural Care Notes
                </label>
                <textarea
                  id="spec-care"
                  rows={3}
                  value={editingSpecimen.careGuide}
                  onChange={(e) =>
                    setEditingSpecimen((prev) => ({ ...prev, careGuide: e.target.value }))
                  }
                  className={inputClassName}
                />
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-[#E8E5DF] px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('list');
                  setValidationError(null);
                }}
                className="px-5 py-2.5 rounded-lg border border-[#E8E5DF] text-sm font-medium text-[#5A685F] hover:text-[#222222] hover:bg-[#F9F8F6] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors cursor-pointer"
              >
                Save to Collection
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
};
