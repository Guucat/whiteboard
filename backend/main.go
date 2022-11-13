package main

import (
	"log"
	"whiteboard/dao/mongodb"
	"whiteboard/dao/mysql"
	"whiteboard/dao/redis"
	"whiteboard/middleware/rabbitmq"
	"whiteboard/router"
	"whiteboard/setting"
	"whiteboard/utils/validator"
)

func init() {
	err := setting.Init()
	if err != nil {
		log.Panicln("配置文件错误:", err)
	}
	//Init MySQL
	mysql.Init(setting.Conf.MySQLConfig)
	//Init Redis
	redis.Init(setting.Conf.RedisConfig)
	//Init RabbitMQ
	rabbitmq.Init(setting.Conf.RabbitMQConfig)
	//Init MongoDB
	mongodb.Init(setting.Conf.MongoDBConfig)
	//Init Validate
	validator.Init()
}

func main() {
	// Register Route
	r := router.SetupRouter()
	// performance test
	//pprof.Register(r)

	r.Run(":8080")
}
