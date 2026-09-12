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
		// LGU Staff can ONLY see users in their assigned Municipality & Region.
		// Never allow client query parameters to override the officer's assigned jurisdiction.
		region := requester.Region
		if region == "" {
			region = "Region X - Northern Mindanao"
		}
		filter["region"] = region

		if requester.Province != "" {
			filter["province"] = requester.Province
		}

		if requester.Municipality != "" {
			filter["municipality"] = requester.Municipality
		}

		// LGU Staff governs the whole Municipality, but can optionally filter by barangay within their town
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
			// Only show farmer, buyer, supplier
			filter["role"] = bson.M{"$in": []models.Role{
				models.RoleFarmer,
				models.RoleBuyer,
				models.RoleSupplier,
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

// ApproveUser approves a pending target user account if the requester is authorized.
// Only pending accounts may be approved.
func (s *AdminService) ApproveUser(ctx context.Context, requesterID string, targetUserID string) error {
	return s.changeStatus(ctx, requesterID, targetUserID, models.StatusApproved)
}

// RejectUser permanently rejects a pending or suspended target user account.
// Approved accounts cannot be directly rejected — they must be suspended first.
func (s *AdminService) RejectUser(ctx context.Context, requesterID string, targetUserID string) error {
	return s.changeStatus(ctx, requesterID, targetUserID, models.StatusRejected)
}

// SuspendUser suspends an approved account, blocking login.
// Super Admin can suspend any non-super-admin account.
// LGU Staff can only suspend farmer/buyer/supplier accounts in their jurisdiction.
func (s *AdminService) SuspendUser(ctx context.Context, requesterID string, targetUserID string) error {
	return s.changeStatus(ctx, requesterID, targetUserID, models.StatusSuspended)
}

// UnsuspendUser reinstates a suspended account back to approved status.
func (s *AdminService) UnsuspendUser(ctx context.Context, requesterID string, targetUserID string) error {
	return s.changeStatus(ctx, requesterID, targetUserID, models.StatusApproved)
}

// changeStatus is the unified authorization + state-machine enforcement for all status transitions.
func (s *AdminService) changeStatus(ctx context.Context, requesterID, targetUserID, newStatus string) error {
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

	// ── Role-based target access checks ───────────────────────────────────────
	if requester.Role == models.RoleSuperAdmin {
		// Super Admin cannot act on other Super Admins
		if target.Role == models.RoleSuperAdmin {
			return errors.New("Super Admin accounts cannot be managed by other admins")
		}
	} else if requester.Role == models.RoleLGUStaff {
		// LGU Staff can only manage farmer, buyer, supplier — never LGU Staff or Super Admin
		if target.Role == models.RoleLGUStaff || target.Role == models.RoleSuperAdmin {
			return errors.New("LGU Staff cannot modify staff or admin account status")
		}
		// Must be within the same jurisdiction
		if requester.Region == "" || !strings.EqualFold(strings.TrimSpace(requester.Region), strings.TrimSpace(target.Region)) {
			return errors.New("cannot manage users outside of your assigned LGU region")
		}
	} else {
		return errors.New("insufficient permissions")
	}

	// ── State-machine transition validation ────────────────────────────────────
	currentStatus := target.Status

	switch newStatus {
	case models.StatusApproved:
		// Approve: only from pending
		// Unsuspend: only from suspended
		if currentStatus != models.StatusPending && currentStatus != models.StatusSuspended {
			return fmt.Errorf("cannot approve an account with status '%s'", currentStatus)
		}

	case models.StatusRejected:
		// Reject: only from pending or suspended — not directly from approved
		if currentStatus == models.StatusApproved {
			return errors.New("approved accounts cannot be rejected directly — suspend the account first")
		}
		if currentStatus == models.StatusRejected {
			return errors.New("account is already rejected")
		}

	case models.StatusSuspended:
		// Suspend: only approved accounts
		if currentStatus != models.StatusApproved {
			return fmt.Errorf("only approved accounts can be suspended (current status: '%s')", currentStatus)
		}

	default:
		return fmt.Errorf("unknown target status: %s", newStatus)
	}

	return s.userRepo.UpdateStatus(ctx, targetOID, newStatus)
}
