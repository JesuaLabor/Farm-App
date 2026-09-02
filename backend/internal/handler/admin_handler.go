package handler

import (
	"net/http"

	"github.com/agriconnect/backend/internal/middleware"
	"github.com/agriconnect/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

// AdminHandler handles user account administration endpoints.
type AdminHandler struct {
	adminService *service.AdminService
}

// NewAdminHandler creates a new AdminHandler.
func NewAdminHandler(adminService *service.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

// ListUsers handles GET /api/admin/users.
func (h *AdminHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	roleFilter := r.URL.Query().Get("role")
	statusFilter := r.URL.Query().Get("status")
	regionFilter := r.URL.Query().Get("region")
	provinceFilter := r.URL.Query().Get("province")
	municipalityFilter := r.URL.Query().Get("municipality")
	barangayFilter := r.URL.Query().Get("barangay")

	users, err := h.adminService.ListUsers(r.Context(), userID, roleFilter, statusFilter, regionFilter, provinceFilter, municipalityFilter, barangayFilter)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, users)
}

// ApproveUser handles PUT /api/admin/users/{id}/approve.
func (h *AdminHandler) ApproveUser(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	targetID := chi.URLParam(r, "id")
	if targetID == "" {
		writeError(w, http.StatusBadRequest, "user ID is required")
		return
	}

	if err := h.adminService.ApproveUser(r.Context(), userID, targetID); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "user approved successfully"})
}

// RejectUser handles PUT /api/admin/users/{id}/reject.
func (h *AdminHandler) RejectUser(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	targetID := chi.URLParam(r, "id")
	if targetID == "" {
		writeError(w, http.StatusBadRequest, "user ID is required")
		return
	}

	if err := h.adminService.RejectUser(r.Context(), userID, targetID); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "user rejected successfully"})
}
