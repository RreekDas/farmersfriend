import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, MessageSquare, Send } from 'lucide-react';
import { formatINR } from '../data/specimens';
import {
  subscribeToConciergeMessages,
} from '../services/firestoreService';
import {
  ConciergeMessage,
  ConciergeThread,
  InquiryStatus,
  OrderInquiry,
} from '../types/botanical';

interface AdminInboxTabProps {
  inquiries: OrderInquiry[];
  threads: ConciergeThread[];
  onUpdateInquiryStatus: (enquiryId: string, status: InquiryStatus) => Promise<void>;
  onSendAdminReply: (
    threadUserId: string,
    customerName: string,
    text: string
  ) => Promise<void>;
  onToggleThreadStatus: (
    threadUserId: string,
    status: 'open' | 'resolved'
  ) => Promise<void>;
}

export const AdminInboxTab: React.FC<AdminInboxTabProps> = ({
  inquiries,
  threads,
  onUpdateInquiryStatus,
  onSendAdminReply,
  onToggleThreadStatus,
}) => {
  const [subTab, setSubTab] = useState<'enquiries' | 'chats'>('chats');
  const [activeThread, setActiveThread] = useState<ConciergeThread | null>(null);
  const [threadMessages, setThreadMessages] = useState<ConciergeMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!activeThread) {
      setThreadMessages([]);
      return;
    }
    const unsub = subscribeToConciergeMessages(activeThread.userId, setThreadMessages);
    return () => unsub();
  }, [activeThread?.userId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !replyText.trim() || sending) return;
    setSending(true);
    try {
      await onSendAdminReply(activeThread.userId, activeThread.customerName, replyText.trim());
      setReplyText('');
    } finally {
      setSending(false);
    }
  };

  if (activeThread) {
    const liveHeader =
      threads.find((t) => t.userId === activeThread.userId) || activeThread;
    const isResolved = liveHeader.status === 'resolved';

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 sm:px-6 py-3 bg-[#F9F8F6] border-b border-[#E8E5DF] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setActiveThread(null)}
              aria-label="Back to customer threads"
              className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white flex items-center justify-center text-[#5A685F] hover:text-[#222222] cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <p className="font-display text-base font-medium text-[#222222] truncate">
                {liveHeader.customerName}
              </p>
              <p className="text-[11px] text-[#5A685F]">
                Updated {liveHeader.updatedAtLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void onToggleThreadStatus(
                liveHeader.userId,
                isResolved ? 'open' : 'resolved'
              )
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
              isResolved
                ? 'bg-white border-[#E8E5DF] text-[#222222] hover:border-[#2E5A44]'
                : 'bg-[#E6F4EC] border-[#2E5A44]/20 text-[#2E5A44] hover:bg-[#2E5A44] hover:text-white'
            }`}
          >
            {isResolved ? 'Reopen Thread' : 'Mark Resolved'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-[#F9F8F6]">
          {threadMessages.map((msg) => {
            const isStaff = msg.senderRole === 'admin';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    isStaff
                      ? 'bg-[#2E5A44] text-white rounded-br-sm'
                      : 'bg-white border border-[#E8E5DF] text-[#222222] rounded-bl-sm'
                  }`}
                >
                  {msg.specimenRef && (
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.08em] mb-1 ${
                        isStaff ? 'text-[#A2D1B5]' : 'text-[#2E5A44]'
                      }`}
                    >
                      Re: {msg.specimenRef}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <span className="mt-1 px-1 text-[10px] text-[#5A685F] tabular-nums">
                  {isStaff ? 'You (Admin)' : msg.senderName} · {msg.createdAtLabel}
                </span>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleSendReply}
          className="p-4 bg-white border-t border-[#E8E5DF] flex items-end gap-2"
        >
          <textarea
            rows={2}
            maxLength={1500}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSendReply(e);
              }
            }}
            placeholder="Write a reply as Farmers Friend showroom…"
            className="flex-1 min-w-0 resize-none bg-[#F9F8F6] border border-[#E8E5DF] rounded-xl px-3.5 py-2 text-sm text-[#222222] focus:bg-white focus:border-[#2E5A44] focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            aria-label="Send admin reply"
            className="h-11 w-11 rounded-xl bg-[#2E5A44] hover:bg-[#4A7C59] text-white inline-flex items-center justify-center cursor-pointer disabled:opacity-45 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
      <div className="flex items-center gap-1 p-1 bg-[#F4F3F1] rounded-lg">
        <button
          type="button"
          onClick={() => setSubTab('chats')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer tabular-nums ${
            subTab === 'chats'
              ? 'bg-white text-[#222222] shadow-xs'
              : 'text-[#5A685F] hover:text-[#222222]'
          }`}
        >
          Concierge Chats ({threads.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('enquiries')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer tabular-nums ${
            subTab === 'enquiries'
              ? 'bg-white text-[#222222] shadow-xs'
              : 'text-[#5A685F] hover:text-[#222222]'
          }`}
        >
          Order Enquiries ({inquiries.length})
        </button>
      </div>

      {subTab === 'chats' ? (
        threads.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] text-center space-y-1.5">
            <MessageSquare className="w-5 h-5 text-[#5A685F] mx-auto" />
            <p className="font-display text-base font-medium text-[#222222]">
              No customer messages yet
            </p>
            <p className="text-xs text-[#5A685F]">
              Signed-in visitors messaging the Concierge Chat appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {threads.map((thread) => (
              <button
                key={thread.userId}
                type="button"
                onClick={() => setActiveThread(thread)}
                className="w-full text-left p-3.5 rounded-xl border border-[#E8E5DF] bg-white hover:border-[#2E5A44] transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base font-semibold text-[#222222] truncate">
                    {thread.customerName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] shrink-0 ${
                      thread.status === 'resolved'
                        ? 'bg-[#F4F3F1] text-[#5A685F]'
                        : 'bg-[#E6F4EC] text-[#2E5A44]'
                    }`}
                  >
                    {thread.status}
                  </span>
                </div>
                <p className="text-xs text-[#5A685F] line-clamp-2">
                  {thread.lastMessagePreview}
                </p>
                <p className="text-[11px] text-[#5A685F]/80 tabular-nums">
                  Last active · {thread.updatedAtLabel}
                </p>
              </button>
            ))}
          </div>
        )
      ) : inquiries.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] text-center space-y-1.5">
          <Check className="w-5 h-5 text-[#5A685F] mx-auto" />
          <p className="font-display text-base font-medium text-[#222222]">
            No saved order enquiries yet
          </p>
          <p className="text-xs text-[#5A685F]">
            Customer reservations submitted while signed in appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="p-3.5 rounded-xl border border-[#E8E5DF] bg-white space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5A685F] tabular-nums">
                  {inq.id} · {inq.createdAt}
                </span>
                <select
                  aria-label={`Update status for ${inq.id}`}
                  value={inq.status || 'pending'}
                  onChange={(e) =>
                    void onUpdateInquiryStatus(inq.id, e.target.value as InquiryStatus)
                  }
                  className="bg-[#F9F8F6] border border-[#E8E5DF] rounded-md px-2 py-1 text-xs font-medium text-[#222222] focus:border-[#2E5A44] focus:outline-none cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="fulfilled">Fulfilled</option>
                </select>
              </div>
              <div>
                <p className="font-display text-base font-semibold text-[#222222]">
                  {inq.customerName} · {inq.quantity}× {inq.specimenName}
                </p>
                <p className="text-xs text-[#5A685F]">
                  {inq.planterName} · {inq.deliveryMethod}
                  {inq.neighborhood ? ` · ${inq.neighborhood}` : ''}
                </p>
              </div>
              {inq.message && (
                <p className="text-xs text-[#5A685F] bg-[#F9F8F6] rounded-lg px-3 py-2 border border-[#E8E5DF]">
                  “{inq.message}”
                </p>
              )}
              {inq.totalPrice > 0 && (
                <p className="text-xs font-semibold text-[#2E5A44] tabular-nums">
                  {formatINR(inq.totalPrice)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
