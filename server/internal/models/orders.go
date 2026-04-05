package models

import "time"

type VmOrder struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserId     uint      `gorm:"column:userId" json:"user_id"`
	TemplateId uint      `gorm:"column:templateId" json:"template_id"`
	Remark     string    `gorm:"column:remark" json:"remark"`
	CreatedOn  time.Time `gorm:"autoCreateTime;column:created_on" json:"created_on"`
	UpdatedOn  time.Time `gorm:"autoUpdateTime;column:updated_on" json:"updated_on"`
}

type Template struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Resource        string    `gorm:"column:resource" json:"resource"` // Stored as JSON string
	BillingConfigId uint      `gorm:"column:billing_configId" json:"billing_config_id"`
	CreatedOn       time.Time `gorm:"autoCreateTime;column:created_on" json:"created_on"`
	UpdatedOn       time.Time `gorm:"autoUpdateTime;column:updated_on" json:"updated_on"`
}

func (VmOrder) TableName() string {
	return "vm_orders"
}

func (Template) TableName() string {
	return "templates"
}