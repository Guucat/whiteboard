package middleware

import (
	"github.com/gin-gonic/gin"
	"strings"
	"whiteboard/utils/jwt"
	"whiteboard/utils/res"
)

// JWTAuthMiddleware the authentication middleware
func JWTAuthMiddleware() func(c *gin.Context) {
	return func(c *gin.Context) {
		// Verify  websocket token from the protocol header
		protocolToken := c.Request.Header.Get("Sec-WebSocket-Protocol")
		if protocolToken != "" {
			mes, err := jwt.ParseToken(protocolToken)
			if err != nil {
				res.Fail(c, 400, "invalid token", nil)
				c.Abort()
				return
			}
			c.Set("name", mes.Name)
			c.Set("id", mes.Id)
			c.Set("token", protocolToken)
			c.Next()
			return
		}

		header := c.Request.Header.Get("Authorization")
		if header == "" {
			res.Fail(c, 400, "token is null", nil)
			c.Abort()
			return
		}

		// Separate data by space
		parts := strings.SplitN(header, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			res.Fail(c, 400, "incorrect request header format", nil)
			c.Abort()
			return
		}
		mes, err := jwt.ParseToken(parts[1])
		if err != nil {
			res.Fail(c, 400, "invalid token", nil)
			c.Abort()
			return
		}
		c.Set("name", mes.Name)
		c.Set("id", mes.Id)
		c.Next()
	}
}
