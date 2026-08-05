package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type EntryType string

const (
	TypeIncome  EntryType = "income"
	TypeExpense EntryType = "expense"
)

type FinancialCategory string

const (
	CategoryProduceSale FinancialCategory = "produce_sale"
	CategorySeeds       FinancialCategory = "seeds"
	CategoryFertilizer  FinancialCategory = "fertilizer"
	CategoryLabor       FinancialCategory = "labor"
	CategoryEquipment   FinancialCategory = "equipment"
	CategoryOther       FinancialCategory = "other"
)

// FinancialEntry represents a single income or expense log by a farmer.
type FinancialEntry struct {
	ID                  bson.ObjectID     `bson:"_id,omitempty"             json:"id"`
	FarmerID            bson.ObjectID     `bson:"farmer_id"                 json:"farmerId"`
	Type                EntryType         `bson:"type"                      json:"type"` // "income" or "expense"
	Category            FinancialCategory `bson:"category"                  json:"category"`
	Title               string            `bson:"title"                     json:"title"`
	Amount              float64           `bson:"amount"                    json:"amount"`
	Date                time.Time         `bson:"date"                      json:"date"`
	Notes               string            `bson:"notes,omitempty"           json:"notes,omitempty"`
	RelatedCrop         string            `bson:"related_crop,omitempty"    json:"relatedCrop,omitempty"`
	LinkedProduceTxID   *bson.ObjectID    `bson:"linked_produce_tx_id,omitempty" json:"linkedProduceTxId,omitempty"`
	LinkedSupplyOrderID *bson.ObjectID    `bson:"linked_supply_order_id,omitempty" json:"linkedSupplyOrderId,omitempty"`
	CreatedAt           time.Time         `bson:"created_at"                json:"createdAt"`
	UpdatedAt           time.Time         `bson:"updated_at"                json:"updatedAt"`
}

// CreateFinancialEntryRequest is the payload to log an income or expense entry.
type CreateFinancialEntryRequest struct {
	Type                EntryType         `json:"type"`
	Category            FinancialCategory `json:"category"`
	Title               string            `json:"title"`
	Amount              float64           `json:"amount"`
	Date                string            `json:"date"` // YYYY-MM-DD
	Notes               string            `json:"notes,omitempty"`
	RelatedCrop         string            `json:"relatedCrop,omitempty"`
	LinkedProduceTxID   string            `json:"linkedProduceTxId,omitempty"`
	LinkedSupplyOrderID string            `json:"linkedSupplyOrderId,omitempty"`
}

// CategoryBreakdown represents total amount per category.
type CategoryBreakdown struct {
	Category FinancialCategory `json:"category"`
	Amount   float64           `json:"amount"`
}

// FinancialSummary holds the aggregated statistics for a farmer over a date range.
type FinancialSummary struct {
	TotalIncome  float64             `json:"totalIncome"`
	TotalExpense float64             `json:"totalExpense"`
	NetProfit    float64             `json:"netProfit"`
	Breakdown    []CategoryBreakdown `json:"breakdown"`
}
