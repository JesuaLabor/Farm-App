package service

import (
	"context"
	"time"

	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/repository"
)

type AnalyticsService struct {
	analyticsRepo *repository.AnalyticsRepository
}

func NewAnalyticsService(analyticsRepo *repository.AnalyticsRepository) *AnalyticsService {
	return &AnalyticsService{analyticsRepo: analyticsRepo}
}

// GetLGUDashboardSummary computes overview statistics for LGU offices.
func (s *AnalyticsService) GetLGUDashboardSummary(ctx context.Context, region, municipality, startDateStr, endDateStr string) (*models.LGUDashboardSummary, error) {
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

	return s.analyticsRepo.GetLGUDashboardSummary(ctx, region, municipality, startDate, endDate)
}
