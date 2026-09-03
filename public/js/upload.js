/* =========================================================
   UPLOAD.JS — Choisir une photo depuis le téléphone/ordinateur
   et la compresser avant de l'envoyer au serveur.
   Ne connaît ni l'API, ni l'affichage de l'app : juste la photo.
   ========================================================= */

var Upload = {};

(function () {
  "use strict";

  var MAX_DIMENSION = 1280;   // largeur/hauteur max en pixels après redimensionnement
  var TARGET_MAX_BYTES = 550 * 1024; // 550 Ko visés par photo, pour rester léger en base
  var START_QUALITY = 0.82;
  var MIN_QUALITY = 0.3;
  var QUALITY_STEP = 0.08;

  // Lit un fichier image, le redimensionne et le recompresse en JPEG.
  // Renvoie une promesse résolue avec { dataUri, approxKB, width, height }.
  Upload.compressImageFile = function (file) {
    return new Promise(function (resolve, reject) {
      if (!file || file.type.indexOf("image/") !== 0) {
        reject(new Error("Ce fichier n'est pas une image."));
        return;
      }
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Impossible de lire ce fichier.")); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error("Image invalide ou abîmée.")); };
        img.onload = function () {
          var scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));

          var canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          var ctx = canvas.getContext("2d");
          ctx.fillStyle = "#FFFFFF"; // évite un fond noir si la photo d'origine a de la transparence (PNG)
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          var quality = START_QUALITY;
          var dataUri = canvas.toDataURL("image/jpeg", quality);

          // Redescend la qualité tant que le fichier est plus lourd que la cible.
          while (approxBytes(dataUri) > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
            quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
            dataUri = canvas.toDataURL("image/jpeg", quality);
          }

          resolve({
            dataUri: dataUri,
            approxKB: Math.round(approxBytes(dataUri) / 1024),
            width: w, height: h
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  function approxBytes(dataUri) {
    // Une chaîne base64 pèse environ 4/3 du poids réel des données.
    var b64 = dataUri.split(",")[1] || "";
    return Math.round(b64.length * 0.75);
  }

  // Relie un input file + un champ texte (URL) + un aperçu, en un seul appel.
  // - Choisir un fichier -> compression -> remplit le champ URL avec le résultat.
  // - Le champ URL reste modifiable à la main (ex. coller un lien Google Drive).
  // Renvoie { refresh } pour forcer l'aperçu à se mettre à jour (utile en mode édition).
  Upload.wirePicker = function (opts) {
    var fileInput = document.getElementById(opts.fileInputId);
    var urlInput = document.getElementById(opts.urlInputId);
    var preview = document.getElementById(opts.previewId);
    var status = document.getElementById(opts.statusId);
    var clearBtn = document.getElementById(opts.clearBtnId);

    function refresh() {
      var val = (urlInput.value || "").trim();
      if (val) {
        preview.innerHTML = '<img src="' + val.replace(/"/g, "&quot;") + '" alt="" onerror="this.parentElement.classList.add(\'empty\');this.remove()">';
        preview.classList.remove("empty");
        if (clearBtn) clearBtn.hidden = false;
      } else {
        preview.innerHTML = "";
        preview.classList.add("empty");
        if (clearBtn) clearBtn.hidden = true;
      }
    }

    urlInput.addEventListener("input", function () { status.textContent = ""; refresh(); });

    fileInput.addEventListener("change", function () {
      var file = fileInput.files[0];
      fileInput.value = ""; // permet de resélectionner le même fichier plus tard si besoin
      if (!file) return;
      status.textContent = "Compression en cours…";
      Upload.compressImageFile(file).then(function (res) {
        urlInput.value = res.dataUri;
        refresh();
        status.textContent = "Photo prête (" + res.approxKB + " Ko, " + res.width + "×" + res.height + " px).";
      }).catch(function (err) {
        status.textContent = "Erreur : " + err.message;
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        urlInput.value = ""; status.textContent = ""; refresh();
      });
    }

    refresh();
    return { refresh: refresh };
  };

})();
