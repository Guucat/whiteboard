package mongodb

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"strconv"
	"time"
	"whiteboard/setting"
)

var (
	ctx        context.Context
	collection *mongo.Collection
)

func Init(cfg *setting.MongoDBConfig) {
	Ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	uri := fmt.Sprintf("mongodb://%s:%s", cfg.Host, strconv.Itoa(cfg.Port))
	o := options.Client().ApplyURI(uri)
	//o.SetMaxPoolSize(50)
	client, err := mongo.Connect(ctx, o)
	if err != nil {
		log.Fatal(err)
	}

	ctx = Ctx
	defer func() {
		if err = client.Disconnect(ctx); err != nil {
			log.Fatal(err)
		}
	}()

	db := client.Database(cfg.DBName)
	collection = db.Collection("board") //设置数据集
}
