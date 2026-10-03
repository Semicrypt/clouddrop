import fs from "node:fs";
import pg from "pg";

const { Pool } = pg;

const databaseSslEnabled =
  process.env.DATABASE_SSL === "true";

let ssl = false;

if (databaseSslEnabled) {
  const caPath =
    process.env.DATABASE_CA_CERT_PATH;

  if (!caPath) {
    throw new Error(
      "DATABASE_CA_CERT_PATH is required when DATABASE_SSL=true"
    );
  }

  ssl = {
    rejectUnauthorized: true,
    ca: fs.readFileSync(
      caPath,
      "utf8"
    ),
  };
}

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL,
  ssl,
});

pool.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL error:",
    error
  );
});

export default pool;
