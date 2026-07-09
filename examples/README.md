# sqlite3-polycall examples

Run a full validation and SQLite record example:

```powershell
node examples/run.js
```

Create only the schema with the installed SQLite CLI:

```powershell
C:\SQLite\sqlite3.exe example.db ".read examples/schema.sql"
```

The npm CLI also records validation results:

```powershell
npx @obinexusltd/sqlite3-polycall validate ..\libpolycall\Polycallfile --db example.db
```
