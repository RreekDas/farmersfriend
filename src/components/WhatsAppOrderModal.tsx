import React, { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, LogIn, X } from 'lucide-react';
import { formatINR, PLANTER_PAIRINGS } from '../data/specimens';
import { OrderInquiry, PlanterPairing, Specimen, UserProfile } from '../types/botanical';
import { WhatsAppGlyph } from './BotanicalIcons';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  specimen: Specimen | null;
  initialPlanter?: PlanterPairing;
  initialQuantity?: number;
  initialMode?: 'WhatsApp' | 'Pickup';
  userProfile: UserProfile | null;
  onSignInWithGoogle: () => Promise<void>;
  onClose: () => void;
  onConfirmInquiry: (
    inquiry: OrderInquiry,
    specimenId?: string,
    quantityReserved?: number
  ) => Promise<void>;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  specimen,
  initialPlanter,
  initialQuantity = 1,
  initialMode = 'WhatsApp',
  userProfile,
  onSignInWithGoogle,
  onClose,
  onConfirmInquiry,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [selectedPlanterId, setSelectedPlanterId] = useState(
    initialPlanter?.id ?? PLANTER_PAIRINGS[0].id
  );
  const [deliveryMethod, setDeliveryMethod] = useState<'White-Glove Courier' | 'Conservatory Pickup'>(
    initialMode === 'Pickup' ? 'Conservatory Pickup' : 'White-Glove Courier'
  );
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderInquiry | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlanterId(initialPlanter?.id ?? PLANTER_PAIRINGS[0].id);
      setDeliveryMethod(initialMode === 'Pickup' ? 'Conservatory Pickup' : 'White-Glove Courier');
      setCustomerName((prev) => userProfile?.displayName || prev);
      setNeighborhood((prev) => userProfile?.neighborhood || prev);
      setCustomerMessage('');
      setSubmittedOrder(null);
      setCopied(false);
      setSubmitting(false);
    }
  }, [isOpen, initialPlanter, initialMode, specimen?.id, userProfile?.displayName, userProfile?.neighborhood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activePlanter =
    PLANTER_PAIRINGS.find((p) => p.id === selectedPlanterId) ?? PLANTER_PAIRINGS[0];
  const unitPrice = specimen ? specimen.price + activePlanter.priceDelta : 0;
  const totalPrice = unitPrice * initialQuantity;
  const isWaitlist = specimen ? specimen.stock <= 0 : false;

  const formattedMessage = specimen
    ? isWaitlist
      ? `Namaste Farmers Friend — I would like to join the waitlist for the next batch of ${specimen.commonName} (${specimen.latinName}). Name: ${customerName || 'Guest'}.${customerMessage ? ` Note: ${customerMessage}` : ''}`
      : `Namaste Farmers Friend — I would like to reserve ${initialQuantity}x ${specimen.commonName} (${specimen.latinName}) paired with ${activePlanter.name} (${formatINR(totalPrice)} total) via ${deliveryMethod}.${neighborhood ? ` Locality: ${neighborhood}.` : ''}${customerName ? ` Name: ${customerName}.` : ''}${customerMessage ? ` Note: ${customerMessage}` : ''}`
    : `Namaste Farmers Friend — I would like to book a showroom visit or room-light assessment at New Alipore, Kolkata.${neighborhood ? ` Locality: ${neighborhood}.` : ''}${customerName ? ` Name: ${customerName}.` : ''}${customerMessage ? ` Note: ${customerMessage}` : ''}`;

  const whatsappUrl = `https://wa.me/918337060050?text=${encodeURIComponent(formattedMessage)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const inquiry: OrderInquiry = {
      id: `INQ-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 89)}`,
      userId: userProfile?.uid,
      specimenId: specimen?.id ?? '',
      specimenName: specimen ? specimen.commonName : 'Conservatory Consultation',
      latinName: specimen ? specimen.latinName : 'Light & Placement Advisory',
      planterName: specimen ? activePlanter.name : 'Private Session',
      quantity: specimen ? initialQuantity : 1,
      totalPrice,
      customerName: customerName.trim() || 'Conservatory Guest',
      neighborhood: neighborhood.trim(),
      deliveryMethod,
      message: customerMessage.trim(),
      status: 'pending',
      createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      savedToCloud: Boolean(userProfile),
    };

    try {
      await onConfirmInquiry(
        inquiry,
        specimen && !isWaitlist ? specimen.id : undefined,
        specimen && !isWaitlist ? initialQuantity : 0
      );
      setSubmittedOrder(inquiry);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    'w-full bg-white border border-[#E8E5DF] rounded-lg px-4 py-2.5 text-[15px] text-[#222222] placeholder:text-[#5A685F]/60 focus:border-[#2E5A44] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/15 transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Direct WhatsApp Concierge Order"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#222222]/35 backdrop-blur-[4px]"
      />

      <div className="relative z-10 w-full max-w-[520px] bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E8E5DF] flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1EA952]">
              WhatsApp Quick Connect
            </p>
            <h2 className="mt-0.5 font-display text-[24px] font-medium text-[#222222]">
              {submittedOrder
                ? 'Enquiry Confirmed'
                : specimen
                  ? isWaitlist
                    ? 'Request Next Glasshouse Batch'
                    : 'Order from Our Collection'
                  : 'Message Conservatory Concierge'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-lg border border-[#E8E5DF] flex items-center justify-center text-[#5A685F] hover:text-[#222222] hover:bg-[#F9F8F6] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {submittedOrder ? (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#5A685F]">
                <span className="font-semibold uppercase tracking-[0.12em]">
                  Reference {submittedOrder.id}
                </span>
                <span>Logged at {submittedOrder.createdAt}</span>
              </div>
              <p className="font-display text-lg font-semibold text-[#222222]">
                {submittedOrder.specimenName}
              </p>
              <p className="text-sm text-[#5A685F]">
                {submittedOrder.planterName} · {submittedOrder.deliveryMethod}
              </p>
              {submittedOrder.totalPrice > 0 && (
                <p className="text-sm font-semibold text-[#2E5A44] tabular-nums">
                  Estimated Total: {formatINR(submittedOrder.totalPrice)}
                </p>
              )}
              {submittedOrder.savedToCloud && (
                <p className="pt-1 text-xs font-medium text-[#2E5A44] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Saved to your Farmers Friend account history</span>
                </p>
              )}
            </div>

            <p className="text-sm leading-relaxed text-[#5A685F]">
              Your reservation note from Our Collection has been logged with our potting bench. You may launch WhatsApp directly below or copy the pre-filled message.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors"
              >
                <WhatsAppGlyph className="w-[18px] h-[18px]" />
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-lg border border-[#E8E5DF] text-sm font-medium text-[#222222] hover:bg-[#F9F8F6] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-4 overflow-y-auto">
            {!userProfile && (
              <div className="p-3 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] flex items-center justify-between gap-3">
                <p className="text-xs text-[#5A685F]">
                  Sign in with Google to save this enquiry to your Farmers Friend account.
                </p>
                <button
                  type="button"
                  onClick={() => void onSignInWithGoogle()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2E5A44] text-white text-xs font-medium hover:bg-[#4A7C59] transition-colors cursor-pointer shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {specimen && (
              <div className="p-3.5 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] flex items-center gap-3.5">
                <img
                  src={specimen.imageUrl}
                  alt={specimen.commonName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold text-[#222222] truncate">
                    {specimen.commonName}
                  </p>
                  <p className="text-xs text-[#5A685F] truncate">{specimen.latinName}</p>
                  <p className="mt-1 text-xs font-medium text-[#2E5A44] tabular-nums">
                    Qty {initialQuantity} · {formatINR(totalPrice)}
                  </p>
                </div>
              </div>
            )}

            {specimen && !isWaitlist && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="wa-planter"
                    className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F] mb-1.5"
                  >
                    Planter Pairing
                  </label>
                  <select
                    id="wa-planter"
                    value={selectedPlanterId}
                    onChange={(e) => setSelectedPlanterId(e.target.value)}
                    className={inputClassName}
                  >
                    {PLANTER_PAIRINGS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.priceDelta > 0 ? `(+${formatINR(p.priceDelta)})` : '(Included)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="wa-delivery"
                    className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F] mb-1.5"
                  >
                    Fulfilment
                  </label>
                  <select
                    id="wa-delivery"
                    value={deliveryMethod}
                    onChange={(e) =>
                      setDeliveryMethod(
                        e.target.value as 'White-Glove Courier' | 'Conservatory Pickup'
                      )
                    }
                    className={inputClassName}
                  >
                    <option value="White-Glove Courier">White-Glove Courier</option>
                    <option value="Conservatory Pickup">Conservatory Pickup</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="wa-name"
                  className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F] mb-1.5"
                >
                  Your Name
                </label>
                <input
                  id="wa-name"
                  type="text"
                  maxLength={120}
                  placeholder="Ananya Rao"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="wa-area"
                  className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F] mb-1.5"
                >
                  Locality / Window Light
                </label>
                <input
                  id="wa-area"
                  type="text"
                  maxLength={200}
                  placeholder="New Alipore · East-facing"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="wa-note"
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F] mb-1.5"
              >
                Message / Care Question (Optional)
              </label>
              <textarea
                id="wa-note"
                rows={2}
                maxLength={1000}
                placeholder="Preferred delivery window, balcony exposure or custom pot note…"
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                className={inputClassName}
              />
            </div>

            {/* Live Formatted WhatsApp Message Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]">
                  Concierge Message Preview
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#2E5A44] hover:text-[#4A7C59] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy text'}</span>
                </button>
              </div>
              <div className="p-3.5 rounded-lg bg-[#F9F8F6] border border-[#E8E5DF] text-xs leading-relaxed text-[#5A685F]">
                {formattedMessage}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-lg border border-[#E8E5DF] text-sm font-medium text-[#5A685F] hover:text-[#222222] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white bg-[#25D366] hover:bg-[#20BA5A] hover:shadow-[0_6px_16px_rgba(37,211,102,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                <WhatsAppGlyph className="w-[18px] h-[18px]" />
                <span>
                  {submitting
                    ? 'Saving Enquiry…'
                    : isWaitlist
                      ? 'Submit Waitlist Request'
                      : 'Confirm Order Enquiry'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
