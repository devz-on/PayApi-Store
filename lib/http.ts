export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function jsonResponse(data: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
      ...(init.headers || {}),
    },
  });
}

export function badRequest(message: string, extra: Record<string, any> = {}) {
  return jsonResponse({ success: false, error: message, ...extra }, { status: 400 });
}

export function stripPngExt(idOrName: string) {
  return idOrName.endsWith(".png") ? idOrName.slice(0, -4) : idOrName;
}

export async function fetchWithTimeout(resource: string, options: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 30000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(resource, { ...rest, signal: controller.signal, cache: "no-store" });
    return res;
  } finally {
    clearTimeout(id);
  }
}
