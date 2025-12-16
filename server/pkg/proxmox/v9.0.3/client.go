package proxmox

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type Client struct {
	Host     string
	Port     string
	NodeName string
	APIToken string
	HTTPClient *http.Client
}

// type VMStatusResponse struct {
//     Data []map[string]interface{} `json:"data"`
// }

// type VMStatusResponse struct {
//     Data VMData `json:"data"`
// }

type VMStatusResponse struct {
    Data VMData `json:"data"`
}

type VMListResponse struct {
    Data []VMData `json:"data"`
}

type VMData struct {
    Name       string  `json:"name"`
    Status     string  `json:"status"`
    VMID       int     `json:"vmid"`
    CPUs       int     `json:"cpus"`
    MaxMem     int64   `json:"maxmem"`
    Mem        int64   `json:"mem"`
    MaxDisk    int64   `json:"maxdisk"`
    // Disk       int64   `json:"disk"`
    Uptime     int64   `json:"uptime"`
    CPU        float64 `json:"cpu"`
    DiskRead   int64   `json:"diskread"`
    DiskWrite  int64   `json:"diskwrite"`
    NetIn      int64   `json:"netin"`
    NetOut     int64   `json:"netout"`
    // Template   int     `json:"template"`
    // OS_Type    string  `json:"ostype"`
    // StartTime  int64   `json:"starttime"`
    // HA_Enabled bool    `json:"ha_enabled"`
}

func NewClient(host, port, nodeName, apiToken string) *Client {
	// 	//FIXME: Remove the skipping of certificate in production or at least give the user the option to control this particular behaviour
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	
	return &Client{
		Host:       host,
		Port:       port,
		NodeName:   nodeName,
		APIToken:   apiToken,
		HTTPClient: &http.Client{Transport: tr},
	}
}

func (c *Client) makeRequest(method, path string, body io.Reader) (*http.Response, error) {
	url := fmt.Sprintf("https://%s:%s%s", c.Host, c.Port, path)
	
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}
	
	req.Header.Add("Authorization", "PVEAPIToken="+c.APIToken)
	if body != nil {
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	}
	
	return c.HTTPClient.Do(req)
}

func (c *Client) GetNodeStatus() ([]VMData, error) {
    path := fmt.Sprintf("/api2/json/nodes/%s/qemu", c.NodeName)

    resp, err := c.makeRequest("GET", path, nil)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != 200 {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("API error: %d - %s", resp.StatusCode, string(body))
    }

    // Use VMListResponse instead of VMStatusResponse
    var vmList VMListResponse
    if err := json.NewDecoder(resp.Body).Decode(&vmList); err != nil {
        return nil, err
    }

    // Optional: log each VM for debugging
    for _, vm := range vmList.Data {
        fmt.Printf("VM: %v\n", vm)
    }

    return vmList.Data, nil
}


func (c *Client) GetVMStatus(vmID int) (VMData, error) {
    path := fmt.Sprintf("/api2/json/nodes/%s/qemu/%d/status/current", c.NodeName, vmID)

    resp, err := c.makeRequest("GET", path, nil)
    if err != nil {
        return VMData{}, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != 200 {
        body, _ := io.ReadAll(resp.Body)
        return VMData{}, fmt.Errorf("API error: %d - %s", resp.StatusCode, string(body))
    }

    var vmStatus VMStatusResponse
    if err := json.NewDecoder(resp.Body).Decode(&vmStatus); err != nil {
        return VMData{}, err
    }

    fmt.Printf("VM: %v\n", vmStatus.Data)

    // If the vmStatus.Data is valid, return it
    if vmStatus.Data.Name != "" {
        return vmStatus.Data, nil
    }

    return VMData{}, fmt.Errorf("VM not found")
}


func (c *Client) ControlVM(vmID int, action string) error {
	path := fmt.Sprintf("/api2/json/nodes/%s/qemu/%d/status/%s", c.NodeName, vmID, action)
	
	resp, err := c.makeRequest("POST", path, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error: %d - %s", resp.StatusCode, string(body))
	}
	
	return nil
}

func (c *Client) CreateVM(vmID int, name string, cores int, memory int) error {
	path := fmt.Sprintf("/api2/json/nodes/%s/qemu", c.NodeName)
	
	data := fmt.Sprintf("vmid=%d&name=%s&cores=%d&memory=%d&sockets=1", vmID, name, cores, memory)
	
	resp, err := c.makeRequest("POST", path, strings.NewReader(data))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error: %d - %s", resp.StatusCode, string(body))
	}
	
	return nil
}
