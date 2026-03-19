package models

import "time"

type CoramLog struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Level       string    `gorm:"default:'info';index" json:"level"` // info, warn, error, debug
	Service     string    `gorm:"default:'system'" json:"service"`   // auth, billing, vm, system
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Username    string    `gorm:"index" json:"username"`
	IPAddress   string    `json:"ip_address"`
	Metadata    string    `gorm:"type:text" json:"metadata"` // JSON string for extra data
	CreatedAt   time.Time `gorm:"index" json:"created_at"`
}

func (CoramLog) TableName() string {
	return "coram_logs"
}
