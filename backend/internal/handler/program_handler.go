package handler

import (
	"encoding/json"
	"net/http"

	"github.com/agriconnect/backend/internal/middleware"
	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

type ProgramHandler struct {
	progService *service.ProgramService
}

func NewProgramHandler(progService *service.ProgramService) *ProgramHandler {
	return &ProgramHandler{progService: progService}
}

// CreateProgram handles POST /api/programs (LGU staff / Admin).
func (h *ProgramHandler) CreateProgram(w http.ResponseWriter, r *http.Request) {
	creatorID := middleware.GetUserID(r.Context())

	var req models.CreateProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	prog, err := h.progService.CreateProgram(r.Context(), creatorID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, prog)
}

// ListPrograms handles GET /api/programs.
func (h *ProgramHandler) ListPrograms(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")

	programs, err := h.progService.ListPrograms(r.Context(), status)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch programs")
		return
	}

	writeJSON(w, http.StatusOK, programs)
}

// GetProgramByID handles GET /api/programs/{id}.
func (h *ProgramHandler) GetProgramByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	prog, err := h.progService.GetProgramByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, prog)
}

// UpdateProgramStatus handles PUT /api/programs/{id}/status (LGU staff).
func (h *ProgramHandler) UpdateProgramStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var payload struct {
		Status models.ProgramStatus `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.progService.UpdateProgramStatus(r.Context(), id, payload.Status); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "program status updated"})
}

// SubmitApplication handles POST /api/programs/{id}/applications (Farmer).
func (h *ProgramHandler) SubmitApplication(w http.ResponseWriter, r *http.Request) {
	farmerID := middleware.GetUserID(r.Context())
	programID := chi.URLParam(r, "id")

	var req models.SubmitApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	app, err := h.progService.SubmitApplication(r.Context(), farmerID, programID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, app)
}

// ListApplicationsByProgram handles GET /api/programs/{id}/applications (LGU staff review queue).
func (h *ProgramHandler) ListApplicationsByProgram(w http.ResponseWriter, r *http.Request) {
	programID := chi.URLParam(r, "id")

	apps, err := h.progService.ListApplicationsByProgram(r.Context(), programID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch program applications")
		return
	}

	writeJSON(w, http.StatusOK, apps)
}

// ListApplicationsByFarmer handles GET /api/programs/applications/my (Farmer tracking).
func (h *ProgramHandler) ListApplicationsByFarmer(w http.ResponseWriter, r *http.Request) {
	farmerID := middleware.GetUserID(r.Context())

	apps, err := h.progService.ListApplicationsByFarmer(r.Context(), farmerID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch your applications")
		return
	}

	writeJSON(w, http.StatusOK, apps)
}

// ReviewApplication handles PUT /api/programs/applications/{appId}/status (LGU staff status & remarks update).
func (h *ProgramHandler) ReviewApplication(w http.ResponseWriter, r *http.Request) {
	reviewerID := middleware.GetUserID(r.Context())
	appID := chi.URLParam(r, "appId")

	var req models.UpdateApplicationStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.progService.ReviewApplication(r.Context(), reviewerID, appID, req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "application status reviewed"})
}
