import assert from "node:assert/strict";
import test from "node:test";

test("renders Math Raccoon PWA metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<html\s+lang="vi">/i);
  assert.match(html, /<title>Math Raccoon · Toán nâng cao lớp 3<\/title>/i);
  assert.match(html, /<link(?=[^>]*\brel="manifest")(?=[^>]*\bhref="\/manifest\.webmanifest")[^>]*>/i);
  assert.match(html, /<link(?=[^>]*\brel="apple-touch-icon")(?=[^>]*\bhref="\/icons\/apple-touch-icon\.png")[^>]*>/i);
  assert.match(html, /Nội dung\s*<!-- -->2026\.09\.16\.1/i);
  assert.match(html, /href="\/assessment\/"/i);
  assert.match(html, /href="\/roadmap\/"/i);
  assert.match(html, /aria-label="Điều hướng chính"/i);
  assert.match(html, /180/);
});
