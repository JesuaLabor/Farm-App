package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/agriconnect/backend/internal/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type NotificationRepository struct {
	db    *mongo.Database
	coll *mongo.Collection
}

func NewNotificationRepository(db *mongo.Database) *NotificationRepository {
	return &NotificationRepository{
		db:   db,
		coll: db.Collection("notifications"),
	}
}

// CreateNotification inserts a new notification for a user.
func (r *NotificationRepository) CreateNotification(ctx context.Context, notif *models.Notification) error {
	notif.ID = bson.NewObjectID()
	notif.CreatedAt = time.Now()
	notif.IsRead = false

	_, err := r.coll.InsertOne(ctx, notif)
	if err != nil {
		return fmt.Errorf("create notification: %w", err)
	}
	return nil
}

// ListUserNotifications returns notifications for a specific user, newest first.
func (r *NotificationRepository) ListUserNotifications(ctx context.Context, userID bson.ObjectID, limit int) ([]models.Notification, error) {
	if limit <= 0 {
		limit = 30
	}
	opts := options.Find().SetSort(bson.M{"created_at": -1}).SetLimit(int64(limit))
	cursor, err := r.coll.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, fmt.Errorf("list notifications: %w", err)
	}
	defer cursor.Close(ctx)

	var notifications []models.Notification
	if err := cursor.All(ctx, &notifications); err != nil {
		return nil, fmt.Errorf("decode notifications: %w", err)
	}
	if notifications == nil {
		notifications = []models.Notification{}
	}
	return notifications, nil
}

// GetUnreadCount returns the count of unread notifications for a user.
func (r *NotificationRepository) GetUnreadCount(ctx context.Context, userID bson.ObjectID) (int, error) {
	count, err := r.coll.CountDocuments(ctx, bson.M{"user_id": userID, "is_read": false})
	if err != nil {
		return 0, fmt.Errorf("count unread notifications: %w", err)
	}
	return int(count), nil
}

// MarkAsRead marks a specific notification as read.
func (r *NotificationRepository) MarkAsRead(ctx context.Context, userID bson.ObjectID, notifID bson.ObjectID) error {
	filter := bson.M{"_id": notifID, "user_id": userID}
	update := bson.M{"$set": bson.M{"is_read": true}}
	_, err := r.coll.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("mark notification read: %w", err)
	}
	return nil
}

// MarkAllAsRead marks all notifications for a user as read.
func (r *NotificationRepository) MarkAllAsRead(ctx context.Context, userID bson.ObjectID) error {
	filter := bson.M{"user_id": userID, "is_read": false}
	update := bson.M{"$set": bson.M{"is_read": true}}
	_, err := r.coll.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("mark all notifications read: %w", err)
	}
	return nil
}
