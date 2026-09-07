package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/agriconnect/backend/internal/middleware"
	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/repository"
	"github.com/agriconnect/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

type ProduceHandler struct {
	produceService *service.ProduceService
}

func NewProduceHandler(produceService *service.ProduceService) *ProduceHandler {
	return &ProduceHandler{produceService: produceService}
}

// CreateListing handles POST /api/produce/listings (Farmer only).
func (h *ProduceHandler) CreateListing(w http.ResponseWriter, r *http.Request) {
	farmerID := middleware.GetUserID(r.Context())
	if farmerID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req models.CreateProduceListingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	listing, err := h.produceService.CreateListing(r.Context(), farmerID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, listing)
}

// ListListings handles GET /api/produce/listings (Public / Auth).
func (h *ProduceHandler) ListListings(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	minPrice, _ := strconv.ParseFloat(q.Get("minPrice"), 64)
	maxPrice, _ := strconv.ParseFloat(q.Get("maxPrice"), 64)

	filter := repository.ProduceFilter{
		CropName: q.Get("cropName"),
		Category: q.Get("category"),
		Location: q.Get("location"),
		MinPrice: minPrice,
		MaxPrice: maxPrice,
		Status:   q.Get("status"),
		FarmerID: q.Get("farmerId"),
	}

	listings, err := h.produceService.ListListings(r.Context(), filter)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch produce listings")
		return
	}

	writeJSON(w, http.StatusOK, listings)
}

// GetListingByID handles GET /api/produce/listings/{id}.
func (h *ProduceHandler) GetListingByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	listing, err := h.produceService.GetListingByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "produce listing not found")
		return
	}

	writeJSON(w, http.StatusOK, listing)
}

// UpdateListing handles PUT /api/produce/listings/{id} (Farmer only).
func (h *ProduceHandler) UpdateListing(w http.ResponseWriter, r *http.Request) {
	farmerID := middleware.GetUserID(r.Context())
	id := chi.URLParam(r, "id")

	var req models.UpdateProduceListingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	listing, err := h.produceService.UpdateListing(r.Context(), farmerID, id, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, listing)
}

// DeleteListing handles DELETE /api/produce/listings/{id} (Farmer only).
func (h *ProduceHandler) DeleteListing(w http.ResponseWriter, r *http.Request) {
	farmerID := middleware.GetUserID(r.Context())
	id := chi.URLParam(r, "id")

	if err := h.produceService.DeleteListing(r.Context(), farmerID, id); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "listing deleted"})
}

// InitiateTransaction handles POST /api/produce/transactions (Buyer only).
func (h *ProduceHandler) InitiateTransaction(w http.ResponseWriter, r *http.Request) {
	buyerID := middleware.GetUserID(r.Context())

	var req models.CreateProduceTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	tx, err := h.produceService.InitiateTransaction(r.Context(), buyerID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, tx)
}

// ListTransactions handles GET /api/produce/transactions (Buyer / Farmer).
func (h *ProduceHandler) ListTransactions(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	role := middleware.GetRole(r.Context())

	txs, err := h.produceService.ListTransactions(r.Context(), userID, role)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch transactions")
		return
	}

	writeJSON(w, http.StatusOK, txs)
}

// UpdateTransactionStatus handles PUT /api/produce/transactions/{id}/status.
func (h *ProduceHandler) UpdateTransactionStatus(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	role := middleware.GetRole(r.Context())
	txID := chi.URLParam(r, "id")

	var req models.UpdateTransactionStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	tx, err := h.produceService.UpdateTransactionStatus(r.Context(), userID, role, txID, req.Status)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, tx)
}
