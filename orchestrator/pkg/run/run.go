package run

import (
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"sync"

	"github.com/SolariusNL/framework/pkg/logger"
)

var services = map[string][]string{
	"nextjs": {"yarn run build", "yarn run start"},
	"cron":   {"yarn run build", "yarn run start"},
}
var paths = map[string]string{
	"nextjs": path.Join(".."),
	"cron":   path.Join("..", "cron"),
}

var logs = make(map[string]*logger.Logger)

func init() {
	for service := range services {
		logs[service] = logger.NewLogger("orchestrator.runner." + service)
	}
}

func getServiceLogger(service string) *logger.Logger {
	return logs[service]
}

func getServicePath(service string) (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", err
	}

	return filepath.Join(wd, paths[service]), nil
}

func buildService(service string, commands []string) error {
	path, err := getServicePath(service)
	if err != nil {
		return err
	}

	log := getServiceLogger(service)
	log.Log("Building " + service)

	cmd := exec.Command("sh", "-c", commands[0])
	cmd.Dir = path
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Run()
	if err != nil {
		log.Err("Error building " + service + ": " + err.Error())
		return err
	}

	return nil
}

func runService(service string, commands []string, wg *sync.WaitGroup) error {
	defer wg.Done()

	path, err := getServicePath(service)
	if err != nil {
		return err
	}

	log := getServiceLogger(service)
	log.Log("Starting " + service)

	cmd := exec.Command("sh", "-c", commands[1])
	cmd.Dir = path
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Start()
	if err != nil {
		return err
	}

	err = cmd.Wait()
	if err != nil {
		log.Err("Error running " + service + ": " + err.Error())
	}

	return nil
}

func Run(rebuild bool) {
	var wg sync.WaitGroup

	for service, commands := range services {
		wg.Add(1)

		if rebuild {
			err := buildService(service, commands)
			if err != nil {
				log := getServiceLogger(service)
				log.Err("Error building " + service + ": " + err.Error())
			}
		}

		go runService(service, commands, &wg)
	}

	wg.Wait()
}
