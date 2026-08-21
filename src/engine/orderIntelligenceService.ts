import { Order, OrderItem, OrderStatus, OrderTrackingStep } from '../types';
import { refundToWallet } from './walletService';
import { awardLoyaltyPoints } from './loyaltyService';

function generateTrackingTimeline(status: OrderStatus, createdAt: string): OrderTrackingStep[] {
  const baseTime = new Date(createdAt).getTime();
  
  const steps: { status: OrderStatus; label: string; offsetHours: number; notes: string }[] = [
    { status: 'placed', label: 'Order Confirmed', offsetHours: 0, notes: 'Payment verified & order inventory reserved.' },
    { status: 'packed', label: 'Packed & Quality Checked', offsetHours: 6, notes: 'Sealed with tamper-evident security tape at Fulfillment Hub.' },
    { status: 'shipped', label: 'Dispatched with Carrier', offsetHours: 18, notes: 'Handed over to BlueDart Express Air Courier.' },
    { status: 'out_for_delivery', label: 'Out for Delivery', offsetHours: 36, notes: 'Courier agent on route to your shipping address.' },
    { status: 'delivered', label: 'Delivered', offsetHours: 48, notes: 'Delivered and signed at doorstep.' }
  ];

  const statusOrder: OrderStatus[] = ['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);

  return steps.map((s, idx) => {
    const isCompleted = idx <= currentIndex && status !== 'cancelled' && status !== 'returned';
    const isCurrent = idx === currentIndex && status !== 'cancelled' && status !== 'returned';
    const timestamp = new Date(baseTime + s.offsetHours * 3600 * 1000).toISOString();

    return {
      status: s.status,
      label: s.label,
      timestamp: isCompleted ? timestamp : undefined,
      completed: isCompleted,
      current: isCurrent,
      notes: isCompleted ? s.notes : undefined
    };
  });
}

const ordersStore: Order[] = [
  {
    id: 'ord-2026-0801',
    userId: 'user-dev-alex',
    userName: 'Alex Kumar',
    items: [
      {
        productId: 'prod-acc-01',
        title: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
        priceINR: 17990,
        priceUSD: 215,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        brand: 'Keychron',
        category: 'Accessories'
      }
    ],
    subtotalINR: 17990,
    discountINR: 0,
    walletUsedINR: 1500,
    pointsDiscountINR: 0,
    shippingFeeINR: 0,
    totalINR: 16490,
    totalUSD: 197.5,
    status: 'delivered',
    createdAt: '2026-08-10T10:30:00Z',
    estimatedDeliveryDate: '2026-08-12',
    deliveredDate: '2026-08-12T16:45:00Z',
    trackingNumber: 'BD-982410-IN',
    carrier: 'BlueDart Express Air',
    paymentMethod: 'split_wallet_card',
    paymentDetails: {
      walletAmountINR: 1500,
      cardAmountINR: 16490,
      gatewayRef: 'pi_test_keychron_01'
    },
    shippingAddress: '402 Tech Park Residency, Bengaluru, Karnataka, India',
    pointsEarned: 450,
    trackingTimeline: generateTrackingTimeline('delivered', '2026-08-10T10:30:00Z')
  },
  {
    id: 'ord-2026-0802',
    userId: 'user-audio-priya',
    userName: 'Priya Nambiar',
    items: [
      {
        productId: 'prod-aud-01',
        title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        priceINR: 29990,
        priceUSD: 359,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        brand: 'Sony',
        category: 'Audio'
      }
    ],
    subtotalINR: 29990,
    discountINR: 2000,
    walletUsedINR: 1000,
    pointsDiscountINR: 200,
    shippingFeeINR: 0,
    totalINR: 26790,
    totalUSD: 320.8,
    status: 'out_for_delivery',
    createdAt: '2026-08-19T08:15:00Z',
    estimatedDeliveryDate: '2026-08-20',
    trackingNumber: 'DLV-441920-IN',
    carrier: 'Delhivery Speed',
    paymentMethod: 'split_wallet_card',
    paymentDetails: {
      walletAmountINR: 1000,
      cardAmountINR: 26790,
      gatewayRef: 'pay_test_priya_sony'
    },
    shippingAddress: 'Flat 12B, Palm Grove Heights, Indiranagar, Bengaluru, India',
    couponApplied: 'AUDIO20',
    pointsEarned: 750,
    trackingTimeline: generateTrackingTimeline('out_for_delivery', '2026-08-19T08:15:00Z')
  },
  {
    id: 'ord-2026-0803',
    userId: 'user-enterprise-vikram',
    userName: 'Vikram Mehta',
    items: [
      {
        productId: 'prod-lap-01',
        title: 'MacBook Pro 16" M3 Pro 36GB RAM',
        priceINR: 249900,
        priceUSD: 2992,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        brand: 'Apple',
        category: 'Laptops'
      }
    ],
    subtotalINR: 249900,
    discountINR: 5000,
    walletUsedINR: 10000,
    pointsDiscountINR: 500,
    shippingFeeINR: 0,
    totalINR: 234400,
    totalUSD: 2807.1,
    status: 'shipped',
    createdAt: '2026-08-19T14:20:00Z',
    estimatedDeliveryDate: '2026-08-21',
    trackingNumber: 'FX-889102-IN',
    carrier: 'FedEx Priority Overnight',
    paymentMethod: 'split_wallet_card',
    paymentDetails: {
      walletAmountINR: 10000,
      cardAmountINR: 234400,
      gatewayRef: 'pi_test_vikram_mac'
    },
    shippingAddress: 'Tech Mahindra Tower 4, Whitefield, Bengaluru, India',
    couponApplied: 'ENTERPRISE5000',
    pointsEarned: 2400,
    trackingTimeline: generateTrackingTimeline('shipped', '2026-08-19T14:20:00Z')
  }
];

export function getUserOrders(userId: string): Order[] {
  return ordersStore.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllOrders(): Order[] {
  return ordersStore.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createOrder(
  userId: string,
  userName: string,
  items: OrderItem[],
  subtotalINR: number,
  discountINR: number,
  walletUsedINR: number,
  pointsDiscountINR: number,
  shippingFeeINR: number,
  totalINR: number,
  paymentMethod: 'wallet' | 'card' | 'upi' | 'split_wallet_card',
  shippingAddress: string,
  couponCode?: string,
  cardAmountINR: number = 0
): Order {
  const totalUSD = Math.round((totalINR / 83.5) * 10) / 10;
  const orderId = `ord-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();
  
  // Calculate delivery date (2 days ahead)
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 2);
  const estimatedDeliveryDate = estDate.toISOString().split('T')[0];

  // Points earned: 1 point per 20 INR
  const pointsEarned = Math.round(totalINR / 20);

  const order: Order = {
    id: orderId,
    userId,
    userName,
    items,
    subtotalINR,
    discountINR,
    walletUsedINR,
    pointsDiscountINR,
    shippingFeeINR,
    totalINR,
    totalUSD,
    status: 'placed',
    createdAt: now,
    estimatedDeliveryDate,
    trackingNumber: `BD-${Math.floor(100000 + Math.random() * 900000)}-IN`,
    carrier: 'BlueDart Express Air',
    paymentMethod,
    paymentDetails: {
      walletAmountINR: walletUsedINR,
      cardAmountINR,
      gatewayRef: `pi_test_${orderId}`
    },
    shippingAddress,
    couponApplied: couponCode,
    pointsEarned,
    trackingTimeline: generateTrackingTimeline('placed', now)
  };

  ordersStore.unshift(order);

  // Automatically award loyalty points
  awardLoyaltyPoints(userId, 'purchase', pointsEarned, `Earned from Order #${orderId}`, orderId);

  return order;
}

export function cancelOrder(orderId: string, reason: string): { success: boolean; order?: Order; refundINR: number; message: string } {
  const order = ordersStore.find(o => o.id === orderId);
  if (!order) {
    return { success: false, refundINR: 0, message: 'Order not found.' };
  }

  if (order.status === 'delivered' || order.status === 'cancelled' || order.status === 'returned') {
    return { success: false, refundINR: 0, message: `Cannot cancel order with status: ${order.status}` };
  }

  order.status = 'cancelled';
  order.cancelReason = reason;

  // Refund the entire total amount + wallet portion back to user's wallet!
  const totalRefundINR = order.totalINR + order.walletUsedINR;
  refundToWallet(order.userId, totalRefundINR, order.id, `Order Cancelled: ${reason}`);

  return {
    success: true,
    order,
    refundINR: totalRefundINR,
    message: `Order #${order.id} cancelled. ₹${totalRefundINR.toLocaleString()} instantly refunded to your ShopSense Wallet.`
  };
}

export function returnOrder(orderId: string, reason: string): { success: boolean; order?: Order; refundINR: number; message: string } {
  const order = ordersStore.find(o => o.id === orderId);
  if (!order) {
    return { success: false, refundINR: 0, message: 'Order not found.' };
  }

  if (order.status !== 'delivered') {
    return { success: false, refundINR: 0, message: 'Only delivered orders can be returned.' };
  }

  order.status = 'returned';
  order.returnReason = reason;

  const totalRefundINR = order.totalINR + order.walletUsedINR;
  refundToWallet(order.userId, totalRefundINR, order.id, `Item Return: ${reason}`);

  return {
    success: true,
    order,
    refundINR: totalRefundINR,
    message: `Return approved for Order #${order.id}. ₹${totalRefundINR.toLocaleString()} credited to your ShopSense Wallet.`
  };
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatus): Order | null {
  const order = ordersStore.find(o => o.id === orderId);
  if (!order) return null;

  order.status = newStatus;
  order.trackingTimeline = generateTrackingTimeline(newStatus, order.createdAt);
  if (newStatus === 'delivered') {
    order.deliveredDate = new Date().toISOString();
  }
  return order;
}
