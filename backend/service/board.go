package service

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"whiteboard/local"
	"whiteboard/model"
)

func EnterBoard(webConn *websocket.Conn, boardId int, userName string) {
	boardInfo := gin.H{
		"code": 200,
		"msg":  "进入房间成功，欢迎" + userName,
		"data": gin.H{
			"boardId": boardId,
		},
	}
	j, _ := json.Marshal(boardInfo)
	if err := webConn.WriteMessage(websocket.TextMessage, j); err != nil {
		log.Println("写入websocket消息失败：", err)
		return
	}
	for {
		messageType, p, err := webConn.ReadMessage()

		if err != nil {
			log.Println("读取websocket消息失败:"+userName, err)

			board, _ := local.Boards.Load(boardId)
			if board.(*model.Board).Owner == userName {
				local.Boards.Delete(boardId)
				return
			}
			websockets := board.(*model.Board).Websockets
			for index, conn := range websockets {
				if conn == webConn {
					websockets = append(websockets[:index], websockets[index+1:]...)
					break
				}
			}
			board.(*model.Board).Websockets = websockets

			users := board.(*model.Board).Users
			for index, user := range users {
				if user == userName {
					users = append(users[:index], users[index+1:]...)
					break
				}
			}
			board.(*model.Board).Users = users

			return
		}
		b, ok := local.Boards.Load(boardId)
		if !ok {
			log.Println("房主解散白板")
			return
			//是否需要关闭ws连接？？？
		}
		board := b.(*model.Board)
		for _, conn := range board.Websockets {
			if conn == webConn {
				continue
			}
			if err := conn.WriteMessage(messageType, p); err != nil {
				log.Println("写入websocket消息失败: ", err)
			}
		}
	}
}
