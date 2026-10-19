// Screenshots through headless Edge's DevTools protocol, so phone widths are exact.
// Usage: node tools/screenshot.mjs <url path> <name> [width] [full|viewport] [height]
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [urlPath = "/", name = "page", width = "1280", mode = "full", height] = process.argv.slice(2);
const W = Number(width);
const H = Number(height) || (W < 768 ? 844 : 860);
const base = process.env.BASE || "http://localhost:8081";
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const port = 9333;
const outDir = path.resolve("screenshots");
fs.mkdirSync(outDir, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "lms-edge-"));

const proc = spawn(edge, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page"); } catch {}
}
if (!target) throw new Error("Edge did not start");

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } else events.push(msg);
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const n = ++id;
  pending.set(n, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: n, method, params }));
});

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: W < 768 });
await send("Page.navigate", { url: `${base}${urlPath}` });
for (let i = 0; i < 100 && !events.some((e) => e.method === "Page.loadEventFired"); i++) await sleep(100);

// Show everything the fade-ins and lazy loading would reveal while scrolling.
await send("Runtime.evaluate", {
  awaitPromise: true,
  expression: `(async () => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    document.querySelectorAll('img[loading=lazy]').forEach(img => img.loading = 'eager');
    await Promise.all([...document.images].map(img => img.complete ? 0 : new Promise(r => { img.onload = img.onerror = r; })));
    await document.fonts.ready;
  })()`,
});
await sleep(900);

let clip;
if (mode === "full") {
  const { cssContentSize } = await send("Page.getLayoutMetrics");
  clip = { x: 0, y: 0, width: W, height: Math.ceil(cssContentSize.height), scale: 1 };
}
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: mode === "full", ...(clip ? { clip } : {}) });
const out = path.join(outDir, `${name}.png`);
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
ws.close();
proc.kill();
await sleep(300);
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(out);
