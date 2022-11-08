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
		if err = DB.SAdd(Ctx, "uniqueId", boardId).Err(); err != nil {
			return 0, err
		}
		return
	}
}

func PutUserIntoBoard(boardId int, userName string) error {
	key := strconv.Itoa(boardId) + "users"
	return DB.SAdd(Ctx, key, userName).Err()
}

func RemoveUserFromBoard(boardId int, userName string) error {
	key := strconv.Itoa(boardId) + "users"
	return DB.SRem(Ctx, key, userName).Err()
}

func RemoveAllUserFromBoard(boardId int) error {
	key := strconv.Itoa(boardId) + "users"
	return DB.Del(Ctx, key).Err() //unlink？？？
}

func GetUsersOfBoard(boarId int) []string {
	key := strconv.Itoa(boarId) + "users"
	return DB.SMembers(Ctx, key).Val()
}

func PutPageIntoBoard(boardId int, pageId int, data string) error {
	key := strconv.Itoa(boardId) + "pages"
	filed := strconv.Itoa(pageId)
	return DB.HSet(Ctx, key, filed, data).Err()
}

func GetPages(boardId int, pageId int) (string, error) {
	key := strconv.Itoa(boardId) + "pages"
	filed := strconv.Itoa(pageId)
	res := DB.HGet(Ctx, key, filed)
	return res.Result()
}

func ExistBoard(boardId int) bool {
	key := strconv.Itoa(boardId) + "board"
	ok := DB.Exists(Ctx, key).Val()
	return ok == 1
}
