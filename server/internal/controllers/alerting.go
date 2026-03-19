package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/config"
	"github.com/iamclintgeorge/Coram/internal/models"
)

// CreateAlertRule creates a new alert rule
func CreateAlertRule(c *gin.Context) {
	var rule models.AlertRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if rule.Name == "" || rule.Metric == "" || rule.Condition == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name, metric, and condition are required"})
		return
	}

	// Validate metric
	validMetrics := map[string]bool{"cpu": true, "memory": true, "disk": true}
	if !validMetrics[rule.Metric] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid metric. Use: cpu, memory, disk"})
		return
	}

	// Validate condition
	validConditions := map[string]bool{"gt": true, "lt": true, "eq": true}
	if !validConditions[rule.Condition] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid condition. Use: gt, lt, eq"})
		return
	}

	if rule.VMFilter == "" {
		rule.VMFilter = "all"
	}

	config.DB.Create(&rule)
	c.JSON(http.StatusCreated, rule)
}

// GetAlertRules returns all alert rules
func GetAlertRules(c *gin.Context) {
	var rules []models.AlertRule
	config.DB.Order("created_at DESC").Find(&rules)
	c.JSON(http.StatusOK, rules)
}

// UpdateAlertRule updates an existing alert rule
func UpdateAlertRule(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rule ID"})
		return
	}

	var existing models.AlertRule
	if err := config.DB.First(&existing, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rule not found"})
		return
	}

	var req models.AlertRule
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existing.Name = req.Name
	existing.Metric = req.Metric
	existing.Condition = req.Condition
	existing.Threshold = req.Threshold
	existing.VMFilter = req.VMFilter
	existing.Enabled = req.Enabled

	config.DB.Save(&existing)
	c.JSON(http.StatusOK, existing)
}

// DeleteAlertRule deletes an alert rule
func DeleteAlertRule(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rule ID"})
		return
	}

	result := config.DB.Delete(&models.AlertRule{}, id)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rule not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Rule deleted"})
}

// GetAlertEvents returns triggered alert events
func GetAlertEvents(c *gin.Context) {
	var events []models.AlertEvent

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if page < 1 { page = 1 }
	if limit < 1 || limit > 200 { limit = 50 }

	query := config.DB.Order("created_at DESC")

	acknowledged := c.Query("acknowledged")
	if acknowledged == "true" {
		query = query.Where("acknowledged = ?", true)
	} else if acknowledged == "false" {
		query = query.Where("acknowledged = ?", false)
	}

	var total int64
	query.Model(&models.AlertEvent{}).Count(&total)

	query.Offset((page - 1) * limit).Limit(limit).Find(&events)

	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"total":  total,
		"page":   page,
	})
}

// CreateAlertEvent records a triggered alert event
func CreateAlertEvent(c *gin.Context) {
	var event models.AlertEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Create(&event)
	c.JSON(http.StatusCreated, event)
}

// AcknowledgeAlertEvent marks an alert event as acknowledged
func AcknowledgeAlertEvent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var event models.AlertEvent
	if err := config.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	event.Acknowledged = true
	config.DB.Save(&event)

	c.JSON(http.StatusOK, gin.H{"message": "Event acknowledged", "event": event})
}

// ToggleAlertRule enables or disables an alert rule
func ToggleAlertRule(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rule ID"})
		return
	}

	var rule models.AlertRule
	if err := config.DB.First(&rule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rule not found"})
		return
	}

	rule.Enabled = !rule.Enabled
	config.DB.Save(&rule)

	c.JSON(http.StatusOK, rule)
}
