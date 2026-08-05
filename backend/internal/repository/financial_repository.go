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

var ErrFinancialEntryNotFound = errors.New("financial entry not found")

type FinancialRepository struct {
	coll *mongo.Collection
}

func NewFinancialRepository(db *mongo.Database) *FinancialRepository {
	repo := &FinancialRepository{
		coll: db.Collection("financial_entries"),
	}
	repo.ensureIndexes()
	return repo
}

func (r *FinancialRepository) ensureIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, _ = r.coll.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "farmer_id", Value: 1}}},
		{Keys: bson.D{{Key: "date", Value: -1}}},
		{Keys: bson.D{{Key: "type", Value: 1}}},
	})
}

// Create inserts a new financial entry.
func (r *FinancialRepository) Create(ctx context.Context, entry *models.FinancialEntry) error {
	entry.CreatedAt = time.Now()
	entry.UpdatedAt = time.Now()

	res, err := r.coll.InsertOne(ctx, entry)
	if err != nil {
		return fmt.Errorf("insert financial entry: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		entry.ID = oid
	}
	return nil
}

// ListEntries returns a farmer's financial entries sorted by date descending.
func (r *FinancialRepository) ListEntries(ctx context.Context, farmerID bson.ObjectID, startDate, endDate *time.Time) ([]models.FinancialEntry, error) {
	query := bson.M{"farmer_id": farmerID}

	if startDate != nil || endDate != nil {
		dateQuery := bson.M{}
		if startDate != nil {
			dateQuery["$gte"] = *startDate
		}
		if endDate != nil {
			dateQuery["$lte"] = *endDate
		}
		query["date"] = dateQuery
	}

	opts := options.Find().SetSort(bson.D{{Key: "date", Value: -1}})
	cursor, err := r.coll.Find(ctx, query, opts)
	if err != nil {
		return nil, fmt.Errorf("find financial entries: %w", err)
	}
	defer cursor.Close(ctx)

	var entries []models.FinancialEntry
	if err := cursor.All(ctx, &entries); err != nil {
		return nil, fmt.Errorf("decode financial entries: %w", err)
	}
	if entries == nil {
		entries = []models.FinancialEntry{}
	}
	return entries, nil
}

// GetSummary calculates total income, total expense, net profit, and category breakdown.
func (r *FinancialRepository) GetSummary(ctx context.Context, farmerID bson.ObjectID, startDate, endDate *time.Time) (*models.FinancialSummary, error) {
	entries, err := r.ListEntries(ctx, farmerID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	summary := &models.FinancialSummary{
		TotalIncome:  0,
		TotalExpense: 0,
		NetProfit:    0,
		Breakdown:    []models.CategoryBreakdown{},
	}

	categoryMap := make(map[models.FinancialCategory]float64)

	for _, entry := range entries {
		if entry.Type == models.TypeIncome {
			summary.TotalIncome += entry.Amount
		} else if entry.Type == models.TypeExpense {
			summary.TotalExpense += entry.Amount
		}
		categoryMap[entry.Category] += entry.Amount
	}

	summary.NetProfit = summary.TotalIncome - summary.TotalExpense

	for cat, amount := range categoryMap {
		summary.Breakdown = append(summary.Breakdown, models.CategoryBreakdown{
			Category: cat,
			Amount:   amount,
		})
	}

	return summary, nil
}

// DeleteEntry deletes an entry owned by the farmer.
func (r *FinancialRepository) DeleteEntry(ctx context.Context, farmerID bson.ObjectID, entryID bson.ObjectID) error {
	res, err := r.coll.DeleteOne(ctx, bson.M{"_id": entryID, "farmer_id": farmerID})
	if err != nil {
		return fmt.Errorf("delete entry: %w", err)
	}
	if res.DeletedCount == 0 {
		return ErrFinancialEntryNotFound
	}
	return nil
}
