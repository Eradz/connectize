import fs from "fs";
import path from "path";

export function getRoutesFromApp() {
  const appPath = path.resolve("src", "App.jsx");
  let content = fs.readFileSync(appPath, "utf-8");

  // Extract paths from <Route path="..." />
  const routeRegex = /<Route\s+path=["'](.*?)["']/g;
  let match;
  const routes = [];

  while ((match = routeRegex.exec(content)) !== null) {
    if (!match[1].includes("*")) {
      routes.push(match[1] === "" ? "/" : match[1]); // Handle home route
    }
  }

  return routes;
}
