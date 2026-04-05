package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/controllers"
	"github.com/iamclintgeorge/Coram/internal/middleware"
)

func OrderRoutes(rg *gin.RouterGroup) {
	order := rg.Group("/order")
	order.Use(middleware.AuthMiddleware())
	{
		// Template routes
		order.POST("/create-template", controllers.CreateTemplate)
		order.GET("/fetch-template", controllers.FetchTemplate)
		order.PUT("/update-template/:id", controllers.UpdateTemplate)
		order.DELETE("/delete-template/:id", controllers.DeleteTemplate)

		// Order routes
		order.POST("/create-order", controllers.CreateOrder)
		order.GET("/fetch-order", controllers.FetchOrder)
		order.PUT("/update-order/:id", controllers.UpdateOrder)
		order.DELETE("/delete-order/:id", controllers.DeleteOrder)
	}
}
