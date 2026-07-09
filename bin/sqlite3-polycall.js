#!/usr/bin/env node
"use strict";

const path = require("node:path");
const packageJson = require("../package.json");
const {
  LIBPOLYCALL_RELEASE_URL,
  doctor,
  recordValidation,
  schemaSql,
  validateConfig
} = require("../src/sqlite3_polycall");

function usage(stream = process.stdout) {
  stream.write(`Usage:
  sqlite3-polycall --help
  sqlite3-polycall --version
  sqlite3-polycall doctor
  sqlite3-polycall schema
  sqlite3-polycall validate [Polycallfile] [--db PATH]

Environment:
  SQLITE3_BIN      Path to sqlite3.exe; default C:\\SQLite\\sqlite3.exe, then PATH sqlite3
  POLYCALL_EXE     Path to polycall.exe; default ..\\libpolycall\\build\\bin\\polycall.exe
  POLYCALL_CONFIG  Path to Polycallfile

libpolycall host:
  ${LIBPOLYCALL_RELEASE_URL}
`);
}

function takeOption(args, name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }
  const value = args[index + 1] || null;
  args.splice(index, value === null ? 1 : 2);
  return value;
}

function json(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function main(argv) {
  const [command = "--help", ...rest] = argv;
  const args = [...rest];

  switch (command) {
    case "--help":
    case "-h":
    case "help":
      usage();
      return;
    case "--version":
    case "-v":
      process.stdout.write(`${packageJson.version}\n`);
      return;
    case "doctor":
      json(doctor());
      return;
    case "schema":
      process.stdout.write(schemaSql.trim());
      process.stdout.write("\n");
      return;
    case "validate": {
      const database = takeOption(args, "--db");
      const configPath = args[0] ? path.resolve(process.cwd(), args[0]) : undefined;
      const result = database
        ? recordValidation({ configPath, database: path.resolve(process.cwd(), database) })
        : recordValidation({ configPath });
      json({
        database: result.database,
        polycallExe: result.validation.polycallExe,
        configPath: result.validation.configPath,
        status: result.validation.status,
        stdout: result.validation.stdout.trim(),
        stderr: result.validation.stderr.trim(),
        sqliteStatus: result.sqlite.status
      });
      process.exitCode = result.validation.status || result.sqlite.status;
      return;
    }
    case "validate-only": {
      const configPath = args[0] ? path.resolve(process.cwd(), args[0]) : undefined;
      const result = validateConfig({ configPath });
      json({
        polycallExe: result.polycallExe,
        configPath: result.configPath,
        status: result.status,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim()
      });
      process.exitCode = result.status;
      return;
    }
    default:
      usage(process.stderr);
      throw new Error(`unknown command: ${command}`);
  }
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`sqlite3-polycall: ${error.message}`);
  process.exit(1);
});
