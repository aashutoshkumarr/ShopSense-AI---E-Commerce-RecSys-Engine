import { UserPersona } from '../types';

export const mockPersonas: UserPersona[] = [
  {
    id: 'user-dev-alex',
    name: 'Alex Kumar',
    role: 'Senior Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    description: 'Prioritizes tactile mechanical keyboards, high RAM for Docker & compilers, matte displays, and ANC headphones for deep focus.',
    targetBudgetINR: 75000,
    targetBudgetUSD: 900,
    priceElasticity: 'moderate',
    preferredCategories: ['Laptops', 'Accessories', 'Audio'],
    preferredBrands: ['Lenovo', 'Keychron', 'Sony', 'Logitech', 'Acer'],
    historicalViewedIds: ['prod-lap-01', 'prod-acc-01', 'prod-acc-04', 'prod-aud-01'],
    historicalPurchasedIds: ['prod-acc-01'],
    cartItemIds: ['prod-acc-04'],
    wishlistIds: ['prod-lap-01', 'prod-aud-01'],
    categoryAffinities: {
      'Laptops': 0.88,
      'Accessories': 0.94,
      'Audio': 0.72,
      'Gaming': 0.35,
      'Smartphones': 0.40,
      'Smart Home': 0.25
    },
    embedding: [0.95, 0.80, 0.30, 0.60, 0.85, 0.20, 0.70, 0.75]
  },
  {
    id: 'user-design-priya',
    name: 'Priya Sharma',
    role: 'Lead Product Designer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    description: 'Demands 100% DCI-P3 color-calibrated displays, Apple Silicon ecosystem, Apple Pencil tablets, and premium aesthetics.',
    targetBudgetINR: 135000,
    targetBudgetUSD: 1600,
    priceElasticity: 'flexible',
    preferredCategories: ['Laptops', 'Smartphones', 'Accessories', 'Audio'],
    preferredBrands: ['Apple', 'Dell', 'Bose'],
    historicalViewedIds: ['prod-lap-02', 'prod-tab-01', 'prod-acc-02', 'prod-aud-02'],
    historicalPurchasedIds: ['prod-aud-02'],
    cartItemIds: ['prod-tab-01'],
    wishlistIds: ['prod-lap-02', 'prod-acc-02'],
    categoryAffinities: {
      'Laptops': 0.95,
      'Smartphones': 0.85,
      'Accessories': 0.80,
      'Audio': 0.90,
      'Gaming': 0.20
    },
    embedding: [0.85, 0.92, 0.40, 0.80, 0.90, 0.85, 0.98, 0.45]
  },
  {
    id: 'user-gamer-jordan',
    name: 'Jordan Rivera',
    role: 'Competitive Gamer & Streamer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    description: 'Values high refresh rate screens, 4000Hz polling rate mice, next-gen consoles, low-latency audio, and 4K stream gear.',
    targetBudgetINR: 120000,
    targetBudgetUSD: 1450,
    priceElasticity: 'moderate',
    preferredCategories: ['Gaming', 'Laptops', 'Accessories'],
    preferredBrands: ['ASUS', 'Sony', 'Logitech', 'Elgato'],
    historicalViewedIds: ['prod-gam-01', 'prod-gam-02', 'prod-lap-03', 'prod-acc-05'],
    historicalPurchasedIds: ['prod-gam-01'],
    cartItemIds: ['prod-gam-02'],
    wishlistIds: ['prod-lap-03', 'prod-gam-02'],
    categoryAffinities: {
      'Gaming': 0.98,
      'Laptops': 0.75,
      'Accessories': 0.82,
      'Audio': 0.65
    },
    embedding: [0.75, 0.50, 0.99, 0.65, 0.50, 0.60, 0.92, 0.55]
  },
  {
    id: 'user-student-aarav',
    name: 'Aarav Patel',
    role: 'CS Undergrad Student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    description: 'Searching for maximum value under ₹50,000 - ₹70,000 for coursework, lightweight battery life, and affordable TWS earbuds.',
    targetBudgetINR: 55000,
    targetBudgetUSD: 660,
    priceElasticity: 'strict',
    preferredCategories: ['Laptops', 'Audio', 'Accessories'],
    preferredBrands: ['Dell', 'Acer', 'ASUS', 'OnePlus', 'Anker'],
    historicalViewedIds: ['prod-lap-04', 'prod-lap-06', 'prod-aud-04', 'prod-acc-03'],
    historicalPurchasedIds: [],
    cartItemIds: ['prod-lap-06'],
    wishlistIds: ['prod-aud-04', 'prod-lap-06'],
    categoryAffinities: {
      'Laptops': 0.92,
      'Audio': 0.85,
      'Accessories': 0.70
    },
    embedding: [0.78, 0.80, 0.30, 0.40, 0.80, 0.30, 0.70, 0.98]
  },
  {
    id: 'user-guest-coldstart',
    name: 'Guest Shopper',
    role: 'Anonymous Visitor (Cold-Start)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    description: 'No prior user profile history. Relies on real-time active session events, global popularity, and instant natural language intents.',
    targetBudgetINR: 50000,
    targetBudgetUSD: 600,
    priceElasticity: 'flexible',
    preferredCategories: [],
    preferredBrands: [],
    historicalViewedIds: [],
    historicalPurchasedIds: [],
    cartItemIds: [],
    wishlistIds: [],
    categoryAffinities: {},
    embedding: [0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50]
  }
];

export const personas = mockPersonas;
