import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DEFAULT_HERO_BANNER, SHOWROOM_HERO_IMAGES } from '../data/specimens';
import { HeroBannerConfig } from '../types/botanical';

interface HeroProps {
  specimenCount: number;
  banner: HeroBannerConfig;
  onExploreCatalog: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  specimenCount,
  banner,
  onExploreCatalog,
  onExploreServices,
}) => {
  const isCustomBanner = banner.imageUrl !== DEFAULT_HERO_BANNER.imageUrl;

  const slides = useMemo(() => {
    if (isCustomBanner && banner.imageUrl) {
      return [
        {
          id: 'custom-banner',
          label: banner.captionTitle || 'Custom Showroom Banner',
          url: banner.imageUrl,
        },
        ...SHOWROOM_HERO_IMAGES,
      ];
    }
    return SHOWROOM_HERO_IMAGES;
  }, [isCustomBanner, banner.imageUrl, banner.captionTitle]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [failedSlides, setFailedSlides] = useState<Record<string, boolean>>({});
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    setActiveIndex(0);
    setFailedSlides({});
  }, [banner.imageUrl]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1 || isCustomBanner) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isAutoPlaying, slides.length, isCustomBanner]);

  const activeSlide = slides[activeIndex] ?? slides[0];

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 pb-10 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-16">
      <div className="relative rounded-2xl overflow-hidden border border-[#E8E5DF] min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] flex flex-col justify-between bg-[#15422E]">
        {/* Full-bleed 3-Image Background Layer */}
        <div className="absolute inset-0">
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            const hasFailed = failedSlides[slide.id];
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  isActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
                }`}
              >
                {!hasFailed ? (
                  <img
                    src={slide.url}
                    alt={slide.label}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedSlides((prev) => ({ ...prev, [slide.id]: true }))
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#15422E] to-[#2E5A44]" />
                )}
              </div>
            );
          })}

          {/* Measured Contrast Scrim for WCAG AAA Text Legibility across mobile & desktop */}
          <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-[#102218]/90 via-[#102218]/75 to-[#102218]/45 sm:to-[#102218]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102218]/90 via-[#102218]/25 to-[#102218]/25" />
        </div>

        {/* Foreground Editorial Content */}
        <div className="relative z-10 p-5 sm:p-10 lg:p-14 flex-1 flex flex-col justify-between gap-8 sm:gap-10">
          <div className="max-w-2xl space-y-4 sm:space-y-5 pt-1 sm:pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-[#A2D1B5]">
              {banner.eyebrow}
            </p>

            <h1 className="font-display text-[32px] sm:text-[48px] lg:text-[56px] font-normal leading-[1.15] tracking-[-0.02em] text-white text-balance">
              Cultivated flora &amp; handcrafted planters.
            </h1>

            <p className="text-[15px] sm:text-[18px] leading-[1.6] text-[#F1F1EF]/90 max-w-[48ch]">
              Each plant in Our Collection is acclimatised for six weeks in our sunlit glasshouse, dressed in raw terracotta or ceramic vessels, and delivered straight to your doorstep.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onExploreCatalog}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-[#15422E] bg-white hover:bg-[#F4F3F1] rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Explore Our Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onExploreServices}
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/35 hover:bg-white/20 rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                White-Glove Care
              </button>
            </div>
          </div>

          {/* Bottom Bar: Provenance Metrics + 3-Image Background Switcher */}
          <div className="pt-5 sm:pt-6 border-t border-white/20 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 max-w-xl">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-white/70">
                  Our Collection
                </p>
                <p className="mt-1 font-display text-base sm:text-xl font-medium text-white tabular-nums">
                  {specimenCount} Available
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-white/70">
                  Acclimatisation
                </p>
                <p className="mt-1 font-display text-base sm:text-xl font-medium text-white">
                  6 Weeks Min
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1 min-w-0">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-white/70">
                  Showroom
                </p>
                <p className="mt-1 font-display text-base sm:text-xl font-medium text-white truncate">
                  {banner.locationTag || 'New Alipore, Kolkata'}
                </p>
              </div>
            </div>

            {/* 3 Showroom Background Image Switcher */}
            <div className="flex flex-col items-start lg:items-end gap-2 w-full lg:w-auto">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-white/85">
                {activeSlide.label}
              </p>
              <div className="grid grid-cols-3 sm:flex items-center gap-2.5 w-full sm:w-auto">
                {slides.map((slide, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => {
                        setActiveIndex(idx);
                        setIsAutoPlaying(false);
                      }}
                      aria-label={`View background: ${slide.label}`}
                      aria-pressed={isActive}
                      className={`relative h-14 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer shrink-0 ${
                        isActive
                          ? 'border-white sm:scale-105 shadow-md'
                          : 'border-white/35 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={slide.url}
                        alt={slide.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
