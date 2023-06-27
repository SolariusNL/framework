const fs = require("fs");
const path = require("path");

const rootDir = "/Users/seeun/Repositories/framework";
const searchDir = path.join(rootDir, "src");

function convertImportsToAlias(directoryPath) {
  fs.readdirSync(directoryPath, { withFileTypes: true }).forEach((item) => {
    const itemPath = path.join(directoryPath, item.name);
    if (item.isDirectory()) {
      convertImportsToAlias(itemPath);
    } else if (
      item.isFile() &&
      (item.name.endsWith(".js") ||
        item.name.endsWith(".ts") ||
        item.name.endsWith(".tsx") ||
        item.name.endsWith(".mdx"))
    ) {
      convertFileImports(itemPath);
    }
  });
}

function convertFileImports(filePath, folderName) {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const importRegex = new RegExp(
    "(?<!\\.{2}\\/\\.{2})((?:\\.{2}\\/)+)([^\\/;\n]+)(?![\\/.])"
  );
  const convertedContent = fileContent.replace(importRegex, "@/$2");

  fs.writeFileSync(filePath, convertedContent, "utf-8");
  console.log(`Converted imports in file: ${filePath}`);
}

convertImportsToAlias(searchDir);
