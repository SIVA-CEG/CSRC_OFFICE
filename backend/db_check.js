const pool = require("./db/db");

(async () => {
  try {
    const r = await pool.query(
      "SELECT status, COUNT(*) AS cnt FROM endorsements GROUP BY status",
    );
    console.log("STATUS:", JSON.stringify(r.rows, null, 2));
    const r2 = await pool.query(
      "SELECT user_id, COUNT(*) AS cnt FROM endorsements GROUP BY user_id",
    );
    console.log("USER_ID:", JSON.stringify(r2.rows, null, 2));
    const r3 = await pool.query("SELECT COUNT(*) AS cnt FROM faculty_profile");
    console.log("PROFILE_COUNT:", JSON.stringify(r3.rows, null, 2));
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
