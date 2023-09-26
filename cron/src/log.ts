export type LogLevel = "info" | "error" | "warn";

function logMsg(level: LogLevel, message: string) {
  const emoji: Record<LogLevel, string> = {
    info: "✅",
    error: "❌",
    warn: "⚠️",
  };

  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${emoji[level]} ${message}`);
}

export default logMsg;