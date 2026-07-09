"use strict";

const fs = require("node:fs");
const path = require("node:path");
const sqlite3Polycall = require("./src/sqlite3_polycall");

const root = __dirname;
const packageJson = require("./package.json");

const relativeDirectories = Object.freeze({
  bin: "bin",
  dist: "dist",
  examples: "examples",
  src: "src",
  tests: "tests"
});

function resolvePackagePath(...segments) {
  const resolved = path.resolve(root, ...segments);
  const rootWithSeparator = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (resolved !== root && !resolved.startsWith(rootWithSeparator)) {
    throw new Error(`Path escapes package root: ${segments.join("/")}`);
  }
  return resolved;
}

function listFiles(directoryName) {
  if (!Object.prototype.hasOwnProperty.call(relativeDirectories, directoryName)) {
    throw new Error(`Unknown package directory: ${directoryName}`);
  }

  const start = resolvePackagePath(relativeDirectories[directoryName]);
  if (!fs.existsSync(start)) {
    return [];
  }

  const output = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else {
        output.push(path.relative(root, fullPath).replace(/\\/g, "/"));
      }
    }
  };

  visit(start);
  return output.sort();
}

module.exports = Object.freeze({
  ...sqlite3Polycall,
  packageName: packageJson.name,
  version: packageJson.version,
  root,
  directories: Object.freeze(
    Object.fromEntries(
      Object.entries(relativeDirectories).map(([name, relativePath]) => [
        name,
        resolvePackagePath(relativePath)
      ])
    )
  ),
  resolve: resolvePackagePath,
  listFiles
});
