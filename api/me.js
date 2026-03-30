const { loadUserFromRequest } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  try {
    const user = await loadUserFromRequest(req);
    if (!user) return res.status(401).json({ error: "unauthorized" });
    res.json({ user });
  } catch (error) {
    console.error("me error:", error);
    res.status(500).json({ error: "server_error" });
  }
};
