import React from 'react';

export const WhatsAppGlyph: React.FC<{ className?: string }> = ({ className = 'w-[18px] h-[18px]' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.79 14.07c-.24.68-1.42 1.3-1.97 1.38-.51.08-1.15.11-1.85-.11-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.03-2.48.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.59.84 2.04.91 2.19.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.61.18.3.79 1.3 1.7 2.11 1.17 1.04 2.16 1.37 2.46 1.52.3.15.48.12.66-.07.18-.2.76-.89.96-1.19.2-.3.4-.25.67-.15.27.1 1.74.82 2.04.97.3.15.5.22.57.34.07.12.07.7-.17 1.38z" />
  </svg>
);

export const DeliveryVanMonoIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M2 7h11v9H2z" />
    <path d="M13 10h4.5l3 3.2V16H13v-6z" />
    <circle cx="6.5" cy="17.5" r="2" />
    <circle cx="17" cy="17.5" r="2" />
    <path d="M8.5 16H15" />
    <path d="M5.5 11.5c1.5-1.5 3.5-1.5 4.5-.5-.2 1.8-1.8 2.8-4.5.5z" />
  </svg>
);

export const PottingSoilMonoIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M7 7h10l1.5 12.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5L7 7z" />
    <path d="M8.5 7l-1-3h9l-1 3" />
    <path d="M12 11.5v4.5" />
    <path d="M12 13.5c-1.8 0-2.8-1.2-2.8-2.5 1.5 0 2.8.8 2.8 2.5z" />
    <path d="M12 13.5c1.8 0 2.8-1.2 2.8-2.5-1.5 0-2.8.8-2.8 2.5z" />
  </svg>
);

export const BotanicalShearsMonoIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <circle cx="7" cy="18" r="2.2" />
    <circle cx="17" cy="18" r="2.2" />
    <path d="M8.5 16.2L15.5 5c-1.8.8-3 2.5-3.5 4.8" />
    <path d="M15.5 16.2L8.5 5c1.8.8 3 2.5 3.5 4.8" />
    <circle cx="12" cy="11.5" r="0.8" fill="currentColor" />
  </svg>
);

export const WateringCanMonoIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M8 10h7a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" />
    <path d="M15 10V7.5a2.5 2.5 0 0 0-5 0V10" />
    <path d="M17 13l4-4" />
    <path d="M20.2 7.8l1.6 1.6" />
    <path d="M6 12.5H4a1.5 1.5 0 0 0-1.5 1.5v2A1.5 1.5 0 0 0 4 17.5h2" />
  </svg>
);

export const LightSunMicroIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.35}
    strokeLinecap="round"
    aria-hidden="true"
    className={className}
  >
    <circle cx="8" cy="8" r="2.8" />
    <path d="M8 1.5v1.4M8 13.1v1.4M1.5 8h1.4M13.1 8h1.4M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" />
  </svg>
);

export const WaterDropMicroIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.35}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M8 2.2C8 2.2 3.8 7 3.8 10a4.2 4.2 0 0 0 8.4 0C12.2 7 8 2.2 8 2.2z" />
  </svg>
);
