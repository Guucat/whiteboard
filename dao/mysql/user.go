package mysql

import "whiteboard/model"

func GetUserByName(name string) (*model.User, error) {
	var user *model.User
	err := DB.Where("name = ?", name).First(&user).Error
	if err != nil {
		return nil, err
	}
	return user, nil
}

func CreateUser(name string, pwd string) int64 {
	res := DB.Create(&model.User{
		Name: name,
		Pwd:  pwd,
	})
	return res.RowsAffected
}
