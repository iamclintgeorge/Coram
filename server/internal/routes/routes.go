package routes

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api") 
	{
		SetupRoutes(api)
    		UserRoutes(api)
		BillingRoutes(api)
		LoggingRoutes(api)
		AlertingRoutes(api)
	}

	proxmox := r.Group("/api/proxmox") 
	{
		ProxmoxRoutes(proxmox)
	}
}
