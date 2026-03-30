const crypto = require("crypto");
const pool = require("./_db");

const createPasswordHash = (password, salt) =>
  crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");

const parseCookies = (cookieHeader = "") => {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const index = part.indexOf("=");
      if (index === -1) return acc;
      const key = part.slice(0, index).trim();
      const value = decodeURIComponent(part.slice(index + 1));
      acc[key] = value;
      return acc;
    }, {});
};

const setSessionCookie = (res, token) => {
  res.setHeader(
    "Set-Cookie",
    `session_token=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
  );
};

const clearSessionCookie = (res) => {
  res.setHeader(
    "Set-Cookie",
    "session_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );
};

const loadUserFromRequest = async (req) => {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies.session_token;
  if (!token) return null;

  const sessionResult = await pool.query(
    "SELECT * FROM sessions WHERE token = $1",
    [token]
  );
  const session = sessionResult.rows[0];
  if (!session) return null;

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await pool.query("DELETE FROM sessions WHERE id = $1", [session.id]);
    return null;
  }

  const userResult = await pool.query(
    "SELECT id, username FROM users WHERE id = $1",
    [session.user_id]
  );
  return userResult.rows[0] || null;
};

const parseCurrency = (value) => {
  if (!value) return 0;
  const normalized = String(value).replace(/[^\d.]/g, "");
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : 0;
};

module.exports = {
  createPasswordHash,
  parseCookies,
  setSessionCookie,
  clearSessionCookie,
  loadUserFromRequest,
  parseCurrency,
};
