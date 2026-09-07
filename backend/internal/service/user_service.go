package service

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// UserService handles user profile business logic.
type UserService struct {
	repo      *repository.UserRepository
	uploadDir string
}

// NewUserService creates a new UserService.
func NewUserService(repo *repository.UserRepository, uploadDir string) *UserService {
	// Ensure the upload directory exists
	_ = os.MkdirAll(uploadDir, os.ModePerm)
	return &UserService{repo: repo, uploadDir: uploadDir}
}

// GetProfile retrieves a user profile by ID.
func (s *UserService) GetProfile(ctx context.Context, userID string) (*models.User, error) {
	oid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}
	return s.repo.FindByID(ctx, oid)
}

// UpdateProfile updates the user's profile fields.
func (s *UserService) UpdateProfile(ctx context.Context, userID string, req models.UpdateProfileRequest) (*models.User, error) {
	oid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	existingUser, err := s.repo.FindByID(ctx, oid)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	update := bson.M{}
	if req.FirstName != nil {
		update["first_name"] = *req.FirstName
	}
	if req.LastName != nil {
		update["last_name"] = *req.LastName
	}
	if req.Phone != nil {
		update["phone"] = *req.Phone
	}

	// LGU Staff jurisdiction (Region, Province, Municipality) is locked to prevent data leaks.
	// Barangay is explicitly excluded/cleared for LGU Staff since their jurisdiction covers the entire Municipality.
	if existingUser.Role == models.RoleLGUStaff {
		update["barangay"] = "" // LGU Staff represents the entire Municipality, no specific barangay
	} else {
		if req.Region != nil {
			update["region"] = *req.Region
		}
		if req.Province != nil {
			update["province"] = *req.Province
		}
		if req.Municipality != nil {
			update["municipality"] = *req.Municipality
		}
		if req.Barangay != nil {
			update["barangay"] = *req.Barangay
		}
	}

	if req.Address != nil {
		update["address"] = *req.Address
	}

	if len(update) == 0 {
		return s.repo.FindByID(ctx, oid)
	}

	if err := s.repo.Update(ctx, oid, update); err != nil {
		return nil, err
	}

	return s.repo.FindByID(ctx, oid)
}

// UploadPhoto saves a profile photo to disk and updates the user's photo URL.
func (s *UserService) UploadPhoto(ctx context.Context, userID string, filename string, file io.Reader) (*models.User, error) {
	oid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	// Generate unique filename
	ext := filepath.Ext(filename)
	if ext == "" {
		ext = ".jpg"
	}
	newName := fmt.Sprintf("%s_%d%s", userID, time.Now().UnixNano(), strings.ToLower(ext))
	savePath := filepath.Join(s.uploadDir, newName)

	// Save file to disk
	dst, err := os.Create(savePath)
	if err != nil {
		return nil, fmt.Errorf("create file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return nil, fmt.Errorf("save file: %w", err)
	}

	// Update user record
	photoURL := "/uploads/" + newName
	if err := s.repo.Update(ctx, oid, bson.M{"photo_url": photoURL}); err != nil {
		return nil, err
	}

	return s.repo.FindByID(ctx, oid)
}

// ChangePassword verifies the current password and updates to the new one.
func (s *UserService) ChangePassword(ctx context.Context, userID string, req models.ChangePasswordRequest) error {
	if req.CurrentPassword == "" || req.NewPassword == "" {
		return errors.New("current password and new password are required")
	}
	if len(req.NewPassword) < 8 {
		return errors.New("new password must be at least 8 characters")
	}

	oid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}

	user, err := s.repo.FindByID(ctx, oid)
	if err != nil {
		return err
	}

	// Verify current password
	if !CheckPassword(req.CurrentPassword, user.Password) {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	hashed, err := HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	return s.repo.Update(ctx, oid, bson.M{"password": hashed})
}
