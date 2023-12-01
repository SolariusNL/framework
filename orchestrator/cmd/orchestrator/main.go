package main

import "github.com/SolariusNL/framework/pkg/logger"

func main() {
	appLogger := logger.NewLogger("framework.app")
	appLogger.Err("James")
}
