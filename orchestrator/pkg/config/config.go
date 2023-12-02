package config

import (
	"path"

	"github.com/SolariusNL/framework/internal"
)

var services = map[string][]string{
	"nextjs": {"yarn run build", "yarn run start-next"},
	"cron":   {"yarn run build", "yarn run start"},
}
var paths = map[string]string{
	"nextjs": path.Join(".."),
	"cron":   path.Join("..", "cron"),
}

func GetServices() map[string][]string {
	if internal.GetDevMode() {
		return map[string][]string{
			"nextjs": {"yarn run prebuild", "yarn run dev-next"},
			"cron":   {"yarn run prebuild", "yarn run dev"},
		}
	}
	return services
}

func GetPaths() map[string]string {
	return paths
}