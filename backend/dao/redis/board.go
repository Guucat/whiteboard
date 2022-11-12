package redis

import (
	"math/rand"
	"strconv"
	"time"
	"whiteboard/model"
)

const (
	min = 1e8
	max = 1e9
)

func AddBoard(boardId int, owner string, editType int, pageSum int) error {
	return db.HMSet(ctx, strconv.Itoa(boardId), "owner", owner, "editType", editType, "pageSum", pageSum).Err()
}

func GetBoard(boardId string) (*model.Board, error) {
	boardInfo, err := db.HGetAll(ctx, boardId).Result()
	if err != nil {
		return nil, err
	}
	Id, _ := strconv.Atoi(boardId)
	editType, _ := strconv.Atoi(boardInfo["editType"])
	pageSum, _ := strconv.Atoi(boardInfo["pageSum"])
	return &model.Board{
		BoardId:  Id,
		Owner:    boardInfo["owner"],
		EditType: editType,
		PageSum:  pageSum,
	}, nil
}

func SetExpireBoard(boardId int) {
	key := strconv.Itoa(boardId) + "pages"
	db.Expire(ctx, key, 1*time.Minute)
	db.Expire(ctx, strconv.Itoa(boardId), 1*time.Minute)
}

func PutUniqueId() (boardId int, err error) {
	rand.Seed(time.Now().UnixNano())
	for {
		boardId = int(rand.Int31n(max-min) + min)
		if exist := db.SIsMember(ctx, "uniqueId", boardId).Val(); exist {
			continue
		}
		if err = db.SAdd(ctx, "uniqueId", boardId).Err(); err != nil {
			return 0, err
		}
		return
	}
}

func PutUserIntoBoard(boardId int, userName string) error {
	key := strconv.Itoa(boardId) + "users"
	return db.SAdd(ctx, key, userName).Err()
}

func RemoveUserFromBoard(boardId int, userName string) error {
	key := strconv.Itoa(boardId) + "users"
	return db.SRem(ctx, key, userName).Err()
}

func RemoveAllUserFromBoard(boardId int) error {
	key := strconv.Itoa(boardId) + "users"
	return db.Del(ctx, key).Err() //unlink？？？
}

func GetUsersOfBoard(boarId int) []string {
	key := strconv.Itoa(boarId) + "users"
	return db.SMembers(ctx, key).Val()
}

func ExistUserInBoard(boardId int, userName string) (bool, error) {
	return db.SIsMember(ctx, strconv.Itoa(boardId)+"users", userName).Result()
}

func PutPageIntoBoard(boardId int, pageId int, data string) error {
	key := strconv.Itoa(boardId) + "pages"
	filed := strconv.Itoa(pageId)
	return db.HSet(ctx, key, filed, data).Err()
}

func GetPages(boardId int, pageId int) (string, error) {
	key := strconv.Itoa(boardId) + "pages"
	filed := strconv.Itoa(pageId)
	res := db.HGet(ctx, key, filed)
	return res.Result()
}

func PutNewMode(boardId string, newMode int) error {
	return db.HSet(ctx, boardId, "editType", newMode).Err()
}

func ExistBoard(boardId string) (bool, error) {
	ok, err := db.Exists(ctx, boardId).Result()
	if err != nil {
		return false, err
	}
	if ok == 1 {
		return true, nil
	}
	return false, nil
}
