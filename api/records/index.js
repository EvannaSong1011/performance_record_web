const pool = require("./_db");
const { loadUserFromRequest, parseCurrency } = require("./_auth");

module.exports = async (req, res) => {
  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(401).json({ error: "unauthorized" });

    // ---- GET: 查询记录 ----
    if (req.method === "GET") {
      const { type, month } = req.query || {};
      const conditions = ["user_id = $1"];
      const params = [user.id];
      let paramIndex = 2;

      if (type) {
        conditions.push(`type = $${paramIndex}`);
        params.push(type);
        paramIndex++;
      }

      if (month) {
        conditions.push(`datetime LIKE $${paramIndex}`);
        params.push(`${month}%`);
        paramIndex++;
      }

      const whereClause = `WHERE ${conditions.join(" AND ")}`;
      const result = await pool.query(
        `SELECT * FROM records ${whereClause} ORDER BY datetime DESC, id DESC`,
        params
      );

      const rows = result.rows;

      // 将 cast_info 映射回前端期望的 cast 字段
      const records = rows.map((row) => ({
        ...row,
        cast: row.cast_info,
      }));

      const watchedCount = records.filter((r) => r.status === "已观看").length;
      const upcomingCount = records.filter((r) => r.status === "待观看").length;
      const sumPaidAll = records.reduce((acc, r) => acc + parseCurrency(r.paid), 0);
      const sumPaidWatched = records
        .filter((r) => r.status === "已观看")
        .reduce((acc, r) => acc + parseCurrency(r.paid), 0);

      return res.json({
        records,
        stats: { watchedCount, upcomingCount, sumPaidAll, sumPaidWatched },
      });
    }

    // ---- POST: 新建记录 ----
    if (req.method === "POST") {
      const { title, type, datetime, city, venue, price, paid, seat, cast, status } =
        req.body || {};

      if (!title || !type || !datetime || !city || !venue || !price || !paid || !status) {
        return res.status(400).json({ error: "missing_fields" });
      }

      const result = await pool.query(
        `INSERT INTO records (user_id, title, type, datetime, city, venue, price, paid, seat, cast_info, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          user.id,
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
          new Date().toISOString(),
        ]
      );

      return res.json({ id: result.rows[0].id });
    }

    return res.status(405).json({ error: "method_not_allowed" });
  } catch (error) {
    console.error("records error:", error);
    res.status(500).json({ error: "database_error" });
  }
};
