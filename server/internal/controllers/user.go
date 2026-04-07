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

	// Find user by email
	var user models.User
	if err := config.DB.First(&user, "email = ?", req.EmailId).Error; err != nil {
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
		Username: req.UserName,
		Password: string(hashedPassword),
		Role:     "user", // Default role
		VMAssigned: "[]", // Default empty array
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
			"userName": user.Username,
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

func FetchUsers(c *gin.Context) {
	var users []models.User

	// Query for all users where role is NOT 'root'
	result := config.DB.Where("role <> ?", "root").Find(&users)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Prepare data for frontend
	type UserResponse struct {
		ID        uint   `json:"ID"`
		UserName  string `json:"UserName"`
		Email     string `json:"Email"`
		Role      string `json:"Role"`
		CreatedOn string `json:"CreatedOn"`
		VMs       []int  `json:"VMs"`
	}

	var responseUsers []UserResponse
	for _, u := range users {
		var vms []int
		
		// Fetch assigned VMs for this user
		var assigned []models.VmAssigned
		config.DB.Where("userId = ?", u.ID).Find(&assigned)
		
		// Collect all VM IDs from all assigned nodes for this user
		for _, a := range assigned {
			vms = append(vms, a.VmId...)
		}
		
		responseUsers = append(responseUsers, UserResponse{
			ID:        u.ID,
			UserName:  u.Username,
			Email:     u.Email,
			Role:      u.Role,
			CreatedOn: u.CreatedOn.Format("2006-01-02T15:04:05Z"),
			VMs:       vms,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"users": responseUsers,
	})
}



func DeleteUsers(c *gin.Context) {
	userID := c.Param("id")

	result := config.DB.Where("id = ? AND role <> ?", userID, "root").Delete(&models.User{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "User not found or is protected root"})
		return
	}

	// Also delete assignments
	config.DB.Where("userId = ?", userID).Delete(&models.VmAssigned{})

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}



func UpdateVMAssign(c *gin.Context) {
    var req struct {
        UserID   uint   `json:"id"`
        VMIDs    []int  `json:"vmids"`
        ConfigID uint   `json:"config_id"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
        return
    }

    var vmAssign models.VmAssigned
    res := config.DB.Where("userId = ? AND proxmox_configId = ?", req.UserID, req.ConfigID).First(&vmAssign)

    if res.Error == gorm.ErrRecordNotFound {
        // Create new record
        vmAssign = models.VmAssigned{
            UserId:          req.UserID,
            VmId:            req.VMIDs,
            ProxmoxConfigId: req.ConfigID,
        }
        if err := config.DB.Create(&vmAssign).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign VMs"})
            return
        }
    } else if res.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        return
    } else {
        // Update existing record
        vmAssign.VmId = req.VMIDs
        if err := config.DB.Save(&vmAssign).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update VM assignment"})
            return
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "VM assignments updated successfully",
        "data":    vmAssign,
    })
}

func FetchVMs(c *gin.Context) {
	var vms []models.VmAssigned

	result := config.DB.Find(&vms)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"vms": vms,
	})
}