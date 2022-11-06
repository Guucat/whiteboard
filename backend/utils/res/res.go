package res

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func Ok(c *gin.Context, code int, msg string, data gin.H) {
	c.JSON(http.StatusOK, gin.H{
		"code": code,
		"msg":  msg,
		"data": data,
	})
}

func Fail(c *gin.Context, code int, msg string, data gin.H) {
	c.JSON(http.StatusBadRequest, gin.H{
		"code": code,
		"msg":  msg,
		"data": data,
	})
}
