require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const seed = require("./seed/seed");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors()); // autorise les appels depuis n'importe quelle origine (utile en développement local)
app.use(express.json({ limit: "1mb" })); // les photos sont des liens (URL), pas des fichiers : pas besoin de plus

// Fichiers du site (HTML / CSS / JS) — servis tels quels
app.use(express.static(path.join(__dirname, "public")));

// Petite route légère, pensée pour UptimeRobot : elle réveille et confirme que le serveur répond.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Routes de l'API
app.use("/api/dishes", require("./routes/dishes"));
app.use("/api/tutorials", require("./routes/tutorials"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/admin", require("./routes/admin"));

if (!MONGODB_URI) {
  console.error("ERREUR : la variable d'environnement MONGODB_URI n'est pas définie.");
  console.error("Crée un fichier .env (voir .env.example) ou configure-la sur Render.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connecté à MongoDB.");
    await seed();
    app.listen(PORT, () => {
      console.log("Clara's Kitchenette en ligne sur le port " + PORT);
    });
  })
  .catch((err) => {
    console.error("Impossible de se connecter à MongoDB :", err.message);
    process.exit(1);
  });
