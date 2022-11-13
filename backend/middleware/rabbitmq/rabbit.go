package rabbitmq

import (
	"github.com/streadway/amqp"
)

type ExchangeInfo struct {
	ExchangeName string
	queueName    string
	// After the queue is created, the Message will be consumed via the message chan
	messages <-chan amqp.Delivery
}

func (info *ExchangeInfo) NewPsExchange() error {
	return Chan.ExchangeDeclare(
		info.ExchangeName,
		"fanout",
		false,
		true,
		false,
		false,
		nil,
	)
}

func (info *ExchangeInfo) NewPsQueue() error {
	// Creating a Message Queue
	que, err := Chan.QueueDeclare(
		"",
		false,
		false,
		true, // When the connection that declared it closes, the queue will be deleted
		false,
		nil,
	)
	if err != nil {
		return err
	}
	info.queueName = que.Name
	// Bind the message queue to Exchange
	err = Chan.QueueBind(info.queueName,
		"",
		info.ExchangeName,
		false,
		nil,
	)
	if err != nil {
		return err
	}
	// Initializes the message Channel
	info.messages, err = Chan.Consume(
		info.queueName,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}
	return nil
}

func (info *ExchangeInfo) DeletePsQueue() error {
	_, err := Chan.QueueDelete(info.queueName, false, false, false)
	return err
}

func (info *ExchangeInfo) SendMessage(data string) error {
	err := Chan.Publish(
		info.ExchangeName,
		"",
		false,
		false,
		amqp.Publishing{
			DeliveryMode: amqp.Transient,
			ContentType:  "text/plain",
			Body:         []byte(data),
		},
	)
	return err
}

func (info *ExchangeInfo) ReceiveMessage() <-chan amqp.Delivery {
	return info.messages
}
