package repository

import (
	"context"
	"time"

	"github.com/agriconnect/backend/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type AnalyticsRepository struct {
	userColl    *mongo.Collection
	txColl      *mongo.Collection
	produceColl *mongo.Collection
	appColl     *mongo.Collection
	postColl    *mongo.Collection
	commentColl *mongo.Collection
	priceColl   *mongo.Collection
}

func NewAnalyticsRepository(db *mongo.Database) *AnalyticsRepository {
	return &AnalyticsRepository{
		userColl:    db.Collection("users"),
		txColl:      db.Collection("produce_transactions"),
		produceColl: db.Collection("produce_listings"),
		appColl:     db.Collection("program_applications"),
		postColl:    db.Collection("community_posts"),
		commentColl: db.Collection("community_comments"),
		priceColl:   db.Collection("market_prices"),
	}
}

// GetLGUDashboardSummary computes aggregated regional statistics.
func (r *AnalyticsRepository) GetLGUDashboardSummary(ctx context.Context, region string, startDate, endDate *time.Time) (*models.LGUDashboardSummary, error) {
	summary := &models.LGUDashboardSummary{
		Region:                      region,
		TopCrops:                    []models.CropStat{},
		ProgramApplicationsByStatus: []models.StatusStat{},
		RecentMarketPrices:         []models.MarketPrice{},
		MonthlyTrends:               []models.MonthlyTrend{},
	}

	// 1. Registered Farmers count
	userQuery := bson.M{"role": models.RoleFarmer}
	if region != "" && region != "All Regions" {
		userQuery["region"] = bson.M{"$regex": region, "$options": "i"}
	}
	farmerCount, err := r.userColl.CountDocuments(ctx, userQuery)
	if err == nil {
		summary.TotalRegisteredFarmers = farmerCount
	}

	// 2. Transactions Count & Value Aggregation Pipeline
	txPipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{"status": bson.M{"$ne": "cancelled"}}}},
	}
	if startDate != nil || endDate != nil {
		dateFilter := bson.M{}
		if startDate != nil {
			dateFilter["$gte"] = *startDate
		}
		if endDate != nil {
			dateFilter["$lte"] = *endDate
		}
		txPipeline = append(txPipeline, bson.D{{Key: "$match", Value: bson.M{"created_at": dateFilter}}})
	}
	txPipeline = append(txPipeline, bson.D{{Key: "$group", Value: bson.M{
		"_id":        nil,
		"totalCount": bson.M{"$sum": 1},
		"totalValue": bson.M{"$sum": "$total_price"},
	}}})

	txCursor, err := r.txColl.Aggregate(ctx, txPipeline)
	if err == nil {
		var res []struct {
			TotalCount int64   `bson:"totalCount"`
			TotalValue float64 `bson:"totalValue"`
		}
		if err := txCursor.All(ctx, &res); err == nil && len(res) > 0 {
			summary.TotalTransactionsCount = res[0].TotalCount
			summary.TotalTransactionsValue = res[0].TotalValue
		}
	}

	// 3. Top Crops Listed Aggregation Pipeline
	cropPipeline := mongo.Pipeline{
		bson.D{{Key: "$group", Value: bson.M{
			"_id":          "$crop_name",
			"listingCount": bson.M{"$sum": 1},
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "listingCount", Value: -1}}}},
		bson.D{{Key: "$limit", Value: 5}},
	}
	cropCursor, err := r.produceColl.Aggregate(ctx, cropPipeline)
	if err == nil {
		_ = cropCursor.All(ctx, &summary.TopCrops)
		if summary.TopCrops == nil {
			summary.TopCrops = []models.CropStat{}
		}
	}

	// 4. Program Applications by Status Aggregation
	appPipeline := mongo.Pipeline{
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   "$status",
			"count": bson.M{"$sum": 1},
		}}},
	}
	appCursor, err := r.appColl.Aggregate(ctx, appPipeline)
	if err == nil {
		_ = appCursor.All(ctx, &summary.ProgramApplicationsByStatus)
		if summary.ProgramApplicationsByStatus == nil {
			summary.ProgramApplicationsByStatus = []models.StatusStat{}
		}
	}

	// 5. Community Hub Activity Levels
	postsCount, _ := r.postColl.CountDocuments(ctx, bson.M{"is_removed": false})
	commentsCount, _ := r.commentColl.CountDocuments(ctx, bson.M{"is_removed": false})
	summary.CommunityActivity = models.CommunityStat{
		TotalPosts:    postsCount,
		TotalComments: commentsCount,
	}

	// 6. Recent Market Prices
	priceFilter := PriceFilter{Region: region}
	priceRepo := NewPriceRepository(r.priceColl.Database())
	prices, err := priceRepo.ListPriceHistory(ctx, priceFilter)
	if err == nil && len(prices) > 0 {
		if len(prices) > 6 {
			summary.RecentMarketPrices = prices[len(prices)-6:]
		} else {
			summary.RecentMarketPrices = prices
		}
	}

	return summary, nil
}
