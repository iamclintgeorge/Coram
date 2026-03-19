package models

import "time"

type AlertRule struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Metric    string    `gorm:"not null" json:"metric"`    // cpu, memory, disk
	Condition string    `gorm:"not null" json:"condition"` // gt, lt, eq (greater than, less than, equal)
	Threshold float64   `gorm:"not null" json:"threshold"` // threshold value (e.g. 80 for 80%)
	VMFilter  string    `json:"vm_filter"`                 // "all" or specific VM ID
	Enabled   bool      `gorm:"default:true" json:"enabled"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type AlertEvent struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	RuleID       uint      `gorm:"not null;index" json:"rule_id"`
	RuleName     string    `json:"rule_name"`
	VMID         int       `json:"vm_id"`
	VMName       string    `json:"vm_name"`
	Metric       string    `json:"metric"`
	MetricValue  float64   `json:"metric_value"`
	Threshold    float64   `json:"threshold"`
	Condition    string    `json:"condition"`
	Severity     string    `gorm:"default:'warning'" json:"severity"` // warning, critical
	Acknowledged bool      `gorm:"default:false" json:"acknowledged"`
	CreatedAt    time.Time `gorm:"index" json:"created_at"`
}

func (AlertRule) TableName() string {
	return "alert_rules"
}

func (AlertEvent) TableName() string {
	return "alert_events"
}
