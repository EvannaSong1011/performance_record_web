const pool = require("../_db");
const { loadUserFromRequest } = require("../_auth");

module.exports = async (req, res) => {
  if (req.method !== "PUT") return res.status(405).json({ error: "method_not_allowed" });

  const recordId = Number(req.query.id);
  if (!recordId) return res.status(400).json({ error: "invalid_id" });

  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(401).json({ error: "unauthorized" });

    const { title, type, datetime, city, venue, price, paid, seat, cast, status } =
      req.body || {};

    if (!title || !type || !datetime || !city || !venue || !price || !paid || !status) {
      return res.status(400).json({ error: "missing_fields" });
    }

    const result = await pool.query(
      `UPDATE records
       SET title = $1, type = $2, datetime = $3, city = $4, venue = $5,
           price = $6, paid = $7, seat = $8, cast_info = $9, status = $10
       WHERE id = $11 AND user_id = $12`,
      [
        title,
        type,
        datetime,
        city,
        venue,
        price,
        paid,
        seat || "",
        cast || "",
        status,
        recordId,
        user.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "not_found" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("records update error:", error);
    res.status(500).json({ error: "update_failed" });
  }
};
