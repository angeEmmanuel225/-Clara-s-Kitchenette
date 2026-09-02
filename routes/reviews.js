const router = require("express").Router();
const Review = require("../models/Review");
const requireAdmin = require("../middleware/requireAdmin");

// GET /api/reviews — liste publique des avis
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: 1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la lecture des avis." });
  }
});

// POST /api/reviews — un visiteur publie un avis (accès public, pas de mot de passe)
router.post("/", async (req, res) => {
  try {
    const { name, comment, rating } = req.body;
    if (!name || !comment || !rating) {
      return res.status(400).json({ error: "Prénom, commentaire et note sont obligatoires." });
    }
    const review = await Review.create({ name, comment, rating });
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: "Impossible d'enregistrer cet avis." });
  }
});

// DELETE /api/reviews/:id — modération (admin uniquement)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Impossible de supprimer cet avis." });
  }
});

module.exports = router;
