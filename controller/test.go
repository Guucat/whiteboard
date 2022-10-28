package controller

import (
	"github.com/gin-gonic/gin"
	"whiteboard/utils/res"
)

func Token(c *gin.Context) {
	res.Ok(c, 200, "token done well", nil)
}
