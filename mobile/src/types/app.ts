export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  cropName: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  description?: string;
  photos?: string[];
  status: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  isExpert?: boolean;
  category: string;
  title: string;
  body: string;
  imageUrl?: string;
  upvotes: number;
  commentsCount: number;
  isUpvotedByMe?: boolean;
  createdAt: string;
}

export type CommunityPost = Post;

export interface SupplyProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stockQuantity: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
}

/**
 * Payment method chosen at checkout.
 * - cod: Cash on Delivery (default, delivery only)
 * - gcash / maya / bank_transfer / card: online (future PayMongo/Dragonpay)
 */
export type PaymentMethod = 'cod' | 'gcash' | 'maya' | 'bank_transfer' | 'card';

/**
 * Payment lifecycle status.
 * - pending_payment: default for all new orders
 * - paid: confirmed (COD by supplier, online by gateway webhook)
 * - failed: online payment declined
 * - refunded: payment reversed
 */
export type PaymentStatus = 'pending_payment' | 'paid' | 'failed' | 'refunded';

export type SupplyOrderStatus = 'pending' | 'processing' | 'shipped_ready' | 'completed' | 'cancelled';

export interface SupplyOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerItem: number;
}

export interface SupplyOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  supplierId: string;
  supplierName: string;
  items: SupplyOrderItem[];
  totalAmount: number;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: string;
  status: SupplyOrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplyOrderPayload {
  items: { productId: string; quantity: number }[];
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
}

export interface UpdatePaymentStatusPayload {
  paymentStatus: PaymentStatus;
  paymentNote?: string;
}

export interface PriceRecord {
  id: string;
  commodity: string;
  category: string;
  region: string;
  price: number;
  unit: string;
  change: string;
  updatedAt: string;
}

export interface FinancialEntry {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}
