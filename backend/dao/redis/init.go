package redis

import (
	"context"
	"github.com/go-redis/redis/v8"
	"strconv"
	"whiteboard/setting"
)

var (
	db  *redis.Client
	ctx = context.Background()
)

func Init(cfg *setting.RedisConfig) {
	db = redis.NewClient(&redis.Options{
		Addr:     cfg.Host + ":" + strconv.Itoa(cfg.Port),
		Password: "",
		DB:       cfg.Db,
		PoolSize: cfg.PoolSize,
	})
}
