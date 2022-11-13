package service

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"strconv"
	"whiteboard/dao/redis"
	"whiteboard/middleware/rabbitmq"
	"whiteboard/model"
	"whiteboard/utils/validator"
)

func EnterBoard(webConn *websocket.Conn, mq *rabbitmq.ExchangeInfo, boardId int, userName string) {
	// Historical serialized data
	history, board := GetAllPages(boardId)
	owner := board.Owner
	isOwner := false
	if owner == userName {
		isOwner = true
	}

	boardInfo := gin.H{
		"type": model.EnterBoardSign,
		"data": gin.H{
			"boardId":   boardId,
			"history":   history,
			"userName":  userName,
			"isOwner":   isOwner,
			"boardMode": board.EditType,
		},
	}
	j, _ := json.Marshal(boardInfo)
	if err := webConn.WriteMessage(websocket.TextMessage, j); err != nil {
		log.Println("Disconnected, failed to write message to websocket while entering the room err:", err)
		return
	}

	// Notify other users of their own entry message
	mqMessage := model.MqMessage{
		MessageType: model.EnterBoardSign,
		UserName:    userName,
		DataType:    websocket.TextMessage,
		Data:        redis.GetUsersOfBoard(boardId),
	}
	jsonMqMessage, _ := json.Marshal(mqMessage)
	err := mq.SendMessage(string(jsonMqMessage))
	if err != nil {
		log.Println("Sending message err:", err)
	}

	// read websocketMessage
	go readMessage(webConn, mq, boardId, userName)
	// send websocketMessage
	go sendMessage(webConn, mq, boardId, userName)
}

func readMessage(webConn *websocket.Conn, mq *rabbitmq.ExchangeInfo, boardId int, userName string) {
	for {
		dataType, data, err := webConn.ReadMessage()
		if err != nil {
			log.Println("Failed to read websocket message, quit connection err:", err)

			// Deleting a user If the number of users on the whiteboard is 0, set the expiration time for the whiteboard
			_ = redis.RemoveUserFromBoard(boardId, userName)
			users := GetUsers(boardId)
			if len(users) == 0 {
				SetExpireBoard(boardId)
			}
			// Deleting queue
			_ = mq.DeletePsQueue()
			break
		}

		board, err := GetBoardInfo(strconv.Itoa(boardId))
		if err != nil {
			log.Println("Get board err:", err)
			return
		}
		recData := model.ReceiveWsMessage{}
		err = json.Unmarshal(data, &recData)
		if err != nil {
			log.Println("websocket message read failed err:", err)
			continue
		}
		// Determine if collaboration is possible
		if board.EditType == model.ReadMode || (recData.PageId < 0 || recData.PageId >= board.PageSum) {
			message := gin.H{
				"type": model.ForbiddenWrite,
			}
			m, _ := json.Marshal(message)
			if err := webConn.WriteMessage(websocket.TextMessage, m); err != nil {
				log.Println("Disconnected, failed to write message to websocket while entering the room err:", err)
				return
			}
			continue
		}

		// Add page
		err = AddPage(boardId, recData.PageId, recData.SeqData)
		if err != nil {
			log.Println("Failed to serialize messages for storage in redis ", err)
		}
		mqMessage := model.MqMessage{
			MessageType: model.SequenceBoardSign,
			UserName:    userName,
			DataType:    dataType,
			PageId:      recData.PageId,
			Data:        recData.SeqData,
		}
		jsonMqMessage, _ := json.Marshal(mqMessage)
		err = mq.SendMessage(string(jsonMqMessage))
		if err != nil {
			log.Println("Send message err")
		}
	}
}

func sendMessage(webConn *websocket.Conn, mq *rabbitmq.ExchangeInfo, boardId int, userName string) {
	for msg := range mq.ReceiveMessage() {
		isDissolve := false
		mqMessage := model.MqMessage{}
		err := json.Unmarshal(msg.Body, &mqMessage)
		if err != nil {
			log.Println("fail to unmarshal rabbitMQ message ")
			continue
		}
		var sendData gin.H
		if mqMessage.MessageType == model.SequenceBoardSign && mqMessage.UserName != userName {
			sendData = gin.H{
				"type": model.SequenceBoardSign,
				"data": gin.H{
					"pageId":  mqMessage.PageId,
					"seqData": mqMessage.Data,
				},
			}
		} else if mqMessage.MessageType == model.AddNewPageSign {
			sendData = gin.H{
				"type": model.AddNewPageSign,
				"data": gin.H{
					"pageId":  mqMessage.PageId,
					"seqData": mqMessage.Data,
				},
			}
		} else if mqMessage.MessageType == model.EnterBoardSign || (mqMessage.MessageType == model.ExitBoardSign && mqMessage.UserName != userName) {
			sendData = gin.H{
				"type": model.UserCountChangedSign,
				"data": gin.H{
					"users":   redis.GetUsersOfBoard(boardId),
					"user":    mqMessage.UserName,
					"inOrOut": mqMessage.MessageType,
				},
			}
		} else if mqMessage.MessageType == model.DissolveBoardSign {
			isDissolve = true
			sendData = gin.H{
				"type":    model.DissolveBoardSign,
				"data":    "",
				"isOwner": mqMessage.UserName == userName,
			}
		} else if mqMessage.MessageType == model.ExitBoardSign {
			webConn.Close()
			if err = mq.DeletePsQueue(); err != nil {
				log.Println("Delete queue err:", err)
			}
			return
		} else if mqMessage.MessageType == model.SwitchModeSign {
			sendData = gin.H{
				"type": model.SwitchModeSign,
				"data": gin.H{
					"newMode": mqMessage.Data,
				},
			}
		} else {
			continue // Ignore your own messages
		}
		j, _ := json.Marshal(sendData)
		err = webConn.WriteMessage(mqMessage.DataType, j)
		if err != nil {
			log.Println("fail to write back websocket message, goroutine exits")
			return
		}
		if isDissolve {
			webConn.Close()
			return
		}
	}
}

func ValidateBoardId(boardId string) (any, bool) {
	err := validator.Validate.Var(boardId, "len=9,required,numeric")
	if err != nil {
		return nil, false
	}
	board, err := GetBoardInfo(boardId)
	if err != nil {
		log.Println("Get board info err:", err)
		return nil, false
	}
	if board == nil {
		return nil, false
	}
	return board, true
}

func GetBoardInfo(boardId string) (*model.Board, error) {
	return redis.GetBoard(boardId)
}

func GenUniqueId() (int, error) {
	return redis.PutUniqueId()
}

func AddBoard(boardId int, owner string, editType int, pageSum int) error {
	return redis.AddBoard(boardId, owner, editType, pageSum)
}

func SetExpireBoard(boardId int) {
	redis.SetExpireBoard(boardId)
}

func AddUser(boardId int, userName string) error {
	return redis.PutUserIntoBoard(boardId, userName)
}

func DeleteUser(boardId int, userName string) error {
	return redis.RemoveUserFromBoard(boardId, userName)
}

func DeleteAllUser(boardId int) error {
	return redis.RemoveAllUserFromBoard(boardId)
}

func GetUsers(boardId int) []string {
	return redis.GetUsersOfBoard(boardId)
}

func ExistUserInBoard(boardId int, userName string) (bool, error) {
	return redis.ExistUserInBoard(boardId, userName)
}

func AddPage(boardId int, pageId int, data string) error {
	return redis.PutPageIntoBoard(boardId, pageId, data)
}

func GetPage(boardId int, pageId int) string {
	data, err := redis.GetPages(boardId, pageId)
	if err != nil {
		return ""
	}
	return data
}

func GetAllPages(boardId int) ([]string, *model.Board) {
	board, err := GetBoardInfo(strconv.Itoa(boardId))
	if err != nil {
		log.Println("Get board info")
		return nil, nil
	}
	history := make([]string, board.PageSum)
	for i := 0; i < board.PageSum; i++ {
		o := gin.H{
			strconv.Itoa(i): GetPage(boardId, i),
		}
		page, err := json.Marshal(o)
		if err != nil {
			log.Println("history serialization failed", err)
			return nil, nil
		}
		history[i] = string(page)
	}
	return history, board
}

func PutNewMode(boardId string, newMode int) error {
	return redis.PutNewMode(boardId, newMode)
}
