package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/controllers"
	"github.com/iamclintgeorge/Coram/internal/middleware"
)

func LoggingRoutes(rg *gin.RouterGroup) {
	logs := rg.Group("/logs")
	logs.Use(middleware.AuthMiddleware())
	{
		logs.GET("", controllers.GetLogs)
		logs.GET("/proxmox/:node", controllers.GetProxmoxSyslog)
	}
}
