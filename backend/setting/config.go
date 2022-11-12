package setting

import (
	"github.com/spf13/viper"
	"log"
)

//读取配置文件用到了viper第三方包 该包要求tag必须是mapstructure

//命名的时候注意统一用驼命名法

//tag字段统一小写加下划线分割
type WhiteBoardConfig struct {
	MachineID       int64  `mapstructure:"machine_id" `
	Port            int    `mapstructure:"port"`
	StartTime       string `mapstructure:"start_time"`
	*MySQLConfig    `mapstructure:"mysql"`
	*RedisConfig    `mapstructure:"redis"`
	*AESConfig      `mapstructure:"aes"`
	*TokenConfig    `mapstructure:"token"`
	*RabbitMQConfig `mapstructure:"rabbitMQ"`
	*MongoDBConfig  `mapstructure:"mongoDB"`
}

type MySQLConfig struct {
	Host        string `mapstructure:"host"`
	Port        int    `mapstructure:"port"`
	Root        string `mapstructure:"root"`
	Password    string `mapstructure:"password"`
	DbName      string `mapstructure:"db_name"`
	MaxOpenConn int    `mapstructure:"max_open_conn"`
	MaxIdleConn int    `mapstructure:"max_idle_conn"`
}

type MongoDBConfig struct {
	Host        string `mapstructure:"host"`
	Port        int    `mapstructure:"port"`
	MaxOpenConn int    `mapstructure:"max_open_conn"`
	MaxIdleConn int    `mapstructure:"max_idle_conn"`
	DBName      string `mapstructure:"dbname"`
	TimeOut     int    `mapstructure:"timeout"`
}

type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Db       int    `mapstructure:"db"`
	PoolSize int    `mapstructure:"pool_size"`
}

type AESConfig struct {
	Key string `mapstructure:"key"`
}

type TokenConfig struct {
	Secret string `mapstructure:"secret"`
	Issuer string `mapstructure:"issuer"`
}

type RabbitMQConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Root     string `mapstructure:"root"`
	Password string `mapstructure:"password"`
}

var Conf = new(WhiteBoardConfig)

func Init() (err error) {
	viper.SetConfigName("config")    //配置文件名
	viper.AddConfigPath("./setting") //配置文件的相对路径
	viper.SetConfigType("yaml")
	if err = viper.ReadInConfig(); err != nil { //读取配置文件
		//日志信息统一用内置log输出 格式 包名-方法名-failed err:
		log.Println("viper ReadInConfig failed,err:", err)
		return
	}
	if err = viper.Unmarshal(Conf); err != nil {
		log.Println("viper Unmarshal failed,err:", err)
		return
	}
	return
}
