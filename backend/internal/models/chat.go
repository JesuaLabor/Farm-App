package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type ChatContextType string

const (
	ChatContextProduce     ChatContextType = "produce"
	ChatContextSupply      ChatContextType = "supply"
	ChatContextTransaction ChatContextType = "produce_order"
	ChatContextSupplyOrder ChatContextType = "supply_order"
	ChatContextGeneral     ChatContextType = "general"
)

// ChatContext captures the item (crop listing, supply product, or order) being discussed.
type ChatContext struct {
	Type        ChatContextType `bson:"type"                   json:"type"`
	ReferenceID string          `bson:"reference_id,omitempty" json:"referenceId,omitempty"`
	Title       string          `bson:"title,omitempty"        json:"title,omitempty"`
	Image       string          `bson:"image,omitempty"        json:"image,omitempty"`
	Price       float64         `bson:"price,omitempty"        json:"price,omitempty"`
	Unit        string          `bson:"unit,omitempty"         json:"unit,omitempty"`
	Status      string          `bson:"status,omitempty"       json:"status,omitempty"`
}

// ConversationParticipant holds cached profile information of a user in the chat.
type ConversationParticipant struct {
	UserID   bson.ObjectID `bson:"user_id"             json:"userId"`
	Name     string        `bson:"name"                json:"name"`
	Role     Role          `bson:"role"                json:"role"`
	PhotoURL string        `bson:"photo_url,omitempty" json:"photoUrl,omitempty"`
}

// LastMessageSummary is stored on Conversation for rapid inbox rendering.
type LastMessageSummary struct {
	SenderID  bson.ObjectID `bson:"sender_id"  json:"senderId"`
	Content   string        `bson:"content"    json:"content"`
	CreatedAt time.Time     `bson:"created_at" json:"createdAt"`
}

// Conversation represents a direct chat thread between two users.
type Conversation struct {
	ID             bson.ObjectID             `bson:"_id,omitempty"       json:"id"`
	ParticipantIDs []bson.ObjectID           `bson:"participant_ids"      json:"participantIds"`
	Participants   []ConversationParticipant `bson:"participants"         json:"participants"`
	Context        *ChatContext              `bson:"context,omitempty"   json:"context,omitempty"`
	LastMessage    *LastMessageSummary       `bson:"last_message,omitempty" json:"lastMessage,omitempty"`
	UnreadCounts   map[string]int            `bson:"unread_counts"       json:"unreadCounts"` // key: UserID.Hex() -> count
	CreatedAt      time.Time                 `bson:"created_at"          json:"createdAt"`
	UpdatedAt      time.Time                 `bson:"updated_at"          json:"updatedAt"`
}

// ProductCard can be attached to a specific chat message (e.g., when clicking "Chat Now" on an item).
type ProductCard struct {
	Type  ChatContextType `bson:"type"  json:"type"`
	ID    string          `bson:"id"    json:"id"`
	Title string          `bson:"title" json:"title"`
	Image string          `bson:"image" json:"image"`
	Price float64         `bson:"price" json:"price"`
	Unit  string          `bson:"unit"  json:"unit"`
}

// ChatMessage represents a single message inside a conversation.
type ChatMessage struct {
	ID             bson.ObjectID  `bson:"_id,omitempty"          json:"id"`
	ConversationID bson.ObjectID  `bson:"conversation_id"        json:"conversationId"`
	SenderID       bson.ObjectID  `bson:"sender_id"              json:"senderId"`
	SenderName     string         `bson:"sender_name"            json:"senderName"`
	SenderRole     Role           `bson:"sender_role"            json:"senderRole"`
	SenderPhoto    string         `bson:"sender_photo,omitempty" json:"senderPhoto,omitempty"`
	RecipientID    bson.ObjectID  `bson:"recipient_id"          json:"recipientId"`
	Content        string         `bson:"content"                json:"content"`
	ProductCard    *ProductCard   `bson:"product_card,omitempty" json:"productCard,omitempty"`
	IsRead         bool           `bson:"is_read"                json:"isRead"`
	CreatedAt      time.Time      `bson:"created_at"             json:"createdAt"`
}

// CreateConversationRequest is the request payload to initiate or find a chat.
type CreateConversationRequest struct {
	RecipientID    string       `json:"recipientId"`
	Context        *ChatContext `json:"context,omitempty"`
	InitialMessage string       `json:"initialMessage,omitempty"`
}

// SendChatMessageRequest is the payload to send a new message in an active conversation.
type SendChatMessageRequest struct {
	Content     string       `json:"content"`
	ProductCard *ProductCard `json:"productCard,omitempty"`
}

// ChatUnreadCountResponse is the response for total unread chat messages.
type ChatUnreadCountResponse struct {
	UnreadCount int `json:"unreadCount"`
}
