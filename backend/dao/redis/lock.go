package redis

import (
	"context"
	"log"
	"time"
)

const ValidTime = 3

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
				if db.Exists(ctx, key).Val() == 1 {
					db.Expire(ctx, key, 2*time.Millisecond)
				} else {
					return
				}
			}
		}
	}()
	return
}

func Unlock(cancel context.CancelFunc, key string, value string) {
	// 取消daemon goroutine
	cancel()
	// 原子性
	if db.Get(ctx, key).Val() == value {
		db.Del(ctx, key)
	}
	return
}
