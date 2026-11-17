import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/specimens';

export const FaqAccordion: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const toggleItem = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12 lg:py-20 border-t border-[#E8E5DF]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
            Horticultural Guidance
          </p>
          <h2 className="mt-2 font-display text-[28px] sm:text-[40px] font-medium leading-[1.2] tracking-[-0.015em] text-[#222222] text-balance">
            Care &amp; concierge questions.
          </h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5A685F]">
            Guidance on glasshouse acclimatisation, custom stone potting, and direct WhatsApp reservations from Our Collection.
          </p>
        </div>

        {/* Divider-driven accordion without container cards */}
        <div className="lg:col-span-8 border-t border-[#E8E5DF]">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="border-b border-[#E8E5DF]">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full py-6 flex items-center justify-between gap-6 text-left cursor-pointer group focus-visible:outline-2 focus-visible:outline-[#2E5A44] rounded-sm"
                >
                  <span className="font-display text-[18px] sm:text-[20px] font-semibold leading-[28px] text-[#222222] group-hover:text-[#2E5A44] transition-colors">
                    {item.question}
                  </span>

                  {/* Rotating geometric + / — indicator */}
                  <span
                    aria-hidden="true"
                    className="relative w-5 h-5 shrink-0 flex items-center justify-center text-[#5A685F]"
                  >
                    <span className="block w-3.5 h-[1.5px] bg-current rounded-full" />
                    <span
                      className={`absolute block w-[1.5px] h-3.5 bg-current rounded-full transition-transform duration-200 ${
                        isOpen ? 'rotate-90 scale-y-0 opacity-0' : 'rotate-0 scale-y-100 opacity-100'
                      }`}
                    />
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-6 pr-8">
                    <p className="text-[15px] leading-[24px] text-[#5A685F] max-w-[68ch]">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
