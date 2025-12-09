package main

// import (
// 	"log"

// 	"github.com/iamclintgeorge/VM-Billing/internal/config"
// 	"github.com/iamclintgeorge/VM-Billing/internal/models"
// )

// //To be deleted as it serves no purpose

// func main() {
// 	config.Connect()
	
// 	// Create Proxmox config
// 	proxmoxConfig := models.ProxmoxConfig{
// 		Host:     "192.168.122.100",
// 		Port:     "8006",
// 		NodeName: "pve",
// 		APIToken: "root@pam!test-vm=09acc1b3-bcf9-4e3b-a6e7-039aa344bce9", // Replace this
// 	}
	
// 	if err := config.DB.Create(&proxmoxConfig).Error; err != nil {
// 		log.Fatal("Failed to create Proxmox config:", err)
// 	}
	
// 	log.Println("Proxmox config created successfully!")
	
// 	// Link VM to user (user_id = 1)
// 	userVM := models.UserVM{
// 		UserID:   1, // Change this if your user has different ID
// 		VMID:     100,
// 		VMName:   "vm1",
// 		NodeName: "pve",
// 	}
	
// 	if err := config.DB.Create(&userVM).Error; err != nil {
// 		log.Fatal("Failed to link VM:", err)
// 	}
	
// 	log.Println("VM linked to user successfully!")
// }
