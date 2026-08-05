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

export interface PriceRecord {
  id: string;
  commodity: string;
  category: string;
  region: string;
  price: number;
  unit: string;
  change: string; // 'up' | 'down' | 'same'
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
