import { expect, test } from "@playwright/test";

const webBaseUrl = process.env.WEB_BASE_URL || "https://connectize.co";
const apiBaseUrl =
  process.env.API_BASE_URL || process.env.BASE_URL || "https://about.connectize.co";
const email = process.env.CONNECTIZE_EMAIL;
const password = process.env.CONNECTIZE_PASSWORD;
const staticToken = process.env.CONNECTIZE_ACCESS_TOKEN;
const sessionStorageKey = "connectize_auth_session";

const productionHosts = new Set(["about.connectize.co", "connectize.co", "www.connectize.co"]);
const runWriteFlows = process.env.RUN_WEB_WRITE_FLOWS === "1";
const allowProductionWrites = process.env.ALLOW_PRODUCTION_WRITES === "1";

function tokenFrom(payload) {
  return (
    payload?.tokens?.access ||
    payload?.access ||
    payload?.access_token ||
    payload?.token ||
    payload?.key ||
    payload?.results?.tokens?.access ||
    payload?.results?.access ||
    payload?.data?.tokens?.access ||
    payload?.data?.access ||
    ""
  );
}

function isProductionUrl(value) {
  try {
    return productionHosts.has(new URL(value).hostname);
  } catch (_error) {
    return false;
  }
}

async function buildAuth(request) {
  if (staticToken) {
    return {
      token: staticToken,
      session: { tokens: { access: staticToken } },
    };
  }

  const response = await request.post(`${apiBaseUrl}/api/auth/login/`, {
    data: { email, username: email, password },
    headers: { Accept: "application/json" },
  });
  expect([200, 201], "login status").toContain(response.status());

  const body = await response.json();
  const session = body?.results || body?.data || body;
  const token = tokenFrom(session) || tokenFrom(body);
  expect(token, "login access token").toBeTruthy();

  return { token, session };
}

async function seedSession(page, session) {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          data: value,
        }),
      );
    },
    { key: sessionStorageKey, value: session },
  );
}

async function cleanupPostByBody(request, token, body) {
  const list = await request.get(`${apiBaseUrl}/api/posts/?page_size=50`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (list.status() !== 200) return;
  const payload = await list.json();
  const post = (payload?.results || []).find((item) => item.body === body);
  if (!post?.id) return;
  await request.delete(`${apiBaseUrl}/api/posts/${post.id}/`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
}

test.describe("gated web write workflows", () => {
  test.skip(!runWriteFlows, "Set RUN_WEB_WRITE_FLOWS=1 to run UI write workflows.");
  test.skip(
    !staticToken && (!email || !password),
    "Set CONNECTIZE_EMAIL/CONNECTIZE_PASSWORD or CONNECTIZE_ACCESS_TOKEN.",
  );

  test.beforeAll(() => {
    if (
      !allowProductionWrites &&
      (isProductionUrl(webBaseUrl) || isProductionUrl(apiBaseUrl))
    ) {
      throw new Error(
        "Refusing to run web write flows against production. Set ALLOW_PRODUCTION_WRITES=1 only with sandbox accounts.",
      );
    }
  });

  test("creates a post through the web composer and cleans it up", async ({ page, request }) => {
    const auth = await buildAuth(request);
    const body = `[connectize-e2e-delete-me:${Date.now()}] Web composer smoke post`;

    try {
      await seedSession(page, auth.session);
      await page.goto("/", { waitUntil: "networkidle" });

      const composer = page
        .getByPlaceholder(/what('|’)s happening|what is happening/i)
        .or(page.locator('[contenteditable="true"]').first())
        .first();
      await expect(composer, "post composer").toBeVisible({ timeout: 20_000 });
      await composer.fill(body);

      await page.getByRole("button", { name: /create post|post/i }).click();
      await expect(page.getByText(body, { exact: true })).toBeVisible({ timeout: 30_000 });
    } finally {
      await cleanupPostByBody(request, auth.token, body);
    }
  });
});
