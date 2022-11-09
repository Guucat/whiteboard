package model

const (
	EnterBoardSign       = 1 // 进入房间     	-> front
	SequenceBoardSign    = 2 // 序列化消息	-> front
	ExitBoardSign        = 3 //退出房间
	DissolveBoardSign    = 4 //解散房间      	-> front
	AddNewPageSign       = 5 //新增一页消息	-> front
	SwitchModeSign       = 6 //编辑模式切换	-> front
	UserCountChangedSign = 7 //用户数改变		-> front
	ForbiddenWrite       = 8 //禁止写入				-> front
	//ActionObjectSign     = 8 //操作对象
)

type Message struct {
	UserId      int
	BoardId     int
	MessageType uint8 // 通知，画板复原，对象操作，编辑模式切换，解散房间
	// 1 进入房间   2 房主解散房间	3 编辑模式切换 	4 对象操作 	5 修改对象操作
	//BasicData
	Data interface{}
}

type WebSocketMessage struct {
	BoardId     int
	Page        uint8
	MessageType uint8 // 通知，画板复原，对象操作，编辑模式切换，解散房间
	// 1 进入房间   2 房主解散房间	3 编辑模式切换 	4 对象操作 	5 修改对象操作
	//BasicData
	Data interface{}
}

type ReceiveWsMessage struct {
	PageId  int    `json:"pageId"`
	SeqData string `json:"seqData"`
}

type MqMessage struct {
	//  序列化消息, 新增页消息
	MessageType int         `json:"messageType"`
	UserName    string      `json:"userName"`
	DataType    int         `json:"dataType"`
	PageId      int         `json:"pageId"`
	Data        interface{} `json:"data"`
}
