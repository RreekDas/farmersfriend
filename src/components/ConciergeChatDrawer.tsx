import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import {
  ConciergeMessage,
  ConciergeThread,
  Specimen,
  UserProfile,
} from '../types/botanical';
import { WhatsAppGlyph } from './BotanicalIcons';

interface ConciergeChatDrawerProps {
  isOpen: boolean;
  userProfile: UserProfile | null;
  authLoading: boolean;
  specimens: Specimen[];
  threadHeader: ConciergeThread | null;
  messages: ConciergeMessage[];
  onClose: () => void;
  onSignInWithGoogle: () => Promise<void>;
  onSendMessage: (text: string, specimenRef: string) => Promise<void>;
}

const QUICK_PROMPTS = [
  'Which indoor plants thrive in low-light rooms?',
  'Can I order Ceramic planters wholesale for my terrace?',
  'What is the Kolkata white-glove delivery timeline?',
];

export const ConciergeChatDrawer: React.FC<ConciergeChatDrawerProps> = ({
  isOpen,
  userProfile,
  authLoading,
  specimens,
  threadHeader,
  messages,
  onClose,
  onSignInWithGoogle,
  onSendMessage,
}) => {
  const [draftText, setDraftText] = useState('');
  const [specimenRef, setSpecimenRef] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isResolved = threadHeader?.status === 'resolved';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftText.trim();
    if (!cleaned || sending || isResolved) return;
    setSending(true);
    setErrorMsg(null);
    try {
      await onSendMessage(cleaned, specimenRef);
      setDraftText('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Showroom Concierge Chat"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#222222]/35 backdrop-blur-[4px]"
      />

      <aside className="relative z-10 w-full max-w-[460px] h-full bg-white border-l border-[#E8E5DF] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E8E5DF] flex items-center justify-between gap-3 bg-white">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2E5A44] truncate">
              Farmers Friend Horticulturist Desk
            </p>
            <h2 className="mt-0.5 font-display text-[22px] sm:text-[24px] font-medium text-[#222222] truncate">
              Showroom Concierge Chat
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close concierge chat"
            className="w-9 h-9 rounded-lg border border-[#E8E5DF] flex items-center justify-center text-[#5A685F] hover:text-[#222222] hover:bg-[#F9F8F6] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {!userProfile ? (
          <div className="flex-1 p-6 flex flex-col justify-center space-y-5 bg-[#F9F8F6]">
            <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 space-y-4">
              <div className="w-11 h-11 rounded-full bg-[#F9F8F6] border border-[#E8E5DF] flex items-center justify-center text-[#2E5A44]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-xl font-medium text-[#222222]">
                  Message our New Alipore showroom
                </h3>
                <p className="text-sm leading-relaxed text-[#5A685F]">
                  Sign in with Google to ask about sunlight suitability, custom wholesale pots, or delivery slots. Every message stays saved to your Farmers Friend account.
                </p>
              </div>

              <button
                type="button"
                disabled={authLoading}
                onClick={() => void onSignInWithGoogle()}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>{authLoading ? 'Signing in…' : 'Sign In with Google to Chat'}</span>
              </button>

              <a
                href="https://wa.me/918337060050"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors"
              >
                <WhatsAppGlyph className="w-[18px] h-[18px]" />
                <span>Direct WhatsApp · 8337060050</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Context Bar */}
            <div className="px-4 sm:px-6 py-3 bg-[#F9F8F6] border-b border-[#E8E5DF] flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="chat-specimen-ref"
                  className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5A685F] mb-1"
                >
                  Our Collection / Topic (Optional)
                </label>
                <select
                  id="chat-specimen-ref"
                  value={specimenRef}
                  onChange={(e) => setSpecimenRef(e.target.value)}
                  className="w-full bg-white border border-[#E8E5DF] rounded-lg px-3 py-1.5 text-xs text-[#222222] focus:border-[#2E5A44] focus:outline-none"
                >
                  <option value="">General Showroom Enquiry</option>
                  {specimens.map((s) => (
                    <option key={s.id} value={s.commonName}>
                      {s.commonName}
                    </option>
                  ))}
                  <option value="Wholesale Ceramic Planters">Wholesale Ceramic Planters</option>
                </select>
              </div>

              {threadHeader && (
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] shrink-0 ${
                    isResolved
                      ? 'bg-[#E8E5DF] text-[#5A685F]'
                      : 'bg-[#E6F4EC] text-[#2E5A44]'
                  }`}
                >
                  {isResolved ? 'Resolved' : 'Saved Thread'}
                </span>
              )}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3 bg-[#F9F8F6]">
              {messages.length === 0 ? (
                <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 space-y-3">
                  <p className="text-sm font-medium text-[#222222]">
                    Namaste {userProfile.displayName.split(' ')[0]}, how may our New Alipore potting bench assist you today?
                  </p>
                  <p className="text-xs text-[#5A685F]">
                    Tap a common question below or type your own message — all chats save directly to your account.
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setDraftText(prompt)}
                        className="text-left px-3.5 py-2 rounded-lg border border-[#E8E5DF] bg-[#F9F8F6] hover:border-[#2E5A44] text-xs font-medium text-[#222222] transition-colors cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isStaff = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isStaff
                            ? 'bg-white border border-[#E8E5DF] text-[#222222] rounded-bl-sm'
                            : 'bg-[#2E5A44] text-white rounded-br-sm'
                        }`}
                      >
                        {msg.specimenRef && (
                          <p
                            className={`text-[10px] font-semibold uppercase tracking-[0.08em] mb-1 ${
                              isStaff ? 'text-[#2E5A44]' : 'text-[#A2D1B5]'
                            }`}
                          >
                            Re: {msg.specimenRef}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-[#5A685F] tabular-nums">
                        {isStaff ? 'Farmers Friend Staff' : 'You'} · {msg.createdAtLabel}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="p-4 bg-white border-t border-[#E8E5DF] space-y-2.5">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {isResolved ? (
                <div className="p-3 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] text-xs text-[#5A685F] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>This conversation was marked resolved by our showroom team.</span>
                  <a
                    href="https://wa.me/918337060050"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#1EA952] hover:underline shrink-0"
                  >
                    <WhatsAppGlyph className="w-3.5 h-3.5" />
                    <span>WhatsApp Desk</span>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    maxLength={1500}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend(e);
                      }
                    }}
                    placeholder="Ask about light, planters, wholesale orders or delivery…"
                    aria-label="Message to Farmers Friend"
                    className="flex-1 min-w-0 resize-none bg-[#F9F8F6] border border-[#E8E5DF] rounded-xl px-3.5 py-2.5 text-sm text-[#222222] placeholder:text-[#5A685F]/60 focus:bg-white focus:border-[#2E5A44] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/15"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draftText.trim()}
                    aria-label="Send message"
                    className="h-11 w-11 rounded-xl bg-[#2E5A44] hover:bg-[#4A7C59] text-white inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-45 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
};
