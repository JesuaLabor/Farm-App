package repository

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/agriconnect/backend/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// ErrUserNotFound is returned when a user lookup finds no results.
var ErrUserNotFound = errors.New("user not found")

// ErrDuplicateEmail is returned when an insert violates the unique email index.
var ErrDuplicateEmail = errors.New("email already registered")

// UserRepository handles all user-related database operations.
type UserRepository struct {
	coll *mongo.Collection
}

// NewUserRepository creates a new UserRepository and ensures indexes.
func NewUserRepository(coll *mongo.Collection) *UserRepository {
	repo := &UserRepository{coll: coll}
	repo.ensureIndexes()
	return repo
}

// ensureIndexes creates the unique index on the email field.
func (r *UserRepository) ensureIndexes() {
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, _ = r.coll.Indexes().CreateOne(ctx, indexModel)
}

// Create inserts a new user into the database.
func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	_, err := r.coll.InsertOne(ctx, user)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return ErrDuplicateEmail
		}
		return fmt.Errorf("insert user: %w", err)
	}
	return nil
}

// FindByEmail looks up a user by email address (case-insensitive).
func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	trimmed := strings.ToLower(strings.TrimSpace(email))
	var user models.User
	// Case-insensitive regex matching for email lookup
	pattern := bson.M{"$regex": "^" + regexp.QuoteMeta(trimmed) + "$", "$options": "i"}
	err := r.coll.FindOne(ctx, bson.M{"email": pattern}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("find user by email: %w", err)
	}
	return &user, nil
}

// FindByID looks up a user by ObjectID.
func (r *UserRepository) FindByID(ctx context.Context, id bson.ObjectID) (*models.User, error) {
	var user models.User
	err := r.coll.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("find user by id: %w", err)
	}
	return &user, nil
}

// Update performs a partial update on the user document.
func (r *UserRepository) Update(ctx context.Context, id bson.ObjectID, update bson.M) error {
	update["updated_at"] = time.Now()
	result, err := r.coll.UpdateByID(ctx, id, bson.M{"$set": update})
	if err != nil {
		return fmt.Errorf("update user: %w", err)
	}
	if result.MatchedCount == 0 {
		return ErrUserNotFound
	}
	return nil
}

// FindUsers returns users matching a BSON filter query, sorted by created_at descending.
func (r *UserRepository) FindUsers(ctx context.Context, filter bson.M) ([]models.User, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.coll.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("find users: %w", err)
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
		return nil, fmt.Errorf("decode users: %w", err)
	}
	if users == nil {
		users = []models.User{}
	}
	return users, nil
}

// UpdateStatus updates the status and is_verified fields for a user.
func (r *UserRepository) UpdateStatus(ctx context.Context, id bson.ObjectID, status string) error {
	isVerified := status == models.StatusApproved
	return r.Update(ctx, id, bson.M{
		"status":      status,
		"is_verified": isVerified,
	})
}

