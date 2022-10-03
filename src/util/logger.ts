import chalk from "chalk";

export type LogLevel = "info" | "debug" | "warn" | "error" | "recv" | "send";
export const colors = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  white: "#d1d5db",
};

function logger() {
  return new Logger();
}

class Logger {
  constructor() {}
  private log(message: string, level: LogLevel) {
    const timestamp = new Date().toISOString();
    const color =
      level === "error"
        ? colors.red
        : level === "warn"
        ? colors.orange
        : level === "info"
        ? colors.green
        : level === "debug"
        ? colors.blue
        : level === "recv"
        ? colors.purple
        : level === "send"
        ? colors.yellow
        : colors.white;

    console.log(
      chalk.bgBlue(chalk.hex(colors.white)(` [${timestamp}] `)),
      chalk.hex(color)(`[framework->${level}]`),
      chalk.hex(colors.white)(`${message}`)
    );
  }

  info(message: string) {
    this.log(message, "info");
  }

  debug(message: string) {
    this.log(message, "debug");
  }

  warn(message: string) {
    this.log(message, "warn");
  }

  error(message: string) {
    this.log(message, "error");
  }

  recv(message: string) {
    this.log(message, "recv");
  }

  send(message: string) {
    this.log(message, "send");
  }
}

export default logger;
