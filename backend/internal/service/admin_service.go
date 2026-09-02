package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// AdminService manages admin operations such as user approvals and listings.
type AdminService struct {
	userRepo *repository.UserRepository
}

// NewAdminService creates a new AdminService.
func NewAdminService(userRepo *repository.UserRepository) *AdminService {
	return &AdminService{userRepo: userRepo}
}

// ListUsers retrieves accounts based on requester permissions and filters.
func (s *AdminService) ListUsers(ctx context.Context, requesterID string, roleFilter, statusFilter, regionFilter, provinceFilter, municipalityFilter, barangayFilter string) ([]models.User, error) {
	reqOID, err := bson.ObjectIDFromHex(requesterID)
	if err != nil {
		return nil, errors.New("invalid requester ID")
	}

	requester, err := s.userRepo.FindByID(ctx, reqOID)
	if err != nil {
		return nil, fmt.Errorf("requester not found: %w", err)
	}

	filter := bson.M{}

	if requester.Role == models.RoleSuperAdmin {
		// Super Admin can filter by role, status, region, province, municipality, barangay
		if roleFilter != "" && roleFilter != "all" {
			filter["role"] = roleFilter
		}
		if statusFilter != "" && statusFilter != "all" {
			filter["status"] = statusFilter
		}
		if regionFilter != "" && regionFilter != "all" {
			filter["region"] = regionFilter
		}
		if provinceFilter != "" && provinceFilter != "all" {
			filter["province"] = provinceFilter
		}
		if municipalityFilter != "" && municipalityFilter != "all" {
			filter["municipality"] = municipalityFilter
		}
		if barangayFilter != "" && barangayFilter != "all" {
			filter["barangay"] = barangayFilter
		}
		// Don't list super_admin accounts in approval management
		if roleFilter == "" || roleFilter == "all" {
			filter["role"] = bson.M{"$ne": models.RoleSuperAdmin}
		}
	} else if requester.Role == models.RoleLGUStaff {
		// LGU Staff can only see users in their region (and province/municipality if assigned)
		if requester.Region == "" {
			return nil, errors.New("LGU Staff account has no region assigned")
		}

		filter["region"] = requester.Region
		if requester.Province != "" {
			filter["province"] = requester.Province
		} else if provinceFilter != "" && provinceFilter != "all" {
			filter["province"] = provinceFilter
		}

		if requester.Municipality != "" {
			filter["municipality"] = requester.Municipality
		} else if municipalityFilter != "" && municipalityFilter != "all" {
			filter["municipality"] = municipalityFilter
		}

		if barangayFilter != "" && barangayFilter != "all" {
			filter["barangay"] = barangayFilter
		}

		if roleFilter != "" && roleFilter != "all" {
			// Prevent LGU Staff from requesting lgu_staff or super_admin lists
			if roleFilter == string(models.RoleLGUStaff) || roleFilter == string(models.RoleSuperAdmin) {
				return nil, errors.New("insufficient permissions to view staff accounts")
			}
			filter["role"] = roleFilter
		} else {
			// Only show farmer, buyer, supplier, expert
			filter["role"] = bson.M{"$in": []models.Role{
				models.RoleFarmer,
				models.RoleBuyer,
				models.RoleSupplier,
				models.RoleExpert,
			}}
		}

		if statusFilter != "" && statusFilter != "all" {
			filter["status"] = statusFilter
		}
	} else {
		return nil, errors.New("insufficient permissions")
	}

	return s.userRepo.FindUsers(ctx, filter)
}

// ApproveUser approves a target user account if the requester is authorized.
func (s *AdminService) ApproveUser(ctx context.Context, requesterID string, targetUserID string) error {
	return s.updateUserApprovalStatus(ctx, requesterID, targetUserID, models.StatusApproved)
}

// RejectUser rejects a target user account if the requester is authorized.
func (s *AdminService) RejectUser(ctx context.Context, requesterID string, targetUserID string) error {
	return s.updateUserApprovalStatus(ctx, requesterID, targetUserID, models.StatusRejected)
}

func (s *AdminService) updateUserApprovalStatus(ctx context.Context, requesterID string, targetUserID string, newStatus string) error {
	reqOID, err := bson.ObjectIDFromHex(requesterID)
	if err != nil {
		return errors.New("invalid requester ID")
	}

	targetOID, err := bson.ObjectIDFromHex(targetUserID)
	if err != nil {
		return errors.New("invalid target user ID")
	}

	requester, err := s.userRepo.FindByID(ctx, reqOID)
	if err != nil {
		return fmt.Errorf("requester user not found: %w", err)
	}

	target, err := s.userRepo.FindByID(ctx, targetOID)
	if err != nil {
		return fmt.Errorf("target user not found: %w", err)
	}

	// Authorization checks
	if requester.Role == models.RoleSuperAdmin {
		// Super Admin can approve/reject any user
		return s.userRepo.UpdateStatus(ctx, targetOID, newStatus)
	} else if requester.Role == models.RoleLGUStaff {
		// LGU Staff can only manage users in their specific LGU region
		if requester.Region == "" || !strings.EqualFold(strings.TrimSpace(requester.Region), strings.TrimSpace(target.Region)) {
			return errors.New("cannot manage users outside of your assigned LGU region")
		}

		// LGU Staff cannot manage other LGU Staff or Super Admin accounts
		if target.Role == models.RoleLGUStaff || target.Role == models.RoleSuperAdmin {
			return errors.New("LGU Staff cannot modify staff or admin account status")
		}

		return s.userRepo.UpdateStatus(ctx, targetOID, newStatus)
	}

	return errors.New("insufficient permissions")
}
