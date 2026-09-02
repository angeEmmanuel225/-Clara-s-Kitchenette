const router = require("express").Router();
const Tutorial = require("../models/Tutorial");
const requireAdmin = require("../middleware/requireAdmin");

// GET /api/tutorials — liste publique des tutos
router.get("/", async (req, res) => {
  try {
    const tutorials = await Tutorial.find().sort({ createdAt: 1 });
    res.json(tutorials);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la lecture des tutos." });
  }
});

// POST /api/tutorials — créer un tuto (admin uniquement)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, summary, photo, video, ingredients, steps } = req.body;
    if (!title) return res.status(400).json({ error: "Le titre est obligatoire." });
    const tutorial = await Tutorial.create({ title, summary, photo, video, ingredients, steps });
    res.status(201).json(tutorial);
  } catch (err) {
    res.status(400).json({ error: "Impossible de créer ce tuto." });
  }
});

// PUT /api/tutorials/:id — modifier un tuto (admin uniquement)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { title, summary, photo, video, ingredients, steps } = req.body;
    const tutorial = await Tutorial.findByIdAndUpdate(
      req.params.id,
      { title, summary, photo, video, ingredients, steps },
      { new: true, runValidators: true }
    );
    if (!tutorial) return res.status(404).json({ error: "Tuto introuvable." });
    res.json(tutorial);
  } catch (err) {
    res.status(400).json({ error: "Impossible de modifier ce tuto." });
  }
});

// DELETE /api/tutorials/:id — supprimer un tuto (admin uniquement)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Tutorial.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Impossible de supprimer ce tuto." });
  }
});

module.exports = router;
