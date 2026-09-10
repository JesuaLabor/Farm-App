# ==============================================================================
# Multi-stage Dockerfile for AgriConnect Go Backend API (Render / Production)
# ==============================================================================

# Stage 1: Build binary
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Download modules (cached if go.mod/go.sum don't change)
COPY go.mod go.sum ./
RUN go mod download

# Copy source files
COPY . .

# Build statically linked binary without debugging symbols
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./cmd/api

# Stage 2: Minimal runtime image
FROM alpine:latest

WORKDIR /app

# Install CA certificates for TLS/SSL (needed for MongoDB Atlas connection) and timezone data
RUN apk --no-cache add ca-certificates tzdata

# Copy compiled binary from builder
COPY --from=builder /app/server /app/server

# Create directory for file uploads
RUN mkdir -p /app/uploads

# Expose port (Render sets $PORT dynamically)
EXPOSE 8080

# Environment defaults
ENV PORT=8080
ENV UPLOAD_DIR=/app/uploads

# Run the API server
CMD ["/app/server"]
