# TODO

- Add optional SQLite loadable-extension support if a stable sqlite3 extension
  ABI is required later.
- Add SQL migration examples for appending telemetry or CUID snapshots.
- Keep the adapter thin; do not reimplement libpolycall validation semantics in
  SQLite or JavaScript.
