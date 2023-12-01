const { copyFileSync, existsSync, writeFileSync } = require("fs");
const { resolve } = require("path");

const path = resolve(__dirname, "..", "server.example.json");
const newPath = resolve(__dirname, "..", "server.json");

function mergeConfigs(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      mergeConfigs(target[key], source[key]);
    } else {
      if (!(key in target)) {
        target[key] = source[key];
      }
    }
  }
}

if (existsSync(newPath)) {
  const serverConfig = require("../server.json");
  const exampleConfig = require("../server.example.json");

  const newConfig = { ...serverConfig };
  mergeConfigs(newConfig, exampleConfig);

  try {
    writeFileSync(newPath, JSON.stringify(newConfig, null, 2));
    console.log("✅ Updated server.json");
  } catch (error) {
    console.error("Error writing to server.json:", error);
  }

  return;
}

copyFileSync(path, newPath);
console.log("✅ Created server.json");
