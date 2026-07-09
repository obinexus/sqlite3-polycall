"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const {
  defaultPaths,
  recordValidation,
  resolvePolycallExe,
  resolveSQLite3Bin,
  sqliteExec,
  tempDatabase
} = require("../");

const sqlite3Bin = resolveSQLite3Bin();
const polycallExe = resolvePolycallExe();

assert.ok(fs.existsSync(sqlite3Bin), `sqlite3 exists: ${sqlite3Bin}`);
assert.ok(fs.existsSync(polycallExe), `polycall.exe exists: ${polycallExe}`);
assert.ok(fs.existsSync(defaultPaths.polycallConfig), `Polycallfile exists: ${defaultPaths.polycallConfig}`);

const database = tempDatabase("sqlite3-polycall-validation.db");

try {
  const result = recordValidation({
    database,
    sqlite3Bin,
    polycallExe,
    configPath: defaultPaths.polycallConfig
  });

  assert.equal(result.validation.status, 0, result.validation.stderr);
  assert.match(result.validation.stdout, /is valid/);
  assert.equal(result.sqlite.status, 0, result.sqlite.stderr);

  const query = sqliteExec({
    database,
    sqlite3Bin,
    sql: "SELECT status_code FROM polycall_config_validation ORDER BY id DESC LIMIT 1;"
  });

  assert.equal(query.status, 0, query.stderr);
  assert.equal(query.stdout.trim(), "0");
} finally {
  fs.rmSync(database, { force: true });
}

console.log("sqlite3-polycall sqlite/polycall integration test: PASS");
