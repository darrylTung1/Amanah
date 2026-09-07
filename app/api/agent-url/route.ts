import { people } from '@/engine/model';
import { runtimeEnv, sameOrigin } from '@/lib/server';
export async function GET(request: Request) {
  try {
    sameOrigin(request);
    const id = new URL(request.url).searchParams.get('person');
    if (!people.some((p) => p.id === id))
      return Response.json(
        { error: 'Unknown council member' },
        { status: 400 },
      );
    const env = await runtimeEnv();
    const agent = env['ELEVENLABS_AGENT_' + id!.toUpperCase()];
    if (!env.ELEVENLABS_API_KEY || !agent)
      return Response.json(
        {
          error:
            'Live voice is not configured yet. The written council is ready to use.',
        },
        { status: 503 },
      );
    const response = await fetch(
      'https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=' +
        encodeURIComponent(agent),
      {
        headers: { 'xi-api-key': env.ELEVENLABS_API_KEY },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) throw Error('Voice service unavailable');
    const data = (await response.json()) as { signed_url: string };
    return Response.json(
      { signedUrl: data.signed_url },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json(
      {
        error:
          'The voice service is unavailable. Please use the written council.',
      },
      { status: 502 },
    );
  }
}
