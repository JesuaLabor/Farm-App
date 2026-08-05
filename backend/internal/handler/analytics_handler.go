package handler

import (
	"net/http"

	"github.com/agriconnect/backend/internal/service"
)

type AnalyticsHandler struct {
	analyticsService *service.AnalyticsService
}

func NewAnalyticsHandler(analyticsService *service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsService: analyticsService}
}

// GetLGUDashboard handles GET /api/lgu/dashboard.
func (h *AnalyticsHandler) GetLGUDashboard(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	region := q.Get("region")
	startDate := q.Get("startDate")
	endDate := q.Get("endDate")

	summary, err := h.analyticsService.GetLGUDashboardSummary(r.Context(), region, startDate, endDate)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to compute LGU dashboard metrics")
		return
	}

	writeJSON(w, http.StatusOK, summary)
}
