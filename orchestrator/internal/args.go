package internal

import (
	"flag"
)

var (
	devMode bool
)

func init() {
	flag.BoolVar(&devMode, "dev", false, "Enable development mode")
}

func GetDevMode() bool {
	return devMode
}

func ParseFlags() {
	flag.Parse()
}
