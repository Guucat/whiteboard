package rabbitmq

import (
	"fmt"
	"github.com/streadway/amqp"
	"log"
	"strconv"
	"whiteboard/setting"
)

var Chan *amqp.Channel

func Init(cfg *setting.RabbitMQConfig) {
	url := fmt.Sprintf("amqp://%s:%s@%s:%s", cfg.Root, cfg.Password, cfg.Host, strconv.Itoa(cfg.Port))
	conn, err := amqp.Dial(url)
	if err != nil {
		log.Panicf("%s: %s", "连接RabbitMQ服务器失败: ", err)
	}
	Chan, err = conn.Channel()
	if err != nil {
		log.Panicf("%s: %s", "获取RabbitMQ连接的Channel失败: ", err)
	}
}
