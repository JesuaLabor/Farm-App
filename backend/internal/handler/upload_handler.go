package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/agriconnect/backend/internal/middleware"
)

// UploadHandler handles file and image upload endpoints.
type UploadHandler struct {
	uploadDir string
}

// NewUploadHandler creates a new UploadHandler.
func NewUploadHandler(uploadDir string) *UploadHandler {
	return &UploadHandler{uploadDir: uploadDir}
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

	// Generate safe, unique filename
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), userID, ext)
	savePath := filepath.Join(h.uploadDir, filename)

	dst, err := os.Create(savePath)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create destination file")
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save uploaded file")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"url":      "/uploads/" + filename,
		"filename": filename,
	})
}
