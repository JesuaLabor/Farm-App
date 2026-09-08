export type ListingStatus = 'available' | 'sold' | 'reserved';
export type TransactionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

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
  harvestDate: string;
  location: string;
  photos?: string[];
  description?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProduceListingPayload {
  cropName: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  harvestDate: string;
  location: string;
  photos?: string[];
  description?: string;
}

export interface ProduceTransaction {
  id: string;
  listingId: string;
  cropName: string;
  cropPhoto?: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  contactMessage?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProduceTransactionPayload {
  listingId: string;
  quantity: number;
  contactMessage?: string;
}
