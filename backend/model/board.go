package model

import "github.com/gorilla/websocket"

// Board 定义白板的结构体
type Board struct {
	BoardId    int               // 白板id
	Owner      string            // 白板创建者
	EditType   int               // 白板编辑类型
	Users      []string          // 当前加入白板的用户
	Websockets []*websocket.Conn // 当前白板维持的websocket连接
}
