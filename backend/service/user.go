package service

import (
	"errors"
	"whiteboard/dao/mysql"
	"whiteboard/model"
)

func Register(name string, pwd string) error {
	_, err := mysql.GetUserByName(name)
	if err != nil {
		mysql.CreateUser(name, pwd)
		return nil
	}
	return errors.New("user already exists")
}

func GetUserByNamePwd(name, pwd string) (*model.User, error) {
	return mysql.GetUserByNamePwd(name, pwd)
}
