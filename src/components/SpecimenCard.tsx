import React, { useState } from 'react';
import { formatINR } from '../data/specimens';
import { Specimen } from '../types/botanical';
import { LightSunMicroIcon, WaterDropMicroIcon, WhatsAppGlyph } from './BotanicalIcons';

interface SpecimenCardProps {
  specimen: Specimen;
  onSelectSpecimen: (specimen: Specimen) => void;
  onDirectWhatsAppOrder: (specimen: Specimen) => void;
}

export const SpecimenCard: React.FC<SpecimenCardProps> = ({
  specimen,
  onSelectSpecimen,
  onDirectWhatsAppOrder,
}) => {
  const [imgError, setImgError] = useState(false);
  const isOutOfStock = specimen.stock <= 0;

  return (
    <article className="group bg-white border border-[#E8E5DF] rounded-2xl p-4 flex flex-col justify-between ambient-flora-hover">
      <div>
        {/* 4:5 Portrait Image Container */}
        <button
          type="button"
          onClick={() => onSelectSpecimen(specimen)}
          className="relative block w-full aspect-[4/5] rounded-lg overflow-hidden bg-[#F4F3F1] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E5A44]"
          aria-label={`Inspect ${specimen.commonName}`}
        >
          {!imgError && specimen.imageUrl ? (
            <img
              src={specimen.imageUrl}
              alt={`${specimen.commonName} (${specimen.latinName})`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover specimen-image-scale"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#F4F3F1] to-[#E9E8E6]">
              <span className="font-display text-lg text-[#2E5A44]">{specimen.commonName}</span>
              <span className="mt-1 text-xs text-[#5A685F]">{specimen.latinName}</span>
            </div>
          )}

          {/* Optional Seasonal / Rare or Reserved Tag (max 1) */}
          {isOutOfStock ? (
            <span className="absolute top-3 left-3 max-w-[55%] truncate inline-flex items-center h-6 px-2.5 rounded-full bg-[#222222]/85 text-white text-[11px] font-semibold uppercase tracking-[0.1em]">
              Reserved
            </span>
          ) : specimen.isRareSeasonal ? (
            <span className="absolute top-3 left-3 max-w-[55%] truncate inline-flex items-center h-6 px-2.5 rounded-full bg-[#FFF4F0]/95 text-[#D97757] text-[11px] font-semibold uppercase tracking-[0.1em]">
              Seasonal Drop
            </span>
          ) : null}

          {/* Upper-right floating price pill */}
          <span className="absolute top-3 right-3 inline-flex items-center h-7 px-3 rounded-full bg-white/95 border border-[#E8E5DF] text-[#222222] text-sm font-medium tabular-nums">
            {formatINR(specimen.price)}
          </span>
        </button>

        {/* Botanical Title & Latin Classification */}
        <div className="pt-4 pb-3">
          <div className="flex items-baseline justify-between gap-2">
            <button
              type="button"
              onClick={() => onSelectSpecimen(specimen)}
              className="text-left font-display text-[19px] sm:text-[20px] font-semibold leading-[26px] sm:leading-[28px] text-[#222222] hover:text-[#2E5A44] transition-colors cursor-pointer"
            >
              {specimen.commonName}
            </button>
          </div>
          <p className="mt-0.5 text-[13px] leading-[20px] text-[#5A685F]">
            {specimen.latinName}
          </p>

          {/* Light / Water micro-icons as clean inline metadata */}
          <div className="mt-3 pt-3 border-t border-[#E8E5DF] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-medium text-[#5A685F]">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <LightSunMicroIcon className="w-3.5 h-3.5 text-[#2E5A44] shrink-0" />
              <span className="truncate">{specimen.light}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <WaterDropMicroIcon className="w-3.5 h-3.5 text-[#2E5A44] shrink-0" />
              <span className="truncate">{specimen.water}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Full-Width Direct Order WhatsApp CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onDirectWhatsAppOrder(specimen)}
          className={`w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] ${
            isOutOfStock
              ? 'bg-[#F4F3F1] text-[#5A685F] border border-[#E8E5DF] hover:bg-[#E9E8E6]'
              : 'bg-[#25D366] hover:bg-[#20BA5A] hover:shadow-[0_6px_16px_rgba(37,211,102,0.25)] text-white'
          }`}
        >
          <WhatsAppGlyph className="w-[18px] h-[18px] shrink-0" />
          <span className="whitespace-nowrap">
            {isOutOfStock ? 'Request Next Batch' : 'Order via WhatsApp'}
          </span>
        </button>
      </div>
    </article>
  );
};
