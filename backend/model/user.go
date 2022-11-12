package model

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Id   int    `json:"id"`
	Name string `json:"name" validate:"required" gorm:"index:idx_name_pwd;index:idx_name"`
	Pwd  string `json:"pwd" validate:"required" gorm:"index:idx_name_pwd"`
}
