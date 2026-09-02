const mongoose = require("mongoose");

// Un plat de la carte : nom, catégorie, prix, description, et une photo
// (lien Google Drive ou autre — voir README pour la méthode).
const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Plats", "Accompagnements", "Boissons", "Desserts"],
      default: "Plats",
    },
    price: { type: Number, required: true, min: 0 },
    photo: { type: String, default: "", trim: true },
    desc: { type: String, default: "", trim: true, maxlength: 300 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dish", dishSchema);
