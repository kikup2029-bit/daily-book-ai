import fs from "node:fs";
import vm from "node:vm";

const code = fs.readFileSync("public/sw.js", "utf8");

let pass = 0,
  fail = 0;
const ok = (cond, label) => {
  if (cond) pass++;
  else {
    fail++;
    console.log("FAIL: " + label);
  }
};

// --- a small fake service worker environment -------------------------------
const listeners = {};
const stores = new Map(); // cacheName -> Map(url -> "cached")
const fetchLog = [];
let networkUp = true;

const makeCache = (name) => {
  if (!stores.has(name)) stores.set(name, new Map());
  const store = stores.get(name);
  return {
    add: async () => {},
    match: async (req) =>
      store.has(urlOf(req)) ? { ok: true, from: "cache", url: urlOf(req) } : undefined,
    put: async (req, res) => {
      store.set(urlOf(req), res);
    },
  };
};
const urlOf = (req) => (typeof req === "string" ? new URL(req, "https://app.test").href : req.url);

const self = {
  location: { origin: "https://app.test" },
  addEventListener: (type, fn) => {
    (listeners[type] ||= []).push(fn);
  },
  skipWaiting: async () => {},
  clients: { claim: async () => {}, matchAll: async () => [], openWindow: async () => {} },
};

const sandbox = {
  self,
  caches: {
    open: async (name) => makeCache(name),
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
  },
  fetch: async (req) => {
    fetchLog.push({ url: urlOf(req), method: req.method ?? "GET" });
    if (!networkUp) throw new Error("offline");
    return { ok: true, from: "network", clone: () => ({ from: "network" }) };
  },
  Request: class {
    constructor(url, init) {
      this.url = urlOf(url);
      Object.assign(this, init);
    }
  },
  Response: class {
    constructor(body, init) {
      this.body = body;
      Object.assign(this, init);
    }
  },
  URL,
  console,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const request = (url, { method = "GET", mode = "no-cors" } = {}) => ({
  url: new URL(url, "https://app.test").href,
  method,
  mode,
});

// Drive a fetch event and report what the worker decided to do.
async function handle(req) {
  let responded = null;
  const event = {
    request: req,
    respondWith: (p) => {
      responded = p;
    },
    waitUntil: () => {},
  };
  for (const fn of listeners.fetch ?? []) fn(event);
  if (responded === null) return { handled: false };
  return { handled: true, response: await responded.catch((e) => ({ error: e.message })) };
}

// --- writes must never be intercepted -------------------------------------
{
  const r = await handle(request("/_serverFn/createEntry", { method: "POST" }));
  ok(r.handled === false, "POST is left alone entirely — never cached, never served from cache");
}
for (const method of ["PUT", "PATCH", "DELETE"]) {
  const r = await handle(request("/_serverFn/x", { method }));
  ok(r.handled === false, `${method} is left alone`);
}

// --- auth is never cached -------------------------------------------------
{
  const r = await handle(request("/auth", { mode: "navigate" }));
  ok(r.handled === false, "sign-in page is never cached or served from cache");
  const shell = stores.get("simplebooks-shell-v2");
  ok(
    !shell || ![...shell.keys()].some((k) => k.includes("/auth")),
    "nothing auth-shaped in the cache",
  );
}

// --- cross-origin is left alone ------------------------------------------
{
  const r = await handle(request("https://xyz.supabase.co/rest/v1/entries"));
  ok(r.handled === false, "Supabase requests go straight to the network");
}

// --- assets: cache first, and available offline --------------------------
{
  networkUp = true;
  await handle(request("/_build/app.js"));
  const shell = stores.get("simplebooks-shell-v2");
  ok(shell.has("https://app.test/_build/app.js"), "asset stored on first fetch");

  networkUp = false;
  const r = await handle(request("/_build/app.js"));
  ok(r.response.from === "cache", "asset served from cache when offline");
}

// --- data reads: network first, cache as the offline fallback -------------
{
  networkUp = true;
  const fresh = await handle(request("/_serverFn/getEntries"));
  ok(fresh.response.from === "network", "fresh figures preferred while online");

  networkUp = false;
  const stale = await handle(request("/_serverFn/getEntries"));
  ok(stale.response.from === "cache", "last known figures readable offline");

  const missing = await handle(request("/_serverFn/getSomethingNeverSeen"));
  ok(
    missing.response.error === "offline",
    "never-fetched data fails honestly rather than faking a result",
  );
}

// --- navigation falls back to the offline page ---------------------------
{
  networkUp = true;
  await handle(request("/dashboard", { mode: "navigate" }));
  networkUp = false;
  const r = await handle(request("/dashboard", { mode: "navigate" }));
  ok(r.response.from === "cache", "a page you've visited opens offline");

  // A page never visited, with the offline page precached.
  stores
    .get("simplebooks-shell-v2")
    .set("https://app.test/offline.html", { from: "cache", url: "offline" });
  const r2 = await handle(request("/never-seen-page", { mode: "navigate" }));
  ok(
    r2.response.url === "offline" || r2.response.from === "cache",
    "unseen page falls back to the offline page",
  );
}

// --- sign-out wipes the data cache but not the shell ---------------------
{
  ok(stores.has("simplebooks-data-v2"), "data cache exists before sign-out");
  const event = { data: "clear-data-cache", waitUntil: (p) => p };
  for (const fn of listeners.message ?? []) fn(event);
  await new Promise((r) => setTimeout(r, 10));
  ok(!stores.has("simplebooks-data-v2"), "figures wiped on sign-out");
  ok(stores.has("simplebooks-shell-v2"), "app code kept, so it still opens offline");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
