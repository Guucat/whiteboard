package rabbitmq

import "github.com/streadway/amqp"

type ExchangeInfo struct {
	ExchangeName string
	queueName    string
	// 创建队列后, 通过Message消费消息
	Messages <-chan amqp.Delivery
}

func (info *ExchangeInfo) NewPsExchange() error {
	return Chan.ExchangeDeclare(
		info.ExchangeName,
		"fanout",
		true,
		false,
		false,
		false,
		nil,
	)

}

func (info *ExchangeInfo) NewPsQueue() error {
	// 创建消息队列
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
	// 将消息队列绑定到Exchange
	err = Chan.QueueBind(info.queueName,
		"",
		info.ExchangeName,
		false,
		nil,
	)
	if err != nil {
		return err
	}
	// 初始化消息Channel
	info.Messages, err = Chan.Consume(
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
