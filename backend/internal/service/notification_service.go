package service

import (
	"context"
	"fmt"

	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/repository"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type NotificationService struct {
	repo *repository.NotificationRepository
}

func NewNotificationService(repo *repository.NotificationRepository) *NotificationService {
	return &NotificationService{repo: repo}
}

// CreateNotification sends a notification to a specific user.
func (s *NotificationService) CreateNotification(ctx context.Context, userID bson.ObjectID, title, message string, notifType models.NotificationType, link string) error {
	notif := &models.Notification{
		UserID:  userID,
		Title:   title,
		Message: message,
		Type:    notifType,
		Link:    link,
	}
	return s.repo.CreateNotification(ctx, notif)
}

// ListUserNotifications fetches recent notifications for a user.
func (s *NotificationService) ListUserNotifications(ctx context.Context, userIDStr string) ([]models.Notification, error) {
	uOID, err := bson.ObjectIDFromHex(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}
	return s.repo.ListUserNotifications(ctx, uOID, 30)
}

// GetUnreadCount returns the count of unread notifications for a user.
func (s *NotificationService) GetUnreadCount(ctx context.Context, userIDStr string) (int, error) {
	uOID, err := bson.ObjectIDFromHex(userIDStr)
	if err != nil {
		return 0, fmt.Errorf("invalid user ID: %w", err)
	}
	return s.repo.GetUnreadCount(ctx, uOID)
}

// MarkAsRead marks a specific notification as read.
func (s *NotificationService) MarkAsRead(ctx context.Context, userIDStr string, notifIDStr string) error {
	uOID, err := bson.ObjectIDFromHex(userIDStr)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}
	nOID, err := bson.ObjectIDFromHex(notifIDStr)
	if err != nil {
		return fmt.Errorf("invalid notification ID: %w", err)
	}
	return s.repo.MarkAsRead(ctx, uOID, nOID)
}

// MarkAllAsRead marks all notifications as read for a user.
func (s *NotificationService) MarkAllAsRead(ctx context.Context, userIDStr string) error {
	uOID, err := bson.ObjectIDFromHex(userIDStr)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}
	return s.repo.MarkAllAsRead(ctx, uOID)
}
