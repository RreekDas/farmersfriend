import React from 'react';
import { SERVICE_FEATURES } from '../data/specimens';
import { ServiceFeature } from '../types/botanical';
import {
  BotanicalShearsMonoIcon,
  DeliveryVanMonoIcon,
  PottingSoilMonoIcon,
  WateringCanMonoIcon,
} from './BotanicalIcons';

const renderServiceIcon = (iconType: ServiceFeature['iconType']) => {
  switch (iconType) {
    case 'delivery':
      return <DeliveryVanMonoIcon className="w-6 h-6 text-[#2E5A44]" />;
    case 'soil':
      return <PottingSoilMonoIcon className="w-6 h-6 text-[#2E5A44]" />;
    case 'shears':
      return <BotanicalShearsMonoIcon className="w-6 h-6 text-[#2E5A44]" />;
    case 'watering':
      return <WateringCanMonoIcon className="w-6 h-6 text-[#2E5A44]" />;
  }
};

export const ServicesSection: React.FC = () => {
  return (
    <section
      id="services"
      className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12 lg:py-20 border-t border-[#E8E5DF]"
    >
      <div className="max-w-2xl mb-8 sm:mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
          White-Glove Atelier Standards
        </p>
        <h2 className="mt-2 font-display text-[28px] sm:text-[40px] font-medium leading-[1.2] tracking-[-0.015em] text-[#222222] text-balance">
          From potting bench to sunlit verandah.
        </h2>
        <p className="mt-3 text-[15px] leading-[1.6] text-[#5A685F]">
          Every living piece is prepared with horticultural discipline so every plant in Our Collection settles gracefully into your home.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICE_FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="bg-white border border-[#E8E5DF] rounded-2xl px-6 py-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-full bg-[#F9F8F6] border border-[#E8E5DF] flex items-center justify-center mb-6">
                {renderServiceIcon(feature.iconType)}
              </div>
              <h3 className="font-display text-[20px] font-semibold leading-[28px] text-[#222222]">
                {feature.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-[24px] text-[#5A685F]">
                {feature.description}
              </p>
            </div>
            <p className="mt-6 pt-4 border-t border-[#E8E5DF] text-[12px] font-medium text-[#2E5A44]">
              {feature.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
