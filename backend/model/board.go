package model

const EditMode = 0
const ReadMode = 1

// Board defines the whiteboard structure
type Board struct {
	BoardId  int    // whiteboard id
	Owner    string // whiteboard creator
	EditType int    // whiteboard editing types
	PageSum  int    // number of current pages
	//Users    []string   				// Current user joined to the whiteboard            			   -> redis
	//Websockets []*websocket.Conn 		// The websocket connection maintained by the current whiteboard   -> rabbitmq
	//Pages      map[int]string         // Data per page				  								   -> redis
}
