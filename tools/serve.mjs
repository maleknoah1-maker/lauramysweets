// Serves _site like GitHub Pages does (folder/index.html, 301 to trailing slash, 404.html).
// Usage: node tools/serve.mjs [port] [pathPrefix]   e.g. 8091 /lauramysweets/ for a preview build
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("_site");
const port = Number(process.argv[2]) || 8090;
const prefix = (process.argv[3] || "/").replace(/\/$/, "");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json" };

http.createServer((req, res) => {
  let url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (prefix) {
    if (!url.startsWith(prefix + "/") && url !== prefix) { res.writeHead(404).end(); return; }
    url = url.slice(prefix.length) || "/";
  }
  let file = path.join(root, url);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.endsWith("/")) { res.writeHead(301, { Location: prefix + url + "/" }).end(); return; }
    file = path.join(file, "index.html");
  }
  if (!fs.existsSync(file)) {
    res.writeHead(404, { "Content-Type": types[".html"] });
    fs.createReadStream(path.join(root, "404.html")).pipe(res);
    return;
  }
  res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "max-age=600" });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving _site at http://localhost:${port}`));
