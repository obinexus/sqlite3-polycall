CREATE TABLE IF NOT EXISTS polycall_config_validation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_path TEXT NOT NULL,
  polycall_exe TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  stdout TEXT NOT NULL,
  stderr TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

SELECT 'sqlite3-polycall schema ready' AS message;
