package main

import (
	"gorm.io/gorm"
	"whiteboard/router"
)

type User struct {
	gorm.Model
	Name string // 用户名
	Pwd  string // 密码
}

func main() {
	//mysql.DB.AutoMigrate(&User{})
	//mysql.DB.Create(&User{
	//	Name: "test1",
	//	Pwd:  "test1",
	//})
	//var user User
	//mysql.DB.First(&user, 1)
	//fmt.Printf(user.Name)

	// 注册路由
	r := router.SetupRouter()
	r.Run(":8080")
}
