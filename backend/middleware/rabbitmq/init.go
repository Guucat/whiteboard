package rabbitmq

import (
	"github.com/streadway/amqp"
	"log"
)

var Chan *amqp.Channel

func Init() {
	conn, err := amqp.Dial("amqp://test:test@localhost:5672")
	if err != nil {
		log.Panicf("%s: %s", "连接RabbitMQ服务器失败: ", err)
	}
	Chan, err = conn.Channel()
	if err != nil {
		log.Panicf("%s: %s", "获取RabbitMQ连接的Channel失败: ", err)
	}
}
