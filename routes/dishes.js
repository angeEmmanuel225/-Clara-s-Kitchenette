const router = require("express").Router();
const Dish = require("../models/Dish");
const requireAdmin = require("../middleware/requireAdmin");

// GET /api/dishes — liste publique des plats
router.get("/", async (req, res) => {
  try {
    const dishes = await Dish.find().sort({ createdAt: 1 });
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la lecture des plats." });
  }
});

// POST /api/dishes — créer un plat (admin uniquement)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, category, price, photo, desc, featured } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Nom et prix sont obligatoires." });
    }
    const dish = await Dish.create({ name, category, price, photo, desc, featured });
    res.status(201).json(dish);
  } catch (err) {
    res.status(400).json({ error: "Impossible de créer ce plat." });
  }
});

// PUT /api/dishes/:id — modifier un plat (admin uniquement)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { name, category, price, photo, desc, featured } = req.body;
    const dish = await Dish.findByIdAndUpdate(
      req.params.id,
      { name, category, price, photo, desc, featured },
      { new: true, runValidators: true }
    );
    if (!dish) return res.status(404).json({ error: "Plat introuvable." });
    res.json(dish);
  } catch (err) {
    res.status(400).json({ error: "Impossible de modifier ce plat." });
  }
});

// DELETE /api/dishes/:id — supprimer un plat (admin uniquement)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Dish.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Impossible de supprimer ce plat." });
  }
});

module.exports = router;
