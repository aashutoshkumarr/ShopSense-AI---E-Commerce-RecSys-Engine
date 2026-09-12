import { 
  ReturnRequest, 
  ReturnResolutionType, 
  ReturnReasonCategory, 
  ReturnStatus, 
  ReturnTrackingStep, 
  HelpArticle, 
  SupportTicket, 
  SupportTicketMessage, 
  OrderItem 
} from '../types';
import { refundToWallet } from './walletService';
import { awardLoyaltyPoints } from './loyaltyService';

function generateReturnTimeline(status: ReturnStatus, createdAt: string): ReturnTrackingStep[] {
  const baseTime = new Date(createdAt).getTime();

  const steps: { step: ReturnStatus; label: string; offsetHours: number; notes: string }[] = [
    { step: 'requested', label: 'Return / Replacement Initiated', offsetHours: 0, notes: 'Request verified and authorization RMA generated.' },
    { step: 'pickup_scheduled', label: 'Doorstep Pickup Scheduled', offsetHours: 4, notes: 'BlueDart Courier assigned for doorstep pickup.' },
    { step: 'picked_up', label: 'Item Collected by Courier', offsetHours: 24, notes: 'Package securely collected with pickup receipt.' },
    { step: 'inspection_passed', label: 'Hub Quality Check Verified', offsetHours: 36, notes: 'Item condition and serial number verified at fulfillment hub.' },
    { step: 'refund_processed', label: 'Refund Credited / Replacement Dispatched', offsetHours: 40, notes: 'Full refund credited to ShopSense Wallet or Replacement unit dispatched.' }
  ];

  const statusOrder: ReturnStatus[] = ['requested', 'pickup_scheduled', 'picked_up', 'inspection_passed', 'refund_processed'];
  const currentIndex = statusOrder.indexOf(status);

  return steps.map((s, idx) => {
    const isCompleted = idx <= currentIndex && status !== 'cancelled';
    const isCurrent = idx === currentIndex && status !== 'cancelled';
    const timestamp = new Date(baseTime + s.offsetHours * 3600 * 1000).toISOString();

    return {
      step: s.step,
      label: s.label,
      timestamp: isCompleted ? timestamp : undefined,
      completed: isCompleted,
      current: isCurrent,
      notes: isCompleted ? s.notes : undefined
    };
  });
}

// In-Memory Return Requests Store
const returnRequestsStore: ReturnRequest[] = [
  {
    id: 'ret-2026-091',
    orderId: 'ord-2026-0801',
    userId: 'user-dev-alex',
    userName: 'Alex Kumar',
    item: {
      productId: 'prod-acc-01',
      title: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
      priceINR: 17990,
      priceUSD: 215,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      brand: 'Keychron',
      category: 'Accessories'
    },
    resolution: 'refund_wallet',
    reasonCategory: 'size_fit_issue',
    reasonText: 'Keyboard footprint slightly larger than expected for current mobile desk setup.',
    comments: 'All original packaging, braided cable, and switch pullers intact.',
    refundAmountINR: 17990,
    refundAmountUSD: 215,
    pickupDate: '2026-08-22',
    pickupSlot: 'morning_9_to_1',
    pickupAddress: '402 Tech Park Residency, Bengaluru, Karnataka, India',
    status: 'pickup_scheduled',
    createdAt: '2026-08-18T11:00:00Z',
    updatedAt: '2026-08-18T14:30:00Z',
    trackingTimeline: generateReturnTimeline('pickup_scheduled', '2026-08-18T11:00:00Z')
  }
];

// In-Memory Help Center Articles
export const helpCenterArticles: HelpArticle[] = [
  {
    id: 'art-return-policy',
    title: '7-Day Return & Doorstep Replacement Policy',
    category: 'returns_refunds',
    categoryLabel: 'Returns & Replacements',
    summary: 'Everything you need to know about returning electronics, laptops, audio gear, and accessories within 7 days.',
    content: `### 7-Day Hassle-Free Returns & Replacements
We want you to be 100% satisfied with your tech. If your product is defective, damaged in transit, or has a fit/compatibility issue:

1. **Eligibility Window**: You can request a return or replacement within **7 days** of delivery.
2. **Doorstep Pickup**: Our logistics partner BlueDart will collect the item directly from your address at your chosen time slot.
3. **Instant Wallet Refund**: Opting for **ShopSense Wallet Refund** ensures your funds are credited within **2 minutes** of hub inspection.
4. **Direct Replacement**: If you select Replacement, a brand-new sealed unit is reserved and dispatched immediately with expedited shipping.`,
    keywords: ['return', 'refund', 'replacement', 'damaged', 'defective', '7 days', 'exchange'],
    helpfulCount: 342,
    views: 1890,
    featured: true
  },
  {
    id: 'art-refund-timelines',
    title: 'Refund Timelines & Payment Methods (Instant Wallet vs Original Mode)',
    category: 'wallet_payments',
    categoryLabel: 'Payments & Refunds',
    summary: 'Compare instant 2-minute wallet refunds versus 3-5 bank day UPI/Card payment reversals.',
    content: `### Refund Options Breakdown
When returning an item, you can choose your preferred payout channel:

* **ShopSense Wallet (Recommended - Instant)**:
  - Time to credit: **< 2 minutes** after inspection.
  - Can be combined with UPI/Cards on your next checkout.
  - Earns an extra **+50 Loyalty Points** when choosing Wallet refund.
* **Original Payment Method (Card/UPI/NetBanking)**:
  - UPI / Net Banking: **24-48 business hours**.
  - Credit / Debit Cards: **3-5 business days** depending on your issuing bank.`,
    keywords: ['refund', 'money back', 'wallet', 'credit card', 'upi', 'bank transfer'],
    helpfulCount: 215,
    views: 1420,
    featured: true
  },
  {
    id: 'art-shipping-tracking',
    title: 'Live Order Tracking & Express Delivery Information',
    category: 'shipping_delivery',
    categoryLabel: 'Shipping & Delivery',
    summary: 'Track live milestones: order confirmed, packaging, air cargo transit, and doorstep delivery.',
    content: `### Express Shipping Guarantee
All orders are handled via expedited Air Freight (BlueDart / Delhivery Express).

* **Metro Cities**: Next-day or 2-day delivery.
* **Rest of India**: 2-3 business days.
* **Live GPS Tracking**: Access the Orders tab anytime to view real-time courier checkpoints.`,
    keywords: ['shipping', 'delivery', 'bluedart', 'tracking', 'transit', 'eta'],
    helpfulCount: 180,
    views: 990
  },
  {
    id: 'art-wallet-benefits',
    title: 'ShopSense Wallet: Top-Ups, Cashbacks & Split Payments',
    category: 'wallet_payments',
    categoryLabel: 'Wallet & Payments',
    summary: 'Learn how to top up via mock Stripe, earn top-up bonuses, and pay partially with wallet balance.',
    content: `### Maximizing Your ShopSense Wallet
ShopSense Wallet gives you one-click checkout with zero payment failures:

* **Top-Up Bonuses**: Receive up to ₹500 instant cashback on wallet top-ups over ₹5,000.
* **Split Tender**: If your wallet doesn't cover the full cart, easily pay the remaining amount via Credit Card or UPI.`,
    keywords: ['wallet', 'topup', 'balance', 'cashback', 'split payment'],
    helpfulCount: 148,
    views: 820
  },
  {
    id: 'art-loyalty-tiers',
    title: 'Loyalty Club: Tiers (Bronze, Silver, Gold, Platinum) & Point Redemption',
    category: 'rewards_loyalty',
    categoryLabel: 'Rewards & Loyalty',
    summary: 'How to earn 1 point per ₹20 spent and redeem points for direct checkout discounts.',
    content: `### Loyalty Club Rewards
Every interaction earns you valuable reward points:
* **Purchases**: Earn 1 point per ₹20 spent.
* **Reviews with NLP Sentiment**: Earn +50 points per verified review.
* **Referrals**: Earn +200 points + ₹500 wallet credit per invited friend.
* **Redemption**: 100 Points = ₹50 direct discount at checkout.`,
    keywords: ['loyalty', 'points', 'rewards', 'gold tier', 'discounts'],
    helpfulCount: 290,
    views: 1650,
    featured: true
  }
];

// In-Memory Support Tickets Store
const supportTicketsStore: SupportTicket[] = [
  {
    id: 'tkt-2026-104',
    userId: 'user-dev-alex',
    userName: 'Alex Kumar',
    orderId: 'ord-2026-0801',
    category: 'return_replacement',
    subject: 'Assistance with Keychron Q1 Pro Return Pickup Slot',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-08-18T11:15:00Z',
    updatedAt: '2026-08-18T12:00:00Z',
    messages: [
      {
        id: 'tmsg-1',
        sender: 'user',
        senderName: 'Alex Kumar',
        content: 'Hi! I scheduled a return for my Keychron Q1 Pro. Can I ensure the courier visits after 10 AM?',
        timestamp: '2026-08-18T11:15:00Z'
      },
      {
        id: 'tmsg-2',
        sender: 'automated_assistant',
        senderName: 'ShopSense Support Desk',
        content: 'Hello Alex! I have updated your BlueDart pickup instructions to note a preferred collection window between 10:00 AM and 1:00 PM. You will receive an SMS alert with the courier agent contact 1 hour prior.',
        timestamp: '2026-08-18T11:16:00Z'
      }
    ]
  }
];

// Getters & Handlers
export function getUserReturnRequests(userId: string): ReturnRequest[] {
  return returnRequestsStore
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllReturnRequests(): ReturnRequest[] {
  return returnRequestsStore
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createReturnRequest(
  orderId: string,
  userId: string,
  userName: string,
  item: OrderItem,
  resolution: ReturnResolutionType,
  reasonCategory: ReturnReasonCategory,
  reasonText: string,
  comments: string = '',
  pickupDate: string,
  pickupSlot: 'morning_9_to_1' | 'afternoon_2_to_6' | 'evening_6_to_9',
  pickupAddress: string
): ReturnRequest {
  const returnId = `ret-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();
  const refundINR = item.priceINR * item.quantity;
  const refundUSD = item.priceUSD * item.quantity;

  const newReturn: ReturnRequest = {
    id: returnId,
    orderId,
    userId,
    userName,
    item,
    resolution,
    reasonCategory,
    reasonText,
    comments,
    refundAmountINR: refundINR,
    refundAmountUSD: refundUSD,
    pickupDate: pickupDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    pickupSlot: pickupSlot || 'morning_9_to_1',
    pickupAddress: pickupAddress || 'Registered Delivery Address',
    status: 'requested',
    trackingTimeline: generateReturnTimeline('requested', now),
    createdAt: now,
    updatedAt: now
  };

  returnRequestsStore.unshift(newReturn);

  // If user requested instant wallet refund, we can simulate an inspection advance if requested
  return newReturn;
}

export function updateReturnStatus(returnId: string, newStatus: ReturnStatus): ReturnRequest | null {
  const req = returnRequestsStore.find(r => r.id === returnId);
  if (!req) return null;

  req.status = newStatus;
  req.updatedAt = new Date().toISOString();
  req.trackingTimeline = generateReturnTimeline(newStatus, req.createdAt);

  // If status is completed or refund_processed and resolution was wallet refund, credit wallet!
  if (newStatus === 'refund_processed' || newStatus === 'completed') {
    if (req.resolution === 'refund_wallet' && !req.walletRefundId) {
      req.walletRefundId = `rfnd_${Date.now()}`;
      refundToWallet(req.userId, req.refundAmountINR, req.orderId, `Item Return Refund: ${req.item.title}`);
      awardLoyaltyPoints(req.userId, 'purchase', 50, `Bonus points for choosing wallet refund on return #${req.id}`);
    }
  }

  return req;
}

export function searchHelpArticles(query: string, category?: string): HelpArticle[] {
  const q = query.toLowerCase().trim();
  return helpCenterArticles.filter(art => {
    const matchesCategory = !category || category === 'all' || art.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;

    const matchesTitle = art.title.toLowerCase().includes(q);
    const matchesSummary = art.summary.toLowerCase().includes(q);
    const matchesKeywords = art.keywords.some(k => k.toLowerCase().includes(q));
    const matchesContent = art.content.toLowerCase().includes(q);

    return matchesTitle || matchesSummary || matchesKeywords || matchesContent;
  });
}

export function getUserSupportTickets(userId: string): SupportTicket[] {
  return supportTicketsStore
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function createSupportTicket(
  userId: string,
  userName: string,
  category: 'return_replacement' | 'order_tracking' | 'payment_refund' | 'product_inquiry' | 'general',
  subject: string,
  initialMessage: string,
  orderId?: string
): SupportTicket {
  const ticketId = `tkt-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const userMsg: SupportTicketMessage = {
    id: `tmsg-${Date.now()}`,
    sender: 'user',
    senderName: userName,
    content: initialMessage,
    timestamp: now
  };

  // Generate immediate automated support triage response
  let aiReplyText = `Thank you for reaching out, ${userName}. Your ticket #${ticketId} has been created with our Priority Support Desk. `;
  if (category === 'return_replacement') {
    aiReplyText += `For return/replacement requests, our 7-day doorstep replacement protocol is active. You can track your return pickup and refund progress under the Returns Hub.`;
  } else if (category === 'order_tracking') {
    aiReplyText += `We have synced your latest BlueDart Air courier updates. Our support team is monitoring transit progress.`;
  } else if (category === 'payment_refund') {
    aiReplyText += `Wallet refunds are processed in under 2 minutes. Bank and card reversals reflect within 24-48 hours.`;
  } else {
    aiReplyText += `A dedicated customer success specialist will review your request shortly.`;
  }

  const aiMsg: SupportTicketMessage = {
    id: `tmsg-${Date.now() + 1}`,
    sender: 'automated_assistant',
    senderName: 'ShopSense Support Desk',
    content: aiReplyText,
    timestamp: now
  };

  const newTicket: SupportTicket = {
    id: ticketId,
    userId,
    userName,
    orderId,
    category,
    subject,
    priority: 'medium',
    status: 'in_progress',
    messages: [userMsg, aiMsg],
    createdAt: now,
    updatedAt: now
  };

  supportTicketsStore.unshift(newTicket);
  return newTicket;
}

export function addMessageToTicket(ticketId: string, sender: 'user' | 'support_agent' | 'automated_assistant', senderName: string, content: string): SupportTicket | null {
  const ticket = supportTicketsStore.find(t => t.id === ticketId);
  if (!ticket) return null;

  const newMsg: SupportTicketMessage = {
    id: `tmsg-${Date.now()}`,
    sender,
    senderName,
    content,
    timestamp: new Date().toISOString()
  };

  ticket.messages.push(newMsg);
  ticket.updatedAt = new Date().toISOString();
  return ticket;
}
