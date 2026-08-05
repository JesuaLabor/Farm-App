package config

import (
	"os"
	"strconv"
)

// Config holds all configuration for the application.
type Config struct {
	MongoURI     string
	DBName       string
	JWTSecret    string
	JWTExpiryHrs int
	Port         string
	UploadDir    string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() *Config {
	cfg := &Config{
		MongoURI:     getEnv("MONGO_URI", "mongodb://localhost:27017"),
		DBName:       getEnv("DB_NAME", "agriconnect"),
		JWTSecret:    getEnv("JWT_SECRET", "change-me-to-a-secure-random-string"),
		JWTExpiryHrs: getEnvInt("JWT_EXPIRY_HOURS", 24),
		Port:         getEnv("PORT", "8080"),
		UploadDir:    getEnv("UPLOAD_DIR", "./uploads"),
	}
	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}
