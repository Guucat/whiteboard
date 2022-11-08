package controller

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"strconv"
	"time"
	"whiteboard/dao/redis"
	"whiteboard/local"
	"whiteboard/model"
	"whiteboard/service"
	"whiteboard/utils/res"
)

func CreateBoard(c *gin.Context) {
	// 生成白板id
	boardId, err := redis.PutUniqueId()
	if err != nil {
		log.Println("生成boardId错误", err)
		res.Fail(c, 500, "服务器生成boardId错误", nil)
		return
	}

	// 初始化白板信息
	userName := c.GetString("name")
	err = service.AddUser(boardId, userName)
	if err != nil {
		log.Println("redis添加协作用户失败", err)
		res.Fail(c, 500, "服务器添加协作用户失败", nil)
		return
	}
	err = service.AddPage(boardId, 0, "")
	if err != nil {
		log.Println("redis添加协作用户失败", err)
		res.Fail(c, 500, "服务器添加协作用户失败", nil)
		return
	}
	mq, err := service.NewMQ(boardId)
	if err != nil {
		log.Println("rabbitMq创建队列失败", err)
		res.Fail(c, 500, "服务器添创建mq失败", nil)
		return
	}
	local.Boards.Store(boardId, &model.Board{
		BoardId:  boardId,
		Owner:    userName,
		EditType: model.EditMode,
		PageSum:  1,
	})

	// 升级为websocket协议
	c.Writer.Header().Set("Sec-WebSocket-Protocol", c.GetString("token"))
	webConn, err := (&websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}).Upgrade(c.Writer, c.Request, c.Writer.Header())
	if err != nil {
		res.Fail(c, 500, "websocket 创建失败", nil)
		return
	}
	log.Println("升级协议完成, boardId: " + strconv.Itoa(boardId))
	service.EnterBoard(webConn, mq, boardId, userName)
	//err = mysql.CreateBoard(&model.Board{BoardId: boardId, Owner: owner, EditType: editType})
	//if err != nil {
	//	res.Ok(c, 400, "创建白板错误", nil)
	//	return
	//}
	//redis.PutUserIntoBoard(boardId, owner)

	//websockets := []*websocket.Conn{webConn}
	//users = append(users, owner)
	//local.Boards.Store(boardId, &model.Board{
	//	BoardId:    boardId,
	//	Owner:      owner,
	//	EditType:   editType,
	//	Users:      users,
	//	Websockets: websockets,
	//})

}

func EnterBoard(c *gin.Context) {
	boardId := c.GetInt("boardId")

	timeSeq := strconv.Itoa(int(time.Now().Unix()))
	userName := timeSeq[len(timeSeq)-6:]
	mq, err := service.NewMQ(boardId)
	if err != nil {
		log.Println("rabbitMq创建队列失败", err)
		res.Fail(c, 500, "服务器添创建mq失败", nil)
		return
	}
	err = service.AddUser(boardId, userName)
	if err != nil {
		log.Println("redis添加协作用户失败", err)
		res.Fail(c, 500, "服务器添加协作用户失败", nil)
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
		res.Fail(c, 400, "fail to upgrade websocket protocol", nil)
		return
	}
	log.Println("升级协议完成, usetName: " + userName)
	service.EnterBoard(webConn, mq, boardId, userName)

	//redis.PutUserIntoBoard(boardId, "")
	//websockets := board.(*model.Board).Websockets
	//websockets = append(websockets, webConn)
	//board.(*model.Board).Websockets = websockets

	//users := board.(*model.Board).Users
	//users = append(users, "zhy")
	//board.(*model.Board).Users = users

}

func ValidateBoardId(c *gin.Context) {
	boardId := c.Query("boardId")
	ok := service.ValidateBoardId(boardId)
	if !ok {
		res.Fail(c, 400, "boardId无效", nil)
		c.Abort()
		return
	}
	if c.FullPath() == "/board/validate" {
		res.Ok(c, 200, "boardId验证通过", nil)
		return
	}
	Id, _ := strconv.Atoi(boardId)
	c.Set("boardId", Id)
	c.Next()
}

func GetOnlineUsers(c *gin.Context) {
	boardId := c.GetInt("boardId")
	users := service.GetUsers(boardId)
	res.Ok(c, 200, "success to get all online users of current whiteboard", gin.H{
		"users": users,
	})
}

func ExitBoard(c *gin.Context) {
	boardId := c.GetInt("boardId")
	userName := c.Query("userName") //校验？？？？？

	mq, err := service.BindExchange(boardId)
	if err != nil {
		log.Println("退出房间时rabbitMq创建队列失败", err)
		res.Fail(c, 500, "服务器添创建mq失败", nil)
		return
	}
	message := model.MqMessage{
		MessageType: model.ExitBoardSign,
		UserName:    userName,
		DataType:    websocket.TextMessage,
	}
	j, err := json.Marshal(message)
	if err != nil {
		log.Println("Marshal message err:", err)
		res.Fail(c, 500, "序列化消息失败", nil)
		return
	}
	service.DeleteUser(boardId, userName)
	err = mq.SendMessage(string(j)) //异步？？
	if err != nil {
		log.Println("mq消息发送失败") //轮询？？？？
		res.Fail(c, 500, "消息发送失败", nil)
		return
	}

	res.Ok(c, 200, "退出成功", nil)
}

func DissolveBoard(c *gin.Context) {
	boardId := c.GetInt("boardId")
	ownerName := c.Query("ownerName")
	board, _ := local.Boards.Load(boardId)
	if ownerName != board.(*model.Board).Owner {
		res.Ok(c, 200, "无权限解散房间", nil)
		return
	}

	mq, err := service.BindExchange(boardId)
	if err != nil {
		log.Println("退出房间时rabbitMq创建队列失败", err)
		res.Fail(c, 500, "服务器添创建mq失败", nil)
		return
	}
	message := model.MqMessage{
		MessageType: model.DissolveBoardSign,
		UserName:    ownerName,
		DataType:    websocket.TextMessage,
	}
	j, err := json.Marshal(message)
	if err != nil {
		log.Println("Marshal message err:", err)
		res.Fail(c, 500, "序列化消息失败", nil)
		return
	}
	service.DeleteAllUser(boardId)
	err = mq.SendMessage(string(j)) //异步？？
	if err != nil {
		log.Println("mq消息发送失败") //轮询？？？？
		res.Fail(c, 500, "消息发送失败", nil)
		return
	}

	res.Ok(c, 200, "解散成功", nil)
}
