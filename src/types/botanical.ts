export enum BotanicalCategory {
  ALL = 'Our Collection',
  ARCHITECTURAL = 'Architectural Flora',
  RARE_AROIDS = 'Rare Aroids',
  DESERT_CAUDEX = 'Desert & Caudex',
  CONSERVATORY_TREES = 'Conservatory Trees',
}

export enum LightRequirement {
  BRIGHT_INDIRECT = 'Bright Indirect',
  DIRECT_SUN = 'Direct Sun',
  MEDIUM_FILTERED = 'Filtered Shade',
}

export enum WaterFrequency {
  WEEKLY = 'Weekly Mist & Soak',
  BIWEEKLY = 'Every 10–14 Days',
  SPARINGLY = 'Monthly Dry Cycle',
}

export interface Specimen {
  id: string;
  commonName: string;
  latinName: string;
  family: string;
  category: string;
  price: number;
  stock: number;
  light: string;
  water: string;
  heightRange: string;
  potDiameter: string;
  origin: string;
  humidity: string;
  soilMix: string;
  petSafe: boolean;
  isRareSeasonal: boolean;
  provenanceNote: string;
  careGuide: string;
  imageUrl: string;
}

export interface BotanicalTaxonomies {
  categories: string[];
  lightOptions: string[];
  waterOptions: string[];
}

export interface PlanterPairing {
  id: string;
  name: string;
  material: string;
  priceDelta: number;
}

export interface ServiceFeature {
  id: string;
  title: string;
  description: string;
  detail: string;
  iconType: 'delivery' | 'soil' | 'shears' | 'watering';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type InquiryStatus = 'pending' | 'confirmed' | 'fulfilled';

export interface OrderInquiry {
  id: string;
  userId?: string;
  specimenId?: string;
  specimenName: string;
  latinName: string;
  planterName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  neighborhood?: string;
  deliveryMethod: 'White-Glove Courier' | 'Conservatory Pickup';
  message?: string;
  status?: InquiryStatus;
  createdAt: string;
  savedToCloud?: boolean;
}

export interface HeroBannerConfig {
  imageUrl: string;
  eyebrow: string;
  captionTitle: string;
  captionLatin: string;
  locationTag: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  role: 'customer' | 'admin';
  email: string;
  phone: string;
  neighborhood: string;
}

export interface ConciergeThread {
  userId: string;
  customerName: string;
  lastMessagePreview: string;
  status: 'open' | 'resolved';
  updatedAtLabel: string;
}

export interface ConciergeMessage {
  id: string;
  threadUserId: string;
  senderUid: string;
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  specimenRef: string;
  createdAtLabel: string;
}
