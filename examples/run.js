"use strict";

const path = require("node:path");
const {
  defaultPaths,
  recordValidation
} = require("../");

const database = path.join(__dirname, "sqlite3-polycall.example.db");
const result = recordValidation({
  database,
  configPath: defaultPaths.polycallConfig
});

console.log({
  database: result.database,
  polycallExe: result.validation.polycallExe,
  configPath: result.validation.configPath,
  status: result.validation.status,
  stdout: result.validation.stdout.trim()
});
