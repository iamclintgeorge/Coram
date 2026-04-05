package models

type VmAssigned struct {
	ID               uint `gorm:"primaryKey" json:"id"`
	UserId           uint `gorm:"column:userId" json:"user_id"`
	VmId             int  `gorm:"column:vmId" json:"vm_id"`
	ProxmoxConfigId uint `gorm:"column:proxmox_configId" json:"proxmox_config_id"`
}

func (VmAssigned) TableName() string {
	return "vm_assigned"
}