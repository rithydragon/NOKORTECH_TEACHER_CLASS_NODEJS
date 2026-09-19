import db from "./config/db.js";
import { readFileSync } from "fs";

const sql = readFileSync(new URL("./ENROLLMENTS.sql", import.meta.url), "utf8");
const createSql = sql.slice(sql.indexOf("CREATE TABLE"), sql.lastIndexOf(";") + 1);

await db.query("DROP TABLE IF EXISTS ENROLLMENTS");
await db.query(createSql);

const [rows] = await db.query("SHOW TABLES LIKE 'ENROLLMENTS'");
if (rows.length === 1) {
  console.log("ENROLLMENTS table applied successfully");
} else {
  console.log("FAILED: table not found after apply");
  process.exit(1);
}
process.exit(0);