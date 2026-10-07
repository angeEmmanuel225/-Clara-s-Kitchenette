const mongoose = require("mongoose");

// Un code promo : un code à donner aux clientes, une réduction en %,
// et une commande minimum pour pouvoir l'utiliser.
const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true, unique: true },
    discountPercent: { type: Number, required: true, min: 1, max: 90 },
    minOrder: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromoCode", promoCodeSchema);
