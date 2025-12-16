package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/controllers"
	"github.com/iamclintgeorge/Coram/internal/middleware"
)

func ProxmoxRoutes(rg *gin.RouterGroup) {
	rg.GET("/fetchNodeStats/:node", middleware.AuthMiddleware(),controllers.FetchNodeStats)
	rg.GET("/vms/:node/:id", middleware.AuthMiddleware(),controllers.FetchVMStats)
	rg.POST("/vms/:node/:id", middleware.AuthMiddleware(),controllers.ControlVM)

	// vms := rg.Group("/vms")
	// vms.Use(middleware.AuthMiddleware())
	// {
	// 	vms.GET("", controllers.GetUserVMs)
	// 	vms.GET("/:vmid", controllers.GetVMDetails)
	// 	vms.POST("/:vmid/:action", controllers.ControlVM)
	// 	vms.POST("/link", controllers.LinkVMToUser)
	// }
}
