package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// MarketPrice represents a crop price record at a specific location and date.
type MarketPrice struct {
	ID             bson.ObjectID `bson:"_id,omitempty"       json:"id"`
	CropName       string        `bson:"crop_name"           json:"cropName"`
	Category       string        `bson:"category"            json:"category"`
	Unit           string        `bson:"unit"                json:"unit"` // e.g. "kg", "ton", "bag"
	Price          float64       `bson:"price"               json:"price"`
	Region         string        `bson:"region"              json:"region"`
	MarketLocation string        `bson:"market_location"     json:"marketLocation"` // e.g. "Baguio Trading Post"
	RecordedAt     time.Time     `bson:"recorded_at"         json:"recordedAt"`
	Source         string        `bson:"source"              json:"source"` // e.g. "DA-AMAS", "LGU Agri Office"
	RecordedBy     bson.ObjectID `bson:"recorded_by"         json:"recordedBy,omitempty"`
	CreatedAt      time.Time     `bson:"created_at"          json:"createdAt"`
	UpdatedAt      time.Time     `bson:"updated_at"          json:"updatedAt"`
}

// CreateMarketPriceRequest is the JSON payload for LGU staff to add a price record.
type CreateMarketPriceRequest struct {
	CropName       string  `json:"cropName"`
	Category       string  `json:"category"`
	Unit           string  `json:"unit"`
	Price          float64 `json:"price"`
	Region         string  `json:"region"`
	MarketLocation string  `json:"marketLocation"`
	RecordedAt     string  `json:"recordedAt"` // YYYY-MM-DD
	Source         string  `json:"source"`
}

// LatestPriceResponse is returned when querying the latest price for a crop.
type LatestPriceResponse struct {
	CropName       string    `json:"cropName"`
	Region         string    `json:"region"`
	Price          float64   `json:"price"`
	Unit           string    `json:"unit"`
	MarketLocation string    `json:"marketLocation"`
	RecordedAt     time.Time `json:"recordedAt"`
	Source         string    `json:"source"`
}
