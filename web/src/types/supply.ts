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
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  status: SupplyOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplyOrderPayload {
  items: { productId: string; quantity: number }[];
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
}
