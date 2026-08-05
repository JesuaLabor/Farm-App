package handler

import (
	"encoding/json"
	"net/http"

	"github.com/agriconnect/backend/internal/middleware"
	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/service"
)

type PriceHandler struct {
	priceService *service.PriceService
}

func NewPriceHandler(priceService *service.PriceService) *PriceHandler {
	return &PriceHandler{priceService: priceService}
}

// CreateRecord handles POST /api/market-prices (LGU Staff / Admin only).
func (h *PriceHandler) CreateRecord(w http.ResponseWriter, r *http.Request) {
	recorderID := middleware.GetUserID(r.Context())

	var req models.CreateMarketPriceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	price, err := h.priceService.CreatePriceRecord(r.Context(), recorderID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, price)
}

// ListHistory handles GET /api/market-prices (Public / Auth).
func (h *PriceHandler) ListHistory(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	cropName := q.Get("cropName")
	region := q.Get("region")
	startDate := q.Get("startDate")
	endDate := q.Get("endDate")

	prices, err := h.priceService.ListPriceHistory(r.Context(), cropName, region, startDate, endDate)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch market price history")
		return
	}

	writeJSON(w, http.StatusOK, prices)
}

// GetLatestPrice handles GET /api/market-prices/latest (Public / Auth).
func (h *PriceHandler) GetLatestPrice(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	cropName := q.Get("cropName")
	region := q.Get("region")

	price, err := h.priceService.GetLatestPrice(r.Context(), cropName, region)
	if err != nil {
		writeError(w, http.StatusNotFound, "latest price not found for specified crop")
		return
	}

	writeJSON(w, http.StatusOK, price)
}
