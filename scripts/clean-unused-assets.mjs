import fs from "fs";
import path from "path";
import readline from "readline";

// 🔹 Setup user prompt for deletions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const srcDir = path.join(process.cwd(), "src");
const publicDir = path.join(process.cwd(), "public");

// 🔹 Supported file types
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

// 🔹 Map for storing used files
const fileUsageMap = new Map();

/**
 * 🔍 Scan src directory for asset references
 */
function scanDirectory(directory) {
  console.log(`🔍 Scanning: ${directory}`);
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath); // Recursive scan
    } else if (/\.(js|jsx|ts|tsx|css|scss|json)$/i.test(file)) {
      console.log(`📄 Checking file: ${file}`);
      const content = fs.readFileSync(fullPath, "utf-8");

      fileExtensions.forEach((ext) => {
        const regex = new RegExp(
          `(["'(\s])(?:public/|/)?([^"')]+\\${ext})`,
          "g"
        );
        let match;
        while ((match = regex.exec(content)) !== null) {
          const fileName = match[2];

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
 * 🗑️ Find and delete unused files (with user confirmation)
 */
async function deleteUnusedFiles() {
  if (!fs.existsSync(publicDir)) {
    console.log("❌ No 'public' folder found.");
    return;
  }

  console.log("\n📂 Scanning 'public' for unused files...\n");
  const allFiles = getAllFiles(publicDir);
  const usedFiles = new Set(fileUsageMap.keys());

  for (const filePath of allFiles) {
    const relativePath = path.relative(publicDir, filePath).replace(/\\/g, "/");

    if (usedFiles.has(relativePath)) {
      console.log(`✅ Kept: ${relativePath}`);
    } else {
      console.log(`🗑️ Unused: ${relativePath} (No references found in 'src')`);

      // Ask user for confirmation
      const confirm = await confirmDeletion(filePath);
      if (confirm) {
        fs.unlinkSync(filePath);
        console.log(`🚮 Deleted: ${relativePath}`);
      } else {
        console.log(`🚫 Skipped: ${relativePath}`);
      }
    }
  }

  rl.close();
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
 * 🔹 Confirm deletion before removing files
 */
function confirmDeletion(filePath) {
  return new Promise((resolve) => {
    rl.question(`❗ Delete unused file: ${filePath}? (y/n) `, (answer) => {
      resolve(answer.toLowerCase() === "y");
    });
  });
}

/**
 * 🔹 Run the public folder cleanup process
 */
(async function () {
  console.log("\n🚀 Starting public folder cleanup...\n");

  if (!fs.existsSync(srcDir)) {
    console.log("❌ 'src' folder not found. Cannot scan for asset references.");
    return;
  }

  scanDirectory(srcDir);
  logDuplicateFiles();
  await deleteUnusedFiles();
})();
