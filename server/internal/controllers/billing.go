package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/config"
	"github.com/iamclintgeorge/Coram/internal/models"
)

// Billing CRUD Endpoints
func FetchBill(c *gin.Context) {
	var records []models.BillingRecord
	if err := config.DB.Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch billing records"})
		return
	}
	c.JSON(http.StatusOK, records)
}

func CreateRate(c *gin.Context) {
	var rate models.BillingConfig
	if err := c.ShouldBindJSON(&rate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := config.DB.Create(&rate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create rate config"})
		return
	}

	c.JSON(http.StatusCreated, rate)
}

func FetchRate(c *gin.Context) {
	var rates []models.BillingConfig
	if err := config.DB.Find(&rates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rates"})
		return
	}
	c.JSON(http.StatusOK, rates)
}

func UpdateRate(c *gin.Context) {
	id := c.Param("id")
	var rate models.BillingConfig
	if err := config.DB.First(&rate, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rate config not found"})
		return
	}

	if err := c.ShouldBindJSON(&rate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := config.DB.Save(&rate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update rate config"})
		return
	}

	c.JSON(http.StatusOK, rate)
}

func DeleteRate(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.BillingConfig{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete rate config"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Rate config deleted successfully"})
}

// GetBillingHistory returns billing records with pagination
func GetBillingHistory(c *gin.Context) {
	var records []models.BillingRecord
	
	page := 1
	limit := 20
	
	query := config.DB.Order("created_at DESC")
	
	vmID := c.Query("vm_id")
	if vmID != "" {
		query = query.Where("vm_id = ?", vmID)
	}
	
	query.Offset((page - 1) * limit).Limit(limit).Find(&records)
	
	var total int64
	config.DB.Model(&models.BillingRecord{}).Count(&total)
	
	c.JSON(http.StatusOK, gin.H{
		"records": records,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}

func UpdateBillStatus(c *gin.Context) {
	id := c.Param("id")
	var record models.BillingRecord
	if err := config.DB.First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Billing record not found"})
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	record.Status = req.Status
	if err := config.DB.Save(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update record"})
		return
	}

	c.JSON(http.StatusOK, record)
}
