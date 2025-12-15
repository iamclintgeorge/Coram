// package middleware

// import (
// 	"net/http"

// 	"github.com/gin-contrib/sessions"
// 	"github.com/gin-gonic/gin"
// 	"github.com/iamclintgeorge/Coram/internal/config"
// 	"github.com/iamclintgeorge/Coram/internal/models"
// )

// func AuthMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		session := sessions.Default(c)
// 		userID := session.Get("user_id")

// 		if userID == nil {
// 			c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false, "message": "You are not authenticated."})
// 			c.Abort()
// 			return
// 		}

// 		var user models.User
// 		if err := config.DB.First(&user, userID).Error; err != nil {
// 			c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false, "message": "User not found."})
// 			c.Abort()
// 			return
// 		}

// 		// Set user_id in context for controllers
// 		c.Set("user_id", user.ID)
// 		c.Set("user", user)
// 		c.Next()
// 	}
// }

// func CheckAuth(c *gin.Context) {
// 	user, exists := c.Get("user")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
// 		return
// 	}

// 	userModel := user.(models.User)

// 	c.JSON(http.StatusOK, gin.H{
// 		"authenticated": true,
// 		"user": gin.H{
// 			"id":          userModel.ID,
// 			"name":        userModel.UserName,
// 			"emailId":     userModel.Email,
// 			"permissions": []string{"all"}, // Add this - grants all permissions
// 		},
// 	})
// }

package middleware

import (
	"log"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/config"
	"github.com/iamclintgeorge/Coram/internal/models"
)

// AuthMiddleware ensures the user is logged in
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		userID := session.Get("user_id")
log.Println("AuthMiddleware: session user_id =", userID)
		if userID == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "You are not authenticated"})
			c.Abort()
			return
		}

		// Optionally, load user from DB and attach to context
		var user models.User
		if err := config.DB.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "You are not authenticated"})
			c.Abort()
			return
		}

		// Store user in context for handlers

		c.Set("user", user)
		c.Next()
	}
}

// CheckAuth returns current authenticated user info
func CheckAuth(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "You are not authenticated"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"authenticated": true,
		"user":          user,
	})
}