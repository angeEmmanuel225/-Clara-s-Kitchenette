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
    ├── favicon.ico              → la petite icône affichée dans l'onglet du navigateur
    ├── robots.txt               → autorise Google à explorer le site (SEO)
    ├── sitemap.xml              → liste des pages à indexer, pour Google (SEO)
    ├── css/
    │   └── style.css           → toute l'apparence (couleurs, typographie, mise en page)
    └── js/
        ├── api.js               → tout ce qui communique avec le serveur
        ├── upload.js             → choisir une photo sur le téléphone/ordinateur et la compresser
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

## 6. Étape 5 — Ajouter des photos (plats et couvertures de tutos)

### Méthode 1 — Depuis ton téléphone ou ton ordinateur (recommandée)

Dans l'espace pro, chaque plat et chaque tuto a un bouton **"Choisir une photo"**. En cliquant dessus :

1. Ton appareil ouvre son sélecteur de fichiers habituel (galerie photo, appareil photo, dossiers...).
2. Une fois la photo choisie, elle est automatiquement **redimensionnée et compressée dans le navigateur**
   (avant même d'être envoyée) : maximum 1280 pixels de côté, qualité ajustée pour viser environ **550 Ko
   ou moins**. Un message affiche le résultat, par exemple *"Photo prête (210 Ko, 1280×960 px)"*.
3. Un aperçu apparaît immédiatement à gauche du bouton. Le bouton **"Retirer"** permet d'enlever la photo.
4. Il ne reste qu'à cliquer sur **"Enregistrer"** en bas du formulaire.

La photo est stockée directement dans MongoDB (pas besoin de Google Drive ni d'un autre service). Avec les
512 Mo offerts par le plan gratuit MongoDB Atlas, et des photos compressées à ~550 Ko maximum, tu as de la
place pour plusieurs centaines de photos — largement de quoi couvrir toute ta carte et tous tes tutos.

### Méthode 2 — Coller un lien (utile pour une photo déjà hébergée ailleurs)

Sous le bouton "Choisir une photo", un petit champ texte reste disponible pour coller un lien direct. Si tu
préfères passer par Google Drive :

1. Dépose ta photo dans Google Drive.
2. Clic droit sur le fichier → **Partager** → change l'accès en **"Tous les utilisateurs disposant du lien"**.
3. Copie le lien, il ressemble à : `https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing`
4. Repère la partie entre `/d/` et `/view` — ici `1AbCdEfGhIjKlMnOp` — c'est l'identifiant du fichier.
5. Construis ce lien à la place : `https://drive.google.com/uc?export=view&id=1AbCdEfGhIjKlMnOp`
6. Colle **ce nouveau lien** dans le petit champ texte (pas besoin de passer par "Choisir une photo").

*(Limite à connaître avec cette méthode : Google peut, rarement, bloquer temporairement l'affichage si une
image est vue un très grand nombre de fois dans la journée — la Méthode 1 n'a pas cette limite puisque
l'image est servie directement par ton propre serveur.)*

### Pour les vidéos (tutos)

Rien à compresser ni convertir : colle simplement le lien YouTube ou TikTok tel quel dans le champ "Lien
vidéo", juste en dessous de la photo de couverture. Un lien YouTube s'affiche directement dans la page ;
un lien TikTok affiche un bouton "Voir la vidéo" qui ouvre TikTok.

---

## 7. Changer le logo

Le logo affiché en haut du site (à côté de "Clara's Kitchenette") est un petit dessin vectoriel (SVG) écrit
directement dans `public/index.html`, vers la ligne 53 — cherche `class="brand"` dans le fichier. Je l'ai
mis à jour dans cette version pour utiliser ton vrai monogramme (le cercle doré avec la fleur d'hibiscus et
"CK"), assorti à ta charte graphique.

**Pour le changer à nouveau plus tard, deux façons :**

- **Utiliser une image à toi** (un logo que tu as fait dessiner, par exemple) : dépose le fichier dans
  `public/img/logo.png`, puis remplace tout le bloc `<svg>...</svg>` par :
  `<img src="/img/logo.png" alt="Clara's Kitchenette" width="42" height="42">`
- **Me redonner le fichier `.svg` de ton logo** (ou me décrire ce que tu veux) et je te prépare la version
  finale, à coller au même endroit.

Le favicon (petite icône dans l'onglet du navigateur, fichier `public/favicon.ico`) est basé sur ce même
logo — si tu le changes, dis-le-moi et je régénère aussi le favicon assorti.

## 8. Une photo ne s'affiche pas / ne se met pas à jour : comment vérifier

**Mise à jour : un vrai bug d'affichage a été corrigé dans cette version.** Les photos pouvaient être bien
enregistrées dans la base de données, mais rester invisibles à l'écran à cause d'une règle CSS (le calcul
de hauteur des images dans certains blocs ne se faisait pas de façon fiable dans tous les navigateurs).
C'est corrigé dans `public/css/style.css` — renvoie simplement ce fichier sur GitHub pour que Render le
redéploie, et les photos déjà enregistrées devraient apparaître immédiatement, sans avoir besoin de les
ré-ajouter.

Si un souci persiste malgré tout, voici comment vérifier :

**D'abord, un point important sur les rôles de chaque outil**, car c'est une confusion fréquente :

- **GitHub** héberge uniquement le **code** de ton site (les fichiers de ce projet). Il ne reçoit jamais
  les photos ajoutées depuis l'espace pro.
- **MongoDB Atlas** héberge le **contenu** : tes plats, tutos, avis, réglages — **et les photos elles-mêmes**
  quand tu utilises le bouton "Choisir une photo" (elles y sont stockées directement, compressées).
- Tu n'as donc jamais besoin de toucher à GitHub pour ajouter ou changer une photo — seul l'espace pro
  (`/#pro`) du site suffit. GitHub ne sert qu'à mettre à jour le *code* si un jour je te fournis une nouvelle
  version des fichiers.

**Si une photo ajoutée depuis l'espace pro ne semble pas apparaître, vérifie dans cet ordre :**

1. **Le message de confirmation.** Juste après avoir choisi la photo, un texte doit apparaître sous le
   bouton : *"Photo prête (xxx Ko, ...)"*. S'il n'apparaît jamais, la compression a échoué — regarde l'étape 4.
2. **Le bouton "Enregistrer".** As-tu bien cliqué sur "Enregistrer le plat" / "Enregistrer le tuto" en bas du
   formulaire après avoir choisi la photo ? Choisir une photo ne suffit pas, il faut ensuite valider le formulaire.
3. **Le message après l'enregistrement.** Un petit message doit apparaître en bas de l'écran : soit
   *"Plat enregistré."* (succès), soit un message d'erreur. S'il indique une erreur, note exactement ce
   qu'il dit.
4. **La console du navigateur (pour une vérification plus poussée).** Fais un clic droit sur la page → **Inspecter**
   → onglet **Console**. Recommence l'ajout de la photo : si une ligne apparaît en rouge, elle m'aidera
   à identifier précisément le problème — copie-la moi.
5. **As-tu bien mis en ligne la dernière version du code ?** La fonction "Choisir une photo" fait partie
   d'une mise à jour récente. Vérifie que le fichier `public/js/upload.js` existe bien dans ton dépôt GitHub
   — s'il n'y est pas, c'est que cette version n'a pas encore été envoyée/déployée.
6. **Recharge la page.** Après un enregistrement réussi, la page qui a servi à l'ajouter se met à jour toute
   seule. Mais si tu regardais le site depuis un **autre onglet ou un autre appareil** déjà ouvert avant
   l'ajout, il faut le recharger (F5) pour qu'il aille chercher les nouvelles données.

Si après ces vérifications ça ne fonctionne toujours pas, dis-moi à quelle étape ça coince (et le message
d'erreur exact s'il y en a un) — je pourrai cibler la correction.

## 9. Faire apparaître ton site sur Google, gratuitement

Deux leviers gratuits, à faire tous les deux :

### A. Google Search Console (indexation technique)

1. Va sur [search.google.com/search-console](https://search.google.com/search-console) et connecte-toi avec
   un compte Google.
2. **Ajouter une propriété** → choisis **"Préfixe d'URL"** → colle l'adresse de ton site
   (ex. `https://clara-kitchenette.onrender.com/`).
3. Pour la vérification, choisis la méthode **"Balise HTML"**. Google t'affiche une ligne du type :
   `<meta name="google-site-verification" content="abcdef123..." />`
4. Ouvre `public/index.html`, repère ce commentaire près du haut du fichier :
   ```html
   <!-- <meta name="google-site-verification" content="COLLE-TON-CODE-ICI" /> -->
   ```
   Remplace cette ligne par la vraie balise que Google t'a donnée (enlève les `<!--` et `-->`).
5. Renvoie le fichier modifié sur GitHub (Render redéploie automatiquement).
6. Reviens sur Search Console et clique **Vérifier**.
7. Une fois vérifié, va dans **Sitemaps** (menu de gauche) → soumets `sitemap.xml`
   (déjà présent dans le projet, à l'adresse `https://TON-SITE.onrender.com/sitemap.xml` — pense à corriger
   l'adresse à l'intérieur de `sitemap.xml`, de `robots.txt`, et de la balise `<link rel="canonical">` tout
   en haut de `index.html`, avec ta vraie adresse Render une fois déployé).
8. Va dans **Inspection de l'URL**, colle l'adresse de ton site, clique **Demander une indexation**. Cela
   accélère la première prise en compte par Google (au lieu d'attendre qu'il passe tout seul).

*(Le site étant une page unique qui charge son contenu dynamiquement, Google sait généralement bien
l'analyser aujourd'hui, mais l'indexation peut prendre un peu plus de temps qu'un site classique. Ce n'est
pas bloquant, juste un peu moins immédiat.)*

### B. Google Business Profile (le plus important pour être trouvée localement)

Pour une activité comme la tienne, ce levier compte souvent plus que le site lui-même dans les recherches
du type "traiteur africain Lyon" :

1. Va sur [google.com/business](https://www.google.com/business/) → **Gérer maintenant**.
2. Crée ta fiche : nom "Clara's Kitchenette", catégorie "Traiteur" ou "Restaurant africain", zone de
   livraison (Lyon + France), horaires, numéro de téléphone, lien vers ton site Render.
3. Ajoute des photos de tes plats (les mêmes que celles de ton site, par exemple).
4. Valide la fiche (Google envoie un code par courrier, SMS ou appel selon les cas).
5. Une fois validée, demande à tes premiers clients satisfaits d'y laisser un avis Google — c'est ce qui
   pèse le plus dans le classement local.

## 10. Tester sur ton ordinateur avant de mettre en ligne (facultatif)

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

## 11. Après la mise en ligne

- **Changer le mot de passe de l'espace pro** : va dans Render → ton service → **Environment** → modifie
  `ADMIN_PASSCODE` → **Save Changes** (le service redémarre tout seul).
- **Mentions légales** : le site n'en génère pas automatiquement. Avant l'ouverture au public, ajoute tes
  informations légales réelles (SIRET, adresse si tu en as une) — dis-le-moi si tu veux que je prépare
  cette page avec toi.
- **Remplacer le contenu de démonstration** : les plats et tutos visibles au premier lancement sont des
  exemples. Modifie-les ou supprime-les depuis l'espace pro (`/#pro`).

---

## 12. Bon à savoir sur les limites de cette version gratuite

- **Sécurité de l'espace pro :** le mot de passe est vérifié par le serveur (donc plus solide qu'un simple
  code caché dans une page web), mais il n'y a pas de compte utilisateur individuel ni de limite de
  tentatives. Largement suffisant pour démarrer ; à renforcer si l'activité grandit beaucoup.
- **MongoDB Atlas gratuit :** 512 Mo de stockage. Le texte (plats, tutos, avis, réglages) prend une place
  négligeable ; ce sont les photos envoyées depuis l'espace pro qui comptent le plus, mais comme elles sont
  compressées à ~550 Ko maximum avant l'envoi, cela laisse de la place pour plusieurs centaines de photos.
  Si tu approches un jour de la limite, MongoDB Atlas affiche une alerte dans son tableau de bord bien avant
  que ce soit critique.
- **Render gratuit :** le service s'endort sans visite ; UptimeRobot limite le problème mais ne l'élimine
  pas à 100 %.

Si tu as une question en cours de route ou qu'une étape bloque, montre-moi le message d'erreur exact —
je t'aiderai à le résoudre.
