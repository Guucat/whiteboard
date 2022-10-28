package mysql

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
)

var DB *gorm.DB

func init() {
	dsn := "shengyi:123456@tsy@tcp(rm-2vc34w5spf5nm2992eo.mysql.cn-chengdu.rds.aliyuncs.com)/whiteboard?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	DB = db
	if err != nil {
		log.Panicf("fail to conenct MySQL: %s", err)
	}
}
