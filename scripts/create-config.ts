import { copyFileSync } from "fs";
import { join } from "path";

const path = join(__dirname, "..", "framework.example.yml");
const newPath = join(__dirname, "..", "framework.yml");

copyFileSync(path, newPath);

console.log("✅ Created framework.yml");
