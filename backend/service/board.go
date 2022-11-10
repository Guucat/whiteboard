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
	// 历史序列化数据
	history, board := GetAllPages(boardId)
	owner := board.Owner
	isOwner := false
	if owner == userName {
		isOwner = true
	}
	boardInfo := gin.H{
		"type": model.EnterBoardSign,
		"data": gin.H{
			"boardId":  boardId,
			"history":  history,
			"userName": userName,
			"isOwner":  isOwner,
		},
	}
	j, _ := json.Marshal(boardInfo)
	if err := webConn.WriteMessage(websocket.TextMessage, j); err != nil {
		log.Println("断开连接, 进入房间时消息写入websocket失败：", err)
		return
	}

	//通知其他用户自己的进入消息
	mqMessage := model.MqMessage{
		MessageType: model.EnterBoardSign,
		UserName:    userName,
		DataType:    websocket.TextMessage,
		Data:        redis.GetUsersOfBoard(boardId),
	}
	jsonMqMessage, _ := json.Marshal(mqMessage)
	err := mq.SendMessage(string(jsonMqMessage))
	if err != nil {
		log.Println("mq消息发送失败")
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
			log.Println("读取websocket消息失败, 退出连接:"+userName, err)
			// 判断board是否存在,
			//board, _ := local.Boards.Load(boardId)
			//// 房主清理board
			//if board != nil && board.(*model.Board).Owner == userName {
			//	local.Boards.Delete(boardId)
			//	return
			//}
			// 清理redis的users和pages键值？
			_ = redis.RemoveUserFromBoard(boardId, userName)
			// 清理rabbitMq的exchange和queue?
			//return
			break
		}

		board, err := GetBoardInfo(strconv.Itoa(boardId))
		if err != nil {
			log.Println("获取board错误, err", err)
			return
		}
		//判断是否可协作
		if board.EditType == model.ReadMode {
			message := gin.H{
				"type": model.ForbiddenWrite,
			}
			m, _ := json.Marshal(message)
			if err := webConn.WriteMessage(websocket.TextMessage, m); err != nil {
				log.Println("断开连接, 进入房间时消息写入websocket失败：", err)
				return
			}
			continue
		}

		recData := model.ReceiveWsMessage{}
		err = json.Unmarshal(data, &recData)
		if err != nil {
			log.Println("websocket消息读取失败 ", err)
			continue
		}

		err = AddPage(boardId, recData.PageId, recData.SeqData)
		if err != nil {
			log.Println("序列化消息存储到redis失败 ", err)
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
			log.Println("mq消息发送失败")
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
			log.Println(userName + "退出房间中")
			webConn.Close()
			if err = mq.DeletePsQueue(); err != nil {
				log.Println("删除队列错误", err)
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
			continue //忽略自己的消息
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
		log.Println("获取board信息错误，err:", err)
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

func AddBoard(boardId int, owner string, editType int, pageSum int) error {
	return redis.AddBoard(boardId, owner, editType, pageSum)
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
		log.Println("获取board信息失败")
		return nil, nil
	}
	history := make([]string, board.PageSum)
	for i := 0; i < board.PageSum; i++ {
		o := gin.H{
			strconv.Itoa(i): GetPage(boardId, i),
		}
		page, err := json.Marshal(o)
		if err != nil {
			log.Println("history序列化失败", err)
		}
		history[i] = string(page)
	}
	return history, board
}

func PutNewMode(boardId string, newMode int) error {
	return redis.PutNewMode(boardId, newMode)
}
