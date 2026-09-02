/* =========================================================
   API.JS — Tout ce qui parle au serveur (Express + MongoDB).
   Ce fichier ne connaît rien de l'affichage : il sait juste
   comment lire et écrire les plats, tutos, avis et réglages.
   ========================================================= */

var API = {};

(function () {
  "use strict";

  // Mot de passe admin gardé UNIQUEMENT en mémoire (jamais écrit dans le code,
  // jamais sauvegardé sur le disque) — perdu si on recharge la page, ce qui est voulu.
  var adminPasscode = "";

  function setAdminPasscode(pass) {
    adminPasscode = pass || "";
  }

  function request(path, method, body, needsAuth) {
    var headers = { "Content-Type": "application/json" };
    if (needsAuth) headers["x-admin-passcode"] = adminPasscode;

    return fetch(path, {
      method: method,
      headers: headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(function (r) {
      return r.json().catch(function(){ return {}; }).then(function (data) {
        return { ok: r.ok, status: r.status, data: data };
      });
    });
  }

  /* ---------- Plats ---------- */
  API.getDishes = function () { return request("/api/dishes", "GET"); };
  API.createDish = function (dish) { return request("/api/dishes", "POST", dish, true); };
  API.updateDish = function (id, dish) { return request("/api/dishes/" + id, "PUT", dish, true); };
  API.deleteDish = function (id) { return request("/api/dishes/" + id, "DELETE", undefined, true); };

  /* ---------- Tutos ---------- */
  API.getTutorials = function () { return request("/api/tutorials", "GET"); };
  API.createTutorial = function (t) { return request("/api/tutorials", "POST", t, true); };
  API.updateTutorial = function (id, t) { return request("/api/tutorials/" + id, "PUT", t, true); };
  API.deleteTutorial = function (id) { return request("/api/tutorials/" + id, "DELETE", undefined, true); };

  /* ---------- Avis ---------- */
  API.getReviews = function () { return request("/api/reviews", "GET"); };
  API.createReview = function (r) { return request("/api/reviews", "POST", r, false); }; // public, sans mot de passe
  API.deleteReview = function (id) { return request("/api/reviews/" + id, "DELETE", undefined, true); };

  /* ---------- Réglages ---------- */
  API.getSettings = function () { return request("/api/settings", "GET"); };
  API.updateSettings = function (s) { return request("/api/settings", "PUT", s, true); };

  /* ---------- Connexion espace pro ---------- */
  API.adminLogin = function (passcode) {
    return request("/api/admin/login", "POST", { passcode: passcode }, false).then(function (res) {
      if (res.ok && res.data.ok) setAdminPasscode(passcode);
      return res;
    });
  };
  API.adminLogout = function () { setAdminPasscode(""); };

})();
