"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const LIBPOLYCALL_RELEASE_URL = "https://github.com/obinexus/libpolycall/releases#release-libpolycall-1.0.0";
const packageRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(packageRoot, "..");

const defaultPaths = Object.freeze({
  sqlite3Bin: "C:\\SQLite\\sqlite3.exe",
  polycallExe: path.join(workspaceRoot, "libpolycall", "build", "bin", "polycall.exe"),
  polycallConfig: path.join(workspaceRoot, "libpolycall", "Polycallfile"),
  database: path.join(process.cwd(), "sqlite3-polycall.db")
});

const schemaSql = `
CREATE TABLE IF NOT EXISTS polycall_config_validation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_path TEXT NOT NULL,
  polycall_exe TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  stdout TEXT NOT NULL,
  stderr TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

function exists(value) {
  return typeof value === "string" && value.length > 0 && fs.existsSync(value);
}

function resolveSQLite3Bin(value = process.env.SQLITE3_BIN) {
  const candidates = [
    value,
    defaultPaths.sqlite3Bin,
    "sqlite3"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === "sqlite3" || exists(candidate)) {
      return candidate;
    }
  }

  return defaultPaths.sqlite3Bin;
}

function resolvePolycallExe(value = process.env.POLYCALL_EXE) {
  const candidates = [
    value,
    defaultPaths.polycallExe,
    path.join(workspaceRoot, "libpolycall", "libpolycall", "build", "bin", "polycall.exe"),
    path.join(process.cwd(), "libpolycall", "build", "bin", "polycall.exe"),
    path.join(process.cwd(), "libpolycall", "libpolycall", "build", "bin", "polycall.exe")
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (exists(candidate)) {
      return candidate;
    }
  }

  return defaultPaths.polycallExe;
}

function resolvePolycallConfig(value = process.env.POLYCALL_CONFIG) {
  const candidates = [
    value,
    defaultPaths.polycallConfig,
    path.join(process.cwd(), "Polycallfile"),
    path.join(process.cwd(), "libpolycall", "Polycallfile")
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (exists(candidate)) {
      return candidate;
    }
  }

  return defaultPaths.polycallConfig;
}

function runProcess(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    windowsHide: true,
    ...options
  });

  return {
    command,
    args,
    status: typeof result.status === "number" ? result.status : 1,
    stdout: result.stdout || "",
    stderr: result.stderr || (result.error ? result.error.message : ""),
    error: result.error ? result.error.message : null
  };
}

function quoteSql(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqliteExec(options = {}) {
  const sqlite3Bin = resolveSQLite3Bin(options.sqlite3Bin);
  const database = options.database || defaultPaths.database;
  const sql = options.sql || "";

  if (database !== ":memory:") {
    fs.mkdirSync(path.dirname(path.resolve(database)), { recursive: true });
  }

  return {
    database,
    sqlite3Bin,
    ...runProcess(sqlite3Bin, [database], {
      input: sql
    })
  };
}

function validateConfig(options = {}) {
  const polycallExe = resolvePolycallExe(options.polycallExe);
  const configPath = path.resolve(options.configPath || resolvePolycallConfig());
  return {
    polycallExe,
    configPath,
    ...runProcess(polycallExe, ["config", "validate", configPath])
  };
}

function recordValidation(options = {}) {
  const database = options.database || defaultPaths.database;
  const validation = validateConfig(options);
  const insertSql = `
${schemaSql}
INSERT INTO polycall_config_validation (
  config_path,
  polycall_exe,
  status_code,
  stdout,
  stderr
) VALUES (
  ${quoteSql(validation.configPath)},
  ${quoteSql(validation.polycallExe)},
  ${Number(validation.status)},
  ${quoteSql(validation.stdout.trim())},
  ${quoteSql(validation.stderr.trim())}
);
SELECT id, config_path, status_code, stdout FROM polycall_config_validation ORDER BY id DESC LIMIT 1;
`;

  const sqlite = sqliteExec({
    database,
    sqlite3Bin: options.sqlite3Bin,
    sql: insertSql
  });

  return {
    database,
    validation,
    sqlite
  };
}

function doctor(options = {}) {
  const sqlite3Bin = resolveSQLite3Bin(options.sqlite3Bin);
  const polycallExe = resolvePolycallExe(options.polycallExe);
  const configPath = resolvePolycallConfig(options.configPath);
  const sqliteVersion = runProcess(sqlite3Bin, ["-version"]);
  const polycallHelp = exists(polycallExe) ? runProcess(polycallExe, ["--help"]) : null;

  return {
    packageRoot,
    workspaceRoot,
    sqlite3Bin,
    sqlite3Exists: sqlite3Bin === "sqlite3" || exists(sqlite3Bin),
    sqliteVersion: sqliteVersion.stdout.trim(),
    polycallExe,
    polycallExists: exists(polycallExe),
    polycallConfig: configPath,
    polycallConfigExists: exists(configPath),
    polycallProbeStatus: polycallHelp ? polycallHelp.status : 1,
    libpolycallHostUrl: LIBPOLYCALL_RELEASE_URL
  };
}

function tempDatabase(name = "sqlite3-polycall-test.db") {
  return path.join(os.tmpdir(), `${process.pid}-${name}`);
}

module.exports = {
  LIBPOLYCALL_RELEASE_URL,
  defaultPaths,
  schemaSql,
  doctor,
  quoteSql,
  recordValidation,
  resolvePolycallConfig,
  resolvePolycallExe,
  resolveSQLite3Bin,
  runProcess,
  sqliteExec,
  tempDatabase,
  validateConfig
};
