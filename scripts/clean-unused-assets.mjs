import fs from "fs";
import path from "path";

// 🔹 Paths
const srcDir = path.join(process.cwd(), "src");
const publicDir = path.join(process.cwd(), "public");

// 🔹 Supported file extensions
const fileExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp", // Images
  ".mp4",
  ".webm",
  ".mov",
  ".avi", // Videos
  ".woff",
  ".woff2",
  ".ttf",
  ".eot", // Fonts
  ".mp3",
  ".wav",
  ".ogg", // Audio
  ".json",
  ".pdf",
  ".txt", // Other assets
];

// 🔹 Store file references
const fileUsageMap = new Map();

/**
 * 🔹 Scan src directory for asset references
 */
function scanDirectory(directory) {
  console.log(`🔍 Scanning: ${directory}`);
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath); // Recursively scan subfolders
    } else if (/\.(js|jsx|ts|tsx|css|scss|json)$/i.test(file)) {
      console.log(`📄 Checking file: ${file}`);
      const content = fs.readFileSync(fullPath, "utf-8");

      fileExtensions.forEach((ext) => {
        const regex = new RegExp(`public/([^"')]+\\${ext})`, "g");
        let match;
        while ((match = regex.exec(content)) !== null) {
          const fileName = match[1];

          if (!fileUsageMap.has(fileName)) {
            fileUsageMap.set(fileName, new Set());
          }
          fileUsageMap.get(fileName).add(fullPath);
        }
      });
    }
  }
}

/**
 * 🔹 Find and delete unused files
 */
function deleteUnusedFiles() {
  if (!fs.existsSync(publicDir)) {
    console.log("❌ No 'public' folder found.");
    return;
  }

  console.log("\n📂 Scanning 'public' for unused files...\n");
  const allFiles = getAllFiles(publicDir);
  const usedFiles = new Set(fileUsageMap.keys());

  allFiles.forEach((filePath) => {
    const relativePath = path.relative(publicDir, filePath).replace(/\\/g, "/");

    if (usedFiles.has(relativePath)) {
      const references = Array.from(fileUsageMap.get(relativePath)).join(
        "\n   - "
      );
      console.log(`✅ Kept: ${relativePath} (Used in: \n   - ${references})`);
    } else {
      console.log(`🗑️ Unused: ${relativePath} (No references found in 'src')`);
      fs.unlinkSync(filePath);
    }
  });

  console.log("\n✅ Cleanup completed.");
}

/**
 * 🔹 Recursively get all files in the public directory
 */
function getAllFiles(dir) {
  let filesList = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      filesList = filesList.concat(getAllFiles(filePath));
    } else {
      filesList.push(filePath);
    }
  });

  return filesList;
}

/**
 * 🔹 Detect duplicate file references
 */
function logDuplicateFiles() {
  console.log("\n🔎 Checking for duplicate file references...\n");
  fileUsageMap.forEach((files, file) => {
    if (files.size > 1) {
      console.log(
        `⚠️ Duplicate: ${file} is used in multiple files:\n   - ${Array.from(
          files
        ).join("\n   - ")}`
      );
    }
  });
}

/**
 * 🔹 Run the public folder cleanup process
 */
(function () {
  console.log("\n🚀 Starting public folder cleanup...\n");

  if (!fs.existsSync(srcDir)) {
    console.log("❌ 'src' folder not found. Cannot scan for asset references.");
    return;
  }

  scanDirectory(srcDir);
  logDuplicateFiles();
  deleteUnusedFiles();
})();
