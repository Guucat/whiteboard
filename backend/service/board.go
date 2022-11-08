package service

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"strconv"
	"whiteboard/dao/redis"
	"whiteboard/local"
	"whiteboard/middleware/rabbitmq"
	"whiteboard/model"
	"whiteboard/utils/validator"
)

func EnterBoard(webConn *websocket.Conn, mq *rabbitmq.ExchangeInfo, boardId int, userName string) {
	// 历史序列化数据
	history := GetAllPages(boardId)
	boardInfo := gin.H{
		"type": model.EnterBoardSign,
		"data": gin.H{
			"boardId": boardId,
			"history": history,
		},
	}
	j, _ := json.Marshal(boardInfo)
	if err := webConn.WriteMessage(websocket.TextMessage, j); err != nil {

		log.Println("断开连接, 进入房间时消息写入websocket失败：", err)
		return
	}

	// read websocketMessage
	go func() {
		for {
			dataType, data, err := webConn.ReadMessage()
			if err != nil {
				log.Println("读取websocket消息失败, 退出连接:"+userName, err)
				// 判断board是否存在,
				board, _ := local.Boards.Load(boardId)
				// 房主清理board
				if board != nil && board.(*model.Board).Owner == userName {
					local.Boards.Delete(boardId)
					return
				}
				// 清理redis的users和pages键值？
				_ = redis.RemoveUserFromBoard(boardId, userName)
				// 清理rabbitMq的exchange和queue?
				return
			}
			recData := model.ReceiveWsMessage{}
			log.Println(data)
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
	}()
	// send websocketMessage
	go func() {
		for msg := range mq.ReceiveMessage() {
			mqMessage := model.MqMessage{}
			err := json.Unmarshal(msg.Body, &mqMessage)
			if err != nil {
				log.Println("fail to unmarshal rabbitMQ message ")
				continue
			}
			if mqMessage.UserName == userName {
				continue
			}
			//wsData, ok := mqMessage.Data.([]byte)
			//if !ok {
			//	log.Println("fail to convert rabbitMQ message to []byte ")
			//	continue
			//}
			sendDate := gin.H{
				"type": mqMessage.MessageType,
				"data": gin.H{
					"pageId":  mqMessage.PageId,
					"seqData": mqMessage.Data,
				},
			}
			j, _ := json.Marshal(sendDate)
			err = webConn.WriteMessage(mqMessage.DataType, j)
			if err != nil {
				log.Println("fail to write back websocket message, goroutine exits")
				return
			}
		}
	}()
	//for {
	//	messageType, p, err := webConn.ReadMessage()
	//	if err != nil {
	//		log.Println("读取websocket消息失败, 退出连接:"+userName, err)
	//		// 判断board是否存在,
	//		board, _ := local.Boards.Load(boardId)
	//		if board == nil {
	//			return
	//		}
	//		// 房主清理board
	//		if board.(*model.Board).Owner == userName {
	//			local.Boards.Delete(boardId)
	//			return
	//		}
	//
	//		// 清理redis的users和pages键值？
	//		// 清理rabbitMq的exchange和queue?
	//		return
	//		//websockets := board.(*model.Board).Websockets
	//		//for index, conn := range websockets {
	//		//	if conn == webConn {
	//		//		websockets = append(websockets[:index], websockets[index+1:]...)
	//		//		break
	//		//	}
	//		//}
	//		//board.(*model.Board).Websockets = websockets
	//
	//		//users := board.(*model.Board).Users
	//		//for index, user := range users {
	//		//	if user == userName {
	//		//		users = append(users[:index], users[index+1:]...)
	//		//		break
	//		//	}
	//		//}
	//		//board.(*model.Board).Users = users
	//
	//	}
	//
	//	if !ok {
	//		log.Println("房主解散白板")
	//		webConn.Close()
	//		return
	//		//是否需要关闭ws连接？？
	//	}
	//
	//	if err := webConn.WriteMessage(messageType, p); err != nil {
	//		log.Println("写入websocket消息失败: ", err)
	//	}
	//
	//	//board := b.(*model.Board)
	//	//for _, conn := range board.Websockets {
	//	//	if conn == webConn {
	//	//		continue
	//	//	}
	//	//	if err := conn.WriteMessage(messageType, p); err != nil {
	//	//		log.Println("写入websocket消息失败: ", err)
	//	//	}
	//	//}
	//}
}

func ValidateBoardId(boardId string) (any, bool) {
	err := validator.Validate.Var(boardId, "len=9,required,numeric")
	if err != nil {
		return nil, false
	}
	id, _ := strconv.Atoi(boardId)
	v, ok := local.Boards.Load(id)
	if !ok {
		return nil, false
	}
	return v, true
}

func AddUser(boardId int, userName string) error {
	return redis.PutUserIntoBoard(boardId, userName)
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

func GetAllPages(boardId int) map[int]string {
	board, _ := local.Boards.Load(boardId)
	pageSum := board.(*model.Board).PageSum

	history := make(map[int]string)
	for i := 0; i < pageSum; i++ {
		history[i] = GetPage(boardId, i)
	}
	return history
}
