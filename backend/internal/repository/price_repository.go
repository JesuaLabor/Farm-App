package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/agriconnect/backend/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var ErrPriceNotFound = errors.New("market price record not found")

type PriceFilter struct {
	CropName  string
	Region    string
	StartDate *time.Time
	EndDate   *time.Time
}

type PriceRepository struct {
	coll *mongo.Collection
}

func NewPriceRepository(db *mongo.Database) *PriceRepository {
	repo := &PriceRepository{
		coll: db.Collection("market_prices"),
	}
	repo.ensureIndexes()
	return repo
}

func (r *PriceRepository) ensureIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, _ = r.coll.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "crop_name", Value: 1}}},
		{Keys: bson.D{{Key: "region", Value: 1}}},
		{Keys: bson.D{{Key: "recorded_at", Value: -1}}},
	})
}

// Create inserts a new price record.
func (r *PriceRepository) Create(ctx context.Context, price *models.MarketPrice) error {
	price.CreatedAt = time.Now()
	price.UpdatedAt = time.Now()

	res, err := r.coll.InsertOne(ctx, price)
	if err != nil {
		return fmt.Errorf("insert price record: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		price.ID = oid
	}
	return nil
}

// ListPriceHistory retrieves price records matching filters sorted chronologically.
func (r *PriceRepository) ListPriceHistory(ctx context.Context, filter PriceFilter) ([]models.MarketPrice, error) {
	query := bson.M{}

	if filter.CropName != "" {
		query["crop_name"] = bson.M{"$regex": filter.CropName, "$options": "i"}
	}
	if filter.Region != "" {
		query["region"] = bson.M{"$regex": filter.Region, "$options": "i"}
	}

	if filter.StartDate != nil || filter.EndDate != nil {
		dateQuery := bson.M{}
		if filter.StartDate != nil {
			dateQuery["$gte"] = *filter.StartDate
		}
		if filter.EndDate != nil {
			dateQuery["$lte"] = *filter.EndDate
		}
		query["recorded_at"] = dateQuery
	}

	opts := options.Find().SetSort(bson.D{{Key: "recorded_at", Value: 1}})
	cursor, err := r.coll.Find(ctx, query, opts)
	if err != nil {
		return nil, fmt.Errorf("find market prices: %w", err)
	}
	defer cursor.Close(ctx)

	var prices []models.MarketPrice
	if err := cursor.All(ctx, &prices); err != nil {
		return nil, fmt.Errorf("decode market prices: %w", err)
	}
	if prices == nil {
		prices = []models.MarketPrice{}
	}
	return prices, nil
}

// GetLatestPrice returns the single most recent price entry for a crop in a region.
func (r *PriceRepository) GetLatestPrice(ctx context.Context, cropName string, region string) (*models.MarketPrice, error) {
	query := bson.M{
		"crop_name": bson.M{"$regex": "^" + cropName + "$", "$options": "i"},
	}
	if region != "" {
		query["region"] = bson.M{"$regex": region, "$options": "i"}
	}

	opts := options.FindOne().SetSort(bson.D{{Key: "recorded_at", Value: -1}})
	var price models.MarketPrice
	err := r.coll.FindOne(ctx, query, opts).Decode(&price)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrPriceNotFound
		}
		return nil, fmt.Errorf("get latest price: %w", err)
	}
	return &price, nil
}
