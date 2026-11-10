import type { APIRoute } from 'astro';

export const prerender = false;

function env(...names: string[]) {
  for (const name of names) {
    const value = import.meta.env[name] || process.env[name];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function getClientId() {
  return env('NEXT_PUBLIC_TINA_CLIENT_ID');
}

function getBranch() {
  return env('NEXT_PUBLIC_TINA_BRANCH', 'TINA_BRANCH') || 'main';
}

function configuredOrigins() {
  return [
    ...env('TINA_ALLOWED_ORIGINS', 'ALLOWED_ORIGINS').split(','),
    env('SITE_URL'),
  ]
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function requestOrigin(request: Request) {
  return new URL(request.url).origin;
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  return normalized === requestOrigin(request) || configuredOrigins().includes(normalized);
}

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin');
  return {
    ...(origin && isAllowedOrigin(request) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-KEY',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonResponse(request: Request, body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export const OPTIONS: APIRoute = ({ request }) => {
  if (!isAllowedOrigin(request)) return jsonResponse(request, { error: 'Origin not allowed' }, 403);
  return new Response(null, { status: 204, headers: corsHeaders(request) });
};

export const GET: APIRoute = ({ request }) =>
  jsonResponse(request, { error: 'Method not allowed' }, 405);

export const POST: APIRoute = async ({ request }) => {
  if (!isAllowedOrigin(request)) return jsonResponse(request, { error: 'Origin not allowed' }, 403);

  const clientId = getClientId();
  if (!clientId) return jsonResponse(request, { error: 'Missing Tina client ID' }, 500);

  const upstream = `https://content.tinajs.io/2.4/content/${encodeURIComponent(clientId)}/github/${encodeURIComponent(getBranch())}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Encoding': 'identity',
  };

  const authorization = request.headers.get('authorization');
  if (authorization) headers.Authorization = authorization;

  // Never elevate an anonymous browser request with the server-side Tina token.
  // SSR callers and authenticated Tina clients must explicitly forward their own
  // X-API-KEY or Authorization header; the proxy only relays credentials.
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) headers['X-API-KEY'] = apiKey;

  try {
    const upstreamResponse = await fetch(upstream, {
      method: 'POST',
      headers,
      body: await request.text(),
    });
    return new Response(await upstreamResponse.text(), {
      status: upstreamResponse.status,
      headers: {
        ...corsHeaders(request),
        'Content-Type': upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'X-Tina-Proxy': 'transparent',
      },
    });
  } catch (error) {
    return jsonResponse(
      request,
      { error: 'Tina proxy failed', message: error instanceof Error ? error.message : String(error) },
      502,
    );
  }
};
