// Package controller is used to accept frontend data and return page request information

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

// CreateBoard Randomly generate the whiteboard ID, cache the whiteboard data to the Redis database,
//and create a message queue through the whiteboard ID, then upgrade the protocol to WebSocket protocol,
//and finally start reading and receiving messages from yourself and other users.
func CreateBoard(c *gin.Context) {
	// Generating a Whiteboard ID
	boardId, err := service.GenUniqueId()
	if err != nil {
		log.Println("Generating a Whiteboard ID err:", err)
		res.Fail(c, 500, "Generate a Whiteboard ID", nil)
		return
	}

	// Initializing whiteboard information
	userName := c.GetString("name")
	err = service.AddBoard(boardId, userName, model.EditMode, 1)
	if err != nil {
		log.Println("Initializing whiteboard information err:", err)
		res.Fail(c, 500, "Initializing whiteboard information err", nil)
		return
	}

	//	Add user
	err = service.AddUser(boardId, userName)
	if err != nil {
		log.Println("Add user err:", err)
		res.Fail(c, 500, "Add user err", nil)
		return
	}

	// Add page
	err = service.AddPage(boardId, 0, "")
	if err != nil {
		log.Println("Add page err:", err)
		res.Fail(c, 500, "Add page err", nil)
		return
	}

	// Create MQ
	mq, err := service.NewMQ(boardId)
	if err != nil {
		log.Println("Create MQ err:", err)
		res.Fail(c, 500, "Create MQ err", nil)
		return
	}

	// Upgrade protocol
	c.Writer.Header().Set("Sec-WebSocket-Protocol", c.GetString("token"))
	webConn, err := (&websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}).Upgrade(c.Writer, c.Request, c.Writer.Header())
	if err != nil {
		log.Println("Upgrade protocol err:", err)
		res.Fail(c, 500, "fail to upgrade websocket protocol", nil)
		return
	}

	// Enter Board
	service.EnterBoard(webConn, mq, boardId, userName)
}

// EnterBoard According to the whiteboard ID sent by the user's request,
//if the token is not carried, it will enter anonymously (the system randomly generates a digital mark name).
//If the token is carried, it will enter according to the username.
//Bind the message queue to the whiteboard ID, then upgrade to the WebSocket protocol,
//and finally start reading and receiving messages from yourself and other users.
func EnterBoard(c *gin.Context) {
	// GET Info
	boardId := c.GetInt("boardId")
	// Names are generated randomly if no token
	protocolToken := c.Request.Header.Get("Sec-WebSocket-Protocol")
	var userName string
	if protocolToken == "" {
		timeSeq := strconv.Itoa(int(time.Now().Unix()))
		userName = timeSeq[len(timeSeq)-6:]
	} else {
		mes, err := jwt.ParseToken(protocolToken)
		if err != nil {
			res.Fail(c, 400, "token is valid", nil)
			c.Abort()
			return
		}
		userName = mes.Name
	}

	// Create MQ
	mq, err := service.NewMQ(boardId)
	if err != nil {
		log.Println("Create MQ err:", err)
		res.Fail(c, 500, "Create MQ err", nil)
		return
	}

	// Add user
	err = service.AddUser(boardId, userName)
	if err != nil {
		log.Println("Add user err:", err)
		res.Fail(c, 500, "Add user err", nil)
		return
	}

	// Upgrade protocol
	c.Writer.Header().Set("Sec-WebSocket-Protocol", protocolToken)
	webConn, err := (&websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}).Upgrade(c.Writer, c.Request, c.Writer.Header())
	if err != nil {
		log.Println("Upgrade protocol err:", err)
		res.Fail(c, 400, "fail to upgrade websocket protocol", nil)
		return
	}

	// Enter Board
	service.EnterBoard(webConn, mq, boardId, userName)
}

// ValidateBoardId Verify the ID by the third-party package validate and the redis database
func ValidateBoardId(c *gin.Context) {
	// GET Info
	boardId := c.Query("boardId")
	if boardId == "" {
		boardId = c.PostForm("boardId")
	}
	// Verify boardId
	_, ok := service.ValidateBoardId(boardId)
	if !ok {
		res.Fail(c, 400, "boardId is valid", nil)
		c.Abort()
		return
	}
	if c.FullPath() == "/board/validate" {
		res.Ok(c, 200, "boardId is passed", nil)
		return
	}
	Id, _ := strconv.Atoi(boardId)
	c.Set("boardId", Id)
	c.Next()
}

// GetOnlineUsers The list of online users is obtained through redis database
func GetOnlineUsers(c *gin.Context) {
	// Get info
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

// ExitBoard Exit the room according to the whiteboard ID and username,
//send information to other users in the whiteboard,
//update the user online list in the whiteboard, delete the user's message queue,
//and finally close the websocket connection. When the number of whiteboard members is 0,
//set an expiration time on the whiteboard, and you can still access the whiteboard within the expiration time.
func ExitBoard(c *gin.Context) {
	// Get Info
	boardId := c.GetInt("boardId")
	userName := c.Query("userName")

	// Judge if the user is inside the whiteboard
	ok, err := service.ExistUserInBoard(boardId, userName)
	if err != nil {
		log.Println("Query user failure err: ", err)
		res.Fail(c, 500, "Query user failure", nil)
		return
	}
	if !ok {
		res.Fail(c, 200, "The user is not in the room", nil)
		return
	}

	// Binding exchange
	mq, err := service.BindExchange(boardId)
	if err != nil {
		log.Println("rabbitMq failed to bind exchange when exiting the room err:", err)
		res.Fail(c, 500, "rabbitMq failed to bind exchange when exiting the room err", nil)
		return
	}

	// Sending an exit message
	message := model.MqMessage{
		MessageType: model.ExitBoardSign,
		UserName:    userName,
		DataType:    websocket.TextMessage,
	}
	j, err := json.Marshal(message)
	if err != nil {
		log.Println("Marshal message err:", err)
		res.Fail(c, 500, "Marshal message err", nil)
		return
	}

	// Deleting a user If the number of users on the whiteboard is 0, set the expiration time for the whiteboard
	_ = service.DeleteUser(boardId, userName)
	users := service.GetUsers(boardId)
	if len(users) == 0 {
		service.SetExpireBoard(boardId)
	}

	err = mq.SendMessage(string(j))
	if err != nil {
		log.Println("Sending message err:", err)
		res.Fail(c, 500, "Message sending failure", nil)
		return
	}

	res.Ok(c, 200, "Exit successful", nil)
}

// DissolveBoard According to the whiteboard ID and the creator of the whiteboard,
//the dissolve is verified (whether it is the creator).
//The verification is successful, the corresponding message queue is deleted,
//the disbandment information is sent to other users,
//and other users delete their own queue and close the websocket connection.
func DissolveBoard(c *gin.Context) {
	// Get Info
	boardId := c.GetInt("boardId")
	ownerName := c.GetString("name")
	board, err := service.GetBoardInfo(strconv.Itoa(boardId))
	if err != nil {
		log.Println("Get board info err:", err)
		res.Fail(c, 400, "Get board info err", nil)
		return
	}
	if ownerName != board.Owner {
		res.Ok(c, 200, "No permission to dissolve the room", nil)
		return
	}

	// Binding exchange
	mq, err := service.BindExchange(boardId)
	if err != nil {
		log.Println("rabbitMq failed to bind exchange when dissolving the room err:", err)
		res.Fail(c, 500, "rabbitMq failed to bind exchange when dissolving the room err", nil)
		return
	}

	// Sending message
	message := model.MqMessage{
		MessageType: model.DissolveBoardSign,
		UserName:    ownerName,
		DataType:    websocket.TextMessage,
	}
	j, err := json.Marshal(message)
	if err != nil {
		log.Println("Marshal message err:", err)
		res.Fail(c, 500, "Marshal message err", nil)
		return
	}

	// Set expire to board
	_ = service.DeleteAllUser(boardId)
	service.SetExpireBoard(boardId)

	err = mq.SendMessage(string(j))
	if err != nil {
		log.Println("Sending message err")
		res.Fail(c, 500, "Sending message err", nil)
		return
	}

	res.Ok(c, 200, "Successful dissolution", nil)
}

// SwitchMode The default mode for creating a whiteboard is cooperative mode.
//Only the whiteboard creator can switch the mode,
//and the mode transition information will be forwarded to other users after the successful switch.
func SwitchMode(c *gin.Context) {
	// Get Info
	boardId := c.PostForm("boardId")
	board, v := service.ValidateBoardId(boardId)
	if v == false {
		res.Fail(c, 400, "boardId is invalid", nil)
		return
	}
	userName := c.GetString("name")

	Mode := c.PostForm("newMode")
	if Mode != "1" && Mode != "0" {
		res.Fail(c, 400, "Invalid switch mode", nil)
		return
	}
	newMode, _ := strconv.Atoi(Mode)

	boardInfo := board.(*model.Board)
	if userName != boardInfo.Owner {
		res.Ok(c, 200, "Switch mode without permission", nil)
		return
	}

	// Update new mode
	err := service.PutNewMode(boardId, newMode)
	if err != nil {
		log.Println("Failed mode switching err:", err)
		res.Fail(c, 500, "Failed mode switching", nil)
		return
	}

	// Binding exchange
	mq, err := service.BindExchange(boardInfo.BoardId)
	if err != nil {
		log.Println("rabbitMq failed to bind exchange when dissolving the room err:", err)
		res.Fail(c, 500, "rabbitMq failed to bind exchange when dissolving the room err", nil)
		return
	}

	// Sending message
	message := model.MqMessage{
		MessageType: model.SwitchModeSign,
		UserName:    userName,
		DataType:    websocket.TextMessage,
		Data:        newMode,
	}
	m, err := json.Marshal(message)
	if err != nil {
		log.Println("Marshal message err:", err)
		res.Fail(c, 500, "Marshal message err", nil)
		return
	}

	err = mq.SendMessage(string(m))
	if err != nil {
		log.Println("Sending message err:", err)
		res.Fail(c, 500, "Sending message err", nil)
		return
	}
	res.Ok(c, 200, "Successful mode switch", nil)
}
