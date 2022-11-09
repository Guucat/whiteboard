package middleware

import (
	"github.com/gin-gonic/gin"
	"strings"
	"whiteboard/utils/jwt"
	"whiteboard/utils/res"
)

// JWTAuthMiddleware JWT认证中间件
func JWTAuthMiddleware() func(c *gin.Context) {
	return func(c *gin.Context) {
		// websocket token 验证
		protocolToken := c.Request.Header.Get("Sec-WebSocket-Protocol")
		if protocolToken != "" {
			mes, err := jwt.ParseToken(protocolToken)
			if err != nil {
				res.Fail(c, 400, "token无效", nil)
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
			res.Fail(c, 400, "token为空", nil)
			c.Abort()
			return
		}
		// 按空格分割
		parts := strings.SplitN(header, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			res.Fail(c, 400, "请求头中auth格式有误", nil)
			c.Abort()
			return
		}
		mes, err := jwt.ParseToken(parts[1])
		if err != nil {
			res.Fail(c, 400, "token无效", nil)
			c.Abort()
			return
		}
		c.Set("name", mes.Name)
		c.Set("id", mes.Id)
		c.Next()
	}
}
