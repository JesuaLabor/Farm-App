package handler

import (
	"encoding/json"
	"net/http"

	"github.com/agriconnect/backend/internal/middleware"
	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

type FinancialHandler struct {
	financialService *service.FinancialService
}

func NewFinancialHandler(financialService *service.FinancialService) *FinancialHandler {
	return &FinancialHandler{financialService: financialService}
}

// CreateEntry handles POST /api/finances/entries (Farmer only).
func (h *FinancialHandler) CreateEntry(w http.ResponseWriter, r *http.Request) {
	farmerID := middleware.GetUserID(r.Context())
	if farmerID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req models.CreateFinancialEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	entry, err := h.financialService.CreateEntry(r.Context(), farmerID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, entry)
}

// ListEntries handles GET /api/finances/entries (Farmer only).
func (h *FinancialHandler) ListEntries(w http.ResponseWriter, r *http.Request) {
	farmerID := middleware.GetUserID(r.Context())
	q := r.URL.Query()

	entries, err := h.financialService.ListEntries(r.Context(), farmerID, q.Get("startDate"), q.Get("endDate"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch financial entries")
		return
	}

	writeJSON(w, http.StatusOK, entries)
}

// GetSummary handles GET /api/finances/summary (Farmer only).
func (h *FinancialHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	farmerID := middleware.GetUserID(r.Context())
	q := r.URL.Query()

	summary, err := h.financialService.GetSummary(r.Context(), farmerID, q.Get("startDate"), q.Get("endDate"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to compute financial summary")
		return
	}

	writeJSON(w, http.StatusOK, summary)
}

// DeleteEntry handles DELETE /api/finances/entries/{id} (Farmer only).
func (h *FinancialHandler) DeleteEntry(w http.ResponseWriter, r *http.Request) {
	farmerID := middleware.GetUserID(r.Context())
	id := chi.URLParam(r, "id")

	if err := h.financialService.DeleteEntry(r.Context(), farmerID, id); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "financial entry deleted"})
}
