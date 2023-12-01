package logger

import (
	"fmt"
	"time"
)

const (
	reset   = "\033[0m"
	bold    = "\033[1m"
	red     = "\033[31m"
	yellow  = "\033[33m"
	blue    = "\033[34m"
	magenta = "\033[35m"
)

type Logger struct {
	Namespace string
}

func (l *Logger) Log(message string) {
	l.printLog("log", message, blue)
}

func (l *Logger) Warn(message string) {
	l.printLog("warn", message, yellow)
}

func (l *Logger) Err(message string) {
	l.printLog("err", message, red)
}

func (l *Logger) printLog(logType, message, color string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	fmt.Printf("%s[%s]%s [%s:%s] ~~~\n%s%s%s", bold, timestamp, reset, l.Namespace, logType, color, message, reset)
}

func NewLogger(namespace string) *Logger {
	return &Logger{Namespace: namespace}
}
