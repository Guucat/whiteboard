package controller

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"strconv"
	"whiteboard/dao/redis"
	"whiteboard/local"
	"whiteboard/model"
	"whiteboard/service"
	"whiteboard/utils/res"
	"whiteboard/utils/validator"
)

func CreateBoard(c *gin.Context) {
	boardId, err := redis.PutUniqueId()
	if err != nil {
		log.Println("生成boardId错误", err)
		c.JSON(http.StatusForbidden, gin.H{
			"code": 400,
			"msg":  "生成boardId错误",
		})
		return
	}
	users := make([]string, 0, 10)
	owner := c.GetString("name")
	editType := model.EditMode

	c.Writer.Header().Set("Sec-WebSocket-Protocol", c.GetString("token"))
	webConn, err := (&websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}).Upgrade(c.Writer, c.Request, c.Writer.Header())
	fmt.Println("升级协议完成")
	if err != nil {
		res.Ok(c, 400, "websocket 创建失败", nil)
		return
	}

	//err = mysql.CreateBoard(&model.Board{BoardId: boardId, Owner: owner, EditType: editType})
	//if err != nil {
	//	res.Ok(c, 400, "创建白板错误", nil)
	//	return
	//}
	//redis.PutUserIntoBoard(boardId, owner)
	websockets := []*websocket.Conn{webConn}
	users = append(users, owner)
	local.Boards.Store(boardId, &model.Board{
		BoardId:    boardId,
		Owner:      owner,
		EditType:   editType,
		Users:      users,
		Websockets: websockets,
	})
	service.EnterBoard(webConn, boardId, owner)
}

func EnterBoard(c *gin.Context) {
	tempId := c.Query("boardId")
	err := validator.Validate.Var(tempId, "len=9,required,numeric")
	if err != nil {
		log.Println("boardId无效", err)
		res.Ok(c, 400, "boardId无效", nil)
		return
	}
	BoardId, _ := strconv.Atoi(tempId)
	//判断board是否存在
	board, ok := local.Boards.Load(BoardId)
	if !ok {
		log.Println("查找board失败", err)
		res.Ok(c, 400, "查找board失败", nil)
		return
	}
	//if redis.GetBoardById(boardId) {
	//	log.Println("查找board失败", err)
	//	res.Ok(c, 400, "查找board失败", nil)
	//	return
	//}

	//升级ws协议
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

	//redis.PutUserIntoBoard(boardId, "")
	websockets := board.(*model.Board).Websockets
	websockets = append(websockets, webConn)
	board.(*model.Board).Websockets = websockets

	users := board.(*model.Board).Users
	users = append(users, "zhy")
	board.(*model.Board).Users = users

	service.EnterBoard(webConn, BoardId, "zhy")
}
