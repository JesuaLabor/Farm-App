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

var (
	ErrProgramNotFound     = errors.New("government program not found")
	ErrApplicationNotFound = errors.New("program application not found")
	ErrAlreadyApplied      = errors.New("you have already submitted an application for this program")
)

type ProgramRepository struct {
	progColl *mongo.Collection
	appColl  *mongo.Collection
}

func NewProgramRepository(db *mongo.Database) *ProgramRepository {
	repo := &ProgramRepository{
		progColl: db.Collection("government_programs"),
		appColl:  db.Collection("program_applications"),
	}
	repo.ensureIndexes()
	return repo
}

func (r *ProgramRepository) ensureIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, _ = r.progColl.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "deadline", Value: 1}}},
	})

	_, _ = r.appColl.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "program_id", Value: 1}}},
		{Keys: bson.D{{Key: "farmer_id", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
	})
}

// CreateProgram creates a new program listing by LGU staff.
func (r *ProgramRepository) CreateProgram(ctx context.Context, prog *models.Program) error {
	prog.CreatedAt = time.Now()
	prog.UpdatedAt = time.Now()

	res, err := r.progColl.InsertOne(ctx, prog)
	if err != nil {
		return fmt.Errorf("insert program: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		prog.ID = oid
	}
	return nil
}

// ListPrograms retrieves all programs with optional status filter.
func (r *ProgramRepository) ListPrograms(ctx context.Context, status string) ([]models.Program, error) {
	query := bson.M{}
	if status != "" {
		query["status"] = status
	}

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.progColl.Find(ctx, query, opts)
	if err != nil {
		return nil, fmt.Errorf("find programs: %w", err)
	}
	defer cursor.Close(ctx)

	var programs []models.Program
	if err := cursor.All(ctx, &programs); err != nil {
		return nil, fmt.Errorf("decode programs: %w", err)
	}
	if programs == nil {
		programs = []models.Program{}
	}
	return programs, nil
}

// GetProgramByID fetches a single program by ID.
func (r *ProgramRepository) GetProgramByID(ctx context.Context, id bson.ObjectID) (*models.Program, error) {
	var prog models.Program
	err := r.progColl.FindOne(ctx, bson.M{"_id": id}).Decode(&prog)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrProgramNotFound
		}
		return nil, fmt.Errorf("find program by id: %w", err)
	}
	return &prog, nil
}

// UpdateProgramStatus changes open/closed status.
func (r *ProgramRepository) UpdateProgramStatus(ctx context.Context, id bson.ObjectID, status models.ProgramStatus) error {
	update := bson.M{
		"$set": bson.M{
			"status":     status,
			"updated_at": time.Now(),
		},
	}
	res, err := r.progColl.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return fmt.Errorf("update program status: %w", err)
	}
	if res.MatchedCount == 0 {
		return ErrProgramNotFound
	}
	return nil
}

// CreateApplication submits a farmer's application for a program.
func (r *ProgramRepository) CreateApplication(ctx context.Context, app *models.ProgramApplication) error {
	// Check duplicate application
	var existing models.ProgramApplication
	err := r.appColl.FindOne(ctx, bson.M{"program_id": app.ProgramID, "farmer_id": app.FarmerID}).Decode(&existing)
	if err == nil {
		return ErrAlreadyApplied
	}

	app.CreatedAt = time.Now()
	app.UpdatedAt = time.Now()
	app.SubmittedAt = time.Now()
	app.Status = models.ApplicationStatusSubmitted

	res, err := r.appColl.InsertOne(ctx, app)
	if err != nil {
		return fmt.Errorf("insert application: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		app.ID = oid
	}
	return nil
}

// ListApplicationsByProgram lists all applications for a given program (LGU view).
func (r *ProgramRepository) ListApplicationsByProgram(ctx context.Context, programID bson.ObjectID) ([]models.ProgramApplication, error) {
	opts := options.Find().SetSort(bson.D{{Key: "submitted_at", Value: -1}})
	cursor, err := r.appColl.Find(ctx, bson.M{"program_id": programID}, opts)
	if err != nil {
		return nil, fmt.Errorf("find applications by program: %w", err)
	}
	defer cursor.Close(ctx)

	var apps []models.ProgramApplication
	if err := cursor.All(ctx, &apps); err != nil {
		return nil, fmt.Errorf("decode applications: %w", err)
	}
	if apps == nil {
		apps = []models.ProgramApplication{}
	}
	return apps, nil
}

// ListApplicationsByFarmer lists all applications submitted by a farmer (Farmer view).
func (r *ProgramRepository) ListApplicationsByFarmer(ctx context.Context, farmerID bson.ObjectID) ([]models.ProgramApplication, error) {
	opts := options.Find().SetSort(bson.D{{Key: "submitted_at", Value: -1}})
	cursor, err := r.appColl.Find(ctx, bson.M{"farmer_id": farmerID}, opts)
	if err != nil {
		return nil, fmt.Errorf("find applications by farmer: %w", err)
	}
	defer cursor.Close(ctx)

	var apps []models.ProgramApplication
	if err := cursor.All(ctx, &apps); err != nil {
		return nil, fmt.Errorf("decode applications: %w", err)
	}
	if apps == nil {
		apps = []models.ProgramApplication{}
	}

	// Populate program titles
	for i := range apps {
		if prog, err := r.GetProgramByID(ctx, apps[i].ProgramID); err == nil {
			apps[i].ProgramTitle = prog.Title
		}
	}

	return apps, nil
}

// UpdateApplicationStatus reviews and updates application status & remarks.
func (r *ProgramRepository) UpdateApplicationStatus(ctx context.Context, appID bson.ObjectID, status models.ApplicationStatus, remarks string, reviewerID bson.ObjectID) error {
	update := bson.M{
		"$set": bson.M{
			"status":      status,
			"remarks":     remarks,
			"reviewed_by": reviewerID,
			"updated_at":  time.Now(),
		},
	}
	res, err := r.appColl.UpdateOne(ctx, bson.M{"_id": appID}, update)
	if err != nil {
		return fmt.Errorf("update application status: %w", err)
	}
	if res.MatchedCount == 0 {
		return ErrApplicationNotFound
	}
	return nil
}
