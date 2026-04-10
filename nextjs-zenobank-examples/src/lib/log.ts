const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
} as const;

type Level = "info" | "warn" | "error" | "success";

const LEVEL_STYLE: Record<Level, { color: string; label: string }> = {
  info: { color: ANSI.cyan, label: "INFO " },
  warn: { color: ANSI.yellow, label: "WARN " },
  error: { color: ANSI.red, label: "ERROR" },
  success: { color: ANSI.green, label: "OK   " },
};

function format(scope: string, level: Level, msg: string) {
  const { color, label } = LEVEL_STYLE[level];
  const ts = new Date().toISOString().slice(11, 23);
  return (
    `${ANSI.gray}${ts}${ANSI.reset} ` +
    `${color}${ANSI.bold}${label}${ANSI.reset} ` +
    `${ANSI.magenta}[${scope}]${ANSI.reset} ` +
    `${msg}`
  );
}

export function createLogger(scope: string) {
  return {
    info: (msg: string, data?: unknown) =>
      console.log(format(scope, "info", msg), data ?? ""),
    success: (msg: string, data?: unknown) =>
      console.log(format(scope, "success", msg), data ?? ""),
    warn: (msg: string, data?: unknown) =>
      console.warn(format(scope, "warn", msg), data ?? ""),
    error: (msg: string, data?: unknown) =>
      console.error(format(scope, "error", msg), data ?? ""),
  };
}
