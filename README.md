# sqlite3-polycall

`@obinexusltd/sqlite3-polycall` is the SQLite3 adapter for
[libpolycall](https://github.com/obinexus/libpolycall). It keeps the binding
thin: the package calls the local `polycall.exe config validate` command and
records the validation result in SQLite through the `sqlite3` CLI.

The default local paths match this workspace:

- SQLite CLI: `C:\SQLite\sqlite3.exe`
- PolyCall CLI: `..\libpolycall\build\bin\polycall.exe`
- PolyCall config: `..\libpolycall\Polycallfile`

## Install

```sh
npm install @obinexusltd/sqlite3-polycall
```

Or run with `npx`:

```sh
npx @obinexusltd/sqlite3-polycall --help
npx @obinexusltd/sqlite3-polycall doctor
npx @obinexusltd/sqlite3-polycall validate ..\libpolycall\Polycallfile --db sqlite3-polycall.db
```

## JavaScript API

```js
const {
  recordValidation
} = require("@obinexusltd/sqlite3-polycall");

const result = recordValidation({
  database: "sqlite3-polycall.db",
  configPath: "../libpolycall/Polycallfile"
});

console.log(result.validation.status);
```

## SQLite schema

The adapter creates this table:

```sql
CREATE TABLE IF NOT EXISTS polycall_config_validation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_path TEXT NOT NULL,
  polycall_exe TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  stdout TEXT NOT NULL,
  stderr TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Examples

```powershell
node examples/run.js
C:\SQLite\sqlite3.exe example.db ".read examples/schema.sql"
```

See [examples/README.md](examples/README.md).

## Verification

```sh
npm test
npm pack --dry-run --json
```

The test suite verifies:

- npm metadata and source-directory indexing
- `C:\SQLite\sqlite3.exe`
- `..\libpolycall\build\bin\polycall.exe`
- `polycall.exe config validate ..\libpolycall\Polycallfile`
- npm `bin` compatibility for `npx`


## License

MIT © Nnamdi Michael Okpala
