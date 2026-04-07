package models

import "time"

type BillingConfig struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	CurrencyCode   string    `gorm:"column:currency_code" json:"currency_code"`
	CpuRate        float64   `gorm:"column:cpu_rate" json:"cpu_rate"`
	RamRate        float64   `gorm:"column:ram_rate" json:"ram_rate"`
	RamAllocRate   float64   `gorm:"column:ram_alloc_rate" json:"ram_alloc_rate"`
	DiskRate       float64   `gorm:"column:disk_rate" json:"disk_rate"`
	DiskAllocRate  float64   `gorm:"column:disk_alloc_rate" json:"disk_alloc_rate"`
	UptimeRate     float64   `gorm:"column:uptime_rate" json:"uptime_rate"`
	BillingPeriod  string    `gorm:"column:billing_period" json:"billing_period"`
	CreatedOn      time.Time `gorm:"autoCreateTime;column:created_on" json:"created_on"`
	UpdatedOn      time.Time `gorm:"autoUpdateTime;column:updated_on" json:"updated_on"`
}

type BillingRecord struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"column:user_id;index" json:"user_id"`
	VMID            int       `gorm:"column:vm_id" json:"vm_id"`
	StartDate       time.Time `gorm:"column:start_date" json:"start_date"`
	EndDate         time.Time `gorm:"column:end_date" json:"end_date"`
	VmDetail        string    `gorm:"column:vm_detail" json:"vm_detail"` // Stored as JSON string
	TotalCost       float64   `gorm:"column:total_cost" json:"total_cost"`
	Status          string    `gorm:"column:status;default:unpaid" json:"status"` // paid or unpaid
	BillingConfigId uint      `gorm:"column:billing_configId" json:"billing_config_id"`
	CreatedOn       time.Time `gorm:"autoCreateTime;column:created_on" json:"created_on"`
	UpdatedOn       time.Time `gorm:"autoUpdateTime;column:updated_on" json:"updated_on"`
}

func (BillingConfig) TableName() string {
	return "billing_config"
}

func (BillingRecord) TableName() string {
	return "billing_records"
}
