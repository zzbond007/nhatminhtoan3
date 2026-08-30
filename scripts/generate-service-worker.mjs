import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "out");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const release = JSON.parse(await readFile(path.join(projectRoot, "public", "content-release.json"), "utf8"));
const includedExtensions = new Set([".html", ".js", ".css", ".json", ".svg", ".png", ".webmanifest", ".woff", ".woff2"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.name !== "sw.js" && includedExtensions.has(path.extname(entry.name))) files.push(fullPath);
  }
  return files;
}

const files = await walk(outputRoot);
const urls = files.map((file) => {
  const relative = path.relative(outputRoot, file).split(path.sep).map(encodeURIComponent).join("/");
  return `${basePath}/${relative}`;
});
urls.push(`${basePath}/`);
const precache = [...new Set(urls)].sort();

const source = `const CACHE_NAME = ${JSON.stringify(`math-raccoon-${release.version}`)};
const BASE_PATH = ${JSON.stringify(basePath)};
const PRECACHE = ${JSON.stringify(precache, null, 2)};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("math-raccoon-") && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || url.pathname.endsWith("/content-release.json") || url.pathname.endsWith("/content-catalog.json") || url.pathname.includes("/content-packs/")) {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match(\`${basePath}/index.html\`)) || (await caches.match(\`${basePath}/\`))));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
    return response;
  })));
});
`;

await writeFile(path.join(outputRoot, "sw.js"), source);
console.log(`Generated offline worker with ${precache.length} cached files.`);
