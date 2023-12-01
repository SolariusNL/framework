package main

import (
	"fmt"
	"runtime"

	"github.com/SolariusNL/framework/pkg/logger"
	"github.com/SolariusNL/framework/pkg/run"
)

var log = logger.NewLogger("orchestrator.main")

func main() {
	if runtime.GOOS == "windows" {
		log.Err("Windows is not supported")
		return
	}

	fmt.Print("Do you want to rebuild the apps before running? (y/n): ")
	var input string
	fmt.Scanln(&input)

	rebuild := input == "y" || input == "Y"

	run.Run(rebuild)
}
