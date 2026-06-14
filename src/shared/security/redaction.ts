const sensitiveKeyPattern = /(access|refresh|id)?_?token|secret|password|authorization|email|buyer|full_?name|phone/i;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const bearerPattern = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const jwtPattern = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const expoPushTokenPattern = /\bExponentPushToken\[[^\]]+\]/g;

let consoleRedactionInstalled = false;

export function redactText(value: string) {
  return value
    .replace(emailPattern, "[redacted-email]")
    .replace(bearerPattern, "Bearer [redacted-token]")
    .replace(jwtPattern, "[redacted-jwt]")
    .replace(expoPushTokenPattern, "ExponentPushToken[redacted]");
}

export function redactUnknown(value: unknown): unknown {
  if (typeof value === "string") {
    return redactText(value);
  }

  if (Array.isArray(value)) {
    return value.map(redactUnknown);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (value instanceof Error) {
    const redactedError = new Error(redactText(value.message));
    redactedError.name = value.name;
    redactedError.stack = value.stack ? redactText(value.stack) : value.stack;

    return redactedError;
  }

  const source = value as Record<string, unknown>;
  const redacted: Record<string, unknown> = {};

  Object.entries(source).forEach(([key, entryValue]) => {
    redacted[key] = sensitiveKeyPattern.test(key) ? "[redacted]" : redactUnknown(entryValue);
  });

  return redacted;
}

export function redactSentryEvent<T>(event: T): T {
  return redactUnknown(event) as T;
}

export function installConsoleRedaction() {
  if (consoleRedactionInstalled || typeof console === "undefined") {
    return;
  }

  consoleRedactionInstalled = true;
  const originalLog = console.log.bind(console);
  const originalInfo = console.info.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);

  console.log = (...args: unknown[]) => originalLog(...args.map(redactUnknown));
  console.info = (...args: unknown[]) => originalInfo(...args.map(redactUnknown));
  console.warn = (...args: unknown[]) => originalWarn(...args.map(redactUnknown));
  console.error = (...args: unknown[]) => originalError(...args.map(redactUnknown));
}
