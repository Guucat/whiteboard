package middleware

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// Cors handles browser cross-domain requests
func Cors() gin.HandlerFunc {
	return func(context *gin.Context) {
		method := context.Request.Method
		// To allow pass all request form any origin
		context.Header("Access-Control-Allow-Origin", "*")
		// Set the server allowed passed request methods
		context.Header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
		// Set the server allowed passed request headers
		context.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept, Authorization")
		// Set the server allowed exposed request headers
		context.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
		// Whether to allow subsequent requests to carry authentication information cookies. The value can only be true.
		//If it is not required, do not set this parameter
		context.Header("Access-Control-Allow-Credentials", "true")
		// Allow all options method
		if method == "OPTIONS" {
			context.AbortWithStatus(http.StatusNoContent)
			return
		}
		context.Next()
	}
}
