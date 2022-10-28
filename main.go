package main

import (
	"log"
	"whiteboard/dao/mysql"
	"whiteboard/dao/redis"
	"whiteboard/router"
	"whiteboard/setting"
)

func main() {
	//mysql.DB.AutoMigrate(&User{})
	//mysql.DB.Create(&User{
	//	Name: "test1",
	//	Pwd:  "test1",
	//})
	//var user User
	//mysql.DB.First(&user, 1)
	//fmt.Printf(user.Name)

	//初始化MySQL数据库
	err := setting.Init()
	if err != nil {
		log.Panicln("配置文件错误:", err)
	}
	mysql.Init(setting.Conf.MySQLConfig)
	redis.Init(setting.Conf.RedisConfig)
	// 注册路由
	r := router.SetupRouter()
	r.Run(":8080")

}
