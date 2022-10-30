package redis

import (
	"math/rand"
	"strconv"
	"time"
)

const (
	min = 1e8
	max = 1e9
)

func PutUniqueId() (boardId int, err error) {
	rand.Seed(time.Now().UnixNano())
	for {
		boardId = int(rand.Int31n(max-min) + min)
		if exist := DB.SIsMember(Ctx, "uniqueId", boardId).Val(); exist {
			continue
		}
		if err = DB.SAdd(Ctx, "uniQueId", boardId).Err(); err != nil {
			return 0, err
		}
	}
	return
}

func PutUserIntoBoard(boardId int, userName string) error {
	if err := DB.SAdd(Ctx, strconv.Itoa(boardId), userName).Err(); err != nil {
		return err
	}
	return nil
}

func GetBoardById(boardId int) bool {
	ok := DB.Exists(Ctx, strconv.Itoa(boardId)).Val()
	if ok == 1 {
		return true
	}
	return false
}
