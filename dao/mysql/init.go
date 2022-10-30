package mysql

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
	"whiteboard/model"
	"whiteboard/setting"
)

var DB *gorm.DB

func Init(cfg *setting.MySQLConfig) {
	//dsn := "shengyi:123456@tsy@tcp(rm-2vc34w5spf5nm2992eo.mysql.cn-chengdu.rds.aliyuncs.com)/whiteboard?charset=utf8mb4&parseTime=True&loc=Local"
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.Root,
		cfg.Password,
		cfg.Host,
		cfg.DbName,
	)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	DB = db
	if err != nil {
		log.Panicf("fail to conenct MySQL: %s", err)
	}

	err = DB.AutoMigrate(&model.User{}, &model.Board{})
	if err != nil {
		log.Panicln("fail to migrate schema ", err)
	}
}
