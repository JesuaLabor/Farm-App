# RFC: Future Improvement — Supplier-to-Supplier B2B Wholesale & Reseller Marketplace

## 1. Executive Summary
In the agricultural supply chain, municipal and barangay-level agri-dealers (retail "agri-vets") frequently source high-demand inputs (e.g., bulk fertilizer grades, certified hybrid seeds, specialized pesticides, machinery parts) from regional distributors and primary importers. 

This document defines the architectural, data, financial, and UI roadmap for introducing **Supplier-to-Supplier B2B Wholesale Reseller Purchasing** in AgriConnect without compromising the direct-to-farmer retail experience.

---

## 2. Business Model & Core Principles

### 2.1 Retail vs. B2B Reseller Differentiation
| Dimension | Retail (Farmer Purchase) | B2B Wholesale (Reseller Purchase) |
|---|---|---|
| **Target User** | Individual Farmer Producer | Accredited Local Agri-Store / Retailer |
| **Order Volume** | Small (1–10 bags / units) | Large (50–500+ bags / pallet loads) |
| **Pricing Model** | Standard Retail Price (SRP) | Tiered Volume Wholesale Discount |
| **Fulfillment** | Local Rider Delivery or Farm-Gate Pickup | Freight / Truckload Logistics |
| **Payment Terms** | Cash on Delivery (COD) / E-Wallet | Bank Transfer (InstaPay/PESONet), Credit Line, or 30-day Terms |
| **Tax / Documentation** | Sales Invoice | BIR Form 2307, Withholding Tax, Official Receipt |

### 2.2 Core Guardrails
1. **Accreditation Requirement**: Only verified suppliers with valid business permits (DTI/SEC & Fertilizer and Pesticide Authority / FPA licenses) can unlock wholesale purchasing.
2. **Strict Self-Purchase Guard**: Suppliers cannot purchase their own products.
3. **Price Protection**: Reseller prices are only visible to logged-in, verified suppliers; farmers continue to see standard SRP to prevent price confusion.

---

## 3. Data Model & Architecture Extensions

### 3.1 Wholesale Pricing Tiers Schema (`supply_products`)
Extend the `SupplyProduct` document in MongoDB with optional volume-discount tiers:

```go
type WholesaleTier struct {
    MinQuantity int     `bson:"min_quantity" json:"minQuantity"` // e.g. 50 bags
    PricePerUnit float64 `bson:"price_per_unit" json:"pricePerUnit"` // e.g. ₱1,150 instead of ₱1,450
}

type SupplyProduct struct {
    // ... existing fields ...
    WholesaleTiers   []WholesaleTier `bson:"wholesale_tiers,omitempty"   json:"wholesaleTiers,omitempty"`
    MinWholesaleQty  int             `bson:"min_wholesale_qty,omitempty" json:"minWholesaleQty,omitempty"`
    AllowsResellers  bool            `bson:"allows_resellers"             json:"allowsResellers"`
}
```

### 3.2 B2B Wholesale Order Schema (`supply_b2b_orders`)
A dedicated transaction collection separate from consumer retail orders:

```go
type SupplyB2BOrder struct {
    ID              bson.ObjectID      `bson:"_id,omitempty"       json:"id"`
    SellerID        bson.ObjectID      `bson:"seller_id"           json:"sellerId"`
    SellerName      string             `bson:"seller_name"         json:"sellerName"`
    BuyerSupplierID bson.ObjectID      `bson:"buyer_supplier_id"   json:"buyerSupplierId"`
    BuyerStoreName  string             `bson:"buyer_store_name"    json:"buyerStoreName"`
    Items           []SupplyOrderItem  `bson:"items"               json:"items"`
    TotalAmount     float64            `bson:"total_amount"        json:"totalAmount"`
    FreightType     string             `bson:"freight_type"        json:"freightType"` // "supplier_truck", "third_party_logistics", "warehouse_pickup"
    DeliveryAddress string             `bson:"delivery_address"    json:"deliveryAddress"`
    PaymentMethod   string             `bson:"payment_method"      json:"paymentMethod"` // "bank_transfer", "net_30_terms", "cheque"
    PaymentStatus   string             `bson:"payment_status"      json:"paymentStatus"`
    OrderStatus     string             `bson:"order_status"        json:"orderStatus"` // "pending_rfq", "po_issued", "dispatched", "delivered", "closed"
    TaxID           string             `bson:"tax_id,omitempty"    json:"taxId,omitempty"` // TIN / BIR 2307
    CreatedAt       time.Time          `bson:"created_at"          json:"createdAt"`
}
```

---

## 4. Backend API & Authorization Roadmap

### 4.1 New Endpoints (`/api/supply/b2b`)

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/api/supply/b2b/catalog` | `supplier` | List products with wholesale pricing and MOQ tiers |
| `POST` | `/api/supply/b2b/orders` | `supplier` | Submit a bulk purchase order to another supplier |
| `GET` | `/api/supply/b2b/orders/my-purchases` | `supplier` | Track restock orders placed to other suppliers |
| `GET` | `/api/supply/b2b/orders/my-sales` | `supplier` | Manage bulk reseller purchase orders from peers |
| `PUT` | `/api/supply/b2b/orders/{id}/status` | `supplier` | Update B2B order fulfillment (RFQ $\rightarrow$ Confirmed $\rightarrow$ Shipped $\rightarrow$ Delivered) |

### 4.2 Backend Business Logic Rules
1. **Self-Purchase Prevention**:
   ```go
   if product.SupplierID.Hex() == buyerSupplierID {
       return nil, errors.New("suppliers cannot purchase their own products")
   }
   ```
2. **MOQ (Minimum Order Quantity) Enforcement**:
   ```go
   if req.Quantity < product.MinWholesaleQty {
       return nil, fmt.Errorf("order quantity below minimum wholesale threshold of %d units", product.MinWholesaleQty)
   }
   ```
3. **Atomic Inventory Reservation**:
   - For bulk orders, stock is reserved upon order confirmation (`pending_rfq` $\rightarrow$ `po_issued`).

---

## 5. UI/UX Interface Design

### 5.1 Dedicated "Wholesale Sourcing" Tab for Suppliers
Instead of mixing with the retail farmer storefront, add a dedicated view:
- **Location**: Sidebar under `MY BUSINESS` $\rightarrow$ `Bulk Restock / Sourcing`.
- **View**:
  - Displays distributor badges (`Primary Importer`, `Regional Wholesaler`).
  - Tier cards:
    - *Tier 1 (50–99 bags)*: ₱1,250/bag
    - *Tier 2 (100–499 bags)*: ₱1,180/bag
    - *Tier 3 (500+ bags)*: ₱1,100/bag
  - "Request Bulk Quote / PO" modal with TIN, tax documentation upload, and pallet selection.

### 5.2 Reseller Orders Management Screen
- **Tab 1: Outgoing Restock Orders** (Orders placed to distributors).
- **Tab 2: Incoming Wholesale Orders** (Bulk orders received from local retailers).

---

## 6. Phased Rollout Plan

### Phase 1: Product Tiering Configuration (Supplier Inventory)
- Allow suppliers in `ManageSupplyProductsPage.tsx` to set optional wholesale tiers (`MinQty` + `WholesalePrice`).
- Add database migration to support wholesale fields on `SupplyProduct`.

### Phase 2: B2B Sourcing Portal (Suppliers Only)
- Launch `/supply/b2b` accessible only to verified suppliers.
- Implement Purchase Order (PO) workflow with bank deposit / wire transfer proofs.

### Phase 3: Integrated Freight & Logistics
- Partner with agricultural freight haulers (e.g. forwarders handling truckloads from Batangas / Cagayan de Oro port terminals to inland municipal dealers).
