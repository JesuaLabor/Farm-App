package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// AuthService handles authentication business logic.
type AuthService struct {
	repo      *repository.UserRepository
	jwtSecret []byte
	jwtExpiry time.Duration
}

// NewAuthService creates a new AuthService.
func NewAuthService(repo *repository.UserRepository, jwtSecret string, jwtExpiryHrs int) *AuthService {
	return &AuthService{
		repo:      repo,
		jwtSecret: []byte(jwtSecret),
		jwtExpiry: time.Duration(jwtExpiryHrs) * time.Hour,
	}
}

// Register creates a new user account and returns an AuthResponse.
func (s *AuthService) Register(ctx context.Context, req models.RegisterRequest) (*models.AuthResponse, error) {
	// Validate inputs
	if req.Email == "" {
		return nil, errors.New("email is required")
	}
	if len(req.Password) < 8 {
		return nil, errors.New("password must be at least 8 characters")
	}
	if !models.IsValidRole(req.Role) {
		return nil, errors.New("invalid role")
	}
	if req.FirstName == "" || req.LastName == "" {
		return nil, errors.New("first name and last name are required")
	}

	// Determine status and verification
	status := models.StatusPending
	isVerified := false
	if req.Role == models.RoleSuperAdmin {
		status = models.StatusApproved
		isVerified = true
	}

	// Hash password
	hashed, err := HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	user := &models.User{
		Email:        req.Email,
		Password:     hashed,
		Role:         req.Role,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Region:       req.Region,
		Province:     req.Province,
		Municipality: req.Municipality,
		Barangay:     req.Barangay,
		Status:       status,
		IsVerified:   isVerified,
	}

	if err := s.repo.Create(ctx, user); err != nil {
		if errors.Is(err, repository.ErrDuplicateEmail) {
			return nil, errors.New("email already registered")
		}
		return nil, err
	}

	// Fetch the created user to get the generated ID
	created, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	// If pending approval, return response without token
	if created.Status != models.StatusApproved {
		return &models.AuthResponse{Token: "", User: *created}, nil
	}

	token, err := s.GenerateToken(created.ID.Hex(), string(created.Role))
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{Token: token, User: *created}, nil
}

// Login authenticates a user and returns a JWT if approved.
func (s *AuthService) Login(ctx context.Context, req models.LoginRequest) (*models.AuthResponse, error) {
	if req.Email == "" || req.Password == "" {
		return nil, errors.New("email and password are required")
	}

	user, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, errors.New("invalid email or password")
		}
		return nil, err
	}

	if !CheckPassword(req.Password, user.Password) {
		return nil, errors.New("invalid email or password")
	}

	// Check status
	if user.Status == models.StatusPending {
		if user.Role == models.RoleLGUStaff {
			return nil, errors.New("Your LGU Staff account is pending approval by the Super Admin.")
		}
		return nil, errors.New("Your account is pending approval by your LGU Staff.")
	}

	if user.Status == models.StatusRejected {
		return nil, errors.New("Your account registration request has been rejected.")
	}

	token, err := s.GenerateToken(user.ID.Hex(), string(user.Role))
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{Token: token, User: *user}, nil
}

// SeedSuperAdmin creates a default Super Admin account if no Super Admin exists.
func (s *AuthService) SeedSuperAdmin(ctx context.Context) error {
	existing, err := s.repo.FindByEmail(ctx, "superadmin@agriconnect.gov.ph")
	if err == nil && existing != nil {
		return nil
	}

	hashed, err := HashPassword("SuperAdmin123!")
	if err != nil {
		return fmt.Errorf("seed super admin hash: %w", err)
	}

	admin := &models.User{
		Email:      "superadmin@agriconnect.gov.ph",
		Password:   hashed,
		Role:       models.RoleSuperAdmin,
		FirstName:  "Super",
		LastName:   "Admin",
		Region:     "Central Office",
		Status:     models.StatusApproved,
		IsVerified: true,
	}

	if err := s.repo.Create(ctx, admin); err != nil {
		if errors.Is(err, repository.ErrDuplicateEmail) {
			return nil
		}
		return fmt.Errorf("seed super admin insert: %w", err)
	}

	return nil
}

// GenerateToken creates a signed JWT with user claims.
func (s *AuthService) GenerateToken(userID, role string) (string, error) {
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"exp":  time.Now().Add(s.jwtExpiry).Unix(),
		"iat":  time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

// HashPassword hashes a plaintext password using bcrypt.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword compares a plaintext password with a bcrypt hash.
func CheckPassword(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
