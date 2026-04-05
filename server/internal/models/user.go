package models

import "time" 

type User struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Email      string    `gorm:"unique;column:email" json:"email"`
	Username   string    `gorm:"column:username" json:"username"`
	Password   string    `gorm:"column:password" json:"password"`
	Role       string    `gorm:"column:role" json:"role"`
	VMAssigned string    `gorm:"column:vm_assigned" json:"vm_assigned"` // Stored as JSON array string
	CreatedOn  time.Time `gorm:"autoCreateTime;column:created_on" json:"created_on"`
	UpdatedOn  time.Time `gorm:"autoUpdateTime;column:updated_on" json:"updated_on"`
}
