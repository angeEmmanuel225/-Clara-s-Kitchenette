const Dish = require("../models/Dish");
const Tutorial = require("../models/Tutorial");
const Settings = require("../models/Settings");
const { DEFAULT_DISHES, DEFAULT_TUTORIALS } = require("./defaults");

// Remplit la base au tout premier démarrage seulement (si elle est vide).
async function seed() {
  try {
    const dishCount = await Dish.countDocuments();
    if (dishCount === 0) {
      await Dish.insertMany(DEFAULT_DISHES);
      console.log("→ Plats de démonstration insérés (" + DEFAULT_DISHES.length + ").");
    }

    const tutorialCount = await Tutorial.countDocuments();
    if (tutorialCount === 0) {
      await Tutorial.insertMany(DEFAULT_TUTORIALS);
      console.log("→ Tutos de démonstration insérés (" + DEFAULT_TUTORIALS.length + ").");
    }

    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({});
      console.log("→ Réglages par défaut créés.");
    }
  } catch (err) {
    console.error("Erreur lors du remplissage initial de la base :", err.message);
  }
}

module.exports = seed;
