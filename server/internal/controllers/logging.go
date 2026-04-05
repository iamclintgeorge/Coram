package controllers

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/config"
	"github.com/iamclintgeorge/Coram/internal/models"
)

// CreateLogEntry is a helper to create log entries from other controllers
func CreateLogEntry(level, service, title, description, username, ip string) {
	log := models.CoramLog{
		Level:       level,
		Service:     service,
		Title:       title,
		Description: description,
		Username:    username,
		IPAddress:   ip,
	}
	config.DB.Create(&log)
}

// GetLogs returns paginated Coram application logs
func GetLogs(c *gin.Context) {
	var logs []models.CoramLog
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	
	if page < 1 { page = 1 }
	if limit < 1 || limit > 200 { limit = 50 }
	
	query := config.DB.Order("created_at DESC")
	
	// Apply filters
	if level := c.Query("level"); level != "" {
		query = query.Where("level = ?", level)
	}
	if service := c.Query("service"); service != "" {
		query = query.Where("service = ?", service)
	}
	if username := c.Query("username"); username != "" {
		query = query.Where("username LIKE ?", "%"+username+"%")
	}
	if startDate := c.Query("start_date"); startDate != "" {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate := c.Query("end_date"); endDate != "" {
		query = query.Where("created_at <= ?", endDate)
	}
	
	var total int64
	query.Model(&models.CoramLog{}).Count(&total)
	
	query.Offset((page - 1) * limit).Limit(limit).Find(&logs)
	
	totalPages := int(total) / limit
	if int(total) % limit > 0 { totalPages++ }
	
	c.JSON(http.StatusOK, gin.H{
		"logs":  logs,
		"total": total,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"totalPages": totalPages,
			"totalCount": total,
			"hasNext":    page < totalPages,
			"hasPrev":    page > 1,
		},
	})
}

// GetProxmoxSyslog proxies the Proxmox syslog API
func GetProxmoxSyslog(c *gin.Context) {
	nodeName := c.Param("node")
	var pConfig models.ProxmoxConfig
	if err := config.DB.Where("node_name = ?", nodeName).First(&pConfig).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Node configuration not found"})
		return
	}
	apiToken := pConfig.APIToken
	host := pConfig.Host
	port := pConfig.Port

	limit := c.DefaultQuery("limit", "50")
	start := c.DefaultQuery("start", "0")
	since := c.DefaultQuery("since", "")

	url := fmt.Sprintf("https://%s:%s/api2/json/nodes/%s/syslog?limit=%s&start=%s",
		host, port, nodeName, limit, start)
	if since != "" {
		url += "&since=" + since
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}
	req.Header.Set("Authorization", "PVEAPIToken="+apiToken)

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Could not reach Proxmox API",
			"logs":  []interface{}{},
		})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, result)
}
