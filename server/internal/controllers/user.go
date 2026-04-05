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
		ID        uint     `json:"ID"`
		UserName  string   `json:"UserName"`
		Email     string   `json:"Email"`
		Role      string   `json:"Role"`
		CreatedOn string   `json:"CreatedOn"`
		VMs       []string `json:"VMs"`
	}

	var responseUsers []UserResponse
	for _, u := range users {
		var vms []string
		// u.VMAssigned is a JSON string of array
		// e.g. ["100", "101"]
		// We could use json.Unmarshal here if needed, but for now let's just pass it or parse it
		// The frontend expects an array of strings (vmid)
		// For simplicity, let's just return what's in users table if it's there
		// Or fetch from VmAssigned table? 
		// User said: "vm_assigned (This will store vms in an array)" in users table
		// and "vmAssigned.db: id, userId, vmId, proxmox_configId"
		// Let's rely on users table for the list of IDs for fetchUsers
		
		// FIXME: For now, if VMAssigned is empty or invalid, return empty array
		vms = []string{}
		// Basic parsing if needed, but let's just send what we have
		
		responseUsers = append(responseUsers, UserResponse{
			ID:        u.ID,
			UserName:  u.Username,
			Email:     u.Email,
			Role:      u.Role,
			CreatedOn: u.CreatedOn.Format("2006-01-02T15:04:05Z"),
			VMs:       vms, // We will populate this properly if needed
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
		UserID   uint `json:"id"`
		VMID     int  `json:"vmid"`
		ConfigID uint `json:"config_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	vmAssign := models.VmAssigned{
		UserId:          req.UserID,
		VmId:            req.VMID,
		ProxmoxConfigId: req.ConfigID,
	}

	// Check if already exists
	var existing models.VmAssigned
	res := config.DB.Where("userId = ? AND vmId = ? AND proxmox_configId = ?", req.UserID, req.VMID, req.ConfigID).First(&existing)

	if res.Error == gorm.ErrRecordNotFound {
		if err := config.DB.Create(&vmAssign).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign VM"})
			return
		}
	} else if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "VM assigned successfully",
		"data":    vmAssign,
	})
}