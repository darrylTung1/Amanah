'use client';
import { useEffect } from 'react';
import { encode, validate } from '@/engine/model';
type Context = {
  registerTool: (
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: object;
      annotations: object;
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => unknown;
};
export default function AgentActions() {
  useEffect(() => {
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'start_sociopoly_council',
            title: 'Start a council',
            description:
              'Start a new council with four declared integer priorities totalling ten; navigates to the council.',
            inputSchema: {
              type: 'object',
              properties: {
                weights: {
                  type: 'array',
                  items: { type: 'integer', minimum: 0, maximum: 10 },
                  minItems: 4,
                  maxItems: 4,
                },
              },
              required: ['weights'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(input) {
              const record = {
                v: 2,
                weights: (input as { weights: unknown }).weights,
                rounds: [],
              };
              validate(record);
              location.assign('/council?d=' + encode(record));
              return { status: 'navigating', weights: record.weights };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Unsupported registry: normal controls remain usable. */
    }
    return () => lifecycle.abort();
  }, []);
  return null;
}
