package main

// import (
// 	"crypto/tls"
// 	"encoding/json"
// 	"fmt"
// 	"io"
// 	"net/http"
// )

// //To be deleted as it serves no purpose

// // Replace these with your actual values
// const (
// 	PROXMOX_HOST  = "192.168.122.15"  // Your Proxmox IP
// 	PROXMOX_PORT  = "8006"
// 	NODE_NAME     = "pve"            // Your node name
// 	VM_ID         = "100"            // Your VM ID
// 	API_TOKEN     = "root@pam!test-vm-token=09acc1b3-bcf9-4e3b-a6e7-039aa344bce9"  // Replace with your actual token
// )

// type VMStatus struct {
// 	Data struct {
// 		Name   string `json:"name"`
// 		Status string `json:"status"`
// 		VMID   int    `json:"vmid"`
// 		CPUs   int    `json:"cpus"`
// 		MaxMem int64  `json:"maxmem"`
// 		MaxDisk int64 `json:"maxdisk"`
// 		Uptime int64  `json:"uptime"`
// 	} `json:"data"`
// }

// func fetchVMInfo() {
// 	// Create HTTP client that ignores SSL certificate errors
// 	tr := &http.Transport{
// 		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
// 	}
// 	client := &http.Client{Transport: tr}

// 	// Build API URL
// 	url := fmt.Sprintf("https://%s:%s/api2/json/nodes/%s/qemu/%s/status/current",
// 		PROXMOX_HOST, PROXMOX_PORT, NODE_NAME, VM_ID)

// 	fmt.Println("Fetching VM details from:", url)
// 	fmt.Println()

// 	// Create request
// 	req, err := http.NewRequest("GET", url, nil)
// 	if err != nil {
// 		fmt.Println("Error creating request:", err)
// 		return
// 	}

// 	// Add authorization header
// 	req.Header.Add("Authorization", "PVEAPIToken="+API_TOKEN)

// 	// Make request
// 	resp, err := client.Do(req)
// 	if err != nil {
// 		fmt.Println("Error making request:", err)
// 		return
// 	}
// 	defer resp.Body.Close()

// 	// Read response
// 	body, err := io.ReadAll(resp.Body)
// 	if err != nil {
// 		fmt.Println("Error reading response:", err)
// 		return
// 	}

// 	// Check status code
// 	if resp.StatusCode != 200 {
// 		fmt.Printf("Error: HTTP %d\n", resp.StatusCode)
// 		fmt.Println("Response:", string(body))
// 		return
// 	}

// 	// Parse JSON
// 	var vmStatus VMStatus
// 	err = json.Unmarshal(body, &vmStatus)
// 	if err != nil {
// 		fmt.Println("Error parsing JSON:", err)
// 		fmt.Println("Raw response:", string(body))
// 		return
// 	}

// 	// Display results
// 	fmt.Println("=== VM Details ===")
// 	fmt.Printf("VM ID:       %d\n", vmStatus.Data.VMID)
// 	fmt.Printf("Name:        %s\n", vmStatus.Data.Name)
// 	fmt.Printf("Status:      %s\n", vmStatus.Data.Status)
// 	fmt.Printf("CPUs:        %d\n", vmStatus.Data.CPUs)
// 	fmt.Printf("Memory:      %d MB\n", vmStatus.Data.MaxMem/(1024*1024))
// 	fmt.Printf("Disk:        %d GB\n", vmStatus.Data.MaxDisk/(1024*1024*1024))
// 	fmt.Printf("Uptime:      %d seconds\n", vmStatus.Data.Uptime)
// 	fmt.Println("\n=== Raw JSON ===")
	
// 	// Pretty print JSON
// 	var prettyJSON map[string]interface{}
// 	json.Unmarshal(body, &prettyJSON)
// 	prettyBytes, _ := json.MarshalIndent(prettyJSON, "", "  ")
// 	fmt.Println(string(prettyBytes))
// }