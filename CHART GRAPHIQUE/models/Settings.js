const mongoose = require("mongoose");

// Un seul document existe pour ce modèle : les réglages généraux du site
// (numéro WhatsApp, ville, texte d'accueil...), modifiables depuis l'espace pro.
const settingsSchema = new mongoose.Schema(
  {
    whatsapp: { type: String, default: "33677949139" },
    ville: { type: String, default: "Lyon" },
    tiktok: { type: String, default: "@claras.kitchenette" },
    heroTitle: { type: String, default: "Les saveurs d'Afrique, cuisinées avec amour" },
    heroSub: {
      type: String,
      default:
        "Togo, Côte d'Ivoire, Mali, Burkina Faso — et quelques classiques d'Europe. Préparé maison à Lyon, livré partout en France.",
    },
    heroPhoto: { type: String, default: "" },
    about: {
      type: String,
      default:
        "Clara's Kitchenette prépare, à la commande, des plats togolais, ivoiriens, maliens et burkinabés — avec quelques classiques européens en clin d'œil. Chaque part est cuisinée maison à Lyon puis livrée avec soin partout en France.",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
