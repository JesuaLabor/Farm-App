package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// Connect establishes a connection to MongoDB and verifies it with a ping.
func Connect(uri string) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(clientOpts)
	if err != nil {
		return nil, fmt.Errorf("failed to create mongo client: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("failed to ping mongo: %w", err)
	}

	log.Println("✅ Connected to MongoDB")
	return client, nil
}

// GetCollection returns a handle to a specific MongoDB collection.
func GetCollection(client *mongo.Client, dbName, collName string) *mongo.Collection {
	return client.Database(dbName).Collection(collName)
}
