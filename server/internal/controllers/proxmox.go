// This is the working API handler of Proxmox
package controllers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/config"
	"github.com/iamclintgeorge/Coram/internal/models"
	proxmox "github.com/iamclintgeorge/Coram/pkg/proxmox/v9.0.3"
)

// This fetches Information of all the VMs in a node
func FetchNodeStats(c *gin.Context) {
	nodeName := c.Param("node")

	// Get user from context
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(models.User)

	// Find config by node name (assuming unique for simplicity in current frontend)
	var pConfig models.ProxmoxConfig
	if err := config.DB.Where("node_name = ?", nodeName).First(&pConfig).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Node configuration not found"})
		return
	}

	client := proxmox.NewClient(
		pConfig.Host,
		pConfig.Port,
		pConfig.NodeName,
		pConfig.APIToken,
	)

	vms, err := client.GetNodeStatus()
	if err != nil {
		log.Printf("Error fetching node status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if user.Role != "root" {
		var vmAssigned models.VmAssigned
		if err := config.DB.Where("userId = ? AND proxmox_configId = ?", user.ID, pConfig.ID).First(&vmAssigned).Error; err != nil {
			// No VMs assigned to this user on this node
			c.JSON(http.StatusOK, []interface{}{})
			return
		}

		assignedIds := make(map[int]bool)
		for _, id := range vmAssigned.VmId {
			assignedIds[id] = true
		}

		var filtered []proxmox.VMData
		for _, vm := range vms {
			if assignedIds[vm.VMID] {
				filtered = append(filtered, vm)
			}
		}
		c.JSON(http.StatusOK, filtered)
		return
	}

	c.JSON(http.StatusOK, vms)
}

func FetchVMStats(c *gin.Context) {
	nodeName := c.Param("node")
	vmIDStr := c.Param("id")

	// Get user from context
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(models.User)

	var pConfig models.ProxmoxConfig
	if err := config.DB.Where("node_name = ?", nodeName).First(&pConfig).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Node configuration not found"})
		return
	}

	vmID, err := strconv.Atoi(vmIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid VM ID"})
		return
	}

	// Permission check
	if user.Role != "root" {
		var vmAssigned models.VmAssigned
		if err := config.DB.Where("userId = ? AND proxmox_configId = ?", user.ID, pConfig.ID).First(&vmAssigned).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		isAssigned := false
		for _, id := range vmAssigned.VmId {
			if id == vmID {
				isAssigned = true
				break
			}
		}

		if !isAssigned {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
	}

	client := proxmox.NewClient(
		pConfig.Host,
		pConfig.Port,
		pConfig.NodeName,
		pConfig.APIToken,
	)

	vms, err := client.GetVMStatus(vmID)
	if err != nil {
		log.Printf("Error fetching VM status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, vms)
}

func ControlVM(c *gin.Context) {
	nodeName := c.Param("node")
	vmIDStr := c.Param("id")

	// Get user from context
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(models.User)

	var pConfig models.ProxmoxConfig
	if err := config.DB.Where("node_name = ?", nodeName).First(&pConfig).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Node configuration not found"})
		return
	}

	vmID, err := strconv.Atoi(vmIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid VM ID"})
		return
	}

	// Permission check
	if user.Role != "root" {
		var vmAssigned models.VmAssigned
		if err := config.DB.Where("userId = ? AND proxmox_configId = ?", user.ID, pConfig.ID).First(&vmAssigned).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		isAssigned := false
		for _, id := range vmAssigned.VmId {
			if id == vmID {
				isAssigned = true
				break
			}
		}

		if !isAssigned {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
	}

	var payload map[string]interface{}
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	action, ok := payload["action"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Action missing or invalid"})
		return
	}

	client := proxmox.NewClient(
		pConfig.Host,
		pConfig.Port,
		pConfig.NodeName,
		pConfig.APIToken,
	)

	err = client.ControlVM(vmID, action)
	if err != nil {
		log.Printf("Error controlling VM: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Action performed successfully"})
}

// Node CRUD Endpoints
func FetchNodes(c *gin.Context) {
	var nodes []models.ProxmoxConfig
	if err := config.DB.Find(&nodes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch nodes"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"nodes": nodes})
}

func CreateNodes(c *gin.Context) {
	var node models.ProxmoxConfig
	if err := c.ShouldBindJSON(&node); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := config.DB.Create(&node).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create node"})
		return
	}

	config.UpdateProxmoxConfig(&node)
	c.JSON(http.StatusCreated, node)
}

func UpdateNodes(c *gin.Context) {
	id := c.Param("id")
	var node models.ProxmoxConfig
	if err := config.DB.First(&node, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Node not found"})
		return
	}

	if err := c.ShouldBindJSON(&node); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := config.DB.Save(&node).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update node"})
		return
	}

	config.UpdateProxmoxConfig(&node)
	c.JSON(http.StatusOK, node)
}

func DeleteNodes(c *gin.Context) {
	id := c.Param("id")
	uID, _ := strconv.ParseUint(id, 10, 32)
	if err := config.DB.Delete(&models.ProxmoxConfig{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete node"})
		return
	}

	config.DeleteProxmoxConfigFromCache(uint(uID))
	c.JSON(http.StatusOK, gin.H{"message": "Node deleted successfully"})
}


// func getProxmoxClient() (*proxmox.Client, error) {
// 	var proxmoxConfig models.ProxmoxConfig
// 	if err := config.DB.First(&proxmoxConfig).Error; err != nil {
// 		return nil, err
// 	}
	
// 	return proxmox.NewClient(
// 		proxmoxConfig.Host,
// 		proxmoxConfig.Port,
// 		proxmoxConfig.NodeName,
// 		proxmoxConfig.APIToken,
// 	), nil
// }

// GetUserVMs returns all VMs for the authenticated user
// func GetUserVMs(c *gin.Context) {
// 	userID := c.GetUint("user_id") // From auth middleware
	
// 	var userVMs []models.UserVM
// 	if err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&userVMs).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch VMs"})
// 		return
// 	}
	
// 	// Get Proxmox client
// 	client, err := getProxmoxClient()
// 	if err != nil {
// 		c.JSON(http.StatusOK, gin.H{
// 			"success": true,
// 			"vms":     userVMs,
// 			"message": "Could not fetch live data",
// 		})
// 		return
// 	}
	
// 	// Enrich with live data from Proxmox
// 	type VMResponse struct {
// 		models.UserVM
// 		LiveData *proxmox.VMData `json:"live_data,omitempty"`
// 	}
	
// 	var enrichedVMs []VMResponse
// 	for _, vm := range userVMs {
// 		vmResp := VMResponse{UserVM: vm}
		
// 		// Try to get live data
// 		if vmStatus, err := client.GetVMStatus(vm.VMID); err == nil {
// 			vmResp.LiveData = &vmStatus.Data
// 			vmResp.Status = vmStatus.Data.Status
// 		}
		
// 		enrichedVMs = append(enrichedVMs, vmResp)
// 	}
	
// 	c.JSON(http.StatusOK, gin.H{
// 		"success": true,
// 		"vms":     enrichedVMs,
// 	})
// }

// GetVMDetails returns detailed information about a specific VM
// func GetVMDetails(c *gin.Context) {
// 	userID := c.GetUint("user_id")
// 	vmID, err := strconv.Atoi(c.Param("vmid"))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid VM ID"})
// 		return
// 	}
	
// 	// Check if user owns this VM
// 	var userVM models.UserVM
// 	if err := config.DB.Where("user_id = ? AND vm_id = ?", userID, vmID).First(&userVM).Error; err != nil {
// 		c.JSON(http.StatusForbidden, gin.H{"error": "VM not found or access denied"})
// 		return
// 	}
	
// 	// Get live data from Proxmox
// 	client, err := getProxmoxClient()
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Proxmox client error"})
// 		return
// 	}
	
// 	vmStatus, err := client.GetVMStatus(vmID)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch VM status"})
// 		return
// 	}
	
// 	c.JSON(http.StatusOK, gin.H{
// 		"success": true,
// 		"vm":      vmStatus.Data,
// 	})
// }

// ControlVM handles start/stop/shutdown/reboot actions
// func ControlVM(c *gin.Context) {
// 	userID := c.GetUint("user_id")
// 	vmID, err := strconv.Atoi(c.Param("vmid"))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid VM ID"})
// 		return
// 	}
	
// 	action := c.Param("action")
	
// 	// Validate action
// 	validActions := map[string]bool{
// 		"start": true, "stop": true, "shutdown": true, "reboot": true, "reset": true,
// 	}
// 	if !validActions[action] {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action"})
// 		return
// 	}
	
// 	// Check ownership
// 	var exists int64
// 	config.DB.Model(&models.UserVM{}).Where("user_id = ? AND vm_id = ?", userID, vmID).Count(&exists)
// 	if exists == 0 {
// 		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
// 		return
// 	}
	
// 	// Execute action
// 	client, err := getProxmoxClient()
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Proxmox client error"})
// 		return
// 	}
	
// 	if err := client.ControlVM(vmID, action); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}
	
// 	c.JSON(http.StatusOK, gin.H{
// 		"success": true,
// 		"message": "VM " + action + " initiated successfully",
// 	})
// }

// LinkVMToUser links an existing VM to the current user
// func LinkVMToUser(c *gin.Context) {
// 	userID := c.GetUint("user_id")
	
// 	var req struct {
// 		VMID     int    `json:"vm_id" binding:"required"`
// 		VMName   string `json:"vm_name" binding:"required"`
// 		NodeName string `json:"node_name" binding:"required"`
// 	}
	
// 	if err := c.ShouldBindJSON(&req); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}
	
// 	userVM := models.UserVM{
// 		UserID:   userID,
// 		VMID:     req.VMID,
// 		VMName:   req.VMName,
// 		NodeName: req.NodeName,
// 	}
	
// 	if err := config.DB.Create(&userVM).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link VM"})
// 		return
// 	}
	
// 	c.JSON(http.StatusCreated, gin.H{
// 		"success": true,
// 		"message": "VM linked successfully",
// 		"vm":      userVM,
// 	})
// }
