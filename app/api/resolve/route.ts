import { levers, people, type LeverId } from '@/engine/model';
import { resolvePosition } from '@/engine/negotiation';
import { readBody, sameOrigin } from '@/lib/server';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const b = await readBody(request);
    if (
      !Object.hasOwn(levers, b.lever) ||
      !people.some((p) => p.id === b.person)
    )
      throw Error('Invalid council member or policy');
    if (b.position?.rider === '') b.position.rider = null;
    return Response.json(
      resolvePosition(b.lever as LeverId, b.person, b.position),
    );
  } catch {
    return Response.json(
      { error: 'Invalid negotiation request' },
      { status: 400 },
    );
  }
}
