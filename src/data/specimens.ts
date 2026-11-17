import heroConservatoryImg from '../assets/images/hero_conservatory_1794726881084.jpg';
import monsteraThaiImg from '../assets/images/specimen_monstera_thai_1794726881580.jpg';
import oliveTreeImg from '../assets/images/specimen_olive_tree_1794726882878.jpg';
import ficusAudreyImg from '../assets/images/specimen_ficus_audrey_1794726881751.jpg';
import anthuriumClarinerviumImg from '../assets/images/specimen_anthurium_clarinervium_1794726882908.jpg';
import euphorbiaAmmakImg from '../assets/images/specimen_euphorbia_ammak_1794726882983.jpg';

import {
  BotanicalCategory,
  BotanicalTaxonomies,
  FaqItem,
  HeroBannerConfig,
  LightRequirement,
  PlanterPairing,
  ServiceFeature,
  Specimen,
  WaterFrequency,
} from '../types/botanical';

export const DEFAULT_TAXONOMIES: BotanicalTaxonomies = {
  categories: [
    BotanicalCategory.ARCHITECTURAL,
    BotanicalCategory.RARE_AROIDS,
    BotanicalCategory.CONSERVATORY_TREES,
    BotanicalCategory.DESERT_CAUDEX,
  ],
  lightOptions: Object.values(LightRequirement),
  waterOptions: Object.values(WaterFrequency),
};

export const formatINR = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

export const HERO_CONSERVATORY_IMAGE = '/assets/aistudio/wholsale_a950266d.jpg';

export const SHOWROOM_HERO_IMAGES = [
  {
    id: 'showroom-wholesale',
    label: 'Ceramic Planter Gallery',
    url: '/assets/aistudio/wholsale_a950266d.jpg',
  },
  {
    id: 'showroom-delivery',
    label: 'Potting Bench & Dispatch',
    url: '/assets/aistudio/delivary_28a886b5.jpg',
  },
  {
    id: 'showroom-whychoose',
    label: 'Showroom & Foliage Lounge',
    url: '/assets/aistudio/whychoose_1eff78d9.jpg',
  },
];

export const DEFAULT_HERO_BANNER: HeroBannerConfig = {
  imageUrl: '/assets/aistudio/wholsale_a950266d.jpg',
  eyebrow: 'Farmers Friend · One Stop Botanical Solution',
  captionTitle: 'Artisanal Planter & Botanical Showroom',
  captionLatin: 'Wholesale & Our Collection',
  locationTag: 'New Alipore, Kolkata',
};

export const NURSERY_PRESET_IMAGES = [
  { label: 'Ceramic Planter Gallery', url: '/assets/aistudio/wholsale_a950266d.jpg' },
  { label: 'Potting Bench & Dispatch', url: '/assets/aistudio/delivary_28a886b5.jpg' },
  { label: 'Showroom & Foliage Lounge', url: '/assets/aistudio/whychoose_1eff78d9.jpg' },
  { label: 'Variegated Monstera', url: monsteraThaiImg },
  { label: 'Mediterranean Olive Tree', url: oliveTreeImg },
  { label: 'Banyan Fig Tree', url: ficusAudreyImg },
  { label: 'Velvet Heart Anthurium', url: anthuriumClarinerviumImg },
  { label: 'Variegated Candelabra Cactus', url: euphorbiaAmmakImg },
  { label: 'Sunlit Conservatory Olive', url: heroConservatoryImg },
];

export const PLANTER_PAIRINGS: PlanterPairing[] = [
  {
    id: 'nursery-pot',
    name: 'Nursery Grow Pot',
    material: 'Breathable recycled matte polymer',
    priceDelta: 0,
  },
  {
    id: 'raw-terracotta',
    name: 'Pondicherry Raw Terracotta',
    material: 'Hand-thrown unglazed clay with drainage tray',
    priceDelta: 1250,
  },
  {
    id: 'honed-travertine',
    name: 'Honed Travertine Cylinder',
    material: 'Solid carved limestone with cork base pads',
    priceDelta: 2400,
  },
];

export const INITIAL_SPECIMENS: Specimen[] = [
  {
    id: 'spec-monstera-thai',
    commonName: 'Variegated Thai Monstera',
    latinName: 'Cream-Marbled Swiss Cheese Plant',
    family: 'Tropical Foliage',
    category: BotanicalCategory.RARE_AROIDS,
    price: 6800,
    stock: 4,
    light: LightRequirement.BRIGHT_INDIRECT,
    water: WaterFrequency.WEEKLY,
    heightRange: '75 – 90 cm',
    potDiameter: '24 cm',
    origin: 'Pune Tissue Culture · Acclimatised 18 Months',
    humidity: '55% – 70% RH',
    soilMix: 'Coarse pine bark, pumice & coco peat',
    petSafe: false,
    isRareSeasonal: true,
    provenanceNote: 'Tissue-cultured lineage selected for high-stability cream marbling.',
    careGuide:
      'Place near an east- or south-facing window filtered through sheer cotton curtains. Allow the top 5 cm of airy tropical potting mix to dry before watering thoroughly.',
    imageUrl: monsteraThaiImg,
  },
  {
    id: 'spec-olea-europaea',
    commonName: 'Mediterranean Olive Tree',
    latinName: 'Indoor Silver-Leaf Olive',
    family: 'Evergreen Trees',
    category: BotanicalCategory.CONSERVATORY_TREES,
    price: 9500,
    stock: 3,
    light: LightRequirement.DIRECT_SUN,
    water: WaterFrequency.BIWEEKLY,
    heightRange: '130 – 155 cm',
    potDiameter: '32 cm',
    origin: 'Mediterranean Stock · Nilgiri Polyhouse Trained',
    humidity: '35% – 50% RH',
    soilMix: 'Mineral grit, decomposed granite & garden loam',
    petSafe: true,
    isRareSeasonal: false,
    provenanceNote: 'Single-trunk sculptural canopy pruned for sunlit living rooms and verandahs.',
    careGuide:
      'Thrives in abundant direct sunlight (5–6 hours daily). Ensure good cross-ventilation and allow the mineral-rich root ball to dry deeply between waterings.',
    imageUrl: oliveTreeImg,
  },
  {
    id: 'spec-ficus-audrey',
    commonName: 'Audrey Banyan Fig',
    latinName: 'Velvet-Leaf Indoor Banyan',
    family: 'Fig & Banyan Trees',
    category: BotanicalCategory.ARCHITECTURAL,
    price: 5800,
    stock: 6,
    light: LightRequirement.BRIGHT_INDIRECT,
    water: WaterFrequency.WEEKLY,
    heightRange: '110 – 130 cm',
    potDiameter: '28 cm',
    origin: 'Kolkata Shadehouse · Pale Bark Selection',
    humidity: '45% – 60% RH',
    soilMix: 'Structured red loam, perlite & vermicompost',
    petSafe: false,
    isRareSeasonal: false,
    provenanceNote: 'Native banyan variety distinguished by velvety matte foliage and pale alabaster branching.',
    careGuide:
      'Far more resilient to indoor shifts than Fiddle Leaf Figs. Rotate a quarter-turn monthly for balanced canopy growth and wipe leaves gently with a damp cloth.',
    imageUrl: ficusAudreyImg,
  },
  {
    id: 'spec-anthurium-clarinervium',
    commonName: 'Velvet Heart Anthurium',
    latinName: 'Silver-Vein Velvet Leaf Plant',
    family: 'Tropical Foliage',
    category: BotanicalCategory.RARE_AROIDS,
    price: 4900,
    stock: 5,
    light: LightRequirement.MEDIUM_FILTERED,
    water: WaterFrequency.WEEKLY,
    heightRange: '45 – 55 cm',
    potDiameter: '18 cm',
    origin: 'Cloud Forest Lineage · Kolkata Glasshouse Grown',
    humidity: '60% – 75% RH',
    soilMix: 'Orchid bark, sphagnum moss & horticultural charcoal',
    petSafe: false,
    isRareSeasonal: true,
    provenanceNote: 'Deep heart-shaped velvety leaves etched with crystalline silver-white veins.',
    careGuide:
      'Shield from harsh afternoon sun, which can scorch the velvety leaves. Prefers steady gentle moisture and pleasant ambient humidity.',
    imageUrl: anthuriumClarinerviumImg,
  },
  {
    id: 'spec-euphorbia-ammak',
    commonName: 'Variegated Candelabra Cactus',
    latinName: 'Cream & Sage Desert Succulent',
    family: 'Desert Succulents',
    category: BotanicalCategory.DESERT_CAUDEX,
    price: 7600,
    stock: 2,
    light: LightRequirement.DIRECT_SUN,
    water: WaterFrequency.SPARINGLY,
    heightRange: '95 – 115 cm',
    potDiameter: '26 cm',
    origin: 'Arid Glasshouse Collection · Multi-Ribbed',
    humidity: '25% – 40% RH',
    soilMix: 'Crushed cinder, coarse pumice & river sand',
    petSafe: false,
    isRareSeasonal: true,
    provenanceNote: 'Architectural four-ribbed columns marbled in cream and sage.',
    careGuide:
      'Water sparingly—only once the porous mineral mix is completely dry throughout. Wear gloves while repotting to avoid contact with its milky sap.',
    imageUrl: euphorbiaAmmakImg,
  },
  {
    id: 'spec-ancient-conservatory-olive',
    commonName: 'Heritage Grove Olive',
    latinName: 'Mature Single-Trunk Olive Tree',
    family: 'Evergreen Trees',
    category: BotanicalCategory.CONSERVATORY_TREES,
    price: 14800,
    stock: 1,
    light: LightRequirement.DIRECT_SUN,
    water: WaterFrequency.BIWEEKLY,
    heightRange: '175 – 195 cm',
    potDiameter: '40 cm',
    origin: '12-Year Rootstock · Signature Collection',
    humidity: '35% – 50% RH',
    soilMix: 'Crushed limestone aggregate & aged leaf mould',
    petSafe: true,
    isRareSeasonal: true,
    provenanceNote: 'Gnarled heritage trunk curated for sunlit architectural homes and courtyards.',
    careGuide:
      'Includes complimentary white-glove placement and a light-intensity check within our local delivery zone.',
    imageUrl: heroConservatoryImg,
  },
];

export const SERVICE_FEATURES: ServiceFeature[] = [
  {
    id: 'srv-delivery',
    title: 'White-Glove Delivery',
    description:
      'Climate-controlled van transport straight from our sunlit glasshouse to your home, positioned and levelled on site.',
    detail: 'Same-week city dispatch',
    iconType: 'delivery',
  },
  {
    id: 'srv-potting',
    title: 'Customised Potting & Soil',
    description:
      'Every plant in Our Collection is dressed to order in hand-thrown Pondicherry terracotta or honed stone using species-specific mineral blends.',
    detail: 'Tailored drainage layers',
    iconType: 'soil',
  },
  {
    id: 'srv-pruning',
    title: 'Seasonal Pruning & Care',
    description:
      'Quarterly house visits for canopy shaping, organic foliar nourishment, and preventative pest checks.',
    detail: 'Home & studio retainers',
    iconType: 'shears',
  },
  {
    id: 'srv-acclimation',
    title: 'Glasshouse Acclimatisation',
    description:
      'Each plant rests for at least six weeks under calibrated light and humidity before entering our active catalogue.',
    detail: 'Zero nursery shock',
    iconType: 'watering',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-whatsapp',
    question: 'How does direct WhatsApp ordering work?',
    answer:
      'Select any plant from Our Collection and tap Order via WhatsApp to compose a pre-filled enquiry with your preferred planter pairing and delivery option. Our head horticulturist replies within two hours with real-time photographs of the exact plant reserved for you.',
  },
  {
    id: 'faq-light',
    question: 'Can you advise whether a plant suits the natural light in my home?',
    answer:
      'Yes, certainly. Share a midday photograph of your room or balcony and window direction when messaging our team. We assess light levels and recommend either the right placement or a more suitable botanical variety.',
  },
  {
    id: 'faq-repotting',
    question: 'Should I repot my plant immediately after delivery?',
    answer:
      'No, there is no need. If you pick a planter pairing at checkout, our potting bench completes the repotting before acclimatisation. Plants delivered in nursery grow pots should remain undisturbed for at least 30 days so they settle comfortably.',
  },
  {
    id: 'faq-guarantee',
    question: 'What does your 30-day botanical guarantee cover?',
    answer:
      'Every plant in Our Collection leaves our glasshouse certified root-healthy and pest-free. Should any plant experience unexpected transit stress or foliage decline within 30 days, our care team provides diagnostic support or a like-for-like replacement.',
  },
  {
    id: 'faq-visit',
    question: 'May I visit the glasshouse in person before buying?',
    answer:
      'Our sunlit glasshouse is open Thursday through Sunday for unhurried browsing, and Monday through Wednesday by prior appointment for interior designers and collectors.',
  },
];
