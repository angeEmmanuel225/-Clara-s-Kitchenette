# Clara's Kitchenette — Site + espace pro

Site "magazine" pour Clara's Kitchenette : présentation des plats, tutos cuisine (vidéos YouTube/TikTok),
commande envoyée sur WhatsApp, avis clients, et un espace pro pour tout gérer sans coder.

Ce guide t'explique comment le mettre en ligne **gratuitement**, avec les outils que tu as choisis :
**GitHub** (le code) + **MongoDB Atlas** (la base de données) + **Render** (l'hébergement) +
**UptimeRobot** (pour garder le site réveillé) + **Google Drive** (pour héberger tes photos).

Compte à créer avant de commencer (tous gratuits) : MongoDB Atlas, GitHub, Render, UptimeRobot.

---

## 1. Comment le projet est organisé

```
clara-kitchenette/
├── server.js                → démarre le serveur (le "chef d'orchestre")
├── package.json              → la liste des outils dont le serveur a besoin
├── .env.example               → modèle des informations secrètes (mot de passe, base de données)
├── models/                    → la forme des données stockées (un plat, un tuto, un avis, les réglages)
│   ├── Dish.js
│   ├── Tutorial.js
│   ├── Review.js
│   └── Settings.js
├── routes/                    → ce que le serveur sait faire (lire/ajouter/modifier/supprimer)
│   ├── dishes.js
│   ├── tutorials.js
│   ├── reviews.js
│   ├── settings.js
│   └── admin.js
├── middleware/
│   └── requireAdmin.js        → vérifie le mot de passe avant d'autoriser une modification
├── seed/                      → contenu de démonstration inséré au tout premier démarrage
│   ├── defaults.js
│   └── seed.js
└── public/                    → le site que voient tes visiteurs
    ├── index.html              → la structure des pages
    ├── css/
    │   └── style.css           → toute l'apparence (couleurs, typographie, mise en page)
    └── js/
        ├── api.js               → tout ce qui communique avec le serveur
        └── app.js                → tout ce qui gère l'affichage et les clics
```

**Pourquoi c'est séparé ainsi :** `index.html` ne contient que la structure, `style.css` ne contient que
l'apparence, `api.js` ne parle qu'au serveur, `app.js` ne s'occupe que de l'affichage. Tu peux ouvrir
n'importe quel fichier sans te perdre dans les autres.

---

## 2. Étape 1 — Créer la base de données (MongoDB Atlas)

1. Va sur [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) et crée un compte gratuit.
2. Crée un cluster gratuit : choisis l'offre **M0 (Free)**.
3. Dans **Database Access**, crée un utilisateur de base de données (note bien le nom et le mot de passe choisis).
4. Dans **Network Access**, clique **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
   *(Nécessaire car Render ne fournit pas d'adresse IP fixe sur son offre gratuite.)*
5. Dans **Database → Connect → Drivers**, copie la chaîne de connexion. Elle ressemble à :
   `mongodb+srv://UTILISATEUR:MOTDEPASSE@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Ajoute le nom de ta base juste après `.net/` : `.../clarakitchenette?retryWrites=true...`
7. Garde cette chaîne de côté — c'est ta variable `MONGODB_URI`.

---

## 3. Étape 2 — Mettre le code sur GitHub

**Le plus simple (sans rien installer) :**
1. Va sur [github.com](https://github.com) → crée un compte si besoin → **New repository** (nomme-le `clara-kitchenette`, garde-le en **Public** ou **Private**, ne coche aucune case d'initialisation).
2. Une fois le dépôt créé, clique **uploading an existing file**.
3. Fais glisser **tout le contenu du dossier** `clara-kitchenette` (garde la structure de dossiers : `models/`, `routes/`, `public/`, etc. — les navigateurs récents permettent de glisser des dossiers entiers).
4. Vérifie que le fichier `.env` n'y figure pas (il n'existe pas encore de toute façon — c'est voulu, il contient des informations secrètes).
5. Clique **Commit changes**.

**Si tu es à l'aise avec le terminal :**
```bash
cd clara-kitchenette
git init
git add .
git commit -m "Premier envoi du site Clara's Kitchenette"
git branch -M main
git remote add origin https://github.com/TON-UTILISATEUR/clara-kitchenette.git
git push -u origin main
```

---

## 4. Étape 3 — Héberger le serveur (Render)

1. Va sur [render.com](https://render.com) → crée un compte (tu peux te connecter directement avec GitHub).
2. **New +** → **Web Service**.
3. Connecte ton dépôt GitHub `clara-kitchenette`.
4. Configure :
   - **Name** : `clara-kitchenette` (le nom choisi devient une partie de ton adresse : `clara-kitchenette.onrender.com`)
   - **Region** : Frankfurt (la plus proche de la France)
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : **Free**
5. Dans **Environment Variables**, ajoute :
   - `MONGODB_URI` → ta chaîne de connexion de l'étape 2
   - `ADMIN_PASSCODE` → le mot de passe que tu veux pour ton espace pro (change-le, ne garde pas l'exemple)
6. Clique **Create Web Service**. Le premier déploiement prend 2 à 5 minutes.
7. Une fois prêt, ton site est en ligne à l'adresse `https://clara-kitchenette.onrender.com` (ou le nom que tu as choisi).

**Important — le plan gratuit s'endort :** après ~15 minutes sans visite, Render met le service en pause.
La première personne qui arrive ensuite attend 30 à 60 secondes le temps qu'il se réveille (le site
affiche un petit message d'attente pendant ce temps). L'étape suivante réduit ce problème.

**Pour republier après une modification du code :** il suffit de renvoyer les fichiers modifiés sur GitHub
(via le bouton d'upload ou `git push`) — Render redéploie automatiquement à chaque envoi.

---

## 5. Étape 4 — Garder le site réveillé (UptimeRobot)

1. Va sur [uptimerobot.com](https://uptimerobot.com) → crée un compte gratuit.
2. **Add New Monitor**.
3. **Monitor Type** : `HTTP(s)`.
4. **URL** : `https://clara-kitchenette.onrender.com/api/health` (adapte avec ton adresse Render).
5. **Monitoring Interval** : `5 minutes` (le minimum du plan gratuit — largement suffisant).
6. Enregistre. UptimeRobot va maintenant visiter cette petite page toutes les 5 minutes, ce qui empêche
   Render de mettre le service en pause pendant la journée.

*(Cela ne garantit pas un réveil instantané à 100% du temps — par exemple juste après un redéploiement —
mais ça couvre la grande majorité des cas.)*

---

## 6. Étape 5 — Ajouter des photos avec Google Drive

Le site n'a pas de bouton "envoyer un fichier" : à la place, tu colles un **lien** vers ta photo dans
l'espace pro. Voici comment obtenir un lien Google Drive qui fonctionne comme une image :

1. Dépose ta photo dans Google Drive.
2. Clic droit sur le fichier → **Partager** → change l'accès en **"Tous les utilisateurs disposant du lien"**.
3. Copie le lien, il ressemble à : `https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing`
4. Repère la partie entre `/d/` et `/view` — ici `1AbCdEfGhIjKlMnOp` — c'est l'identifiant du fichier.
5. Construis ce lien à la place : `https://drive.google.com/uc?export=view&id=1AbCdEfGhIjKlMnOp`
6. Colle **ce nouveau lien** (pas l'original) dans le champ "Lien photo" de l'espace pro.

**Limite à connaître :** ce n'est pas un service d'hébergement d'images officiel — Google peut, rarement,
bloquer temporairement l'affichage si une image est vue un très grand nombre de fois dans la journée. Pour
une activité qui démarre, ça fonctionne bien. Si ça devient un problème plus tard, on pourra basculer vers
un hébergeur d'images dédié (ex. Cloudinary, également gratuit) sans rien changer au reste du site — juste
le lien collé change.

**Pour les vidéos :** rien à convertir — colle simplement le lien YouTube ou TikTok tel quel dans le champ
"Lien vidéo". Un lien YouTube s'affiche directement dans la page ; un lien TikTok affiche un bouton "Voir
la vidéo" qui ouvre TikTok.

---

## 7. Tester sur ton ordinateur avant de mettre en ligne (facultatif)

Si tu as [Node.js](https://nodejs.org) installé :

```bash
cd clara-kitchenette
cp .env.example .env
# ouvre .env et remplace MONGODB_URI par ta vraie chaîne de connexion (étape 1)
npm install
npm start
```

Puis ouvre `http://localhost:3000` dans ton navigateur.

---

## 8. Après la mise en ligne

- **Changer le mot de passe de l'espace pro** : va dans Render → ton service → **Environment** → modifie
  `ADMIN_PASSCODE` → **Save Changes** (le service redémarre tout seul).
- **Mentions légales** : le site n'en génère pas automatiquement. Avant l'ouverture au public, ajoute tes
  informations légales réelles (SIRET, adresse si tu en as une) — dis-le-moi si tu veux que je prépare
  cette page avec toi.
- **Remplacer le contenu de démonstration** : les plats et tutos visibles au premier lancement sont des
  exemples. Modifie-les ou supprime-les depuis l'espace pro (`/#pro`).

---

## 9. Bon à savoir sur les limites de cette version gratuite

- **Sécurité de l'espace pro :** le mot de passe est vérifié par le serveur (donc plus solide qu'un simple
  code caché dans une page web), mais il n'y a pas de compte utilisateur individuel ni de limite de
  tentatives. Largement suffisant pour démarrer ; à renforcer si l'activité grandit beaucoup.
- **MongoDB Atlas gratuit :** 512 Mo de stockage — largement de quoi stocker des centaines de plats, tutos
  et avis (les photos ne sont que des liens, donc elles ne prennent pas de place ici).
- **Render gratuit :** le service s'endort sans visite ; UptimeRobot limite le problème mais ne l'élimine
  pas à 100 %.

Si tu as une question en cours de route ou qu'une étape bloque, montre-moi le message d'erreur exact —
je t'aiderai à le résoudre.
