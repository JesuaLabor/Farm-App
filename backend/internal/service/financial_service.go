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

type FinancialService struct {
	financialRepo *repository.FinancialRepository
}

func NewFinancialService(financialRepo *repository.FinancialRepository) *FinancialService {
	return &FinancialService{financialRepo: financialRepo}
}

// CreateEntry logs a farmer's income or expense item.
func (s *FinancialService) CreateEntry(ctx context.Context, farmerID string, req models.CreateFinancialEntryRequest) (*models.FinancialEntry, error) {
	fOID, err := bson.ObjectIDFromHex(farmerID)
	if err != nil {
		return nil, fmt.Errorf("invalid farmer ID: %w", err)
	}

	if req.Title == "" {
		return nil, errors.New("title is required")
	}
	if req.Amount <= 0 {
		return nil, errors.New("amount must be greater than zero")
	}

	entryDate, _ := time.Parse("2006-01-02", req.Date)
	if entryDate.IsZero() {
		entryDate = time.Now()
	}

	var pOID *bson.ObjectID
	if req.LinkedProduceTxID != "" {
		if id, err := bson.ObjectIDFromHex(req.LinkedProduceTxID); err == nil {
			pOID = &id
		}
	}

	var sOID *bson.ObjectID
	if req.LinkedSupplyOrderID != "" {
		if id, err := bson.ObjectIDFromHex(req.LinkedSupplyOrderID); err == nil {
			sOID = &id
		}
	}

	entry := &models.FinancialEntry{
		FarmerID:            fOID,
		Type:                req.Type,
		Category:            req.Category,
		Title:               req.Title,
		Amount:              req.Amount,
		Date:                entryDate,
		Notes:               req.Notes,
		RelatedCrop:         req.RelatedCrop,
		LinkedProduceTxID:   pOID,
		LinkedSupplyOrderID: sOID,
	}

	if err := s.financialRepo.Create(ctx, entry); err != nil {
		return nil, err
	}

	return entry, nil
}

// ListEntries returns a farmer's financial logs over an optional date range.
func (s *FinancialService) ListEntries(ctx context.Context, farmerID string, startDateStr, endDateStr string) ([]models.FinancialEntry, error) {
	fOID, err := bson.ObjectIDFromHex(farmerID)
	if err != nil {
		return nil, fmt.Errorf("invalid farmer ID: %w", err)
	}

	var startDate, endDate *time.Time
	if startDateStr != "" {
		if t, err := time.Parse("2006-01-02", startDateStr); err == nil {
			startDate = &t
		}
	}
	if endDateStr != "" {
		if t, err := time.Parse("2006-01-02", endDateStr); err == nil {
			t = t.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
			endDate = &t
		}
	}

	return s.financialRepo.ListEntries(ctx, fOID, startDate, endDate)
}

// GetSummary computes financial metrics (Income, Expense, Net Profit, Breakdown).
func (s *FinancialService) GetSummary(ctx context.Context, farmerID string, startDateStr, endDateStr string) (*models.FinancialSummary, error) {
	fOID, err := bson.ObjectIDFromHex(farmerID)
	if err != nil {
		return nil, fmt.Errorf("invalid farmer ID: %w", err)
	}

	var startDate, endDate *time.Time
	if startDateStr != "" {
		if t, err := time.Parse("2006-01-02", startDateStr); err == nil {
			startDate = &t
		}
	}
	if endDateStr != "" {
		if t, err := time.Parse("2006-01-02", endDateStr); err == nil {
			t = t.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
			endDate = &t
		}
	}

	return s.financialRepo.GetSummary(ctx, fOID, startDate, endDate)
}

// DeleteEntry removes a financial record.
func (s *FinancialService) DeleteEntry(ctx context.Context, farmerID string, entryID string) error {
	fOID, err := bson.ObjectIDFromHex(farmerID)
	if err != nil {
		return fmt.Errorf("invalid farmer ID: %w", err)
	}
	eOID, err := bson.ObjectIDFromHex(entryID)
	if err != nil {
		return fmt.Errorf("invalid entry ID: %w", err)
	}

	return s.financialRepo.DeleteEntry(ctx, fOID, eOID)
}
