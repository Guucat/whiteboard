package jwt

import (
	"errors"
	"github.com/dgrijalva/jwt-go"
	"time"
	"whiteboard/setting"
)

type TokenInfo struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
	jwt.StandardClaims
}

const TokenValidDuration = 2 * time.Hour

// GenToken 生成JWT
func GenToken(id int, name string) (string, error) {
	c := TokenInfo{
		id,
		name,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(TokenValidDuration).Unix(),
			Issuer:    setting.Conf.Issuer,
		},
	}
	// 指定签名算法
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, c)
	// 返回token编码
	return token.SignedString([]byte(setting.Conf.Secret))
}

func ParseToken(tokenString string) (*TokenInfo, error) {
	token, err := jwt.ParseWithClaims(tokenString, &TokenInfo{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(setting.Conf.Secret), nil
	})
	if err != nil {
		return nil, err
	}
	tokenInfo, ok := token.Claims.(*TokenInfo)
	if ok && token.Valid {
		return tokenInfo, nil
	}
	return nil, errors.New("invalid token")
}
