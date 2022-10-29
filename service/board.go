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

		if err != nil && userName == "zhy" {
			log.Println("读取websocket消息失败:"+userName, err)
			return
		}
		b, _ := local.Boards.Load(boardId)
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
