package models

import "time"

type BillingConfig struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Currency       string    `gorm:"default:'₹'" json:"currency"`
	CurrencyCode   string    `gorm:"default:'INR'" json:"currency_code"`
	CpuRate        float64   `gorm:"default:0.05" json:"cpu_rate"`        // per CPU % per hour
	RamRate        float64   `gorm:"default:0.002" json:"ram_rate"`       // per MB used per hour
	RamAllocRate   float64   `gorm:"default:0.002" json:"ram_alloc_rate"` // per MB allocated
	DiskRate       float64   `gorm:"default:0.001" json:"disk_rate"`      // per GB used per hour
	DiskAllocRate  float64   `gorm:"default:0.001" json:"disk_alloc_rate"`// per GB allocated
	UptimeRate     float64   `gorm:"default:0.01" json:"uptime_rate"`     // per hour uptime
	BillingPeriod  string    `gorm:"default:'hourly'" json:"billing_period"` // hourly, daily, monthly
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type BillingRecord struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	VMID        int       `gorm:"not null;index" json:"vm_id"`
	VMName      string    `json:"vm_name"`
	CpuCharge   float64   `json:"cpu_charge"`
	RamCharge   float64   `json:"ram_charge"`
	DiskCharge  float64   `json:"disk_charge"`
	UptimeCharge float64  `json:"uptime_charge"`
	Total       float64   `json:"total"`
	Currency    string    `json:"currency"`
	PeriodStart time.Time `json:"period_start"`
	PeriodEnd   time.Time `json:"period_end"`
	CreatedAt   time.Time `json:"created_at"`
}

func (BillingConfig) TableName() string {
	return "billing_config"
}

func (BillingRecord) TableName() string {
	return "billing_records"
}
