package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/agriconnect/backend/internal/config"
	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// StorageService defines the contract for storing and deleting files.
type StorageService interface {
	Upload(ctx context.Context, filename string, contentType string, reader io.Reader) (string, error)
	Delete(ctx context.Context, filename string) error
}

// LocalStorage stores uploaded files on the local filesystem.
type LocalStorage struct {
	uploadDir string
}

// NewLocalStorage creates a new local filesystem storage service.
func NewLocalStorage(uploadDir string) *LocalStorage {
	_ = os.MkdirAll(uploadDir, os.ModePerm)
	return &LocalStorage{uploadDir: uploadDir}
}

// Upload writes the file to the local uploads directory and returns its relative path.
func (s *LocalStorage) Upload(_ context.Context, filename string, _ string, reader io.Reader) (string, error) {
	savePath := filepath.Join(s.uploadDir, filename)
	dst, err := os.Create(savePath)
	if err != nil {
		return "", fmt.Errorf("local storage create file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, reader); err != nil {
		return "", fmt.Errorf("local storage write file: %w", err)
	}

	return "/uploads/" + filename, nil
}

// Delete removes the file from the local filesystem.
func (s *LocalStorage) Delete(_ context.Context, filename string) error {
	savePath := filepath.Join(s.uploadDir, filename)
	if err := os.Remove(savePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("local storage delete file: %w", err)
	}
	return nil
}

// R2Storage stores uploaded files in Cloudflare R2 via the AWS S3 SDK.
type R2Storage struct {
	client    *s3.Client
	bucket    string
	publicURL string
}

// NewR2Storage creates an S3/R2 storage service.
func NewR2Storage(client *s3.Client, bucket string, publicURL string) *R2Storage {
	return &R2Storage{
		client:    client,
		bucket:    bucket,
		publicURL: strings.TrimRight(publicURL, "/"),
	}
}

// Upload uploads an object to Cloudflare R2 and returns its public URL.
func (s *R2Storage) Upload(ctx context.Context, filename string, contentType string, reader io.Reader) (string, error) {
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(filename),
		Body:        reader,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("r2 upload put object: %w", err)
	}

	if s.publicURL != "" {
		return fmt.Sprintf("%s/%s", s.publicURL, filename), nil
	}

	// Fallback to S3 key if no public URL domain is defined
	return filename, nil
}

// Delete deletes an object from Cloudflare R2.
func (s *R2Storage) Delete(ctx context.Context, filename string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(filename),
	})
	if err != nil {
		return fmt.Errorf("r2 delete object: %w", err)
	}
	return nil
}

// New initializes the appropriate StorageService based on configuration.
// If R2 credentials are provided, it configures Cloudflare R2; otherwise it falls back to LocalStorage.
func New(cfg *config.Config) (StorageService, error) {
	if cfg.R2BucketName != "" && cfg.R2AccessKeyID != "" && cfg.R2SecretAccessKey != "" && cfg.R2AccountID != "" {
		r2Endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.R2AccountID)

		awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(),
			awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.R2AccessKeyID, cfg.R2SecretAccessKey, "")),
			awsconfig.WithRegion("auto"),
		)
		if err != nil {
			return nil, fmt.Errorf("failed to load R2 credentials: %w", err)
		}

		s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(r2Endpoint)
		})

		log.Printf("☁️ Cloudflare R2 Storage enabled (Bucket: %s, Endpoint: %s)\n", cfg.R2BucketName, r2Endpoint)
		return NewR2Storage(s3Client, cfg.R2BucketName, cfg.R2PublicURL), nil
	}

	log.Printf("📁 Local storage enabled (Upload Directory: %s)\n", cfg.UploadDir)
	return NewLocalStorage(cfg.UploadDir), nil
}
