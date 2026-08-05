package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type SupplyCategory string

const (
	SupplyFertilizer          SupplyCategory = "fertilizer"
	SupplyPesticideHerbicide  SupplyCategory = "pesticide_herbicide_fungicide"
	SupplySeedsSeedlings      SupplyCategory = "seeds_seedlings"
	SupplyTools               SupplyCategory = "tools"
	SupplyPPE                 SupplyCategory = "ppe"
)

type SupplyOrderStatus string

const (
	SupplyOrderPending    SupplyOrderStatus = "pending"
	SupplyOrderProcessing SupplyOrderStatus = "processing"
	SupplyOrderShipped    SupplyOrderStatus = "shipped_ready"
	SupplyOrderCompleted  SupplyOrderStatus = "completed"
	SupplyOrderCancelled  SupplyOrderStatus = "cancelled"
)

type DeliveryMethod string

const (
	DeliveryShip   DeliveryMethod = "delivery"
	DeliveryPickup DeliveryMethod = "pickup"
)

// SupplyProduct represents an agricultural input item listed by a supplier.
type SupplyProduct struct {
	ID            bson.ObjectID  `bson:"_id,omitempty"       json:"id"`
	SupplierID    bson.ObjectID  `bson:"supplier_id"         json:"supplierId"`
	SupplierName  string         `bson:"supplier_name"       json:"supplierName"`
	IsVerified    bool           `bson:"is_verified"         json:"isVerified"` // Supplier accreditation flag
	Name          string         `bson:"name"                json:"name"`
	Category      SupplyCategory `bson:"category"            json:"category"`
	Description   string         `bson:"description"         json:"description"`
	Price         float64        `bson:"price"               json:"price"`
	StockQuantity int            `bson:"stock_quantity"      json:"stockQuantity"`
	Unit          string         `bson:"unit"                json:"unit"` // e.g. "bag", "liter", "pack", "piece"
	Images        []string       `bson:"images,omitempty"    json:"images,omitempty"`
	CreatedAt     time.Time      `bson:"created_at"          json:"createdAt"`
	UpdatedAt     time.Time      `bson:"updated_at"          json:"updatedAt"`
}

// CreateSupplyProductRequest is the JSON payload to list a supply product.
type CreateSupplyProductRequest struct {
	Name          string         `json:"name"`
	Category      SupplyCategory `json:"category"`
	Description   string         `json:"description"`
	Price         float64        `json:"price"`
	StockQuantity int            `json:"stockQuantity"`
	Unit          string         `json:"unit"`
	Images        []string       `json:"images,omitempty"`
}

// UpdateSupplyProductRequest is the JSON payload to update a product.
type UpdateSupplyProductRequest struct {
	Name          *string         `json:"name,omitempty"`
	Category      *SupplyCategory `json:"category,omitempty"`
	Description   *string         `json:"description,omitempty"`
	Price         *float64        `json:"price,omitempty"`
	StockQuantity *int            `json:"stockQuantity,omitempty"`
	Unit          *string         `json:"unit,omitempty"`
	Images        []string        `json:"images,omitempty"`
}

// SupplyOrderItem represents an item line inside a supply order.
type SupplyOrderItem struct {
	ProductID    bson.ObjectID `bson:"product_id"    json:"productId"`
	ProductName  string        `bson:"product_name"  json:"productName"`
	Quantity     int           `bson:"quantity"      json:"quantity"`
	PricePerItem float64       `bson:"price_per_item" json:"pricePerItem"`
}

// SupplyOrder represents an order placed by a farmer to a supplier.
type SupplyOrder struct {
	ID              bson.ObjectID     `bson:"_id,omitempty"        json:"id"`
	BuyerID         bson.ObjectID     `bson:"buyer_id"             json:"buyerId"`
	BuyerName       string            `bson:"buyer_name"           json:"buyerName"`
	SupplierID      bson.ObjectID     `bson:"supplier_id"          json:"supplierId"`
	SupplierName    string            `bson:"supplier_name"        json:"supplierName"`
	Items           []SupplyOrderItem `bson:"items"                json:"items"`
	TotalAmount     float64           `bson:"total_amount"         json:"totalAmount"`
	DeliveryMethod  DeliveryMethod    `bson:"delivery_method"      json:"deliveryMethod"`
	DeliveryAddress string            `bson:"delivery_address,omitempty" json:"deliveryAddress,omitempty"`
	Status          SupplyOrderStatus `bson:"status"               json:"status"`
	CreatedAt       time.Time         `bson:"created_at"           json:"createdAt"`
	UpdatedAt       time.Time         `bson:"updated_at"           json:"updatedAt"`
}

// CreateOrderItemRequest represents an item entry during checkout.
type CreateOrderItemRequest struct {
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
}

// CreateSupplyOrderRequest is the JSON body for checkout.
type CreateSupplyOrderRequest struct {
	Items           []CreateOrderItemRequest `json:"items"`
	DeliveryMethod  DeliveryMethod           `json:"deliveryMethod"`
	DeliveryAddress string                   `json:"deliveryAddress,omitempty"`
}

// UpdateSupplyOrderStatusRequest updates an order's status.
type UpdateSupplyOrderStatusRequest struct {
	Status SupplyOrderStatus `json:"status"`
}
