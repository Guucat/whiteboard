package router

import (
	"github.com/gin-contrib/pprof"
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
		boardGroup.GET("/validate", controller.ValidateBoardId)
		boardGroup.GET("/users", controller.GetOnlineUsers)
		boardGroup.PUT("/page", controller.AddOnePage)
	}
	pprof.RouteRegister(boardGroup, "pprof")

	r.GET("/token", middleware.JWTAuthMiddleware(), controller.Token)
	return r
}
