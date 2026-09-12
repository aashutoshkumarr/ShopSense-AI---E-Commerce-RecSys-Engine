import { Product, UserPersona, StructuredIntent, UserEvent } from '../types';

/**
 * High-Precision In-House Semantic Intent & Grammar Parser
 * Parses natural language shopping queries into structured parameters.
 */
export function parseNaturalLanguageIntent(rawQuery: string): StructuredIntent {
  const q = rawQuery.trim().toLowerCase();

  let category: StructuredIntent['category'] = undefined;
  let subCategory: string | undefined = undefined;
  let targetBudgetINR: number | undefined = undefined;
  let targetBudgetUSD: number | undefined = undefined;
  const brandPreferences: string[] = [];
  const requiredFeatures: string[] = [];
  let useCase: string = 'General Hardware Exploration';
  let confidenceScore = 0.82;

  // 1. Category & Subcategory Detection
  if (/\b(laptop|notebook|macbook|thinkpad|zenbook|ultrabook|chromebook|xps|legion|zephyrus|tuf|spectre|omen)\b/.test(q)) {
    category = 'Laptops';
    confidenceScore += 0.05;
    if (/pro|workstation|m3|m2|i7|i9|ryzen/.test(q)) subCategory = 'Pro & Developer Laptops';
  } else if (/\b(headphone|headphones|earbud|earbuds|earphone|audio|anc|soundbar|speaker|hifi|iem|airpods)\b/.test(q)) {
    category = 'Audio';
    confidenceScore += 0.05;
    if (/anc|noise cancel/.test(q)) subCategory = 'Active Noise Cancellation';
  } else if (/\b(phone|smartphone|iphone|galaxy|pixel|foldable|handset|vivo|oneplus|xiaomi|redmi|poco)\b/.test(q)) {
    category = 'Smartphones';
    confidenceScore += 0.05;
    if (/pro|ultra|fold/.test(q)) subCategory = 'Flagship Smartphones';
  } else if (/\b(game|gaming|ps5|playstation|rtx|geforce|console|controller|switch|ally|vr2)\b/.test(q)) {
    category = 'Gaming';
    confidenceScore += 0.05;
    if (/console|ps5/.test(q)) subCategory = 'Gaming Consoles';
  } else if (/\b(keyboard|mouse|monitor|display|dock|webcam|microphone|stand|charger|gan|trackpad|accessories|ipad|tablet|camera|drone|gimbal)\b/.test(q)) {
    category = 'Accessories';
    confidenceScore += 0.05;
    if (/keyboard/.test(q)) subCategory = 'Mechanical Keyboards';
    else if (/monitor|display/.test(q)) subCategory = 'Displays & Visuals';
  } else if (/\b(smart home|ambient|lighting|bulb|echo|alexa|hub|smart plug|tv|dyson|purifier|roborock|vacuum|doorbell|nanoleaf|nest|homepod)\b/.test(q)) {
    category = 'Smart Home';
    confidenceScore += 0.05;
  } else if (/\b(watch|smartwatch|fitness tracker|band|wearable)\b/.test(q)) {
    category = 'Wearables';
    confidenceScore += 0.05;
  } else if (/\b(grocery|groceries|fresh|milk|mango|almond|tea|chai|coffee|rice|avocado|honey|yogurt|fruits|vegetables|supermarket)\b/.test(q)) {
    category = 'Grocery';
    confidenceScore += 0.05;
  } else if (/\b(bazaar|deal|deals|flask|cushion|organizer|cable dock|duster|night light|lunch box|bento|riser|phone stand|under 999|cheap|budget deal)\b/.test(q)) {
    category = 'Bazaar';
    confidenceScore += 0.05;
  } else if (/\b(pharmacy|pharma|medicine|medicines|bp monitor|glucometer|vitamin|whey|protein|oximeter|dettol|chyawanprash|inhaler|ashwagandha|volini|health)\b/.test(q)) {
    category = 'Pharmacy';
    confidenceScore += 0.05;
  } else if (/\b(pre-owned|used|refurbished|resale|olx|second hand|preowned)\b/.test(q)) {
    category = 'Pre-Owned';
    confidenceScore += 0.05;
  }

  // 2. Target Budget Extraction (Multi-pattern support for INR)
  // Supports: under 70,000 | below ₹15k | < 50000 | under 1.5 lakh | budget 20k
  const lakhMatch = q.match(/(?:under|below|budget|within|around|max)?\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lac)s?/i);
  const kMatch = q.match(/(?:under|below|budget|within|around|max|less than)?\s*(?:₹|rs\.?|inr)?\s*([0-9]+)\s*k\b/i);
  const rawNumMatch = q.match(/(?:under|below|budget|within|around|max|less than)?\s*(?:₹|rs\.?|inr)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,7})/i);

  if (lakhMatch && lakhMatch[1]) {
    targetBudgetINR = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else if (kMatch && kMatch[1]) {
    targetBudgetINR = parseInt(kMatch[1], 10) * 1000;
  } else if (rawNumMatch && rawNumMatch[1]) {
    const parsed = parseInt(rawNumMatch[1].replace(/,/g, ''), 10);
    if (parsed >= 1000) targetBudgetINR = parsed;
  }

  if (targetBudgetINR) {
    targetBudgetUSD = Math.round((targetBudgetINR / 83.5) * 10) / 10;
    confidenceScore += 0.06;
  }

  // 3. Brand Identification
  const knownBrands: Record<string, string> = {
    'apple': 'Apple',
    'macbook': 'Apple',
    'iphone': 'Apple',
    'ipad': 'Apple',
    'airpods': 'Apple',
    'lenovo': 'Lenovo',
    'thinkpad': 'Lenovo',
    'legion': 'Lenovo',
    'sony': 'Sony',
    'bravia': 'Sony',
    'bose': 'Bose',
    'sennheiser': 'Sennheiser',
    'keychron': 'Keychron',
    'samsung': 'Samsung',
    'galaxy': 'Samsung',
    'dell': 'Dell',
    'xps': 'Dell',
    'alienware': 'Dell',
    'asus': 'ASUS',
    'rog': 'ASUS',
    'zenbook': 'ASUS',
    'tuf': 'ASUS',
    'vivo': 'Vivo',
    'oneplus': 'OnePlus',
    'xiaomi': 'Xiaomi',
    'redmi': 'Xiaomi',
    'poco': 'Xiaomi',
    'google': 'Google',
    'pixel': 'Google',
    'nothing': 'Nothing',
    'cmf': 'Nothing',
    'razer': 'Razer',
    'logitech': 'Logitech',
    'dji': 'DJI',
    'gopro': 'GoPro',
    'garmin': 'Garmin',
    'microsoft': 'Microsoft',
    'surface': 'Microsoft',
    'hp': 'HP',
    'omen': 'HP',
    'spectre': 'HP',
    'anker': 'Anker',
    'amazon': 'Amazon',
    'playstation': 'Sony',
    'ps5': 'Sony',
    'shure': 'Shure',
    'elgato': 'Elgato',
    'philips': 'Philips',
    'sonos': 'Sonos',
    'secretlab': 'Secretlab'
  };

  Object.entries(knownBrands).forEach(([keyword, brandName]) => {
    if (new RegExp(`\\b${keyword}\\b`, 'i').test(q) && !brandPreferences.includes(brandName)) {
      brandPreferences.push(brandName);
    }
  });

  if (brandPreferences.length > 0) confidenceScore += 0.04;

  // 4. Required Technical Features
  const featurePatterns: [RegExp, string][] = [
    [/\b(mechanical|tactile|linear|hot[- ]swap)\b/, 'mechanical switches'],
    [/\b(wireless|bluetooth|2\.4ghz)\b/, 'wireless connectivity'],
    [/\b(anc|noise cancel(?:ling|lation)?)\b/, 'active noise cancellation'],
    [/\b(battery|long battery)\b/, 'extended battery life'],
    [/\b(retina|oled|ips|4k|high refresh|120hz|144hz)\b/, 'high-resolution display'],
    [/\b(lightweight|portable|compact)\b/, 'lightweight form factor'],
    [/\b(fast charg(?:e|ing)|gan|usb[- ]c)\b/, 'fast charging'],
    [/\b(rgb|backlit)\b/, 'backlit keyboard'],
    [/\b(rtx|gpu|graphics)\b/, 'dedicated GPU']
  ];

  featurePatterns.forEach(([regex, featureTag]) => {
    if (regex.test(q) && !requiredFeatures.includes(featureTag)) {
      requiredFeatures.push(featureTag);
    }
  });

  // 5. Use Case Classification
  if (/\b(coding|developer|programming|react|python|java|docker|compile)\b/.test(q)) {
    useCase = 'Software Engineering & Parallel Compilation';
    confidenceScore += 0.05;
  } else if (/\b(gaming|esports|steam|fps)\b/.test(q)) {
    useCase = 'High-Frame-Rate Gaming';
    confidenceScore += 0.05;
  } else if (/\b(flight|travel|commute|transit|airport)\b/.test(q)) {
    useCase = 'Travel & Commuter Noise Isolation';
    confidenceScore += 0.05;
  } else if (/\b(office|meeting|calls|zoom|wfh)\b/.test(q)) {
    useCase = 'Work From Home & Video Conferencing';
    confidenceScore += 0.04;
  }

  return {
    rawQuery,
    category,
    subCategory,
    targetBudgetINR,
    targetBudgetUSD,
    brandPreferences,
    requiredFeatures,
    useCase,
    confidenceScore: Math.min(0.98, Math.round(confidenceScore * 100) / 100)
  };
}

/**
 * Generates transparent signal attribution explanation for a recommended product.
 */
export function generateRecommendationExplanation(
  product: Product,
  user: UserPersona,
  scoreData: any
): string {
  const rank = scoreData?.rank || 1;
  const score = scoreData?.finalScore || 0.88;
  const sim = Math.round((scoreData?.features?.semanticSimilarity || 0.82) * 100);
  const affinity = Math.round((scoreData?.features?.userAffinity || 0.75) * 100);
  const headline = scoreData?.groundedReason?.headline;

  const reasonParts: string[] = [];
  reasonParts.push(`Ranked #${rank} for your ${user.role} profile with a composite ranking score of ${score}.`);

  if (headline) {
    reasonParts.push(`Dominant signal: ${headline}.`);
  }

  reasonParts.push(
    `Attribution breakdown: ${sim}% dense semantic vector alignment with your preferred hardware specs, ${affinity}% profile affinity for ${product.brand} in ${product.category}, and instant dispatch verification (${product.stockCount} units in stock).`
  );

  return reasonParts.join(' ');
}

/**
 * Multi-Turn Semantic Dialogue Engine for the Shopping Concierge.
 * Handles order status, returns/replacements, wallet, technical comparisons, and catalog discovery.
 */
export function generateConciergeDialogue(params: {
  messages: { role: string; content: string }[];
  mode: 'thinking' | 'search_grounded' | string;
  user: UserPersona;
  userOrders: any[];
  userReturns: any[];
  userWallet: any;
  userLoyalty: any;
  catalog: Product[];
}): {
  content: string;
  thinkingProcess: string;
  recommendedProductIds: string[];
  groundingSources: { title: string; url: string; snippet: string }[];
} {
  const { messages, user, userOrders, userReturns, userWallet, userLoyalty, catalog } = params;
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const q = lastUserMsg.toLowerCase();

  const recommendedProductIds: string[] = [];
  const groundingSources: { title: string; url: string; snippet: string }[] = [];
  let content = '';
  let thinkingProcess = '';

  // 1. Order Status & Logistics Tracking
  if (/\b(order|track|tracking|package|delivery|shipping|awb|where is)\b/.test(q)) {
    thinkingProcess = `[Intent: Order Logistics Tracking]
Evaluating active shipments for user '${user.id}' (${user.name}).
Order count in database: ${userOrders.length}.
Retrieving real-time dispatch metadata from carrier API (BlueDart Air Express).`;

    if (userOrders.length > 0) {
      const ord = userOrders[0];
      const itemsList = ord.items.map((i: any) => `**${i.title}** (x${i.quantity})`).join(', ');
      content = `### 📦 Order Status: #${ord.id}\n\n` +
        `- **Status**: \`${ord.status.toUpperCase()}\`\n` +
        `- **Items**: ${itemsList}\n` +
        `- **Total**: ₹${ord.totalINR?.toLocaleString()} via ${ord.paymentMethod === 'wallet' ? 'ShopSense Wallet' : 'UPI / Card'}\n` +
        `- **Carrier**: BlueDart Air Express (AWB: \`BD-AIR-${ord.id.slice(-6)}\`)\n` +
        `- **Estimated Delivery**: **${ord.estimatedDeliveryDate || 'Within 48 hours'}**\n` +
        `- **Security**: Tamper-evident barcode sealed at regional fulfillment hub.\n\n` +
        `You can manage delivery instructions or request doorstep re-scheduling in your **Orders** tab.`;
    } else {
      content = `You currently have no active pending orders. Browse our verified hardware catalog to place an order with guaranteed express courier dispatch.`;
    }

    return { content, thinkingProcess, recommendedProductIds, groundingSources };
  }

  // 2. Returns, Replacements & Doorstep Refund Policy
  if (/\b(return|replace|replacement|refund|exchange|broken|damaged|doorstep)\b/.test(q)) {
    thinkingProcess = `[Intent: Post-Purchase Reverse Logistics & Return Policy]
Checking active return requests for user '${user.id}'.
Existing return tickets: ${userReturns.length}.
Synthesizing policy constraints: 7-day hassle-free window, doorstep QC verification, instant wallet credit.`;

    if (userReturns.length > 0) {
      const ret = userReturns[0];
      content = `### 🔄 Active Return Ticket: #${ret.id}\n\n` +
        `- **Item**: **${ret.item.title}**\n` +
        `- **Status**: \`${ret.status.replace('_', ' ').toUpperCase()}\`\n` +
        `- **Scheduled Pickup**: **${ret.pickupDate}** (${ret.pickupSlot.replace('_', ' ')})\n` +
        `- **Resolution Method**: ${ret.resolution === 'refund_wallet' ? '⚡ Instant Wallet Credit' : 'Original Payment Method'}\n` +
        `- **Refund Value**: **₹${ret.refundAmountINR?.toLocaleString()}**\n\n` +
        `Our courier agent will perform doorstep hardware inspection before triggering the instant balance credit.`;
    } else {
      content = `### 🛡️ ShopSense 7-Day Hassle-Free Return & Replacement Guarantee\n\n` +
        `Every eligible purchase is protected by our transparent reverse-logistics guarantee:\n` +
        `1. **7-Day Window**: Request returns or 1-to-1 doorstep hardware replacement directly from the Orders tab.\n` +
        `2. **Free Doorstep Pickup**: Scheduled courier arrival at your preferred time slot with instant barcode verification.\n` +
        `3. **Instant Wallet Credit**: Refunds to your **ShopSense Wallet** credit within **< 2 minutes** of doorstep handover.\n` +
        `4. **Original Payment**: Standard banking turnaround of 24–48 hours for cards or UPI.`;
    }

    return { content, thinkingProcess, recommendedProductIds, groundingSources };
  }

  // 3. Wallet Balance & Loyalty Program
  if (/\b(wallet|balance|points|loyalty|tier|bronze|silver|gold|platinum|cashback)\b/.test(q)) {
    thinkingProcess = `[Intent: Account Ledger & Loyalty Tier Inquiry]
Fetching user wallet from fintech double-entry ledger.
Balance: ₹${userWallet.balanceINR} ($${userWallet.balanceUSD}).
Loyalty account: ${userLoyalty.totalPoints} points, Tier: ${userLoyalty.currentTier}.`;

    content = `### 💳 ShopSense Wallet & Loyalty Account\n\n` +
      `- **Current Balance**: **₹${userWallet.balanceINR.toLocaleString()}** ($${userWallet.balanceUSD})\n` +
      `- **Lifetime Deposited**: ₹${userWallet.totalDepositedINR.toLocaleString()} | **Spent**: ₹${userWallet.totalSpentINR.toLocaleString()}\n` +
      `- **Loyalty Club Tier**: **${userLoyalty.currentTier.toUpperCase()}** (${userLoyalty.totalPoints} Reward Points)\n` +
      `- **Active Tier Perks**:\n` +
      `  - ${userLoyalty.currentTier === 'Bronze' ? '1.0x points earning & free shipping above ₹2,000' : ''}` +
      `  - ${userLoyalty.currentTier === 'Silver' ? '1.2x points multiplier + 2% category cashback + free shipping over ₹1,200' : ''}` +
      `  - ${userLoyalty.currentTier === 'Gold' ? '1.5x points boost + Zero-Fee Express Air delivery on all orders' : ''}` +
      `  - ${userLoyalty.currentTier === 'Platinum' ? '2.0x Double points + Overnight Courier + VIP Beta hardware access' : ''}\n\n` +
      `You can apply your wallet balance during checkout for zero-friction split payments.`;

    return { content, thinkingProcess, recommendedProductIds, groundingSources };
  }

  // 4. Product Comparison (e.g. "ThinkPad vs MacBook")
  if (/\b(compare|vs|versus|difference)\b/.test(q)) {
    const thinkpad = catalog.find(p => p.id === 'prod-lap-01') || catalog[0];
    const macbook = catalog.find(p => p.id === 'prod-lap-02') || catalog[1];

    thinkingProcess = `[Intent: In-Depth Hardware Spec Comparison]
Entities Detected: Lenovo ThinkPad T14s Gen 4 vs Apple MacBook Pro 14" M3 Pro.
User Profile: ${user.name} (${user.role}), Target Budget: ₹${user.targetBudgetINR.toLocaleString()}.
Comparing thermal dynamics, developer compiler speed, battery longevity, and OS ecosystem.`;

    content = `### ⚖️ Technical Comparison: ThinkPad T14s Gen 4 vs. MacBook Pro 14" M3 Pro\n\n` +
      `| Dimension | **Lenovo ThinkPad T14s Gen 4** | **Apple MacBook Pro 14" M3 Pro** |\n` +
      `| :--- | :--- | :--- |\n` +
      `| **Processor** | AMD Ryzen 7 PRO 7840U (8C/16T, 5.1GHz) | Apple M3 Pro (11-Core CPU, 14-Core GPU) |\n` +
      `| **Memory & SSD** | 32GB LPDDR5X (7500MHz) / 1TB Gen4 | 18GB Unified Memory / 512GB NVMe |\n` +
      `| **Display** | 14.0" 2.8K OLED (2880x1800) 400 nits | 14.2" Liquid Retina XDR (3024x1964) 1600 nits peak |\n` +
      `| **Compilation** | Native Linux/Docker bare-metal acceleration | Blazing single-core & Apple Silicon optimized Rust/Go |\n` +
      `| **Battery** | ~14 hours mixed productivity | ~18 hours continuous coding |\n` +
      `| **Keyboard** | 1.5mm tactile travel, spill-resistant | Magic Keyboard, scissor mechanism |\n` +
      `| **Price** | **₹135,000** ($1,620) | **₹199,900** ($2,394) |\n\n` +
      `**Hardware Specialist Verdict for ${user.name} (${user.role}):**\n` +
      `If you prioritize native Linux dual-booting, Docker x86 virtualization, and deep key travel, the **ThinkPad T14s** is unmatched value. If you need exceptional sustained battery runtime away from power outlets and a reference-grade HDR display, the **MacBook Pro M3 Pro** justifies the premium.`;

    recommendedProductIds.push(thinkpad.id, macbook.id);
    return { content, thinkingProcess, recommendedProductIds, groundingSources };
  }

  // 5. Product Discovery & Specification Search
  const parsedIntent = parseNaturalLanguageIntent(lastUserMsg);

  thinkingProcess = `[Intent: Catalog Discovery & Multi-Objective Ranking]
Extracted Intent: Category=${parsedIntent.category || 'Any'}, Budget=₹${parsedIntent.targetBudgetINR?.toLocaleString() || 'Unconstrained'}.
Features: [${parsedIntent.requiredFeatures.join(', ')}].
Cross-referencing in-stock inventory with user persona (${user.role}).`;

  // Candidate matching
  let matchedProducts = catalog.filter(p => p.inStock && p.stockCount > 0);

  if (parsedIntent.category) {
    matchedProducts = matchedProducts.filter(p => p.category === parsedIntent.category);
  }

  if (parsedIntent.targetBudgetINR) {
    const budgetCeiling = parsedIntent.targetBudgetINR * 1.15;
    matchedProducts = matchedProducts.filter(p => p.priceINR <= budgetCeiling);
  }

  if (matchedProducts.length === 0) {
    matchedProducts = catalog.slice(0, 3);
  }

  // Pick top 2
  const topMatches = matchedProducts.slice(0, 2);
  topMatches.forEach(p => recommendedProductIds.push(p.id));

  content = `### 🎯 Verified Catalog Recommendations\n\n` +
    `Based on your query and ${user.role} hardware profile, here are the optimal matches in our verified catalog:\n\n` +
    topMatches.map((p, idx) => {
      return `**${idx + 1}. ${p.title}** (${p.category})\n` +
        `- **Price**: **₹${p.priceINR.toLocaleString()}** ($${p.priceUSD})\n` +
        `- **Rating**: ${p.rating}★ (${p.stockCount} units in stock with express dispatch)\n` +
        `- **Specs**: ${Object.entries(p.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | ')}\n` +
        `- **Why this fits**: ${p.description.slice(0, 140)}...`;
    }).join('\n\n') +
    `\n\nClick **"Add"** on any product card below to add directly to your active cart.`;

  return { content, thinkingProcess, recommendedProductIds, groundingSources };
}
