package model

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Id   int    `json:"id"`
	Name string `json:"name" validate:"required"`
	Pwd  string `json:"pwd" validate:"required"`
}
