package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ProgramService struct {
	progRepo *repository.ProgramRepository
	userRepo *repository.UserRepository
}

func NewProgramService(progRepo *repository.ProgramRepository, userRepo *repository.UserRepository) *ProgramService {
	return &ProgramService{
		progRepo: progRepo,
		userRepo: userRepo,
	}
}

// CreateProgram creates a government program listing.
func (s *ProgramService) CreateProgram(ctx context.Context, creatorID string, req models.CreateProgramRequest) (*models.Program, error) {
	cOID, err := bson.ObjectIDFromHex(creatorID)
	if err != nil {
		return nil, fmt.Errorf("invalid creator ID: %w", err)
	}

	if req.Title == "" {
		return nil, errors.New("program title is required")
	}
	if req.Description == "" {
		return nil, errors.New("program description is required")
	}

	deadline, _ := time.Parse("2006-01-02", req.Deadline)
	if deadline.IsZero() {
		deadline = time.Now().AddDate(0, 1, 0) // Default 30 days
	}

	prog := &models.Program{
		Title:               req.Title,
		Description:         req.Description,
		Agency:              req.Agency,
		EligibilityCriteria: req.EligibilityCriteria,
		RequiredDocuments:   req.RequiredDocuments,
		Deadline:            deadline,
		Status:              models.ProgramStatusOpen,
		CreatedBy:           cOID,
	}

	if err := s.progRepo.CreateProgram(ctx, prog); err != nil {
		return nil, err
	}
	return prog, nil
}

// ListPrograms fetches program listings.
func (s *ProgramService) ListPrograms(ctx context.Context, status string) ([]models.Program, error) {
	return s.progRepo.ListPrograms(ctx, status)
}

// GetProgramByID gets details of a program.
func (s *ProgramService) GetProgramByID(ctx context.Context, idStr string) (*models.Program, error) {
	id, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return nil, fmt.Errorf("invalid program ID: %w", err)
	}
	return s.progRepo.GetProgramByID(ctx, id)
}

// UpdateProgramStatus changes open/closed status.
func (s *ProgramService) UpdateProgramStatus(ctx context.Context, idStr string, status models.ProgramStatus) error {
	id, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return fmt.Errorf("invalid program ID: %w", err)
	}
	return s.progRepo.UpdateProgramStatus(ctx, id, status)
}

// SubmitApplication handles a farmer applying for a program.
func (s *ProgramService) SubmitApplication(ctx context.Context, farmerID string, programIDStr string, req models.SubmitApplicationRequest) (*models.ProgramApplication, error) {
	fOID, err := bson.ObjectIDFromHex(farmerID)
	if err != nil {
		return nil, fmt.Errorf("invalid farmer ID: %w", err)
	}
	pOID, err := bson.ObjectIDFromHex(programIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid program ID: %w", err)
	}

	// Fetch farmer info
	user, err := s.userRepo.FindByID(ctx, fOID)
	if err != nil {
		return nil, fmt.Errorf("fetch farmer details: %w", err)
	}

	// Fetch program to check status
	prog, err := s.progRepo.GetProgramByID(ctx, pOID)
	if err != nil {
		return nil, err
	}
	if prog.Status != models.ProgramStatusOpen {
		return nil, errors.New("this government program is closed for applications")
	}

	app := &models.ProgramApplication{
		ProgramID:        pOID,
		FarmerID:         fOID,
		FarmerName:       user.FirstName + " " + user.LastName,
		FarmerPhone:        user.Phone,
		FarmerRegion:       user.Region,
		FarmerProvince:     user.Province,
		FarmerMunicipality: user.Municipality,
		FarmSizeHectares:   req.FarmSizeHectares,
		CropsGrown:       req.CropsGrown,
		RSBSANumber:      req.RSBSANumber,
		SubmittedDocs:    req.SubmittedDocs,
		Status:           models.ApplicationStatusSubmitted,
	}

	if err := s.progRepo.CreateApplication(ctx, app); err != nil {
		return nil, err
	}

	app.ProgramTitle = prog.Title
	return app, nil
}

// ListApplicationsByProgram fetches queue for LGU staff review.
func (s *ProgramService) ListApplicationsByProgram(ctx context.Context, programIDStr string) ([]models.ProgramApplication, error) {
	pOID, err := bson.ObjectIDFromHex(programIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid program ID: %w", err)
	}
	return s.progRepo.ListApplicationsByProgram(ctx, pOID)
}

// ListApplicationsByFarmer fetches list of submissions for farmer.
func (s *ProgramService) ListApplicationsByFarmer(ctx context.Context, farmerID string) ([]models.ProgramApplication, error) {
	fOID, err := bson.ObjectIDFromHex(farmerID)
	if err != nil {
		return nil, fmt.Errorf("invalid farmer ID: %w", err)
	}
	return s.progRepo.ListApplicationsByFarmer(ctx, fOID)
}

// ReviewApplication updates application status with optional remarks.
func (s *ProgramService) ReviewApplication(ctx context.Context, reviewerID string, appIDStr string, req models.UpdateApplicationStatusRequest) error {
	rOID, err := bson.ObjectIDFromHex(reviewerID)
	if err != nil {
		return fmt.Errorf("invalid reviewer ID: %w", err)
	}
	aOID, err := bson.ObjectIDFromHex(appIDStr)
	if err != nil {
		return fmt.Errorf("invalid application ID: %w", err)
	}

	return s.progRepo.UpdateApplicationStatus(ctx, aOID, req.Status, req.Remarks, rOID)
}
