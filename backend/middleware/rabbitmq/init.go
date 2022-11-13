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
		log.Panicf("%s: %s", "fail to connect rabbitmq server: ", err)
	}
	Chan, err = conn.Channel()
	if err != nil {
		log.Panicf("%s: %s", "fail to connect rabbitmq connection channle: ", err)
	}
}
