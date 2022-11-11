package redis

import (
	"context"
	"github.com/go-redis/redis/v8"
	"log"
	"time"
)

const ValidTime = 3

var DelayExpirationTimeScript = redis.NewScript(`
local key = KEYS[1]
local threadId = ARGV[1]
local expiredTime = ARGV[2]
local curTheadId = redis.call("GET", key)
if curTheadId ~= threadId then
	return 0
end
redis.call("EXPIRE", key, expiredTime)
return 1
`)

var DelKeyScript = redis.NewScript(`
local key = KEYS[1]
local threadId = ARGV[1]
local curTheadId = redis.call("GET", key)
if curTheadId ~= threadId then
	return 0
end
redis.call("DEL", key)
return 1
`)

// Lock key is the name of Concurrent resources, value used to identify thread
func Lock(daemonCtx context.Context, key string, threadId string) {
	// 两秒过期时间
	for db.SetNX(ctx, key, threadId, ValidTime*time.Second).Val() == false {
		// 自旋
	}
	// 守护线程延长锁有效时间
	go func() {
		time.Sleep(time.Second)
		for {
			select {
			case <-daemonCtx.Done():
				return
			case <-time.After(1 * time.Second):
				// 原子性操作
				log.Printf("延长锁时间: " + key)
				keys := []string{key}
				values := []string{threadId}
				num, err := DelayExpirationTimeScript.Run(ctx, db, keys, values).Int()
				if err != nil {
					log.Println("fail to execute DelayExpirationTimeScript: ", err)
				}
				if num == 0 {
					return
				}
				//if db.Get(ctx, key).Val() == threadId {
				//	db.Expire(ctx, key, 2*time.Millisecond)
				//} else {
				//	return
				//}
			}
		}
	}()
	return
}

func Unlock(cancel context.CancelFunc, key string, threadId string) {
	// 取消daemon goroutine
	cancel()
	// 原子性
	//if db.Get(ctx, key).Val() == threadId {
	//	db.Del(ctx, key)
	//}
	keys := []string{key}
	values := []string{threadId}
	_, err := DelKeyScript.Run(ctx, db, keys, values).Int()
	if err != nil {
		log.Println("fail to execute DelKeyScript: ", err)
	}
	return
}
