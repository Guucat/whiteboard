package model

import "sync"

const EditMode = 0
const ReadMode = 1

// Board 定义白板的结构体
type Board struct {
	BoardId  int        // 白板id
	Owner    string     // 白板创建者
	EditType int        // 白板编辑类型
	PageSum  int        // 当前page总数
	Mu       sync.Mutex // 添加新页时加锁
	//Users    []string   // 当前加入白板的用户            -> redis
	//Websockets []*websocket.Conn // 当前白板维持的websocket连接   -> rabbitmq
	//Pages      map[int]string    // 每个页的数据				  -> redis
}
