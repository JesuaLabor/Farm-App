package handler

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/agriconnect/backend/internal/middleware"
	"github.com/agriconnect/backend/internal/storage"
)

// UploadHandler handles file and image upload endpoints.
type UploadHandler struct {
	storage storage.StorageService
}

// NewUploadHandler creates a new UploadHandler.
func NewUploadHandler(storage storage.StorageService) *UploadHandler {
	return &UploadHandler{storage: storage}
}

// UploadImage handles POST /api/upload.
// Accepts multipart/form-data with "image", "file", or "photo" key.
func (h *UploadHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Limit upload size to 10MB
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)

	file, header, err := r.FormFile("image")
	if err != nil {
		file, header, err = r.FormFile("file")
		if err != nil {
			file, header, err = r.FormFile("photo")
			if err != nil {
				writeError(w, http.StatusBadRequest, "image file is required (max 10MB)")
				return
			}
		}
	}
	defer file.Close()

	// Validate extension
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".gif":  true,
	}
	if !allowed[ext] {
		ext = ".jpg"
	}

	// Detect MIME content type from extension
	contentType := "image/jpeg"
	switch ext {
	case ".png":
		contentType = "image/png"
	case ".webp":
		contentType = "image/webp"
	case ".gif":
		contentType = "image/gif"
	}

	// Generate safe, unique filename
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), userID, ext)

	// Upload via storage service (local disk or Cloudflare R2)
	url, err := h.storage.Upload(r.Context(), filename, contentType, file)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to upload file")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"url":      url,
		"filename": filename,
	})
}
