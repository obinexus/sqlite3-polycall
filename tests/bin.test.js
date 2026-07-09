"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const pkg = require("../package.json");
const root = path.resolve(__dirname, "..");
const cli = path.join(root, pkg.bin["sqlite3-polycall"]);

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: "utf8"
  });
}

const help = run(["--help"]);
assert.equal(help.status, 0, help.stderr);
assert.match(help.stdout, /Usage:/);
assert.match(help.stdout, /sqlite3-polycall validate/);

const version = run(["--version"]);
assert.equal(version.status, 0, version.stderr);
assert.equal(version.stdout.trim(), pkg.version);

const doctor = run(["doctor"]);
assert.equal(doctor.status, 0, doctor.stderr);
const payload = JSON.parse(doctor.stdout);
assert.equal(payload.polycallExists, true);
assert.equal(payload.polycallConfigExists, true);

console.log("sqlite3-polycall npm bin smoke test: PASS");
