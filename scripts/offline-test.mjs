import vm from 'node:vm';
import assert from 'node:assert/strict';
const origin = process.argv[2] || 'http://127.0.0.1:3000';
const listeners = {};
const storage = new Map();
let disconnected = false;
const normalise = (x) =>
  new URL(typeof x === 'string' ? x : x.url, origin).href;
const mockCache = {
  put: async (k, v) => storage.set(normalise(k), v.clone()),
  match: async (k) => storage.get(normalise(k))?.clone(),
};
const context = {
  URL,
  Response,
  console,
  fetch: async (input) => {
    if (disconnected) throw Error('Offline');
    return fetch(normalise(input));
  },
  caches: {
    open: async () => mockCache,
    keys: async () => [],
    delete: async () => true,
  },
  self: {
    location: { origin },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
    addEventListener: (name, fn) => {
      listeners[name] = fn;
    },
  },
};
vm.runInNewContext(await (await fetch(origin + '/sw.js')).text(), context);
let work;
listeners.install({ waitUntil: (p) => (work = p) });
await work;
assert.ok(storage.size > 20);
disconnected = true;
for (const path of ['/', '/council?d=abc&demo=1', '/receipt?d=abc']) {
  let result;
  listeners.fetch({
    request: { url: origin + path, method: 'GET', mode: 'navigate' },
    respondWith: (p) => (result = p),
  });
  const r = await result;
  assert.equal(r.status, 200);
  assert.match(await r.text(), /Amanah/);
}
for (const [url, response] of storage) {
  if (url.endsWith('.wav')) {
    const bytes = new Uint8Array(await response.clone().arrayBuffer());
    assert.ok(bytes.length > 10000);
    assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), 'RIFF');
  }
}
let intercepted = false;
listeners.fetch({
  request: { url: origin + '/api/agent-url', method: 'GET' },
  respondWith: () => {
    intercepted = true;
  },
});
assert.equal(intercepted, false);
console.log(
  `Service-worker contract passed: ${storage.size} resources cached, three route shells replay offline, WAVs valid, API URLs excluded. This is a worker contract test, not a browser-device test.`,
);
