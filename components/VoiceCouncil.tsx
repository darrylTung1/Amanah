'use client';
import { useEffect, useRef, useState } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { Button } from '@/components/ui/button';
import {
  allowedRiders,
  type LeverId,
  type DecisionRecord,
} from '@/engine/model';
import { type Position } from '@/engine/negotiation';
type Props = {
  person: string;
  lever: LeverId;
  record: DecisionRecord;
  onPosition: (p: Position) => void;
  onBusy: (v: boolean) => void;
};
function Voice(props: Props) {
  const [error, setError] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const [starting, setStarting] = useState(false);
  const alive = useRef(true);
  const request = useRef<AbortController | null>(null);
  const deadline = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearDeadline = () => {
    if (deadline.current) clearTimeout(deadline.current);
  };
  const conversation = useConversation({
    onMessage: (m) =>
      setLines((v) => [
        ...v.slice(-7),
        `${m.source === 'user' ? 'You' : 'Council'}: ${m.message}`,
      ]),
    onError: () => {
      clearDeadline();
      setError(
        'Voice connection failed. You can continue with the written council.',
      );
      setStarting(false);
      props.onBusy(false);
    },
    onConnect: () => {
      clearDeadline();
      setStarting(false);
    },
    onDisconnect: () => {
      clearDeadline();
      setStarting(false);
      props.onBusy(false);
    },
    clientTools: {
      resolve_position: async (input: unknown) => {
        const r = await fetch('/api/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lever: props.lever,
            person: props.person,
            position: input,
          }),
        });
        if (!r.ok) throw Error('Agreement validation failed');
        const p = (await r.json()) as Position;
        if (alive.current) props.onPosition(p);
        return JSON.stringify(p);
      },
    },
  });
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
      clearDeadline();
      conversation.endSession();
    };
  }, []);
  async function start() {
    if (starting || conversation.status !== 'disconnected') return;
    setStarting(true);
    props.onBusy(true);
    setError('');
    const controller = new AbortController();
    request.current = controller;
    try {
      const r = await fetch(
        '/api/agent-url?person=' + encodeURIComponent(props.person),
        {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(12000),
          ]),
        },
      );
      const data = (await r.json()) as { error?: string; signedUrl: string };
      if (!r.ok) throw Error(data.error || 'Voice unavailable');
      if (!alive.current || controller.signal.aborted) return;
      deadline.current = setTimeout(() => {
        conversation.endSession();
        setStarting(false);
        props.onBusy(false);
        setError(
          'Voice connection timed out. Try again or use the written council.',
        );
      }, 20000);
      conversation.startSession({
        signedUrl: data.signedUrl,
        connectionType: 'websocket',
        dynamicVariables: {
          lever: props.lever,
          allowed_riders: allowedRiders(props.lever).join(', '),
          year: String([2026, 2036, 2050][props.record.rounds.length]),
        },
      });
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : 'Voice unavailable');
      setStarting(false);
      props.onBusy(false);
    }
  }
  const active = starting || conversation.status !== 'disconnected';
  return (
    <div className="negotiation">
      <Button
        className={active ? 'primary' : 'secondary'}
        onClick={() => {
          if (active) {
            request.current?.abort();
            clearDeadline();
            conversation.endSession();
            setStarting(false);
            props.onBusy(false);
          } else void start();
        }}
      >
        {starting
          ? 'Cancel connection'
          : active
            ? 'End voice conversation'
            : '◉ Talk by voice'}
      </Button>
      <small>
        {active
          ? conversation.isSpeaking
            ? 'Council is speaking…'
            : 'Listening to you…'
          : 'Your microphone connects to ElevenLabs when you start.'}
      </small>
      {error && (
        <p className="warning" role="status">
          {error}
        </p>
      )}
      {lines.length > 0 && (
        <div className="transcript" role="log">
          {lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      )}
    </div>
  );
}
export default function VoiceCouncil(props: Props) {
  return (
    <ConversationProvider>
      <Voice {...props} />
    </ConversationProvider>
  );
}
