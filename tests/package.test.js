"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const pkg = require("../package.json");
const index = require("../index.js");

assert.equal(pkg.name, "@obinexusltd/sqlite3-polycall");
assert.equal(pkg.version, "1.0.0");
assert.equal(pkg.license, "MIT");
assert.equal(pkg.author, "Nnamdi Michael Okpala <okpalan@protonmail.com>");
assert.equal(pkg.publishConfig.access, "public");
assert.equal(pkg.bin["sqlite3-polycall"], "bin/sqlite3-polycall.js");
assert.equal(pkg.bin["sqlite-polycall"], "bin/sqlite3-polycall.js");

for (const directory of ["bin", "dist", "examples", "src", "tests"]) {
  assert.ok(fs.existsSync(path.join(__dirname, "..", directory)), `${directory} exists`);
}

assert.equal(index.packageName, pkg.name);
assert.ok(index.listFiles("src").includes("src/sqlite3_polycall.js"));
assert.ok(index.listFiles("examples").includes("examples/schema.sql"));

const binPath = path.join(__dirname, "..", pkg.bin["sqlite3-polycall"]);
assert.match(fs.readFileSync(binPath, "utf8"), /^#!\/usr\/bin\/env node/);

console.log("sqlite3-polycall npm package metadata test: PASS");
