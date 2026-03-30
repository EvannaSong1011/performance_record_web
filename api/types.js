const pool = require("./_db");
const { loadUserFromRequest } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(401).json({ error: "unauthorized" });

    const result = await pool.query(
      "SELECT DISTINCT type FROM records WHERE user_id = $1 ORDER BY type ASC",
      [user.id]
    );
    const types = result.rows.map((row) => row.type).filter(Boolean);
    res.json({ types });
  } catch (error) {
    console.error("types error:", error);
    res.status(500).json({ error: "database_error" });
  }
};
