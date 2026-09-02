const mongoose = require("mongoose");

// Un tuto cuisine : titre, résumé, ingrédients/étapes (texte libre, une ligne = un élément),
// une photo, et/ou un lien vidéo YouTube ou TikTok.
const tutorialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "", trim: true, maxlength: 200 },
    photo: { type: String, default: "", trim: true },
    video: { type: String, default: "", trim: true }, // lien YouTube ou TikTok
    ingredients: { type: String, default: "" }, // une ligne par ingrédient
    steps: { type: String, default: "" }, // une ligne par étape
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tutorial", tutorialSchema);
