package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/controllers"
	"github.com/iamclintgeorge/Coram/internal/middleware"
)

func AlertingRoutes(rg *gin.RouterGroup) {
	alerts := rg.Group("/alerts")
	alerts.Use(middleware.AuthMiddleware())
	{
		// Rules
		alerts.GET("/rules", controllers.GetAlertRules)
		alerts.POST("/rules", controllers.CreateAlertRule)
		alerts.PUT("/rules/:id", controllers.UpdateAlertRule)
		alerts.PUT("/rules/:id/toggle", controllers.ToggleAlertRule)
		alerts.DELETE("/rules/:id", controllers.DeleteAlertRule)

		// Events
		alerts.GET("/events", controllers.GetAlertEvents)
		alerts.POST("/events", controllers.CreateAlertEvent)
		alerts.PUT("/events/:id/acknowledge", controllers.AcknowledgeAlertEvent)
	}
}
