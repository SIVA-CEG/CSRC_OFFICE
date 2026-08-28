const bcrypt = require("bcrypt");
const pool = require("./db/db");

async function createTapalAdmin() {
  const hash = await bcrypt.hash("1234", 10);
  await pool.query(
    `UPDATE admin_users SET password_hash = $1 WHERE username = $2`,
    [hash, "dd1"],
  );
  console.log("Tapal admin password set");
  process.exit();
}

createTapalAdmin();
