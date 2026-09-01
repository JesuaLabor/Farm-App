package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type NotificationType string

const (
	NotifTypeOrderStatus    NotificationType = "order_status"
	NotifTypePaymentStatus  NotificationType = "payment_status"
	NotifTypeProduceInquiry NotificationType = "produce_inquiry"
	NotifTypeCommunityReply NotificationType = "community_reply"
	NotifTypeSystem         NotificationType = "system"
)

// Notification represents an in-app notification sent to a user.
type Notification struct {
	ID        bson.ObjectID    `bson:"_id,omitempty" json:"id"`
	UserID    bson.ObjectID    `bson:"user_id"        json:"userId"`
	Title     string           `bson:"title"          json:"title"`
	Message   string           `bson:"message"        json:"message"`
	Type      NotificationType `bson:"type"           json:"type"`
	Link      string           `bson:"link,omitempty" json:"link,omitempty"`
	IsRead    bool             `bson:"is_read"        json:"isRead"`
	CreatedAt time.Time        `bson:"created_at"     json:"createdAt"`
}

type NotificationUnreadCountResponse struct {
	UnreadCount int `json:"unreadCount"`
}
