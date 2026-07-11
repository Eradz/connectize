import assert from "node:assert/strict";
import test from "node:test";

import renderMeta from "../api/render-meta.js";

function responseRecorder() {
  return {
    headers: {},
    statusCode: null,
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
  };
}

test("renders crawlable job HTML and JobPosting schema", async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    assert.match(String(url), /workforce\/jobs\/job-1/);
    return new Response(JSON.stringify({
      id: "job-1",
      title: "Senior Petroleum Engineer",
      description: "Lead safe offshore drilling programmes.",
      status: "active",
      company_name: "Connectize Energy",
      location: "Lagos",
      created_at: "2026-01-01T00:00:00Z",
      application_deadline: "2027-01-01T00:00:00Z",
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const res = responseRecorder();
    await renderMeta({ query: { path: "/workforce/jobs/job-1" } }, res);
    assert.equal(res.statusCode, 200);
    assert.match(res.body, /Senior Petroleum Engineer/);
    assert.match(res.body, /data-seo-content="true"/);
    assert.match(res.body, /"@type":"JobPosting"/);
    assert.match(res.body, /canonical.*workforce\/jobs\/job-1/);
  } finally {
    global.fetch = originalFetch;
  }
});

test("returns noindex 404 for professional profiles without consent", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({
    id: "42",
    professional_title: "Engineer",
    allow_search_indexing: false,
  }), { status: 200, headers: { "Content-Type": "application/json" } });

  try {
    const res = responseRecorder();
    await renderMeta({ query: { path: "/professionals/42" } }, res);
    assert.equal(res.statusCode, 404);
    assert.match(res.body, /noindex, nofollow/);
  } finally {
    global.fetch = originalFetch;
  }
});

test("returns a real 404 when the public API record is missing", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response("{}", { status: 404 });

  try {
    const res = responseRecorder();
    await renderMeta({ query: { path: "/marketplace/listing/missing" } }, res);
    assert.equal(res.statusCode, 404);
    assert.match(res.body, /Page Not Found/);
  } finally {
    global.fetch = originalFetch;
  }
});
