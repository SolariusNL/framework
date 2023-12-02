package config

import "path"

var services = map[string][]string{
	"nextjs": {"yarn run build", "yarn run start-next"},
	"cron":   {"yarn run build", "yarn run start"},
}
var paths = map[string]string{
	"nextjs": path.Join(".."),
	"cron":   path.Join("..", "cron"),
}

func GetServices() map[string][]string {
	return services
}

func GetPaths() map[string]string {
	return paths
}