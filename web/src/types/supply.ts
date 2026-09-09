export type SupplyCategory =
  | 'fertilizer'
  | 'pesticide_herbicide_fungicide'
  | 'seeds_seedlings'
  | 'tools'
  | 'ppe';

export type DeliveryMethod = 'delivery' | 'pickup';

export type SupplyOrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped_ready'
  | 'completed'
  | 'cancelled';

/**
 * PaymentMethod — mirrors backend models.PaymentMethod constants.
 * - cod: Cash on Delivery (no gateway required, supplier confirms on delivery)
 * - gcash: GCash e-wallet via PayMongo (future)
 * - maya: Maya (PayMaya) e-wallet via PayMongo (future)
 * - bank_transfer: InstaPay / PESONet via Dragonpay (future)
 * - card: Visa / Mastercard via PayMongo (future)
 */
export type PaymentMethod = 'cod' | 'gcash' | 'maya' | 'bank_transfer' | 'card';

/**
 * PaymentStatus — mirrors backend models.PaymentStatus constants.
 * - pending_payment: default for all new orders; COD awaits delivery confirmation
 * - paid: confirmed paid (COD: by supplier; online: by gateway webhook)
 * - failed: online payment attempt was declined
 * - refunded: payment was reversed
 */
export type PaymentStatus = 'pending_payment' | 'paid' | 'failed' | 'refunded';

export interface SupplyProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  isVerified: boolean;
  name: string;
  category: SupplyCategory;
  description: string;
  price: number;
  stockQuantity: number;
  unit: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplyProductPayload {
  name: string;
  category: SupplyCategory;
  description: string;
  price: number;
  stockQuantity: number;
  unit: string;
  images?: string[];
}

export interface SupplyOrderItem {
  productId: string;
  productName: string;
  productImage?: string;
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
  subtotal?: number;
  shippingFee?: number;
  totalAmount: number;
  deliveryMethod: DeliveryMethod;
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
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  /** Defaults to 'cod' on the backend if omitted. */
  paymentMethod: PaymentMethod;
}

export interface UpdatePaymentStatusPayload {
  paymentStatus: PaymentStatus;
  paymentNote?: string;
}
