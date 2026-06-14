const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

export function createSecurityFetch(allowedHosts: readonly string[]): typeof fetch {
  const hostAllowlist = new Set(allowedHosts.map((host) => host.toLowerCase()));

  return (async (...args: Parameters<typeof fetch>) => {
    const requestUrl = resolveFetchUrl(args[0]);
    assertAllowedOutboundUrl(requestUrl, hostAllowlist);

    return fetch(...args);
  }) as typeof fetch;
}

export function assertNoPublicServiceRoleKey() {
  const leakedKey =
    process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY ??
    process.env.EXPO_PUBLIC_SERVICE_ROLE_KEY;

  if (leakedKey) {
    throw new Error("Refusing to start: service-role keys must never be exposed with an EXPO_PUBLIC_ prefix.");
  }
}

export function resolveTrustedHost(urlValue: string) {
  const parsed = new URL(urlValue);

  if (parsed.protocol !== "https:" && !(__DEV__ && localHosts.has(parsed.hostname))) {
    throw new Error("Supabase URL must use HTTPS outside local development.");
  }

  return parsed.host.toLowerCase();
}

function resolveFetchUrl(input: Parameters<typeof fetch>[0]) {
  if (typeof input === "string") {
    return new URL(input);
  }

  if (input instanceof URL) {
    return input;
  }

  return new URL(input.url);
}

function assertAllowedOutboundUrl(url: URL, hostAllowlist: Set<string>) {
  if (url.protocol !== "https:") {
    if (__DEV__ && localHosts.has(url.hostname)) {
      return;
    }

    throw new Error("Blocked non-HTTPS network request.");
  }

  if (!hostAllowlist.has(url.host.toLowerCase())) {
    throw new Error("Blocked request to an untrusted host.");
  }
}
