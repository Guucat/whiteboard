package controller

import (
	"github.com/gin-gonic/gin"
	"whiteboard/model"
	"whiteboard/service"
	"whiteboard/utils/jwt"
	"whiteboard/utils/res"
	"whiteboard/utils/validator"
)

func Register(c *gin.Context) {
	// Get user info
	name := c.PostForm("name")
	pwd := c.PostForm("pwd")
	err := validator.Validate.Struct(&model.User{Name: name, Pwd: pwd})
	if err != nil {
		res.Fail(c, 400, "Registration failed The user name or password is empty", nil)
		return
	}

	// Register user
	err = service.Register(name, pwd)
	if err != nil {
		res.Fail(c, 400, "Registration failed Account has been registered", nil)
		return
	}
	res.Ok(c, 200, "registered successfully", nil)
}

func Login(c *gin.Context) {
	// // Get user info
	name := c.PostForm("name")
	pwd := c.PostForm("pwd")
	err := validator.Validate.Struct(&model.User{Name: name, Pwd: pwd})
	if err != nil {
		res.Ok(c, 400, "Registration failed The user name or password is empty", nil)
		return
	}

	// Verify the username and password
	user, err := service.GetUserByNamePwd(name, pwd)
	if err != nil {
		res.Ok(c, 400, "Incorrect username or password", nil)
		return
	}

	// Generate token
	token, _ := jwt.GenToken(user.Id, user.Name)
	res.Ok(c, 200, "login successfully", gin.H{
		"token": token,
	})
}
