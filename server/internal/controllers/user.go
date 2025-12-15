// package controllers

// import (
// 	"net/http"

// 	"github.com/gin-contrib/sessions"
// 	"github.com/gin-gonic/gin"
// 	"github.com/iamclintgeorge/Coram/internal/config"
// 	"github.com/iamclintgeorge/Coram/internal/models"
// 	"golang.org/x/crypto/bcrypt"
// )

// func LoginController(c *gin.Context) {
// 	var req struct {
// 		EmailId  string `json:"emailId"`
// 		Password string `json:"password"`
// 	}

// 	if err := c.ShouldBindJSON(&req); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request"})
// 		return
// 	}

// 	var user models.User
// 	if err := config.DB.First(&user, "emailId = ?", req.EmailId).Error; err != nil {
// 		c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid email or password"})
// 		return
// 	}

// 	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
// 		c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid password"})
// 		return
// 	}

// 	// CREATE AND SAVE SESSION
// 	session := sessions.Default(c)
// 	session.Set("user_id", user.ID)
// 	if err := session.Save(); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to save session"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"success": true,
// 		"message": "Login successful",
// 		"user": gin.H{
// 			"id":      user.ID,
// 			"name":    user.UserName,
// 			"emailId": user.Email,
// 		},
// 	})
// }

// //Signup Controller
// func SignupController(c *gin.Context) {
// 	var req struct {
// 		EmailId  string `json:"emailId"`
// 		UserName string `json:"userName"`
// 		Password string `json:"password"`
// 	}

// 	// Parse JSON request body
// 	if err := c.ShouldBindJSON(&req); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
// 		return
// 	}

// 	// Validate required fields
// 	if req.EmailId == "" || req.UserName == "" || req.Password == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "All fields are required"})
// 		return
// 	}

// 	// Hash password
// 	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to hash password"})
// 		return
// 	}

// 	// Create user model
// 	user := models.User{
// 		Email:    req.EmailId,
// 		UserName: req.UserName,
// 		Password: string(hashedPassword),
// 	}

// 	// Save to database
// 	if err := config.DB.Create(&user).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create user"})
// 		return
// 	}

// 	// Create session
// 	session := sessions.Default(c)
// 	session.Set("user_id", user.ID)
// 	if err := session.Save(); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to save session"})
// 		return
// 	}

// 	c.JSON(http.StatusCreated, gin.H{
// 		"message": "User created successfully",
// 		"user": gin.H{
// 			"id":       user.ID,
// 			"emailId":  user.Email,
// 			"userName": user.UserName,
// 		},
// 	})
// }

// // LogoutController handles logging out the current user
// func LogoutController(c *gin.Context) {
// 	session := sessions.Default(c)
// 	userID := session.Get("user_id")

// 	if userID == nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "No user is logged in"})
// 		return
// 	}

// 	// Destroy session
// 	session.Clear()
// 	if err := session.Save(); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"message": "Could not log out",
// 			"error":   err.Error(),
// 		})
// 		return
// 	}

// 	// Clear cookie manually (optional, Gin sessions usually handles this)
// 	c.SetCookie("session", "", -1, "/", "localhost", false, true)

// 	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
// }

package controllers

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/config"
	"github.com/iamclintgeorge/Coram/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func CheckRoot(c *gin.Context) {
	// Assuming you have access to the database through the GORM DB instance
	var user models.User

	// Query the database to find if any user has the 'root' role
	if err := config.DB.Where("role = ?", "root").First(&user).Error; err != nil {
		// If no user with the role 'root' exists, send false
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusOK, gin.H{"isRoot": false})
		} else {
			// Handle other errors (e.g., database connection issues)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error querying database"})
		}
		return
	}

	// If the query is successful, a user with the role 'root' exists
	c.JSON(http.StatusOK, gin.H{"isRoot": true})
}


// Login handles POST /api/login with session cookies
func LoginController(c *gin.Context) {
	var req struct {
		EmailId  string `json:"emailId"`
		Password string `json:"password"`
	}

	// Bind JSON body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request"})
		return
	}

	// db := config.Connect()
	// Find user by email
var user models.User
if err := config.DB.First(&user, "emailId = ?", req.EmailId).Error; err != nil {
    c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid email or password"})
    return
}
	// Compare password
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid password"})
		return
	}

	// Create session
	session := sessions.Default(c)
	session.Set("user_id", user.ID)
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to save session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "login successful"})
}



//Signup Controller
func SignupController(c *gin.Context) {
	var req struct {
		EmailId  string `json:"emailId"`
		UserName string `json:"userName"`
		Password string `json:"password"`
	}

	// Parse JSON request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	// Validate required fields
	if req.EmailId == "" || req.UserName == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "All fields are required"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to hash password"})
		return
	}

	// Create user model
	user := models.User{
		Email:    req.EmailId,
		UserName: req.UserName,
		Password: string(hashedPassword),
	}

	// Save to database
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create user"})
		return
	}

	// Create session
	session := sessions.Default(c)
	session.Set("user_id", user.ID)
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to save session"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user": gin.H{
			"id":       user.ID,
			"emailId":  user.Email,
			"userName": user.UserName,
		},
	})
}


// LogoutController handles logging out the current user
func LogoutController(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")

	if userID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "No user is logged in"})
		return
	}

	// Destroy session
	session.Clear()
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not log out",
			"error":   err.Error(),
		})
		return
	}

	// Clear cookie manually (optional, Gin sessions usually handles this)
	c.SetCookie("session", "", -1, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}