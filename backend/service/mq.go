package service

import (
	"strconv"
	"whiteboard/middleware/rabbitmq"
)

func NewMQ(boardId int) (*rabbitmq.ExchangeInfo, error) {
	mq := rabbitmq.ExchangeInfo{ExchangeName: strconv.Itoa(boardId)}
	err := mq.NewPsExchange()
	if err != nil {
		return nil, err
	}
	err = mq.NewPsQueue()
	if err != nil {
		return nil, err
	}
	return &mq, nil
}

func BindExchange(boardId int) (*rabbitmq.ExchangeInfo, error) {
	mq := rabbitmq.ExchangeInfo{
		ExchangeName: strconv.Itoa(boardId),
	}
	if err := mq.NewPsExchange(); err != nil {
		return nil, err
	}
	return &mq, nil
}
