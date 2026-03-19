package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/config"
	"github.com/iamclintgeorge/Coram/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type SetupRootRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// CheckSetupStatus determines if setup has been completed (e.g., if a root user exists)
func CheckSetupStatus(c *gin.Context) {
	var count int64
	if err := config.DB.Model(&models.User{}).Where("role = ?", "root").Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check setup status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"setupRequired": count == 0,
	})
}

// SetupRootAccount creates the initial root account
func SetupRootAccount(c *gin.Context) {
	var count int64
	config.DB.Model(&models.User{}).Where("role = ?", "root").Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Root account already exists"})
		return
	}

	var req SetupRootRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Email:    req.Email,
		UserName: "root",
		Password: string(hashedPassword),
		Role:     "root",
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create root account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Root account created successfully", "user": user})
}

// SetupProxmoxConfig saves Proxmox settings into config.json and SQLite DB
func SetupProxmoxConfig(c *gin.Context) {
	var req models.ProxmoxConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingConfig models.ProxmoxConfig
	if err := config.DB.First(&existingConfig).Error; err == nil {
		// Update existing config
		existingConfig.Host = req.Host
		existingConfig.Port = req.Port
		existingConfig.NodeName = req.NodeName
		existingConfig.APIToken = req.APIToken
		
		if err := config.DB.Save(&existingConfig).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update Proxmox configuration"})
			return
		}
		config.UpdateProxmoxConfig(&existingConfig)
	} else {
		// Create new config
		if err := config.DB.Create(&req).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save Proxmox configuration"})
			return
		}
		config.UpdateProxmoxConfig(&req)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Proxmox configuration saved successfully"})
}

// GetProxmoxConfig retrieves the current Proxmox settings
func GetProxmoxConfig(c *gin.Context) {
	pConfig := config.GetProxmoxConfig()
	if pConfig == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No Proxmox configuration found"})
		return
	}
	c.JSON(http.StatusOK, pConfig)
}

