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
		boardGroup.GET("/enter", controller.ValidateBoardId, controller.EnterBoard)

		boardGroup.GET("/users", controller.ValidateBoardId, controller.GetOnlineUsers)
		boardGroup.DELETE("/exit", controller.ValidateBoardId, controller.ExitBoard)
		boardGroup.DELETE("/dissolve", middleware.JWTAuthMiddleware(), controller.ValidateBoardId, controller.DissolveBoard)

		boardGroup.GET("/validate", controller.ValidateBoardId) //转成中间件？？？？
		boardGroup.PUT("/page", controller.AddOnePage)
		boardGroup.PUT("switchMode", middleware.JWTAuthMiddleware(), controller.SwitchMode)
	}
	pprof.RouteRegister(boardGroup, "pprof")

	r.GET("/token", middleware.JWTAuthMiddleware(), controller.Token)
	return r
}
