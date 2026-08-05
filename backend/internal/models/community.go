package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type PostCategory string

const (
	PostCategoryGeneral     PostCategory = "general"
	PostCategoryCropAdvice  PostCategory = "crop_advice"
	PostCategoryPestControl PostCategory = "pest_control"
	PostCategoryMarketTalk  PostCategory = "market_talk"
	PostCategoryEquipment   PostCategory = "equipment"
)

// Post represents a community discussion post.
type Post struct {
	ID             bson.ObjectID   `bson:"_id,omitempty"       json:"id"`
	AuthorID       bson.ObjectID   `bson:"author_id"           json:"authorId"`
	AuthorName     string          `bson:"author_name"         json:"authorName"`
	AuthorRole     Role            `bson:"author_role"         json:"authorRole"`
	AuthorPhotoUrl string          `bson:"author_photo_url"    json:"authorPhotoUrl,omitempty"`
	Title          string          `bson:"title"               json:"title"`
	Body           string          `bson:"body"                json:"body"`
	Category       PostCategory    `bson:"category"            json:"category"`
	ImageUrl       string          `bson:"image_url,omitempty" json:"imageUrl,omitempty"`
	Upvotes        int             `bson:"upvotes"             json:"upvotes"`
	UpvotedBy      []bson.ObjectID `bson:"upvoted_by"          json:"upvotedBy,omitempty"`
	CommentsCount  int             `bson:"comments_count"      json:"commentsCount"`
	IsFlagged      bool            `bson:"is_flagged"          json:"isFlagged"`
	IsRemoved      bool            `bson:"is_removed"          json:"isRemoved"`
	CreatedAt      time.Time       `bson:"created_at"          json:"createdAt"`
	UpdatedAt      time.Time       `bson:"updated_at"          json:"updatedAt"`

	// Helper for frontend state
	IsUpvotedByMe  bool            `bson:"-"                   json:"isUpvotedByMe,omitempty"`
}

// Comment represents a reply/answer on a community post.
type Comment struct {
	ID             bson.ObjectID `bson:"_id,omitempty"       json:"id"`
	PostID         bson.ObjectID `bson:"post_id"             json:"postId"`
	AuthorID       bson.ObjectID `bson:"author_id"           json:"authorId"`
	AuthorName     string        `bson:"author_name"         json:"authorName"`
	AuthorRole     Role          `bson:"author_role"         json:"authorRole"`
	AuthorPhotoUrl string        `bson:"author_photo_url"    json:"authorPhotoUrl,omitempty"`
	Body           string        `bson:"body"                json:"body"`
	IsFlagged      bool          `bson:"is_flagged"          json:"isFlagged"`
	IsRemoved      bool          `bson:"is_removed"          json:"isRemoved"`
	CreatedAt      time.Time     `bson:"created_at"          json:"createdAt"`
	UpdatedAt      time.Time     `bson:"updated_at"          json:"updatedAt"`
}

// CreatePostRequest payload
type CreatePostRequest struct {
	Title    string       `json:"title"`
	Body     string       `json:"body"`
	Category PostCategory `json:"category"`
	ImageUrl string       `json:"imageUrl,omitempty"`
}

// CreateCommentRequest payload
type CreateCommentRequest struct {
	Body string `json:"body"`
}
