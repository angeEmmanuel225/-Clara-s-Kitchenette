const router = require("express").Router();
const PromoCode = require("../models/PromoCode");
const requireAdmin = require("../middleware/requireAdmin");

// GET /api/promocodes — liste complète (admin uniquement : ce sont des infos sensibles)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const codes = await PromoCode.find().sort({ createdAt: -1 });
    res.json(codes);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la lecture des codes promo." });
  }
});

// POST /api/promocodes — créer un code (admin uniquement)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { code, discountPercent, minOrder } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ error: "Code et pourcentage de réduction obligatoires." });
    }
    const promo = await PromoCode.create({ code, discountPercent, minOrder: minOrder || 0 });
    res.status(201).json(promo);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Ce code existe déjà." });
    res.status(400).json({ error: "Impossible de créer ce code." });
  }
});

// DELETE /api/promocodes/:id — supprimer un code (admin uniquement)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Impossible de supprimer ce code." });
  }
});

// GET /api/promocodes/check/:code?total=42 — vérification publique (pas de mot de passe)
// Ne renvoie jamais la liste complète, seulement si CE code précis est valide pour CE montant.
router.get("/check/:code", async (req, res) => {
  try {
    const total = parseFloat(req.query.total) || 0;
    const promo = await PromoCode.findOne({ code: String(req.params.code).toUpperCase().trim(), active: true });
    if (!promo) return res.json({ valid: false, message: "Code promo invalide." });
    if (total < promo.minOrder) {
      return res.json({ valid: false, message: `Commande minimum de ${promo.minOrder}€ pour ce code.` });
    }
    res.json({ valid: true, code: promo.code, discountPercent: promo.discountPercent, minOrder: promo.minOrder });
  } catch (err) {
    res.status(500).json({ valid: false, message: "Erreur lors de la vérification du code." });
  }
});

module.exports = router;
