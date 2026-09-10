package models

type CropStat struct {
	CropName     string  `bson:"_id"          json:"cropName"`
	ListingCount int64   `bson:"listingCount" json:"listingCount"`
}

type StatusStat struct {
	Status string `bson:"_id"   json:"status"`
	Count  int64  `bson:"count" json:"count"`
}

type CommunityStat struct {
	TotalPosts    int64 `json:"totalPosts"`
	TotalComments int64 `json:"totalComments"`
}

type MonthlyTrend struct {
	Month string  `json:"month"` // e.g. "2026-07"
	Count int64   `json:"count"`
	Value float64 `json:"value"`
}

type LGUDashboardSummary struct {
	Region                     string            `json:"region"`
	Municipality               string            `json:"municipality,omitempty"`
	TotalRegisteredFarmers     int64             `json:"totalRegisteredFarmers"`
	TotalTransactionsCount     int64             `json:"totalTransactionsCount"`
	TotalTransactionsValue     float64           `json:"totalTransactionsValue"`
	TopCrops                   []CropStat        `json:"topCrops"`
	ProgramApplicationsByStatus []StatusStat      `json:"programApplicationsByStatus"`
	CommunityActivity          CommunityStat     `json:"communityActivity"`
	RecentMarketPrices         []MarketPrice     `json:"recentMarketPrices"`
	MonthlyTrends              []MonthlyTrend    `json:"monthlyTrends"`
}
