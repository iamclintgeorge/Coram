package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/config"
	"github.com/iamclintgeorge/Coram/internal/models"
	"github.com/iamclintgeorge/Coram/internal/routes"
)

func main() {
	config.LoadEnv()
	config.Connect()
	
	// Drop deprecated tables
	config.DB.Migrator().DropTable("proxmox_nodes", "billing_usage_records", "user_node_assignments", "billing_invoices", "user_vms")

	config.DB.AutoMigrate(
		&models.User{},
		&models.VmAssigned{},
		&models.ProxmoxConfig{},
		&models.BillingConfig{},
		&models.BillingRecord{},
		&models.VmOrder{},
		&models.Template{},
		&models.CoramLog{},
		&models.AlertRule{},
		&models.AlertEvent{},
	)
	
	// Load the stored Proxmox Config from DB on startup
	config.LoadProxmoxConfig()
	
	r := gin.Default()

	// CORS - Must be before routes
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	
	// Session store
	store := cookie.NewStore([]byte("super-secret-key-change-in-production"))
	store.Options(sessions.Options{
		Path:     "/",
		MaxAge:   86400, // 24 hours
		HttpOnly: true,
		Secure:   false, // true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	})
	r.Use(sessions.Sessions("session", store))
	
	// Register API Routes AFTER middleware
	routes.RegisterRoutes(r)

	// Serve the React application
	if os.Getenv("mode") == "PROD" {
		// Serve the compiled assets (JS, CSS, images) without a root wildcard conflict
		r.StaticFile("/coramlogo_favicon.png", "./dist/coramlogo_favicon.png")
		r.Static("/assets", "./dist/assets")
		
		// Fallback for SPA routing - serve index.html for all unmatched routes
		r.NoRoute(func(c *gin.Context) {
			c.File("./dist/index.html")
		})
	}
	log.Println("Server running on http://localhost:8080")
	r.Run(":8080")
}
