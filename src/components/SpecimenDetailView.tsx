import React, { useState } from 'react';
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { formatINR, PLANTER_PAIRINGS } from '../data/specimens';
import { PlanterPairing, Specimen } from '../types/botanical';
import { LightSunMicroIcon, WaterDropMicroIcon, WhatsAppGlyph } from './BotanicalIcons';

interface SpecimenDetailViewProps {
  specimen: Specimen;
  relatedSpecimens: Specimen[];
  onBack: () => void;
  onSelectSpecimen: (specimen: Specimen) => void;
  onOrderViaWhatsApp: (specimen: Specimen, planter: PlanterPairing, quantity: number, mode: 'WhatsApp' | 'Pickup') => void;
}

export const SpecimenDetailView: React.FC<SpecimenDetailViewProps> = ({
  specimen,
  relatedSpecimens,
  onBack,
  onSelectSpecimen,
  onOrderViaWhatsApp,
}) => {
  const [selectedPlanterId, setSelectedPlanterId] = useState<string>(PLANTER_PAIRINGS[1].id);
  const [quantity, setQuantity] = useState<number>(1);
  const [imgError, setImgError] = useState<boolean>(false);

  const selectedPlanter =
    PLANTER_PAIRINGS.find((p) => p.id === selectedPlanterId) ?? PLANTER_PAIRINGS[0];
  const unitTotal = specimen.price + selectedPlanter.priceDelta;
  const lineTotal = unitTotal * quantity;
  const maxSelectable = Math.max(1, specimen.stock);
  const isOutOfStock = specimen.stock <= 0;

  return (
    <div className="pb-28 md:pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-5 sm:pt-6 lg:pt-10">
        {/* Back Breadcrumb */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5A685F] hover:text-[#2E5A44] transition-colors cursor-pointer mb-6 focus-visible:outline-2 focus-visible:outline-[#2E5A44] rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Our Collection</span>
        </button>

        {/* Asymmetric 12-Column Pairing: 7 Cols Portrait & Monograph + 5 Cols Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left 7 Columns: Portrait + Botanical Monograph */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-[#E8E5DF] bg-[#F4F3F1]">
              {!imgError && specimen.imageUrl ? (
                <img
                  src={specimen.imageUrl}
                  alt={`${specimen.commonName} (${specimen.latinName})`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center">
                  <span className="font-display text-2xl text-[#2E5A44]">{specimen.commonName}</span>
                  <span className="mt-1 text-sm text-[#5A685F]">{specimen.latinName}</span>
                </div>
              )}

              {specimen.isRareSeasonal && !isOutOfStock && (
                <span className="absolute top-4 left-4 inline-flex items-center h-6 px-3 rounded-full bg-[#FFF4F0]/95 text-[#D97757] text-[11px] font-semibold uppercase tracking-[0.12em]">
                  Seasonal Drop
                </span>
              )}
            </div>

            {/* Botanical Monograph Dossier */}
            <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                  Botanical Monograph · Care Specifications
                </p>
                <h2 className="mt-2 font-display text-[24px] sm:text-[28px] font-medium text-[#222222]">
                  Provenance &amp; Microclimate
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5A685F]">
                  {specimen.careGuide}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-6 border-t border-[#E8E5DF]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                    Nursery Origin
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#222222]">{specimen.origin}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                    Plant Height &amp; Vessel
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#222222] tabular-nums">
                    {specimen.heightRange} · {specimen.potDiameter} pot
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                    Ambient Humidity
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#222222] tabular-nums">
                    {specimen.humidity}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                    Substrate Blend
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#222222]">{specimen.soilMix}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                    Household Compatibility
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#222222]">
                    {specimen.petSafe ? 'Pet-friendly foliage' : 'Keep away from pets'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                    Plant Group
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#222222]">{specimen.family}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Sticky Contiguous Purchase Module */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                    {specimen.family} · {specimen.category}
                  </p>
                  <span
                    className={`shrink-0 inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] tabular-nums ${
                      isOutOfStock
                        ? 'bg-[#F4F3F1] text-[#5A685F]'
                        : 'bg-[#25D366]/12 text-[#1EA952]'
                    }`}
                  >
                    {isOutOfStock ? 'Reserved' : `${specimen.stock} Available`}
                  </span>
                </div>

                <h1 className="mt-2 font-display text-[30px] sm:text-[36px] font-medium leading-[1.18] tracking-[-0.015em] text-[#222222] text-balance">
                  {specimen.commonName}
                </h1>
                <p className="mt-1 text-[15px] text-[#5A685F]">{specimen.latinName}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#5A685F]">
                  {specimen.provenanceNote}
                </p>

                <div className="mt-5 flex items-baseline gap-3">
                  <span className="font-display text-3xl font-medium text-[#222222] tabular-nums">
                    {formatINR(lineTotal)}
                  </span>
                  {selectedPlanter.priceDelta > 0 && (
                    <span className="text-xs text-[#5A685F] tabular-nums">
                      Includes +{formatINR(selectedPlanter.priceDelta)} planter upgrade
                    </span>
                  )}
                </div>
              </div>

              {/* Light & Water Care Summary */}
              <div className="py-4 border-y border-[#E8E5DF] grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="mt-0.5 w-8 h-8 rounded-full bg-[#F9F8F6] border border-[#E8E5DF] flex items-center justify-center text-[#2E5A44] shrink-0">
                    <LightSunMicroIcon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                      Light
                    </p>
                    <p className="text-xs font-medium text-[#222222] mt-0.5 break-words">{specimen.light}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="mt-0.5 w-8 h-8 rounded-full bg-[#F9F8F6] border border-[#E8E5DF] flex items-center justify-center text-[#2E5A44] shrink-0">
                    <WaterDropMicroIcon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                      Watering
                    </p>
                    <p className="text-xs font-medium text-[#222222] mt-0.5 break-words">{specimen.water}</p>
                  </div>
                </div>
              </div>

              {/* Vessel Pairing Selector */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                  Select Vessel Pairing
                </p>
                <div className="space-y-2.5">
                  {PLANTER_PAIRINGS.map((planter) => {
                    const isSelected = planter.id === selectedPlanter.id;
                    return (
                      <button
                        key={planter.id}
                        type="button"
                        onClick={() => setSelectedPlanterId(planter.id)}
                        className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#2E5A44] bg-[#F9F8F6]'
                            : 'border-[#E8E5DF] bg-white hover:border-[#5A685F]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#222222]">
                              {planter.name}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#2E5A44] shrink-0" />}
                          </div>
                          <p className="text-xs text-[#5A685F] mt-0.5 truncate">
                            {planter.material}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-[#222222] tabular-nums shrink-0">
                          {planter.priceDelta === 0 ? 'Included' : `+${formatINR(planter.priceDelta)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#222222]">Quantity</span>
                <div className="inline-flex items-center border border-[#E8E5DF] rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 inline-flex items-center justify-center text-[#5A685F] hover:text-[#222222] disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-[#222222] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxSelectable, q + 1))}
                    disabled={quantity >= maxSelectable || isOutOfStock}
                    aria-label="Increase quantity"
                    className="w-10 h-10 inline-flex items-center justify-center text-[#5A685F] hover:text-[#222222] disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Primary Direct WhatsApp & Conservatory Pickup CTAs */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOrderViaWhatsApp(specimen, selectedPlanter, quantity, 'WhatsApp')}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-lg text-sm font-medium text-white bg-[#25D366] hover:bg-[#20BA5A] hover:shadow-[0_6px_16px_rgba(37,211,102,0.25)] transition-all duration-200 cursor-pointer"
                >
                  <WhatsAppGlyph className="w-[18px] h-[18px]" />
                  <span>
                    {isOutOfStock
                      ? 'Notify Me via WhatsApp'
                      : `Order via WhatsApp · ${formatINR(lineTotal)}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onOrderViaWhatsApp(specimen, selectedPlanter, quantity, 'Pickup')}
                  className="w-full inline-flex items-center justify-center py-3 px-5 rounded-lg text-sm font-medium text-[#2E5A44] border border-[#2E5A44] hover:bg-[#2E5A44] hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Reserve for Conservatory Pickup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Companion Specimens Row */}
        {relatedSpecimens.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#E8E5DF]">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                  Curated Companions
                </p>
                <h2 className="mt-1 font-display text-[28px] font-medium text-[#222222]">
                  More from Our Collection
                </h2>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-semibold text-[#2E5A44] border-b border-transparent hover:border-[#2E5A44] transition-colors cursor-pointer whitespace-nowrap"
              >
                View Our Collection
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedSpecimens.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onSelectSpecimen(item);
                  }}
                  className="group text-left bg-white border border-[#E8E5DF] rounded-2xl p-4 flex items-center gap-4 ambient-flora-hover cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.commonName}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 object-cover rounded-lg bg-[#F4F3F1] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold text-[#222222] group-hover:text-[#2E5A44] transition-colors truncate">
                      {item.commonName}
                    </p>
                    <p className="text-xs text-[#5A685F] truncate">{item.latinName}</p>
                    <p className="mt-2 text-sm font-medium text-[#222222] tabular-nums">
                      {formatINR(item.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Ordering Bar (strictly <= 15% viewport height) */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-[#E8E5DF] px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#5A685F] truncate">{specimen.commonName}</p>
          <p className="font-display text-lg font-semibold text-[#222222] tabular-nums">
            {formatINR(lineTotal)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOrderViaWhatsApp(specimen, selectedPlanter, quantity, 'WhatsApp')}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-[#25D366] hover:bg-[#20BA5A] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <WhatsAppGlyph className="w-[18px] h-[18px]" />
          <span>Order via WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
