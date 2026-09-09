# RFC: Future Improvement — Intelligent Vehicle-Tiered Agricultural Logistics System

## 1. Executive Summary
In regional agricultural commerce (specifically across Northern Mindanao, Bukidnon, and Misamis Oriental), cargo weight and volume vary drastically—from a 1 kg bag of vegetable seeds to 5,000+ kg (5 metric tons) of harvested corn or 100 bags of fertilizer surpassing ₱100,000 in transaction value.

This document outlines the architectural and algorithmic specification for an **Intelligent Vehicle-Tiered Shipping & Hauling Engine** to be implemented in a future phase of AgriConnect, transitioning from the initial manual seller-set delivery fee to an automated, weight- and distance-aware logistics calculation.

---

## 2. Vehicle Classifications & Hauling Matrix

Agricultural shipments in the Philippines rely on distinct vehicle classes depending on payload, terrain accessibility (mountainous barangay farm roads vs. national highways), and cargo perishability.

### 2.1 Vehicle Specifications & Payload Capacities

| Vehicle Class | Primary Use Case | Maximum Payload | Typical Cargo Equivalent | Baseline Rate (Northern Mindanao) |
| :--- | :--- | :--- | :--- | :--- |
| **Class A: Two-Wheeled Courier (Motorcycle / Delivery Rider)** | Small seed packs, biologics, small tools, agrochemical bottles | **< 25 kg** | Up to 5 seed packets or 4 bottles of pesticide | ₱60 – ₱120 flat |
| **Class B: Local Tricycle / Multicab** | Local harvests, sacks of root crops, 2–10 bags fertilizer | **25 kg – 500 kg** | 10 sacks of Kamote / 5 bags fertilizer | ₱350 – ₱800 |
| **Class C: Closed Van / Light Truck (Bongo, L300, H100)** | Medium harvest loads, farm equipment, palletized inputs | **500 kg – 2,000 kg (2 Tons)** | 40 bags fertilizer / 1,500 kg corn or palay | ₱1,800 – ₱3,500 |
| **Class D: 4-Wheeler / 6-Wheeler Elf Truck** | High-volume harvest trading, inter-town wholesale bulk orders (₱50k – ₱100k+) | **2,000 kg – 5,000 kg (5 Tons)** | 100 bags fertilizer / 4 metric tons corn | ₱4,500 – ₱7,500 |
| **Class E: 10-Wheeler Forward / Wing Van** | Regional port & food terminal hauling (Bukidnon to Cagayan de Oro port) | **8,000 kg – 15,000 kg (15 Tons)** | 300+ bags grains / full banana or pineapple trailer | ₱12,000 – ₱22,000+ |

---

## 3. Algorithmic Fee Calculation Model

The future automated engine will compute shipping fees dynamically using:
$$\text{ShippingFee} = \text{BaseVehicleRate} + (\text{DistanceInKm} \times \text{PerKmRate}) + \text{HandlingSurcharge}$$

### 3.1 Weight & Dimension Classifier
```typescript
export interface LogisticsClassification {
  totalWeightKg: number;
  totalVolumeCbm?: number;
  recommendedVehicle: 'courier' | 'multicab' | 'light_truck' | 'elf_truck' | 'wing_van';
  estimatedBaseRate: number;
}

export function classifyShipment(totalWeightKg: number): LogisticsClassification {
  if (totalWeightKg <= 25) {
    return { totalWeightKg, recommendedVehicle: 'courier', estimatedBaseRate: 80 };
  } else if (totalWeightKg <= 500) {
    return { totalWeightKg, recommendedVehicle: 'multicab', estimatedBaseRate: 500 };
  } else if (totalWeightKg <= 2000) {
    return { totalWeightKg, recommendedVehicle: 'light_truck', estimatedBaseRate: 2200 };
  } else if (totalWeightKg <= 5000) {
    return { totalWeightKg, recommendedVehicle: 'elf_truck', estimatedBaseRate: 5000 };
  } else {
    return { totalWeightKg, recommendedVehicle: 'wing_van', estimatedBaseRate: 15000 };
  }
}
```

### 3.2 Distance Matrix (Municipality to Municipality)
Predefined distance tables for Northern Mindanao hubs:
- Intra-town (e.g. Maramag to Maramag): `x 1.0 multiplier`
- Adjacent town (e.g. Maramag to Don Carlos / Valencia): `+₱15/km`
- High-altitude / farm-to-market gravel roads: `+15% terrain factor`

---

## 4. Integration with Third-Party Logistics & Trucking Co-ops

1. **Local Transport Cooperatives**: Partnering with municipal hauling cooperatives (e.g., Bukidnon Truckers Association) to accept automated hauling requests.
2. **On-Demand Logistics APIs**: Integration with Lalamove Cargo (L300/4-Wheeler) and Transportify API where coverage exists in Region X.
3. **Kargador (Loading/Unloading) Labor Add-on**: Optional checkbox for bulk grain hauling requiring manual labor (₱5–₱8 per sack loading fee).

---

## 5. Transition Path from Current Seller-Set Model
- **Current Phase (Phase 1)**: Seller (Farmer/Supplier) manually coordinates with their local vehicle/truck contact and inputs the exact agreed shipping fee upon order confirmation. Farmgate/Store Pickup is always ₱0.
- **Next Phase (Phase 2)**: The platform suggests the recommended vehicle class and estimated rate range to the seller and buyer during checkout based on the classification matrix above.
- **Full Automation (Phase 3)**: Automatic real-time route calculation and dispatch to registered hauling drivers.
