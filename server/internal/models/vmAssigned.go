package models

import "time" 

type VmAssigned struct {
	ID        	uint      	`gorm:"primaryKey"`
	UserId		uint		`gorm:"column:userId"`
	CreatedAt 	time.Time 	`gorm:"autoCreateTime"`
	UpdatedAt 	time.Time 	`gorm:"autoUpdateTime"` 
}
