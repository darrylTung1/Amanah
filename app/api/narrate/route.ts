import { run, validate } from '@/engine/model';
import { recordedTestimony } from '@/content/recordings';
import { readBody, sameOrigin } from '@/lib/server';

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const b = await readBody(request);
    validate(b.record);
    if (
      ![2036, 2050, 2126].includes(b.year) ||
      b.record.rounds.length !== [2036, 2050, 2126].indexOf(b.year) + 1
    )
      throw Error('Invalid horizon');
    const state = run(b.record, b.year).at(-1)!;
    return Response.json(recordedTestimony(b.record, state));
  } catch {
    return Response.json(
      { error: 'Invalid decision record or horizon' },
      { status: 400 },
    );
  }
}
