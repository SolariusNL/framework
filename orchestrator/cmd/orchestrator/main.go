package main

import (
	"fmt"
	"os"
	"path"

	"github.com/SolariusNL/framework/internal"
	"github.com/SolariusNL/framework/pkg/config"
	"github.com/SolariusNL/framework/pkg/logger"
	"github.com/SolariusNL/framework/pkg/run"
)

var log = logger.NewLogger("orchestrator.main")

func main() {
	internal.ParseFlags()

	var exists bool
	for _, p := range config.GetPaths() {
		dist := path.Join(p, "dist")
		_, err := os.Stat(dist)
		
		if err != nil {
			exists = false
			continue
		}

		if os.IsNotExist(err) {
			log.Log("Path " + dist + " does not exist, builds will be forced")
			exists = false
			continue
		}

		exists = true
	}

	if exists && internal.GetDevMode() == false {
		fmt.Print("Do you want to rebuild the apps before running? (y/n): ")
		var input string
		fmt.Scanln(&input)

		rebuild := input == "y" || input == "Y"

		run.Run(rebuild)
		return
	} else {
		log.Log("Development mode is enabled.")
	}

	run.Run(true)
}
