package service

import (
	"strconv"
	"whiteboard/middleware/rabbitmq"
)

// NewMQ create a new exchange and a queue to bind to the exchage
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

// BindExchange just create  a new exchange to send messege
func BindExchange(boardId int) (*rabbitmq.ExchangeInfo, error) {
	mq := rabbitmq.ExchangeInfo{
		ExchangeName: strconv.Itoa(boardId),
	}
	if err := mq.NewPsExchange(); err != nil {
		return nil, err
	}
	return &mq, nil
}
