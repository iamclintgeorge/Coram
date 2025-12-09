package controllers

import (
	"crypto/tls"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/VM-Billing/internal/config"
	"github.com/iamclintgeorge/VM-Billing/internal/models"
	"github.com/iamclintgeorge/VM-Billing/pkg/proxmox"
)

//This is the working API handler of Proxmox

// FetchVMStats handles the API request to fetch VM stats from Proxmox
func FetchVMStats(c *gin.Context) {
	config.LoadEnv()  // load environment vars
    apiToken := os.Getenv("apiToken")
	proxmoxHost := os.Getenv("proxmoxHost")
	// log.Println(port)
    nodeName := c.Param("node")

    // Debugging: Log the node name and URL
    log.Printf("Fetching VM stats for node: %s", nodeName)

    // Construct the URL for the Proxmox API
    url := fmt.Sprintf("%s/api2/json/nodes/%s/qemu", proxmoxHost, nodeName)

    // Debugging: Log the full URL
    log.Printf("Proxmox API URL: %s", url)

    // Create a new HTTP client with InsecureSkipVerify set to true (skip cert verification)
    client := &http.Client{
        Timeout: 30 * time.Second,
        Transport: &http.Transport{
            TLSClientConfig: &tls.Config{
                InsecureSkipVerify: true, // This skips cert validation
            },
        },
    }

    // Create the request to Proxmox API
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        log.Printf("Error creating request: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to create request",
        })
        return
    }

    // Add the API token for authentication
    req.Header.Add("Authorization", "PVEAPIToken=" + apiToken)

    // Send the request to Proxmox API
    resp, err := client.Do(req)
    if err != nil {
        log.Printf("Error making request to Proxmox API: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch data from Proxmox",
        })
        return
    }
    defer resp.Body.Close()

    // Debugging: Log the response status code
    log.Printf("Proxmox API responded with status code: %d", resp.StatusCode)

    // Read the response body
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        log.Printf("Error reading response body: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to read response body",
        })
        return
    }

    // Debugging: Log the raw response body (ensure it is not too large or sensitive)
    log.Printf("Proxmox API response body: %s", string(body))

    // Check if the status code is 200 OK
    if resp.StatusCode != 200 {
        log.Printf("Proxmox API request failed with status: %d, response: %s", resp.StatusCode, string(body))
        c.JSON(resp.StatusCode, gin.H{
            "error": "Failed to get valid response from Proxmox",
            "body":  string(body),
        })
        return
    }

    // Return the response body from Proxmox as the API response
    c.Data(resp.StatusCode, "application/json", body)
}



func getProxmoxClient() (*proxmox.Client, error) {
	var proxmoxConfig models.ProxmoxConfig
	if err := config.DB.First(&proxmoxConfig).Error; err != nil {
		return nil, err
	}
	
	return proxmox.NewClient(
		proxmoxConfig.Host,
		proxmoxConfig.Port,
		proxmoxConfig.NodeName,
		proxmoxConfig.APIToken,
	), nil
}

// GetUserVMs returns all VMs for the authenticated user
func GetUserVMs(c *gin.Context) {
	userID := c.GetUint("user_id") // From auth middleware
	
	var userVMs []models.UserVM
	if err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&userVMs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch VMs"})
		return
	}
	
	// Get Proxmox client
	client, err := getProxmoxClient()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"vms":     userVMs,
			"message": "Could not fetch live data",
		})
		return
	}
	
	// Enrich with live data from Proxmox
	type VMResponse struct {
		models.UserVM
		LiveData *proxmox.VMData `json:"live_data,omitempty"`
	}
	
	var enrichedVMs []VMResponse
	for _, vm := range userVMs {
		vmResp := VMResponse{UserVM: vm}
		
		// Try to get live data
		if vmStatus, err := client.GetVMStatus(vm.VMID); err == nil {
			vmResp.LiveData = &vmStatus.Data
			vmResp.Status = vmStatus.Data.Status
		}
		
		enrichedVMs = append(enrichedVMs, vmResp)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"vms":     enrichedVMs,
	})
}

// GetVMDetails returns detailed information about a specific VM
func GetVMDetails(c *gin.Context) {
	userID := c.GetUint("user_id")
	vmID, err := strconv.Atoi(c.Param("vmid"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid VM ID"})
		return
	}
	
	// Check if user owns this VM
	var userVM models.UserVM
	if err := config.DB.Where("user_id = ? AND vm_id = ?", userID, vmID).First(&userVM).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "VM not found or access denied"})
		return
	}
	
	// Get live data from Proxmox
	client, err := getProxmoxClient()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Proxmox client error"})
		return
	}
	
	vmStatus, err := client.GetVMStatus(vmID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch VM status"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"vm":      vmStatus.Data,
	})
}

// ControlVM handles start/stop/shutdown/reboot actions
func ControlVM(c *gin.Context) {
	userID := c.GetUint("user_id")
	vmID, err := strconv.Atoi(c.Param("vmid"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid VM ID"})
		return
	}
	
	action := c.Param("action")
	
	// Validate action
	validActions := map[string]bool{
		"start": true, "stop": true, "shutdown": true, "reboot": true, "reset": true,
	}
	if !validActions[action] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action"})
		return
	}
	
	// Check ownership
	var exists int64
	config.DB.Model(&models.UserVM{}).Where("user_id = ? AND vm_id = ?", userID, vmID).Count(&exists)
	if exists == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}
	
	// Execute action
	client, err := getProxmoxClient()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Proxmox client error"})
		return
	}
	
	if err := client.ControlVM(vmID, action); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "VM " + action + " initiated successfully",
	})
}

// LinkVMToUser links an existing VM to the current user
func LinkVMToUser(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	var req struct {
		VMID     int    `json:"vm_id" binding:"required"`
		VMName   string `json:"vm_name" binding:"required"`
		NodeName string `json:"node_name" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	userVM := models.UserVM{
		UserID:   userID,
		VMID:     req.VMID,
		VMName:   req.VMName,
		NodeName: req.NodeName,
	}
	
	if err := config.DB.Create(&userVM).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link VM"})
		return
	}
	
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "VM linked successfully",
		"vm":      userVM,
	})
}
