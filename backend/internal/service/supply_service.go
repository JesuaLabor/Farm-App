package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type SupplyService struct {
	supplyRepo *repository.SupplyRepository
	userRepo   *repository.UserRepository
}

func NewSupplyService(supplyRepo *repository.SupplyRepository, userRepo *repository.UserRepository) *SupplyService {
	return &SupplyService{
		supplyRepo: supplyRepo,
		userRepo:   userRepo,
	}
}

// CreateProduct creates a product listing for a supplier.
func (s *SupplyService) CreateProduct(ctx context.Context, supplierID string, req models.CreateSupplyProductRequest) (*models.SupplyProduct, error) {
	sOID, err := bson.ObjectIDFromHex(supplierID)
	if err != nil {
		return nil, fmt.Errorf("invalid supplier ID: %w", err)
	}

	supplier, err := s.userRepo.FindByID(ctx, sOID)
	if err != nil {
		return nil, fmt.Errorf("fetch supplier: %w", err)
	}

	if req.Name == "" {
		return nil, errors.New("product name is required")
	}
	if req.Price <= 0 {
		return nil, errors.New("price must be greater than zero")
	}
	if req.StockQuantity < 0 {
		return nil, errors.New("stock quantity cannot be negative")
	}

	product := &models.SupplyProduct{
		SupplierID:    supplier.ID,
		SupplierName:  fmt.Sprintf("%s %s", supplier.FirstName, supplier.LastName),
		IsVerified:    supplier.IsVerified,
		Name:          req.Name,
		Category:      req.Category,
		Description:   req.Description,
		Price:         req.Price,
		StockQuantity: req.StockQuantity,
		Unit:          req.Unit,
		Images:        req.Images,
	}

	if err := s.supplyRepo.CreateProduct(ctx, product); err != nil {
		return nil, err
	}

	return product, nil
}

// ListProducts retrieves products matching filters.
func (s *SupplyService) ListProducts(ctx context.Context, filter repository.SupplyFilter) ([]models.SupplyProduct, error) {
	return s.supplyRepo.ListProducts(ctx, filter)
}

// GetProductByID finds a single product.
func (s *SupplyService) GetProductByID(ctx context.Context, id string) (*models.SupplyProduct, error) {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid product ID: %w", err)
	}
	return s.supplyRepo.GetProductByID(ctx, oid)
}

// UpdateProduct updates product details.
func (s *SupplyService) UpdateProduct(ctx context.Context, supplierID string, productID string, req models.UpdateSupplyProductRequest) (*models.SupplyProduct, error) {
	pOID, err := bson.ObjectIDFromHex(productID)
	if err != nil {
		return nil, fmt.Errorf("invalid product ID: %w", err)
	}

	existing, err := s.supplyRepo.GetProductByID(ctx, pOID)
	if err != nil {
		return nil, err
	}

	if existing.SupplierID.Hex() != supplierID {
		return nil, errors.New("unauthorized to update this product")
	}

	update := bson.M{}
	if req.Name != nil {
		update["name"] = *req.Name
	}
	if req.Category != nil {
		update["category"] = *req.Category
	}
	if req.Description != nil {
		update["description"] = *req.Description
	}
	if req.Price != nil {
		update["price"] = *req.Price
	}
	if req.StockQuantity != nil {
		update["stock_quantity"] = *req.StockQuantity
	}
	if req.Unit != nil {
		update["unit"] = *req.Unit
	}
	if req.Images != nil {
		update["images"] = req.Images
	}

	if err := s.supplyRepo.UpdateProduct(ctx, pOID, update); err != nil {
		return nil, err
	}

	return s.supplyRepo.GetProductByID(ctx, pOID)
}

// DeleteProduct deletes a product.
func (s *SupplyService) DeleteProduct(ctx context.Context, supplierID string, productID string) error {
	pOID, err := bson.ObjectIDFromHex(productID)
	if err != nil {
		return fmt.Errorf("invalid product ID: %w", err)
	}

	existing, err := s.supplyRepo.GetProductByID(ctx, pOID)
	if err != nil {
		return err
	}

	if existing.SupplierID.Hex() != supplierID {
		return errors.New("unauthorized to delete this product")
	}

	return s.supplyRepo.DeleteProduct(ctx, pOID)
}

// CreateOrder places an order for supply products (Farmer).
func (s *SupplyService) CreateOrder(ctx context.Context, buyerID string, req models.CreateSupplyOrderRequest) (*models.SupplyOrder, error) {
	bOID, err := bson.ObjectIDFromHex(buyerID)
	if err != nil {
		return nil, fmt.Errorf("invalid buyer ID: %w", err)
	}

	buyer, err := s.userRepo.FindByID(ctx, bOID)
	if err != nil {
		return nil, fmt.Errorf("fetch buyer: %w", err)
	}

	if len(req.Items) == 0 {
		return nil, errors.New("order must contain at least one item")
	}

	var items []models.SupplyOrderItem
	var totalAmount float64
	var supplierID bson.ObjectID
	var supplierName string

	for i, itemReq := range req.Items {
		pOID, err := bson.ObjectIDFromHex(itemReq.ProductID)
		if err != nil {
			return nil, fmt.Errorf("invalid product ID at index %d: %w", i, err)
		}

		product, err := s.supplyRepo.GetProductByID(ctx, pOID)
		if err != nil {
			return nil, fmt.Errorf("fetch product: %w", err)
		}

		if product.StockQuantity < itemReq.Quantity {
			return nil, fmt.Errorf("insufficient stock for %s (available: %d)", product.Name, product.StockQuantity)
		}

		if i == 0 {
			supplierID = product.SupplierID
			supplierName = product.SupplierName
		}

		itemTotal := float64(itemReq.Quantity) * product.Price
		totalAmount += itemTotal

		items = append(items, models.SupplyOrderItem{
			ProductID:    product.ID,
			ProductName:  product.Name,
			Quantity:     itemReq.Quantity,
			PricePerItem: product.Price,
		})

		// Deduct inventory
		if err := s.supplyRepo.DeductStock(ctx, product.ID, itemReq.Quantity); err != nil {
			return nil, fmt.Errorf("deduct inventory for %s: %w", product.Name, err)
		}
	}

	order := &models.SupplyOrder{
		BuyerID:         buyer.ID,
		BuyerName:       fmt.Sprintf("%s %s", buyer.FirstName, buyer.LastName),
		SupplierID:      supplierID,
		SupplierName:    supplierName,
		Items:           items,
		TotalAmount:     totalAmount,
		DeliveryMethod:  req.DeliveryMethod,
		DeliveryAddress: req.DeliveryAddress,
		Status:          models.SupplyOrderPending,
	}

	if err := s.supplyRepo.CreateOrder(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// ListOrders returns supply orders for a user.
func (s *SupplyService) ListOrders(ctx context.Context, userID string, role string) ([]models.SupplyOrder, error) {
	return s.supplyRepo.ListOrders(ctx, userID, role)
}

// UpdateOrderStatus updates supply order status.
func (s *SupplyService) UpdateOrderStatus(ctx context.Context, userID string, orderID string, status models.SupplyOrderStatus) (*models.SupplyOrder, error) {
	oOID, err := bson.ObjectIDFromHex(orderID)
	if err != nil {
		return nil, fmt.Errorf("invalid order ID: %w", err)
	}

	order, err := s.supplyRepo.GetOrderByID(ctx, oOID)
	if err != nil {
		return nil, err
	}

	if order.SupplierID.Hex() != userID && order.BuyerID.Hex() != userID {
		return nil, errors.New("unauthorized to update this order")
	}

	if err := s.supplyRepo.UpdateOrderStatus(ctx, oOID, status); err != nil {
		return nil, err
	}

	return s.supplyRepo.GetOrderByID(ctx, oOID)
}
