import { ProductReview, ProductNLPSummary, SentimentPolarity } from '../types';

// Initial pre-populated rich review dataset with extracted NLP attributes
const reviewsStore: Record<string, ProductReview[]> = {
  'prod-lap-01': [
    {
      id: 'rev-001',
      productId: 'prod-lap-01',
      userId: 'usr-dev-alex',
      userName: 'Alex Kumar',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      rating: 5,
      title: 'Monstrous Compilation Speed for Docker & Rust',
      comment: 'The M3 Pro chip blazes through heavy parallel builds in seconds. Battery easily lasts 16+ hours on VS Code and terminal. The Liquid Retina XDR screen is stunning, though it is on the heavier side to carry daily.',
      verifiedPurchase: true,
      createdAt: '2026-08-05T10:00:00Z',
      sentiment: {
        polarity: 'positive',
        score: 0.92,
        confidence: 0.96,
        prosExtracted: ['16+ Hr Battery Life', 'Blazing Compilation Speed', 'Liquid Retina XDR Display', 'Silent Operation'],
        consExtracted: ['Heavy Chasis', 'Premium Price Tag'],
        keyPhraseMatches: ['docker compile', 'battery life', 'retina screen']
      },
      helpfulCount: 42
    },
    {
      id: 'rev-002',
      productId: 'prod-lap-01',
      userId: 'usr-02',
      userName: 'Neha Singhal',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      rating: 5,
      title: 'Best Developer Machine Available',
      comment: 'Unbelievable battery life and keyboard feel. Zero thermal throttling even under sustained 100% CPU loads. Worth every rupee.',
      verifiedPurchase: true,
      createdAt: '2026-08-08T14:15:00Z',
      sentiment: {
        polarity: 'positive',
        score: 0.88,
        confidence: 0.94,
        prosExtracted: ['Zero Thermal Throttling', 'Excellent Keyboard', 'Exceptional Battery'],
        consExtracted: [],
        keyPhraseMatches: ['battery life', 'sustained loads', 'keyboard']
      },
      helpfulCount: 19
    }
  ],
  'prod-aud-01': [
    {
      id: 'rev-003',
      productId: 'prod-aud-01',
      userId: 'usr-audio-priya',
      userName: 'Priya Nambiar',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      rating: 5,
      title: 'Unmatched Active Noise Cancellation for Flights & Coding',
      comment: 'The ANC silences airplane engine rumble and noisy cafe chatter completely. Sound signature with LDAC codec is crystal clear with deep articulate bass. The earcups can get slightly warm after 4 hours of continuous wear.',
      verifiedPurchase: true,
      createdAt: '2026-08-12T11:20:00Z',
      sentiment: {
        polarity: 'positive',
        score: 0.94,
        confidence: 0.98,
        prosExtracted: ['World-Class ANC', 'Crystal Clear Soundstage', '30hr Battery Life', 'Multipoint Bluetooth'],
        consExtracted: ['Warm Earcups After 4hrs', 'Non-Foldable Case'],
        keyPhraseMatches: ['noise cancellation', 'ldac audio', 'deep bass']
      },
      helpfulCount: 37
    },
    {
      id: 'rev-004',
      productId: 'prod-aud-01',
      userId: 'usr-04',
      userName: 'Aditya Verma',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      rating: 4,
      title: 'Top Tier Sound, Bulky Carrying Case',
      comment: 'Microphone clarity during Zoom calls is surprisingly good. Battery lasts over a week of commute. Case takes a lot of backpack room.',
      verifiedPurchase: true,
      createdAt: '2026-08-15T09:00:00Z',
      sentiment: {
        polarity: 'positive',
        score: 0.76,
        confidence: 0.91,
        prosExtracted: ['Clear Call Microphones', 'Long Battery', 'Comfortable Fit'],
        consExtracted: ['Bulky Travel Case'],
        keyPhraseMatches: ['microphone clarity', 'battery duration']
      },
      helpfulCount: 14
    }
  ],
  'prod-acc-01': [
    {
      id: 'rev-005',
      productId: 'prod-acc-01',
      userId: 'usr-dev-alex',
      userName: 'Alex Kumar',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      rating: 5,
      title: 'The Ultimate Mechanical Typing Experience',
      comment: 'Full aluminum CNC body feels like a tank. Double-gasket mount creates a deeply satisfying creamy sound profile with Banana switches. QMK/VIA key remapping is effortless.',
      verifiedPurchase: true,
      createdAt: '2026-08-11T12:00:00Z',
      sentiment: {
        polarity: 'positive',
        score: 0.96,
        confidence: 0.99,
        prosExtracted: ['Solid Aluminum CNC Body', 'Creamy Double-Gasket Acoustic', 'QMK/VIA Programmable', 'Hot-Swappable'],
        consExtracted: ['Heavy at 1.8kg'],
        keyPhraseMatches: ['gasket mount', 'qmk via', 'typing sound']
      },
      helpfulCount: 28
    }
  ]
};

// Heuristic keyword rule-base NLP extractor
const POSITIVE_KEYWORDS = [
  'amazing', 'excellent', 'great', 'love', 'blazing', 'fast', 'crisp', 'silent', 
  'superb', 'best', 'unmatched', 'flawless', 'solid', 'satisfying', 'good', 'worth',
  'crystal clear', 'durable', 'smooth', 'stunning', 'impressive'
];

const NEGATIVE_KEYWORDS = [
  'bad', 'poor', 'slow', 'heavy', 'pricey', 'expensive', 'heating', 'lag', 'broken',
  'terrible', 'disappointed', 'bulky', 'noisy', 'mediocre', 'cheap', 'annoying', 'faulty'
];

const PRO_PATTERNS: Record<string, string> = {
  'battery': 'Long Battery Life',
  'fast': 'High-Speed Performance',
  'screen': 'Vibrant Display',
  'display': 'Stunning Screen Quality',
  'sound': 'Rich Audio Profile',
  'anc': 'Active Noise Cancellation',
  'build': 'Durable Premium Build',
  'keyboard': 'Satisfying Tactile Keyboard',
  'camera': 'Sharp Image Clarity',
  'light': 'Lightweight & Portable'
};

const CON_PATTERNS: Record<string, string> = {
  'heavy': 'Noticeable Weight',
  'price': 'Premium Pricing',
  'expensive': 'High Price Point',
  'heat': 'Warm Under Load',
  'bulky': 'Bulky Form Factor',
  'plastic': 'Plastic Exterior Accents',
  'charger': 'No Charger in Box',
  'case': 'Bulky Storage Case'
};

export function extractNLPSentiment(rating: number, title: string, comment: string): ProductReview['sentiment'] {
  const combined = `${title} ${comment}`.toLowerCase();
  
  let posCount = 0;
  let negCount = 0;

  POSITIVE_KEYWORDS.forEach(kw => {
    if (combined.includes(kw)) posCount++;
  });

  NEGATIVE_KEYWORDS.forEach(kw => {
    if (combined.includes(kw)) negCount++;
  });

  // Calculate score between -1.0 and 1.0 based on rating & keywords
  const ratingNormalized = ((rating - 3) / 2); // 5 -> 1.0, 3 -> 0, 1 -> -1.0
  const keywordBias = (posCount - negCount) * 0.15;
  const rawScore = Math.max(-1.0, Math.min(1.0, ratingNormalized * 0.7 + keywordBias * 0.3));
  const score = Math.round(rawScore * 100) / 100;

  let polarity: SentimentPolarity = 'neutral';
  if (score >= 0.25) polarity = 'positive';
  else if (score <= -0.25) polarity = 'negative';

  const prosExtracted: string[] = [];
  const consExtracted: string[] = [];
  const keyPhraseMatches: string[] = [];

  Object.entries(PRO_PATTERNS).forEach(([trigger, label]) => {
    if (combined.includes(trigger) && !prosExtracted.includes(label)) {
      prosExtracted.push(label);
      keyPhraseMatches.push(trigger);
    }
  });

  Object.entries(CON_PATTERNS).forEach(([trigger, label]) => {
    if (combined.includes(trigger) && !consExtracted.includes(label)) {
      consExtracted.push(label);
      keyPhraseMatches.push(trigger);
    }
  });

  if (rating >= 4 && prosExtracted.length === 0) {
    prosExtracted.push('Great Value', 'Reliable Performance');
  }

  return {
    polarity,
    score,
    confidence: Math.round((0.85 + Math.random() * 0.12) * 100) / 100,
    prosExtracted,
    consExtracted,
    keyPhraseMatches
  };
}

export function getProductReviews(productId: string): ProductReview[] {
  return reviewsStore[productId] || [
    {
      id: `rev-default-${productId}`,
      productId,
      userId: 'usr-seed-01',
      userName: 'Vikram Mehta',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      rating: 5,
      title: 'Verified Enterprise Performance',
      comment: 'Rock solid reliability, great thermal management, and premium industrial design. Integrated flawlessly into our daily workflow.',
      verifiedPurchase: true,
      createdAt: '2026-08-10T10:00:00Z',
      sentiment: {
        polarity: 'positive',
        score: 0.91,
        confidence: 0.95,
        prosExtracted: ['Rock Solid Reliability', 'Thermal Management', 'Industrial Design'],
        consExtracted: [],
        keyPhraseMatches: ['reliability', 'thermal']
      },
      helpfulCount: 16
    }
  ];
}

export function addProductReview(
  productId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  rating: number,
  title: string,
  comment: string
): { review: ProductReview; summary: ProductNLPSummary } {
  const sentiment = extractNLPSentiment(rating, title, comment);
  
  const review: ProductReview = {
    id: `rev-${Date.now()}`,
    productId,
    userId,
    userName,
    userAvatar: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    rating,
    title,
    comment,
    verifiedPurchase: true,
    createdAt: new Date().toISOString(),
    sentiment,
    helpfulCount: 0
  };

  if (!reviewsStore[productId]) {
    reviewsStore[productId] = [];
  }
  reviewsStore[productId].unshift(review);

  const summary = getProductNLPSummary(productId);
  return { review, summary };
}

export function getProductNLPSummary(productId: string): ProductNLPSummary {
  const reviews = getProductReviews(productId);
  const totalReviews = reviews.length;
  
  const avgRating = Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / Math.max(1, totalReviews)) * 10) / 10;
  
  const posCount = reviews.filter(r => r.sentiment.polarity === 'positive').length;
  const neuCount = reviews.filter(r => r.sentiment.polarity === 'neutral').length;
  const negCount = reviews.filter(r => r.sentiment.polarity === 'negative').length;

  const prosMap: Record<string, number> = {};
  const consMap: Record<string, number> = {};

  reviews.forEach(r => {
    r.sentiment.prosExtracted.forEach(pro => {
      prosMap[pro] = (prosMap[pro] || 0) + 1;
    });
    r.sentiment.consExtracted.forEach(con => {
      consMap[con] = (consMap[con] || 0) + 1;
    });
  });

  const topExtractedPros = Object.entries(prosMap)
    .map(([tag, count]) => ({
      tag,
      count,
      mentionPct: Math.round((count / Math.max(1, totalReviews)) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const topExtractedCons = Object.entries(consMap)
    .map(([tag, count]) => ({
      tag,
      count,
      mentionPct: Math.round((count / Math.max(1, totalReviews)) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const topProStr = topExtractedPros[0] ? `${topExtractedPros[0].mentionPct}% of verified buyers praise ${topExtractedPros[0].tag.toLowerCase()}` : 'Highly rated for overall quality';

  const editorialSummary = `${topProStr}. Sentiment analysis reveals an overwhelmingly positive response with ${Math.round((posCount / Math.max(1, totalReviews)) * 100)}% satisfaction rating across verified purchasers.`;

  return {
    productId,
    totalReviews,
    averageRating: avgRating,
    sentimentDistribution: {
      positivePct: Math.round((posCount / Math.max(1, totalReviews)) * 100),
      neutralPct: Math.round((neuCount / Math.max(1, totalReviews)) * 100),
      negativePct: Math.round((negCount / Math.max(1, totalReviews)) * 100)
    },
    topExtractedPros,
    topExtractedCons,
    editorialSummary,
    nlpExecutiveSummary: editorialSummary,
    featuredThemes: ['Battery Longevity', 'Acoustic Clarity', 'Build Materials', 'Thermal Efficiency']
  };
}

export function getAllReviews(): ProductReview[] {
  const all: ProductReview[] = [];
  Object.values(reviewsStore).forEach(list => all.push(...list));
  return all;
}
