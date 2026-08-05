package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type CommunityService struct {
	commRepo *repository.CommunityRepository
	userRepo *repository.UserRepository
}

func NewCommunityService(commRepo *repository.CommunityRepository, userRepo *repository.UserRepository) *CommunityService {
	return &CommunityService{
		commRepo: commRepo,
		userRepo: userRepo,
	}
}

// CreatePost creates a new discussion post.
func (s *CommunityService) CreatePost(ctx context.Context, authorID string, req models.CreatePostRequest) (*models.Post, error) {
	aOID, err := bson.ObjectIDFromHex(authorID)
	if err != nil {
		return nil, fmt.Errorf("invalid author ID: %w", err)
	}

	if req.Title == "" {
		return nil, errors.New("post title is required")
	}
	if req.Body == "" {
		return nil, errors.New("post body is required")
	}

	user, err := s.userRepo.FindByID(ctx, aOID)
	if err != nil {
		return nil, fmt.Errorf("fetch author info: %w", err)
	}

	category := req.Category
	if category == "" {
		category = models.PostCategoryGeneral
	}

	post := &models.Post{
		AuthorID:       aOID,
		AuthorName:     user.FirstName + " " + user.LastName,
		AuthorRole:     user.Role,
		AuthorPhotoUrl: user.PhotoURL,
		Title:          req.Title,
		Body:           req.Body,
		Category:       category,
		ImageUrl:       req.ImageUrl,
	}

	if err := s.commRepo.CreatePost(ctx, post); err != nil {
		return nil, err
	}
	return post, nil
}

// ListPosts fetches posts filtered by category.
func (s *CommunityService) ListPosts(ctx context.Context, category string, currentUserID string) ([]models.Post, error) {
	return s.commRepo.ListPosts(ctx, category, currentUserID)
}

// GetPostByID fetches a single post.
func (s *CommunityService) GetPostByID(ctx context.Context, postIDStr string, currentUserID string) (*models.Post, error) {
	pOID, err := bson.ObjectIDFromHex(postIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid post ID: %w", err)
	}
	return s.commRepo.GetPostByID(ctx, pOID, currentUserID)
}

// ToggleUpvote toggles an upvote on a post.
func (s *CommunityService) ToggleUpvote(ctx context.Context, postIDStr string, userIDStr string) (bool, error) {
	pOID, err := bson.ObjectIDFromHex(postIDStr)
	if err != nil {
		return false, fmt.Errorf("invalid post ID: %w", err)
	}
	uOID, err := bson.ObjectIDFromHex(userIDStr)
	if err != nil {
		return false, fmt.Errorf("invalid user ID: %w", err)
	}
	return s.commRepo.ToggleUpvote(ctx, pOID, uOID)
}

// CreateComment adds a comment/answer to a post.
func (s *CommunityService) CreateComment(ctx context.Context, authorID string, postIDStr string, req models.CreateCommentRequest) (*models.Comment, error) {
	aOID, err := bson.ObjectIDFromHex(authorID)
	if err != nil {
		return nil, fmt.Errorf("invalid author ID: %w", err)
	}
	pOID, err := bson.ObjectIDFromHex(postIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid post ID: %w", err)
	}

	if req.Body == "" {
		return nil, errors.New("comment text is required")
	}

	user, err := s.userRepo.FindByID(ctx, aOID)
	if err != nil {
		return nil, fmt.Errorf("fetch author info: %w", err)
	}

	comment := &models.Comment{
		PostID:         pOID,
		AuthorID:       aOID,
		AuthorName:     user.FirstName + " " + user.LastName,
		AuthorRole:     user.Role,
		AuthorPhotoUrl: user.PhotoURL,
		Body:           req.Body,
	}

	if err := s.commRepo.CreateComment(ctx, comment); err != nil {
		return nil, err
	}
	return comment, nil
}

// ListCommentsByPost fetches comments for a post thread.
func (s *CommunityService) ListCommentsByPost(ctx context.Context, postIDStr string) ([]models.Comment, error) {
	pOID, err := bson.ObjectIDFromHex(postIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid post ID: %w", err)
	}
	return s.commRepo.ListCommentsByPost(ctx, pOID)
}
