// Protège les routes d'écriture (ajout/modification/suppression).
// Le mot de passe est envoyé par le site dans l'en-tête "x-admin-passcode"
// et comparé à la variable d'environnement ADMIN_PASSCODE (définie sur Render).
// -> Le mot de passe ne se trouve donc jamais dans le code lui-même.
module.exports = function requireAdmin(req, res, next) {
  const provided = req.headers["x-admin-passcode"];
  const expected = process.env.ADMIN_PASSCODE;

  if (!expected) {
    // Sécurité : si la variable d'environnement n'a pas été configurée sur Render,
    // on bloque plutôt que d'accepter n'importe quel mot de passe.
    return res.status(500).json({ error: "ADMIN_PASSCODE non configuré sur le serveur." });
  }
  if (provided && provided === expected) {
    return next();
  }
  return res.status(401).json({ error: "Mot de passe incorrect." });
};
