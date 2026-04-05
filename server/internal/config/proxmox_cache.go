package config

import (
	"log"
	"sync"

	"github.com/iamclintgeorge/Coram/internal/models"
)

var (
	proxmoxConfigs = make(map[uint]*models.ProxmoxConfig)
	configMutex    sync.RWMutex
)

// LoadProxmoxConfig fetches all Proxmox configs from DB on startup
func LoadProxmoxConfig() {
	configMutex.Lock()
	defer configMutex.Unlock()

	var pConfigs []models.ProxmoxConfig
	if err := DB.Find(&pConfigs).Error; err == nil {
		for i := range pConfigs {
			proxmoxConfigs[pConfigs[i].ID] = &pConfigs[i]
		}
		log.Printf("Loaded %d Proxmox configs from DB\n", len(pConfigs))
	} else {
		log.Println("No Proxmox configs found in DB during startup")
	}
}

// UpdateProxmoxConfig updates the in-memory cache
func UpdateProxmoxConfig(pConfig *models.ProxmoxConfig) {
	configMutex.Lock()
	defer configMutex.Unlock()

	proxmoxConfigs[pConfig.ID] = pConfig
}

// GetProxmoxConfig retrieves the cached Proxmox config by ID with lazy loading
func GetProxmoxConfig(id uint) *models.ProxmoxConfig {
	configMutex.RLock()
	config, ok := proxmoxConfigs[id]
	configMutex.RUnlock()

	if ok {
		return config
	}

	// Lazy load from DB
	var pConfig models.ProxmoxConfig
	if err := DB.First(&pConfig, id).Error; err == nil {
		configMutex.Lock()
		proxmoxConfigs[id] = &pConfig
		configMutex.Unlock()
		return &pConfig
	}

	return nil
}

// GetAllProxmoxConfigs returns all cached configurations
func GetAllProxmoxConfigs() []*models.ProxmoxConfig {
	configMutex.RLock()
	defer configMutex.RUnlock()

	configs := make([]*models.ProxmoxConfig, 0, len(proxmoxConfigs))
	for _, v := range proxmoxConfigs {
		configs = append(configs, v)
	}
	return configs
}

func DeleteProxmoxConfigFromCache(id uint) {
	configMutex.Lock()
	defer configMutex.Unlock()
	delete(proxmoxConfigs, id)
}

// Removed saveToConfigJSON as requested (or just deprecated for multiple nodes)
