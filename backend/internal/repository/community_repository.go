package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/agriconnect/backend/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
	ErrPostNotFound    = errors.New("community post not found")
	ErrCommentNotFound = errors.New("comment not found")
)

type CommunityRepository struct {
	postColl    *mongo.Collection
	commentColl *mongo.Collection
}

func NewCommunityRepository(db *mongo.Database) *CommunityRepository {
	repo := &CommunityRepository{
		postColl:    db.Collection("community_posts"),
		commentColl: db.Collection("community_comments"),
	}
	repo.ensureIndexes()
	return repo
}

func (r *CommunityRepository) ensureIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, _ = r.postColl.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "category", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
		{Keys: bson.D{{Key: "is_removed", Value: 1}}},
	})

	_, _ = r.commentColl.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "post_id", Value: 1}}},
		{Keys: bson.D{{Key: "created_at", Value: 1}}},
	})
}

// CreatePost creates a new community discussion post.
func (r *CommunityRepository) CreatePost(ctx context.Context, post *models.Post) error {
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()
	post.Upvotes = 0
	post.CommentsCount = 0
	post.IsFlagged = false
	post.IsRemoved = false
	post.UpvotedBy = []bson.ObjectID{}

	res, err := r.postColl.InsertOne(ctx, post)
	if err != nil {
		return fmt.Errorf("insert post: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		post.ID = oid
	}
	return nil
}

// ListPosts retrieves community posts filtered by category.
func (r *CommunityRepository) ListPosts(ctx context.Context, category string, currentUserID string) ([]models.Post, error) {
	query := bson.M{"is_removed": false}
	if category != "" && category != "all" {
		query["category"] = category
	}

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.postColl.Find(ctx, query, opts)
	if err != nil {
		return nil, fmt.Errorf("find posts: %w", err)
	}
	defer cursor.Close(ctx)

	var posts []models.Post
	if err := cursor.All(ctx, &posts); err != nil {
		return nil, fmt.Errorf("decode posts: %w", err)
	}
	if posts == nil {
		posts = []models.Post{}
	}

	// Check if current user upvoted
	var userOID bson.ObjectID
	if currentUserID != "" {
		userOID, _ = bson.ObjectIDFromHex(currentUserID)
	}

	for i := range posts {
		if !userOID.IsZero() {
			for _, uID := range posts[i].UpvotedBy {
				if uID == userOID {
					posts[i].IsUpvotedByMe = true
					break
				}
			}
		}
	}

	return posts, nil
}

// GetPostByID fetches a single post by ID.
func (r *CommunityRepository) GetPostByID(ctx context.Context, id bson.ObjectID, currentUserID string) (*models.Post, error) {
	var post models.Post
	err := r.postColl.FindOne(ctx, bson.M{"_id": id, "is_removed": false}).Decode(&post)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrPostNotFound
		}
		return nil, fmt.Errorf("find post by id: %w", err)
	}

	if currentUserID != "" {
		if userOID, err := bson.ObjectIDFromHex(currentUserID); err == nil {
			for _, uID := range post.UpvotedBy {
				if uID == userOID {
					post.IsUpvotedByMe = true
					break
				}
			}
		}
	}

	return &post, nil
}

// ToggleUpvote toggles user upvote on a post.
func (r *CommunityRepository) ToggleUpvote(ctx context.Context, postID bson.ObjectID, userID bson.ObjectID) (bool, error) {
	post, err := r.GetPostByID(ctx, postID, "")
	if err != nil {
		return false, err
	}

	alreadyUpvoted := false
	for _, id := range post.UpvotedBy {
		if id == userID {
			alreadyUpvoted = true
			break
		}
	}

	var update bson.M
	nowUpvoted := false

	if alreadyUpvoted {
		update = bson.M{
			"$pull": bson.M{"upvoted_by": userID},
			"$inc":  bson.M{"upvotes": -1},
		}
		nowUpvoted = false
	} else {
		update = bson.M{
			"$addToSet": bson.M{"upvoted_by": userID},
			"$inc":      bson.M{"upvotes": 1},
		}
		nowUpvoted = true
	}

	_, err = r.postColl.UpdateOne(ctx, bson.M{"_id": postID}, update)
	if err != nil {
		return false, fmt.Errorf("toggle upvote: %w", err)
	}

	return nowUpvoted, nil
}

// CreateComment creates a new comment on a post.
func (r *CommunityRepository) CreateComment(ctx context.Context, comment *models.Comment) error {
	comment.CreatedAt = time.Now()
	comment.UpdatedAt = time.Now()
	comment.IsFlagged = false
	comment.IsRemoved = false

	res, err := r.commentColl.InsertOne(ctx, comment)
	if err != nil {
		return fmt.Errorf("insert comment: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		comment.ID = oid
	}

	// Increment post comments_count
	_, _ = r.postColl.UpdateOne(ctx, bson.M{"_id": comment.PostID}, bson.M{"$inc": bson.M{"comments_count": 1}})

	return nil
}

// ListCommentsByPost retrieves comments for a post in chronological order.
func (r *CommunityRepository) ListCommentsByPost(ctx context.Context, postID bson.ObjectID) ([]models.Comment, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: 1}})
	cursor, err := r.commentColl.Find(ctx, bson.M{"post_id": postID, "is_removed": false}, opts)
	if err != nil {
		return nil, fmt.Errorf("find comments: %w", err)
	}
	defer cursor.Close(ctx)

	var comments []models.Comment
	if err := cursor.All(ctx, &comments); err != nil {
		return nil, fmt.Errorf("decode comments: %w", err)
	}
	if comments == nil {
		comments = []models.Comment{}
	}
	return comments, nil
}
