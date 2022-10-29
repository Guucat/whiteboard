package controller

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"math/rand"
	"net/http"
	"whiteboard/local"
	"whiteboard/model"
	"whiteboard/utils/res"
)

func CreateBoard(c *gin.Context) {
	boardId := rand.Int()
	owner := c.GetString("name")
	editType := model.EditMode
	users := make([]string, 10)

	webConn, err := (&websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}).Upgrade(c.Writer, c.Request, nil)

	if err != nil {
		res.Ok(c, 400, "websocket 创建失败", nil)
		return
	}
	// 通过白板id存放白板
	websockets := []*websocket.Conn{webConn}
	local.Boards.Store(boardId, &model.Board{
		BoardId:    boardId,
		Owner:      owner,
		EditType:   editType,
		Users:      users,
		Websockets: websockets,
	})

	boardInfo := gin.H{
		"code": 200,
		"msg":  "创建房间成功",
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
			log.Println("读取websocket消息失败:", err)
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
