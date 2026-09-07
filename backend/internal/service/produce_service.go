package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/agriconnect/backend/internal/models"
	"github.com/agriconnect/backend/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ProduceService struct {
	produceRepo *repository.ProduceRepository
	userRepo    *repository.UserRepository
	notifRepo   *repository.NotificationRepository
}

func NewProduceService(produceRepo *repository.ProduceRepository, userRepo *repository.UserRepository, notifRepo *repository.NotificationRepository) *ProduceService {
	return &ProduceService{
		produceRepo: produceRepo,
		userRepo:    userRepo,
		notifRepo:   notifRepo,
	}
}

// CreateListing handles listing creation for farmers.
func (s *ProduceService) CreateListing(ctx context.Context, farmerID string, req models.CreateProduceListingRequest) (*models.ProduceListing, error) {
	fOID, err := bson.ObjectIDFromHex(farmerID)
	if err != nil {
		return nil, fmt.Errorf("invalid farmer ID: %w", err)
	}

	farmer, err := s.userRepo.FindByID(ctx, fOID)
	if err != nil {
		return nil, fmt.Errorf("fetch farmer: %w", err)
	}

	if req.CropName == "" {
		return nil, errors.New("crop name is required")
	}
	if req.Quantity <= 0 {
		return nil, errors.New("quantity must be greater than zero")
	}
	if req.PricePerUnit <= 0 {
		return nil, errors.New("price per unit must be greater than zero")
	}

	harvestTime, _ := time.Parse("2006-01-02", req.HarvestDate)
	if harvestTime.IsZero() {
		harvestTime = time.Now()
	}

	listing := &models.ProduceListing{
		FarmerID:     farmer.ID,
		FarmerName:   fmt.Sprintf("%s %s", farmer.FirstName, farmer.LastName),
		FarmerPhone:  farmer.Phone,
		CropName:     req.CropName,
		Category:     req.Category,
		Quantity:     req.Quantity,
		Unit:         req.Unit,
		PricePerUnit: req.PricePerUnit,
		HarvestDate:  harvestTime,
		Location:     req.Location,
		Photos:       req.Photos,
		Description:  req.Description,
		Status:       models.ListingAvailable,
	}

	if err := s.produceRepo.CreateListing(ctx, listing); err != nil {
		return nil, err
	}

	return listing, nil
}

// ListListings retrieves crop listings with filtering.
func (s *ProduceService) ListListings(ctx context.Context, filter repository.ProduceFilter) ([]models.ProduceListing, error) {
	return s.produceRepo.ListListings(ctx, filter)
}

// GetListingByID finds a listing.
func (s *ProduceService) GetListingByID(ctx context.Context, id string) (*models.ProduceListing, error) {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid listing ID: %w", err)
	}
	return s.produceRepo.GetListingByID(ctx, oid)
}

// UpdateListing handles farmer edits to their own listing.
func (s *ProduceService) UpdateListing(ctx context.Context, farmerID string, listingID string, req models.UpdateProduceListingRequest) (*models.ProduceListing, error) {
	lOID, err := bson.ObjectIDFromHex(listingID)
	if err != nil {
		return nil, fmt.Errorf("invalid listing ID: %w", err)
	}

	existing, err := s.produceRepo.GetListingByID(ctx, lOID)
	if err != nil {
		return nil, err
	}

	if existing.FarmerID.Hex() != farmerID {
		return nil, errors.New("unauthorized to update this listing")
	}

	update := bson.M{}
	if req.CropName != nil {
		update["crop_name"] = *req.CropName
	}
	if req.Category != nil {
		update["category"] = *req.Category
	}
	if req.Quantity != nil {
		update["quantity"] = *req.Quantity
	}
	if req.Unit != nil {
		update["unit"] = *req.Unit
	}
	if req.PricePerUnit != nil {
		update["price_per_unit"] = *req.PricePerUnit
	}
	if req.Location != nil {
		update["location"] = *req.Location
	}
	if req.Description != nil {
		update["description"] = *req.Description
	}
	if req.Status != nil {
		update["status"] = *req.Status
	}
	if req.Photos != nil {
		update["photos"] = req.Photos
	}

	if err := s.produceRepo.UpdateListing(ctx, lOID, update); err != nil {
		return nil, err
	}

	return s.produceRepo.GetListingByID(ctx, lOID)
}

// DeleteListing handles farmer deletion of their listing.
func (s *ProduceService) DeleteListing(ctx context.Context, farmerID string, listingID string) error {
	lOID, err := bson.ObjectIDFromHex(listingID)
	if err != nil {
		return fmt.Errorf("invalid listing ID: %w", err)
	}

	existing, err := s.produceRepo.GetListingByID(ctx, lOID)
	if err != nil {
		return err
	}

	if existing.FarmerID.Hex() != farmerID {
		return errors.New("unauthorized to delete this listing")
	}

	return s.produceRepo.DeleteListing(ctx, lOID)
}

// InitiateTransaction processes a buyer's purchase request.
func (s *ProduceService) InitiateTransaction(ctx context.Context, buyerID string, req models.CreateProduceTransactionRequest) (*models.ProduceTransaction, error) {
	bOID, err := bson.ObjectIDFromHex(buyerID)
	if err != nil {
		return nil, fmt.Errorf("invalid buyer ID: %w", err)
	}

	lOID, err := bson.ObjectIDFromHex(req.ListingID)
	if err != nil {
		return nil, fmt.Errorf("invalid listing ID: %w", err)
	}

	buyer, err := s.userRepo.FindByID(ctx, bOID)
	if err != nil {
		return nil, fmt.Errorf("fetch buyer: %w", err)
	}

	listing, err := s.produceRepo.GetListingByID(ctx, lOID)
	if err != nil {
		return nil, fmt.Errorf("fetch listing: %w", err)
	}

	if listing.Status != models.ListingAvailable {
		return nil, errors.New("listing is no longer available")
	}

	if listing.FarmerID.Hex() == buyerID {
		return nil, errors.New("you cannot purchase your own produce listing")
	}

	if req.Quantity <= 0 || req.Quantity > listing.Quantity {
		return nil, fmt.Errorf("invalid quantity: requested %.2f, available %.2f", req.Quantity, listing.Quantity)
	}

	totalPrice := req.Quantity * listing.PricePerUnit

	tx := &models.ProduceTransaction{
		ListingID:      listing.ID,
		CropName:       listing.CropName,
		BuyerID:        buyer.ID,
		BuyerName:      fmt.Sprintf("%s %s", buyer.FirstName, buyer.LastName),
		FarmerID:       listing.FarmerID,
		FarmerName:     listing.FarmerName,
		Quantity:       req.Quantity,
		UnitPrice:      listing.PricePerUnit,
		TotalPrice:     totalPrice,
		ContactMessage: req.ContactMessage,
		Status:         models.TxPending,
	}

	if err := s.produceRepo.CreateTransaction(ctx, tx); err != nil {
		return nil, err
	}

	// Immediately reserve listing quantity
	newQty := listing.Quantity - req.Quantity
	listingUpdate := bson.M{"quantity": newQty}
	if newQty <= 0 {
		listingUpdate["status"] = models.ListingSold
	}
	if err := s.produceRepo.UpdateListing(ctx, listing.ID, listingUpdate); err != nil {
		return nil, fmt.Errorf("failed to reserve harvest quantity: %w", err)
	}

	// Notify the farmer about the buyer inquiry
	if s.notifRepo != nil {
		_ = s.notifRepo.CreateNotification(ctx, &models.Notification{
			UserID:  listing.FarmerID,
			Title:   "🌾 New Produce Purchase Inquiry",
			Message: fmt.Sprintf("%s sent an inquiry for %.2f %s of %s", tx.BuyerName, tx.Quantity, listing.Unit, listing.CropName),
			Type:    models.NotifTypeProduceInquiry,
			Link:    "/produce/orders",
		})
	}

	return tx, nil
}

// ListTransactions returns produce transactions for a user.
func (s *ProduceService) ListTransactions(ctx context.Context, userID string, role string) ([]models.ProduceTransaction, error) {
	return s.produceRepo.ListTransactions(ctx, userID, role)
}

// UpdateTransactionStatus updates order status (Farmer/Buyer/Admin) with role-based checks and stock restoration.
func (s *ProduceService) UpdateTransactionStatus(ctx context.Context, userID string, role string, txID string, status models.TransactionStatus) (*models.ProduceTransaction, error) {
	tOID, err := bson.ObjectIDFromHex(txID)
	if err != nil {
		return nil, fmt.Errorf("invalid transaction ID: %w", err)
	}

	tx, err := s.produceRepo.GetTransactionByID(ctx, tOID)
	if err != nil {
		return nil, err
	}

	isBuyer := tx.BuyerID.Hex() == userID
	isFarmer := tx.FarmerID.Hex() == userID
	isAdmin := role == string(models.RoleSuperAdmin) || role == string(models.RoleLGUStaff)

	// Verify user is either buyer, farmer, or admin
	if !isBuyer && !isFarmer && !isAdmin {
		return nil, errors.New("unauthorized to update this transaction")
	}

	// Enforce role-based status transition rules
	if !isAdmin {
		if isBuyer && !isFarmer {
			if status != models.TxCancelled {
				return nil, errors.New("buyers can only cancel their pending orders")
			}
			if tx.Status != models.TxPending {
				return nil, errors.New("cannot cancel an order that has already been confirmed or processed")
			}
		} else if isFarmer {
			if tx.Status == models.TxCompleted || tx.Status == models.TxCancelled {
				return nil, fmt.Errorf("cannot update a transaction that is already %s", tx.Status)
			}
			if status == models.TxCompleted && tx.Status != models.TxConfirmed {
				return nil, errors.New("order must be confirmed before marking as completed")
			}
		}
	}

	if err := s.produceRepo.UpdateTransactionStatus(ctx, tOID, status); err != nil {
		return nil, err
	}

	// Stock restoration on cancellation
	if status == models.TxCancelled && tx.Status != models.TxCancelled {
		if listing, err := s.produceRepo.GetListingByID(ctx, tx.ListingID); err == nil {
			restoredQty := listing.Quantity + tx.Quantity
			update := bson.M{"quantity": restoredQty}
			if listing.Status == models.ListingSold && restoredQty > 0 {
				update["status"] = models.ListingAvailable
			}
			_ = s.produceRepo.UpdateListing(ctx, tx.ListingID, update)
		}
	}

	// Auto-update listing status if completed and depleted
	if status == models.TxCompleted {
		if listing, err := s.produceRepo.GetListingByID(ctx, tx.ListingID); err == nil && listing.Quantity <= 0 {
			_ = s.produceRepo.UpdateListing(ctx, tx.ListingID, bson.M{"status": models.ListingSold})
		}
	}

	// Send notification on status update
	if s.notifRepo != nil {
		var notifRecipient bson.ObjectID
		var notifTitle string
		var notifMsg string

		if isFarmer || isAdmin {
			notifRecipient = tx.BuyerID
			notifTitle = "🌾 Crop Order Status Updated"
			notifMsg = fmt.Sprintf("Your order for %s has been %s by %s", tx.CropName, status, tx.FarmerName)
		} else {
			notifRecipient = tx.FarmerID
			notifTitle = "🌾 Crop Order Cancelled"
			notifMsg = fmt.Sprintf("Buyer %s cancelled their order for %s", tx.BuyerName, tx.CropName)
		}

		_ = s.notifRepo.CreateNotification(ctx, &models.Notification{
			UserID:  notifRecipient,
			Title:   notifTitle,
			Message: notifMsg,
			Type:    models.NotifTypeOrderStatus,
			Link:    "/produce/orders",
		})
	}

	return s.produceRepo.GetTransactionByID(ctx, tOID)
}
