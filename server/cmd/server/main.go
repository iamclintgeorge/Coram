package main

import (
	"log"
	"net/http"
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
	config.Connect()
	config.LoadEnv()
	
	config.DB.AutoMigrate(
		&models.User{},
		&models.UserVM{},
		&models.ProxmoxConfig{},
	)
	
	r := gin.Default()
	
	// CORS - Must be before routes
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
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
	
	routes.RegisterRoutes(r)
	
	log.Println("Server running on http://localhost:8080")
	r.Run(":8080")
}
