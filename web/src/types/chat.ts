export type ChatContextType = 'produce' | 'supply' | 'produce_order' | 'supply_order' | 'general';

export interface ChatContextData {
  type: ChatContextType;
  referenceId?: string;
  title?: string;
  image?: string;
  price?: number;
  unit?: string;
  status?: string;
}

export interface ConversationParticipant {
  userId: string;
  name: string;
  role: string;
  photoUrl?: string;
}

export interface LastMessageSummary {
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  context?: ChatContextData;
  lastMessage?: LastMessageSummary;
  unreadCounts: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCard {
  type: ChatContextType;
  id: string;
  title: string;
  image: string;
  price: number;
  unit?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderPhoto?: string;
  recipientId: string;
  content: string;
  productCard?: ProductCard;
  isRead: boolean;
  createdAt: string;
}

export interface CreateConversationPayload {
  recipientId: string;
  context?: ChatContextData;
  initialMessage?: string;
}

export interface SendMessagePayload {
  content: string;
  productCard?: ProductCard;
}

export interface ChatUnreadCountResponse {
  unreadCount: number;
}
