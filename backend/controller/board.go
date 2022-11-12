package controller

import (
	"context"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
	"whiteboard/dao/redis"
	"whiteboard/model"
	"whiteboard/service"
	"whiteboard/utils/jwt"
	"whiteboard/utils/res"
	"whiteboard/utils/uuid"
)

func CreateBoard(c *gin.Context) {
	// 生成白板id
	boardId, err := service.GenUniqueId()
	if err != nil {
		log.Println("生成boardId错误", err)
		res.Fail(c, 500, "服务器生成boardId错误", nil)
		return
	}

	// 初始化白板信息
	userName := c.GetString("name")
	err = service.AddBoard(boardId, userName, model.EditMode, 1)
	if err != nil {
		log.Println("redis添加白板失败", err)
		res.Fail(c, 500, "服务器添加白板失败", nil)
		return
	}
	//添加用户
	err = service.AddUser(boardId, userName)
	if err != nil {
		log.Println("redis添加用户失败", err)
		res.Fail(c, 500, "服务器添加用户失败", nil)
		return
	}
	//mongodb修改
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

	protocolToken := c.Request.Header.Get("Sec-WebSocket-Protocol")
	var userName string
	if protocolToken == "" {
		timeSeq := strconv.Itoa(int(time.Now().Unix()))
		userName = timeSeq[len(timeSeq)-6:]
	} else {
		mes, err := jwt.ParseToken(protocolToken)
		if err != nil {
			res.Fail(c, 400, "token无效", nil)
			c.Abort()
			return
		}
		userName = mes.Name
	}

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
	c.Writer.Header().Set("Sec-WebSocket-Protocol", protocolToken)
	webConn, err := (&websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}).Upgrade(c.Writer, c.Request, c.Writer.Header())
	if err != nil {
		res.Fail(c, 400, "fail to upgrade websocket protocol", nil)
		return
	}
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
	if boardId == "" {
		boardId = c.PostForm("boardId")
	}
	_, ok := service.ValidateBoardId(boardId)
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

func AddOnePage(c *gin.Context) {
	boardId := c.PostForm("boardId")
	jsonFile, _ := c.FormFile("jsonFile")
	board, v := service.ValidateBoardId(boardId)
	if v == false {
		res.Fail(c, 400, "boardId无效", nil)
		return
	}
	// redis 分布式锁
	key := "boardLock" + boardId
	threadId := uuid.Get()
	ctx, cancel := context.WithCancel(context.Background())
	redis.Lock(ctx, key, threadId)
	defer redis.Unlock(cancel, key, threadId)

	curPage := board.(*model.Board).PageSum
	data := ""
	if jsonFile != nil {
		// creat a json decoder
		f, err := jsonFile.Open()
		if err != nil {
			res.Fail(c, 400, "json文件无效", nil)
			return
		}
		defer f.Close()
		var info = make([]byte, jsonFile.Size)
		_, err = f.Read(info)
		if err != nil {
			res.Fail(c, 400, "json文件无法读取", nil)
			return
		}
		data = strings.Trim(string(info), "/")
		//decoder := json.NewDecoder(f)
		//err = decoder.Decode(&data)
		//if err != nil {
		//	res.Fail(c, 400, "json无法被解析", nil)
		//	return
		//}
	}
	numBoardId, _ := strconv.Atoi(boardId)
	err := service.AddPage(numBoardId, curPage, data)
	if err != nil {
		res.Fail(c, 400, "添加新页失败", nil)
		return
	}
	board.(*model.Board).PageSum += 1

	id, _ := strconv.Atoi(boardId)
	err = service.AddBoard(id, board.(*model.Board).Owner, board.(*model.Board).EditType, board.(*model.Board).PageSum)
	if err != nil {
		log.Println("fail to fresh board info: ", err)
		return
	}
	//pageInfo := gin.H{
	//	"type": model.AddNewPageSign,
	//	"data": gin.H{
	//		"newPageId": curPage,
	//		"seqData":   data,
	//	},
	//}
	mq, err := service.BindExchange(numBoardId)
	if err != nil {
		res.Fail(c, 500, "rabbitMQ绑定失败", nil)
	}
	mqMessage := model.MqMessage{
		MessageType: model.AddNewPageSign,
		UserName:    "",
		DataType:    websocket.TextMessage,
		PageId:      curPage,
		Data:        data,
	}
	m, err := json.Marshal(mqMessage)
	if err != nil {
		res.Fail(c, 500, "mq消息序列化失败", nil)
	}
	err = mq.SendMessage(string(m))
	if err != nil {
		res.Fail(c, 500, "mq消息发送失败", nil)
		return
	}
	res.Ok(c, 200, "新建页成功", gin.H{
		"pageId":  curPage,
		"seqData": data,
	})
}
func ExitBoard(c *gin.Context) {
	boardId := c.GetInt("boardId")
	userName := c.Query("userName")
	ok, err := service.ExistUserInBoard(boardId, userName)
	if err != nil {
		log.Println("查询用户是否在房间失败", err)
		res.Fail(c, 500, "服务器错误", nil)
		return
	}
	if !ok {
		res.Fail(c, 200, "不在房间内", nil)
		return
	}

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
	_ = service.DeleteUser(boardId, userName)
	users := service.GetUsers(boardId)
	if len(users) == 0 {
		service.SetExpireBoard(boardId)
	}
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
	ownerName := c.GetString("name")
	board, err := service.GetBoardInfo(strconv.Itoa(boardId))
	if err != nil {
		log.Println("获取board信息错误, err:", err)
		res.Fail(c, 400, "获取board信息错误", nil)
		return
	}
	if ownerName != board.Owner {
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
	_ = service.DeleteAllUser(boardId)
	service.SetExpireBoard(boardId)

	err = mq.SendMessage(string(j)) //异步？？
	if err != nil {
		log.Println("mq消息发送失败") //轮询？？？？
		res.Fail(c, 500, "消息发送失败", nil)
		return
	}

	res.Ok(c, 200, "解散成功", nil)
}

func SwitchMode(c *gin.Context) {
	boardId := c.PostForm("boardId")
	board, v := service.ValidateBoardId(boardId)
	if v == false {
		res.Fail(c, 400, "boardId无效", nil)
		return
	}
	userName := c.GetString("name")

	Mode := c.PostForm("newMode")
	if Mode != "1" && Mode != "0" {
		res.Fail(c, 400, "切换模式无效", nil)
		return
	}
	newMode, _ := strconv.Atoi(Mode)

	boardInfo := board.(*model.Board)
	if userName != boardInfo.Owner {
		res.Ok(c, 200, "无权限切换模式", nil)
		return
	}

	err := service.PutNewMode(boardId, newMode)
	if err != nil {
		log.Println("模式转换失败", err)
		res.Fail(c, 500, "模式转换失败", nil)
		return
	}

	mq, err := service.BindExchange(boardInfo.BoardId)
	if err != nil {
		log.Println("模式转换时rabbitMq创建队列失败", err)
		res.Fail(c, 500, "服务器添创建mq失败", nil)
		return
	}
	message := model.MqMessage{
		MessageType: model.SwitchModeSign,
		UserName:    userName,
		DataType:    websocket.TextMessage,
		Data:        newMode,
	}
	m, err := json.Marshal(message)
	if err != nil {
		log.Println("Marshal message err:", err)
		res.Fail(c, 500, "序列化消息失败", nil)
		return
	}
	err = mq.SendMessage(string(m)) //异步？？
	if err != nil {
		log.Println("mq消息发送失败") //轮询？？？？
		res.Fail(c, 500, "消息发送失败", nil)
		return
	}
	res.Ok(c, 200, "切换成功", nil)
}
