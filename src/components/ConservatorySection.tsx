import React, { useState } from 'react';
import { MapPin, MessageSquare, Phone } from 'lucide-react';
import { formatINR } from '../data/specimens';
import { OrderInquiry } from '../types/botanical';
import { WhatsAppGlyph } from './BotanicalIcons';

interface ConservatorySectionProps {
  recentInquiries: OrderInquiry[];
  onOpenGeneralWhatsApp: () => void;
  onOpenConciergeChat: () => void;
}

export const ConservatorySection: React.FC<ConservatorySectionProps> = ({
  recentInquiries,
  onOpenGeneralWhatsApp,
  onOpenConciergeChat,
}) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer
      id="conservatory"
      className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-12 pb-12 lg:pt-20 border-t border-[#E8E5DF]"
    >
      <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
              Visit Farmers Friend Showroom
            </p>
            <h2 className="font-display text-[26px] sm:text-[36px] font-medium leading-[1.2] tracking-[-0.015em] text-[#222222] text-balance">
              One stop botanical solution in New Alipore, Kolkata.
            </h2>
            <p className="text-[15px] leading-[1.6] text-[#5A685F] max-w-[50ch]">
              Browse acclimatised indoor plants, ceramic planters, and wholesale pots in person, or message our horticulturist desk directly.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onOpenGeneralWhatsApp}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-white bg-[#25D366] hover:bg-[#20BA5A] hover:shadow-[0_6px_16px_rgba(37,211,102,0.25)] transition-all duration-200 cursor-pointer"
              >
                <WhatsAppGlyph className="w-[18px] h-[18px]" />
                <span>WhatsApp · 8337060050</span>
              </button>

              <button
                type="button"
                onClick={onOpenConciergeChat}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors duration-200 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Live Concierge Chat</span>
              </button>

              <a
                href="tel:+918337060050"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-[#2E5A44] border border-[#2E5A44] hover:bg-[#2E5A44] hover:text-white transition-colors duration-200"
              >
                <Phone className="w-4 h-4" />
                <span>Call +91 83370 60050</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 lg:pt-0">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                Showroom Address
              </p>
              <div className="flex items-start gap-2 text-sm text-[#222222]">
                <MapPin className="w-4 h-4 text-[#2E5A44] shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">
                  550, Block N, New Alipore, Kolkata, West Bengal, 700053
                </p>
              </div>
              <p className="text-xs text-[#5A685F] pl-6">
                Open daily · 10:00 AM – 8:00 PM
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                Contact &amp; Dispatch
              </p>
              <a
                href="tel:+918337060050"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#222222] hover:text-[#2E5A44] transition-colors tabular-nums"
              >
                <Phone className="w-4 h-4 text-[#2E5A44] shrink-0" />
                <span>+91 83370 60050</span>
              </a>
              <p className="text-sm text-[#5A685F]">
                Wholesale planters &amp; white-glove Kolkata delivery
              </p>
            </div>

            {recentInquiries.length > 0 && (
              <div className="sm:col-span-2 pt-4 border-t border-[#E8E5DF]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F] mb-2">
                  Your Recent Saved Enquiries ({recentInquiries.length})
                </p>
                <div className="space-y-1.5">
                  {recentInquiries.slice(0, 3).map((inq) => (
                    <div
                      key={inq.id}
                      className="flex items-center justify-between gap-4 text-xs text-[#5A685F]"
                    >
                      <span className="truncate">
                        {inq.customerName} · {inq.quantity}× {inq.specimenName} ({inq.planterName})
                      </span>
                      <span className="font-medium text-[#222222] tabular-nums shrink-0">
                        {formatINR(inq.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#E8E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#5A685F]">
        <div className="flex items-center gap-4">
          {!logoError && (
            <img
              src="/assets/aistudio/logo_10d5cff1.png"
              alt="Farmers Friend"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-8 w-auto object-contain"
            />
          )}
          <p>© 2026 Farmers Friend · 550, Block N, New Alipore, Kolkata 700053.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#catalog" className="hover:text-[#2E5A44] transition-colors">
            Our Collection
          </a>
          <a href="#services" className="hover:text-[#2E5A44] transition-colors">
            Care Services
          </a>
          <a href="#faq" className="hover:text-[#2E5A44] transition-colors">
            Care FAQ
          </a>
        </div>
      </div>
    </footer>
  );
};
