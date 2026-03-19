package config

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnv() {
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: Error loading .env file, falling back to environment variables or defaults")
    }
}
