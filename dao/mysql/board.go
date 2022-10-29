package mysql

import "whiteboard/model"

func GetBoardById(boardId int) (*model.Board, error) {
	var board *model.Board
	err := DB.Where("boardId = ?", boardId).First(board).Error
	if err != nil {
		return nil, err
	}
	return board, nil
}
