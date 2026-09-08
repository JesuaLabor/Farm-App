package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/agriconnect/backend/internal/middleware"
	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

type ChatHandler struct {
	chatService *service.ChatService
}

func NewChatHandler(chatService *service.ChatService) *ChatHandler {
	return &ChatHandler{chatService: chatService}
}

// CreateConversation handles POST /api/chat/conversations
func (h *ChatHandler) CreateConversation(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req models.CreateConversationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.RecipientID == "" {
		writeError(w, http.StatusBadRequest, "recipientId is required")
		return
	}

	conv, err := h.chatService.FindOrCreateConversation(r.Context(), userID, req.RecipientID, req.Context, req.InitialMessage)
	if err != nil {
		if errors.Is(err, service.ErrSelfChat) {
			writeError(w, http.StatusBadRequest, "cannot chat with yourself")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, conv)
}

// ListConversations handles GET /api/chat/conversations
func (h *ChatHandler) ListConversations(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	convs, err := h.chatService.ListConversations(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, convs)
}

// GetConversation handles GET /api/chat/conversations/{id}
func (h *ChatHandler) GetConversation(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	convID := chi.URLParam(r, "id")
	if userID == "" || convID == "" {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	conv, err := h.chatService.GetConversationByID(r.Context(), convID, userID)
	if err != nil {
		if errors.Is(err, service.ErrNotParticipant) {
			writeError(w, http.StatusForbidden, "unauthorized to view this conversation")
			return
		}
		writeError(w, http.StatusNotFound, "conversation not found")
		return
	}

	writeJSON(w, http.StatusOK, conv)
}

// ListMessages handles GET /api/chat/conversations/{id}/messages
func (h *ChatHandler) ListMessages(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	convID := chi.URLParam(r, "id")
	if userID == "" || convID == "" {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	messages, err := h.chatService.ListMessages(r.Context(), convID, userID)
	if err != nil {
		if errors.Is(err, service.ErrNotParticipant) {
			writeError(w, http.StatusForbidden, "unauthorized")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, messages)
}

// SendMessage handles POST /api/chat/conversations/{id}/messages
func (h *ChatHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	convID := chi.URLParam(r, "id")
	if userID == "" || convID == "" {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	var req models.SendChatMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Content == "" && req.ProductCard == nil {
		writeError(w, http.StatusBadRequest, "message content or product card is required")
		return
	}

	msg, err := h.chatService.SendMessage(r.Context(), convID, userID, req.Content, req.ProductCard)
	if err != nil {
		if errors.Is(err, service.ErrNotParticipant) {
			writeError(w, http.StatusForbidden, "unauthorized")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, msg)
}

// MarkAsRead handles PUT /api/chat/conversations/{id}/read
func (h *ChatHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	convID := chi.URLParam(r, "id")
	if userID == "" || convID == "" {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	if err := h.chatService.MarkAsRead(r.Context(), convID, userID); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "conversation marked as read"})
}

// GetUnreadCount handles GET /api/chat/unread-count
func (h *ChatHandler) GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	count, err := h.chatService.GetTotalUnreadCount(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, models.ChatUnreadCountResponse{UnreadCount: count})
}
