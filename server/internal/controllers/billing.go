package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/config"
	"github.com/iamclintgeorge/Coram/internal/models"
)

// GetBillingConfig returns current billing config (creates defaults if none exist)
func GetBillingConfig(c *gin.Context) {
	var billingConfig models.BillingConfig

	result := config.DB.First(&billingConfig)
	if result.Error != nil {
		// Create default config
		billingConfig = models.BillingConfig{
			Currency:      "₹",
			CurrencyCode:  "INR",
			CpuRate:       0.05,
			RamRate:       0.002,
			RamAllocRate:  0.002,
			DiskRate:      0.001,
			DiskAllocRate: 0.001,
			UptimeRate:    0.01,
			BillingPeriod: "hourly",
		}
		config.DB.Create(&billingConfig)
	}

	c.JSON(http.StatusOK, billingConfig)
}

// UpdateBillingConfig updates billing rates and currency
func UpdateBillingConfig(c *gin.Context) {
	var req models.BillingConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existing models.BillingConfig
	result := config.DB.First(&existing)
	if result.Error != nil {
		// Create if not exists
		config.DB.Create(&req)
		c.JSON(http.StatusOK, gin.H{"message": "Billing config created", "config": req})
		return
	}

	// Update existing
	existing.Currency = req.Currency
	existing.CurrencyCode = req.CurrencyCode
	existing.CpuRate = req.CpuRate
	existing.RamRate = req.RamRate
	existing.RamAllocRate = req.RamAllocRate
	existing.DiskRate = req.DiskRate
	existing.DiskAllocRate = req.DiskAllocRate
	existing.UptimeRate = req.UptimeRate
	existing.BillingPeriod = req.BillingPeriod

	config.DB.Save(&existing)

	c.JSON(http.StatusOK, gin.H{"message": "Billing config updated", "config": existing})
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
