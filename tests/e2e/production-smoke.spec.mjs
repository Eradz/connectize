import { expect, test } from "@playwright/test";

const webBaseUrl = process.env.WEB_BASE_URL || "https://connectize.co";
const apiBaseUrl =
  process.env.API_BASE_URL || process.env.BASE_URL || "https://about.connectize.co";
const email = process.env.CONNECTIZE_EMAIL;
const password = process.env.CONNECTIZE_PASSWORD;
const staticToken = process.env.CONNECTIZE_ACCESS_TOKEN;
const apiTargetMs = Number(process.env.WEB_API_TARGET_MS || "1000");
const sessionStorageKey = "connectize_auth_session";

const publicPaths = (process.env.WEB_PUBLIC_PATHS || "/,/login,/signup")
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

const authenticatedPaths = (
  process.env.WEB_AUTH_PATHS ||
  "/,/profile,/companies,/messages,/business-hub,/deal-rooms,/bidding,/logistics,/marketplace,/knowledge,/workforce/jobs,/events"
)
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

const apiEndpoints = [
  { name: "api-root", path: "/api/" },
  { name: "current-user", path: "/api/current-user/" },
  { name: "users-list", path: "/api/users/?page_size=10" },
  { name: "companies-list", path: "/api/companies/?page_size=12" },
  { name: "posts-list", path: "/api/posts/?page_size=10" },
  { name: "messages-list", path: "/api/messages/?page_size=10" },
  { name: "notifications-list", path: "/api/notifications/?page_size=10" },
  { name: "workforce-profiles", path: "/api/v1/workforce/profiles/?page_size=10" },
  { name: "workforce-events", path: "/api/v1/workforce/events/?page_size=10" },
  { name: "knowledge-forums", path: "/api/v1/knowledge/forums/?page_size=10" },
  { name: "knowledge-articles", path: "/api/v1/knowledge/articles/?page_size=10" },
  { name: "logistics-providers", path: "/api/v1/logistics/providers/" },
  { name: "logistics-requests", path: "/api/v1/logistics/requests/" },
  { name: "deal-rooms", path: "/api/v1/deals/deal-rooms/" },
  { name: "bidding-projects", path: "/api/v1/bidding/bid-projects/" },
  { name: "marketplace-listings", path: "/api/marketplace/listings/" },
  { name: "inventory-items", path: "/api/v1/inventory/items/" },
  { name: "subscriptions-current", path: "/api/v1/subscriptions/current/" },
  { name: "plans", path: "/api/v1/plans/", public: true },
  { name: "search", path: "/api/search/?q=connectize", public: true },
];

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

async function seedSession(page, auth) {
  await page.addInitScript(
    ({ key, session }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          data: session,
        }),
      );
    },
    { key: sessionStorageKey, session: auth.session },
  );
}

function watchPageFailures(page) {
  const failures = [];
  page.on("pageerror", (error) => {
    failures.push(error.message);
  });
  page.on("response", (response) => {
    const status = response.status();
    if (status >= 500) {
      failures.push(`${status} ${response.url()}`);
    }
  });
  return failures;
}

async function visitAndAssert(page, path) {
  const failures = watchPageFailures(page);
  const started = Date.now();
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  const duration = Date.now() - started;

  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  await expect(page.locator("body")).toBeVisible();
  expect.soft(response?.status() || 0, `${path} document status`).toBeLessThan(500);
  expect.soft(duration, `${path} document load`).toBeLessThan(10_000);
  expect.soft(failures, `${path} browser/API failures`).toEqual([]);
}

test.describe("public production pages", () => {
  for (const path of publicPaths) {
    test(`loads ${path}`, async ({ page }) => {
      await visitAndAssert(page, path);
    });
  }
});

test.describe("authenticated production smoke", () => {
  test.skip(
    !staticToken && (!email || !password),
    "Set CONNECTIZE_EMAIL/CONNECTIZE_PASSWORD or CONNECTIZE_ACCESS_TOKEN for authenticated smoke tests.",
  );

  let auth;

  test.beforeAll(async ({ request }) => {
    auth = await buildAuth(request);
  });

  for (const endpoint of apiEndpoints) {
    test(`api ${endpoint.name}`, async ({ request }) => {
      const headers = { Accept: "application/json" };
      if (!endpoint.public && auth?.token) {
        headers.Authorization = `Bearer ${auth.token}`;
      }

      const started = Date.now();
      const response = await request.get(`${apiBaseUrl}${endpoint.path}`, { headers });
      const duration = Date.now() - started;

      expect.soft(response.status(), `${endpoint.path} status`).toBeLessThan(500);
      if (response.status() === 200) {
        expect.soft(duration, `${endpoint.path} latency`).toBeLessThan(apiTargetMs);
      }
    });
  }

  for (const path of authenticatedPaths) {
    test(`page ${path}`, async ({ page }) => {
      await seedSession(page, auth);
      await visitAndAssert(page, path);
    });
  }
});
