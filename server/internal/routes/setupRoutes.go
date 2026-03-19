package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/controllers"
)

func SetupRoutes(router *gin.RouterGroup) {
	setup := router.Group("/setup")
	{
		setup.GET("/status", controllers.CheckSetupStatus)
		setup.POST("/root", controllers.SetupRootAccount)
		setup.GET("/proxmox", controllers.GetProxmoxConfig)
		setup.POST("/proxmox", controllers.SetupProxmoxConfig)
	}
}
