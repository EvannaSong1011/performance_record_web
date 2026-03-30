const pool = require("./_db");
const { parseCookies, clearSessionCookie } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies.session_token;
    if (token) {
      await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  } catch (error) {
    console.error("logout error:", error);
    res.status(500).json({ error: "logout_failed" });
  }
};
