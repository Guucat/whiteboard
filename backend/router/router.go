package router

import (
	"github.com/gin-gonic/gin"
	"whiteboard/controller"
	"whiteboard/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.Cors())

	r.POST("/login", controller.Login)
	r.POST("/register", controller.Register)

	boardGroup := r.Group("/board")
	{
		boardGroup.GET("/create", middleware.JWTAuthMiddleware(), controller.CreateBoard)
		boardGroup.GET("/enter", controller.EnterBoard)
	}

	r.GET("/token", middleware.JWTAuthMiddleware(), controller.Token)
	return r
}
