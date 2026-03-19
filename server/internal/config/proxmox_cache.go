package config

import (
	"encoding/json"
	"log"
	"os"
	"sync"

	"github.com/iamclintgeorge/Coram/internal/models"
)

var (
	activeProxmoxConfig *models.ProxmoxConfig
	configMutex         sync.RWMutex
)

// LoadProxmoxConfig fetches the Proxmox config from DB on startup, and saves it to config.json
func LoadProxmoxConfig() {
	configMutex.Lock()
	defer configMutex.Unlock()

	var pConfig models.ProxmoxConfig
	if err := DB.First(&pConfig).Error; err == nil {
		activeProxmoxConfig = &pConfig
		log.Println("Proxmox config loaded from DB")
		saveToConfigJSON(&pConfig)
	} else {
		log.Println("No Proxmox config found in DB during startup")
	}
}

// UpdateProxmoxConfig updates the in-memory cache and config.json
func UpdateProxmoxConfig(pConfig *models.ProxmoxConfig) {
	configMutex.Lock()
	defer configMutex.Unlock()

	activeProxmoxConfig = pConfig
	saveToConfigJSON(pConfig)
}

// GetProxmoxConfig retrieves the cached Proxmox config
func GetProxmoxConfig() *models.ProxmoxConfig {
	configMutex.RLock()
	defer configMutex.RUnlock()
	return activeProxmoxConfig
}

func saveToConfigJSON(pConfig *models.ProxmoxConfig) {
	file, err := os.Create("config.json")
	if err != nil {
		log.Println("Failed to create config.json:", err)
		return
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(pConfig); err != nil {
		log.Println("Failed to write to config.json:", err)
	}
}
