package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/controllers"
	"github.com/iamclintgeorge/Coram/internal/middleware"
)

func BillingRoutes(rg *gin.RouterGroup) {
	billing := rg.Group("/billing")
	billing.Use(middleware.AuthMiddleware())
	{
		billing.GET("/config", controllers.GetBillingConfig)
		billing.PUT("/config", controllers.UpdateBillingConfig)
		billing.GET("/history", controllers.GetBillingHistory)
	}
}
