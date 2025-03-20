import { writeFile } from "fs/promises";
import { getRoutesFromApp } from "./generate-app-routes.mjs";

(async function structureAppRoutes() {
  const routes = getRoutesFromApp();

  const uniqueRoutes = [...new Set(routes)];

  const webRoutes = {};
  uniqueRoutes.forEach((route) => {
    // Convert route to a key (camelCase)
    const key =
      route
        .replace(/^\/|\/$/g, "") // Remove leading/trailing slashes
        .replace(/[:.-]/g, "") // Remove special characters
        .replace(/\/(.)/g, (_, char) => char.toUpperCase()) || "home";

    webRoutes[key] = route;
  });

  const filePath = "./generated/appRoutes.json";
  const fileContent = JSON.stringify({ webRoutes, uniqueRoutes }, null, 2);

  try {
    await writeFile(filePath, fileContent);
    console.log(`✅ Routes saved to ${filePath}`);
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
  }

  return { webRoutes, uniqueRoutes, routes };
})();

// Run the function if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  structureAppRoutes();
}
