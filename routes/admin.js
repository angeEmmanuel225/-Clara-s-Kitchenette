const router = require("express").Router();

// POST /api/admin/login — vérifie le mot de passe de l'espace pro.
// Ne renvoie jamais le mot de passe lui-même, juste ok:true / ok:false.
router.post("/login", (req, res) => {
  const { passcode } = req.body;
  const expected = process.env.ADMIN_PASSCODE;

  if (!expected) {
    return res.status(500).json({ ok: false, error: "ADMIN_PASSCODE non configuré sur le serveur." });
  }
  if (passcode && passcode === expected) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false });
});

module.exports = router;
