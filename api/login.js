const crypto = require("crypto");
const pool = require("./_db");
const { createPasswordHash, setSessionCookie } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "missing_fields" });

  try {
    const existing = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    let user = existing.rows[0];

    if (!user) {
      // 首次登录自动注册
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = createPasswordHash(password, salt);
      const insertResult = await pool.query(
        "INSERT INTO users (username, password_hash, password_salt, created_at) VALUES ($1, $2, $3, $4) RETURNING id, username",
        [username, hash, salt, new Date().toISOString()]
      );
      user = insertResult.rows[0];

      // 将无主记录分配给新用户
      await pool.query("UPDATE records SET user_id = $1 WHERE user_id IS NULL", [user.id]);
    } else {
      // 验证密码
      const hash = createPasswordHash(password, user.password_salt);
      if (hash !== user.password_hash) {
        return res.status(401).json({ error: "invalid_credentials" });
      }
    }

    // 创建会话
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await pool.query(
      "INSERT INTO sessions (user_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4)",
      [user.id, token, expiresAt, new Date().toISOString()]
    );

    setSessionCookie(res, token);
    res.json({ user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ error: "login_failed" });
  }
};
