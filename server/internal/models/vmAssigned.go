package models

import "time" 

type VmAssigned struct {
	ID        	uint      	`gorm:"primaryKey"`
	UserId		uint		`gorm:"column:userId"`
	VmId		uint		`gorm:"column:vmId"`
	configId	uint		`gorm:"column:configId"`
	CreatedAt 	time.Time 	`gorm:"autoCreateTime"`
	UpdatedAt 	time.Time 	`gorm:"autoUpdateTime"` 
}