package main

import (
	"github.com/gin-gonic/gin"
)

type H map[string]interface{}

func main() {
	r := gin.Default()
	r.GET("/hello", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"msg": "hello, world",
		})
	})
	r.Run(":8080")
}
