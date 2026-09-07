export async function runtimeEnv(): Promise<
  Record<string, string | undefined>
> {
  try {
    const { env } = await import('cloudflare:workers');
    return { ...process.env, ...env } as Record<string, string | undefined>;
  } catch {
    return process.env;
  }
}
export async function readBody(request: Request) {
  const text = await request.text();
  if (text.length > 12000) throw Error('Request too large');
  return JSON.parse(text);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    throw Error('Invalid origin');
}
