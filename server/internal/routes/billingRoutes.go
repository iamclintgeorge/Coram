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
		billing.GET("/fetch-invoice", controllers.FetchBill)
		billing.POST("/create-config", controllers.CreateRate)
		billing.GET("/fetch-config", controllers.FetchRate)
		billing.PUT("/update-config/:id", controllers.UpdateRate)
		billing.DELETE("/delete-config/:id", controllers.DeleteRate)
		billing.GET("/history", controllers.GetBillingHistory)
	}
}
