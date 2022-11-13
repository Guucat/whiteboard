package model

const (
	EnterBoardSign       = 1 // someone joined board     			-> exposed to frontend
	SequenceBoardSign    = 2 // someone send serialized data 		-> exposed to frontend
	ExitBoardSign        = 3 // someone exit board
	DissolveBoardSign    = 4 // creator dissolve board    			-> exposed to frontend
	AddNewPageSign       = 5 // someone add a new page  			-> exposed to frontend
	SwitchModeSign       = 6 // someone switched edit mode			-> exposed to frontend
	UserCountChangedSign = 7 //	number of users in board changed    -> exposed to frontend
	ForbiddenWrite       = 8 // forbidden write						-> exposed to frontend
)

//  通知，画板复原，对象操作，编辑模式切换，解散房间
//  1 进入房间   2 房主解散房间	3 编辑模式切换 	4 对象操作 	5 修改对象操作

type ReceiveWsMessage struct {
	PageId  int    `json:"pageId"`
	SeqData string `json:"seqData"`
}

// MqMessage forwards serialization messages and new page added messages
type MqMessage struct {
	MessageType int         `json:"messageType"`
	UserName    string      `json:"userName"`
	DataType    int         `json:"dataType"`
	PageId      int         `json:"pageId"`
	Data        interface{} `json:"data"`
}
