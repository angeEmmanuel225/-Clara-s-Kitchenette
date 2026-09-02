const router = require("express").Router();
const Settings = require("../models/Settings");
const requireAdmin = require("../middleware/requireAdmin");

// GET /api/settings — réglages publics du site (un seul document existe)
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la lecture des réglages." });
  }
});

// PUT /api/settings — modifier les réglages (admin uniquement)
router.put("/", requireAdmin, async (req, res) => {
  try {
    const { whatsapp, ville, tiktok, heroTitle, heroSub, heroPhoto, about } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    Object.assign(settings, { whatsapp, ville, tiktok, heroTitle, heroSub, heroPhoto, about });
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: "Impossible d'enregistrer les réglages." });
  }
});

module.exports = router;
