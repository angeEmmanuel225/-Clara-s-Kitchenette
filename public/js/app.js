/* =========================================================
   APP.JS — État de l'application, affichage et interactions.
   Ce fichier utilise les fonctions de api.js pour parler au
   serveur ; il ne fait aucun appel réseau lui-même.
   ========================================================= */

(function () {
"use strict";

var DEFAULT_SETTINGS = {
  whatsapp: "33677949139",
  ville: "Lyon",
  tiktok: "@claras.kitchenette",
  heroTitle: "Les saveurs d'Afrique, cuisinées avec amour",
  heroSub: "Togo, Côte d'Ivoire, Mali, Burkina Faso — et quelques classiques d'Europe. Préparé maison à Lyon, livré partout en France.",
  heroPhoto: "",
  about: "Clara's Kitchenette prépare, à la commande, des plats togolais, ivoiriens, maliens et burkinabés — avec quelques classiques européens en clin d'œil. Chaque part est cuisinée maison à Lyon puis livrée avec soin partout en France."
};

/* ============ STATE (en mémoire, remis à zéro à chaque chargement) ============ */
var STATE = {
  dishes: [], tutorials: [], reviews: [], settings: {},
  cart: [], isAdmin: false, filterCategory: "Tous",
  activeTutorial: null, adminTab: "plats", ratingDraft: 0
};

/* ============ PETITS OUTILS ============ */
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
function euros(n){ return (Math.round(n*100)/100).toFixed(2).replace(".",",") + " €"; }
function normalizeIds(arr){ return (arr||[]).map(function(x){ x.id = x._id || x.id; return x; }); }
function plateIcon(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.2"/></svg>'; }
function categoryAccent(cat){
  if(cat==="Boissons") return "linear-gradient(135deg,var(--aubergine),#7a3c56)";
  if(cat==="Desserts") return "linear-gradient(135deg,#e58a8a,var(--terracotta))";
  if(cat==="Accompagnements") return "linear-gradient(135deg,var(--gold),#c98a1f)";
  return "linear-gradient(135deg,var(--gold),var(--terracotta))";
}
function mediaBlock(photo, alt, accentBg){
  var img = photo ? '<img src="'+esc(photo)+'" alt="'+esc(alt)+'" loading="lazy" onerror="this.remove()">' : "";
  return '<div style="background:'+accentBg+';position:absolute;inset:0;"></div>'+img+'<span class="thumb-fallback">'+plateIcon()+'</span>';
}
function youTubeId(url){
  if(!url) return null;
  var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}
function showToast(msg){
  var t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(function(){ t.classList.remove("show"); }, 2600);
}
function starsSvg(rating){
  var out = "";
  for(var i=1;i<=5;i++){
    out += '<svg viewBox="0 0 24 24" fill="'+(i<=rating?"currentColor":"none")+'" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg>';
  }
  return out;
}

/* ============ CHARGEMENT DES DONNÉES (via api.js) ============ */
function loadAll(){
  return Promise.all([
    API.getDishes(), API.getTutorials(), API.getReviews(), API.getSettings()
  ]).then(function(res){
    var dishesRes = res[0], tutosRes = res[1], reviewsRes = res[2], settingsRes = res[3];
    if(!dishesRes.ok || !tutosRes.ok || !reviewsRes.ok || !settingsRes.ok){
      throw new Error("Le serveur a répondu avec une erreur.");
    }
    STATE.dishes = normalizeIds(dishesRes.data);
    STATE.tutorials = normalizeIds(tutosRes.data);
    STATE.reviews = normalizeIds(reviewsRes.data);
    STATE.settings = Object.assign({}, DEFAULT_SETTINGS, settingsRes.data || {});
  });
}

/* ============ LIENS WHATSAPP ============ */
function waBaseLink(text){
  var num = (STATE.settings.whatsapp || DEFAULT_SETTINGS.whatsapp).replace(/[^0-9]/g,"");
  return "https://wa.me/" + num + (text ? "?text=" + encodeURIComponent(text) : "");
}
function refreshWaLinks(){
  var greet = "Bonjour Clara's Kitchenette, je voudrais des informations sur vos plats.";
  ["waHeaderBtn","heroWaBtn","aboutWaBtn","footWa","waFloatBtn"].forEach(function(id){
    var el = document.getElementById(id); if(el) el.href = waBaseLink(greet);
  });
  var tk = document.getElementById("footTiktok");
  if(tk) tk.href = "https://www.tiktok.com/" + (STATE.settings.tiktok||"").replace(/^@/,"@");
}

/* ============ ROUTEUR (navigation entre les pages) ============ */
function route(){
  var hash = (location.hash || "#accueil").replace("#","");
  if(!document.getElementById("view-"+hash)) hash = "accueil";
  document.querySelectorAll(".nav-link").forEach(function(a){ a.classList.toggle("active", a.dataset.view===hash); });
  document.querySelectorAll(".view").forEach(function(v){ v.classList.toggle("active", v.id==="view-"+hash); });
  var titles = {
    accueil:"Clara's Kitchenette — Cuisine africaine faite maison à Lyon, livrée en France",
    carte:"La carte — Clara's Kitchenette",
    tutos:"Tutos & recettes — Clara's Kitchenette",
    apropos:"Service & À propos — Clara's Kitchenette",
    avis:"Avis clients — Clara's Kitchenette",
    pro:"Espace pro — Clara's Kitchenette"
  };
  document.title = titles[hash] || titles.accueil;
  window.scrollTo(0,0);
  if(hash==="tutos") renderTutos();
  if(hash==="pro") renderAdmin();
  if(hash==="avis") renderAvis();
  if(hash==="carte") renderCarte();
}
window.addEventListener("hashchange", route);

/* ============ ACCUEIL ============ */
function renderAccueil(){
  document.getElementById("heroTitle").textContent = STATE.settings.heroTitle;
  document.getElementById("heroSub").textContent = STATE.settings.heroSub;
  document.getElementById("heroCityBadge").textContent = (STATE.settings.ville||"LYON").toUpperCase();
  document.getElementById("heroMedia").innerHTML = mediaBlock(STATE.settings.heroPhoto, "Clara's Kitchenette", "linear-gradient(135deg,var(--gold),var(--terracotta))");
  document.getElementById("infoCity").textContent = (STATE.settings.ville||"Lyon") + " — livraison dans toute la France";
  document.getElementById("infoPhone").textContent = "0" + (STATE.settings.whatsapp||"").replace(/^33/,"").replace(/(\d{2})(?=\d)/g,"$1 ");
  document.getElementById("infoTiktok").textContent = STATE.settings.tiktok;
  document.getElementById("aboutText").textContent = STATE.settings.about;

  var featured = STATE.dishes.filter(function(d){return d.featured;})[0] || STATE.dishes[0];
  var fb = document.getElementById("featureBlock");
  if(featured){
    fb.innerHTML =
      '<div class="feature-media">'+mediaBlock(featured.photo, featured.name, categoryAccent(featured.category))+'</div>'+
      '<div class="feature-body"><span class="eyebrow">'+esc(featured.category)+'</span>'+
      '<h3>'+esc(featured.name)+'</h3><p>'+esc(featured.desc)+'</p>'+
      '<div class="feature-price">'+euros(featured.price)+'</div>'+
      '<a href="#carte" class="btn btn-primary btn-sm">Commander ce plat</a></div>';
  } else { fb.innerHTML = ""; }

  document.getElementById("homeDishes").innerHTML = STATE.dishes.slice(0,3).map(function(d){
    return '<div class="card"><div class="card-media">'+mediaBlock(d.photo,d.name,categoryAccent(d.category))+'</div>'+
      '<div class="card-body"><h3>'+esc(d.name)+'</h3><p>'+esc(d.desc)+'</p>'+
      '<div class="card-foot"><span class="price-tag">'+euros(d.price)+'</span><a href="#carte" class="btn btn-outline btn-sm">Voir</a></div></div></div>';
  }).join("");

  var homeTutos = STATE.tutorials.slice(0,3);
  document.getElementById("homeTutos").innerHTML = homeTutos.length ? homeTutos.map(function(t){
    return '<div class="card"><div class="card-media">'+mediaBlock(t.photo,t.title,"linear-gradient(135deg,var(--aubergine),#7a3c56)")+'</div>'+
      '<div class="card-body"><h3>'+esc(t.title)+'</h3><p>'+esc(t.summary)+'</p>'+
      '<a href="#tutos" class="btn btn-outline btn-sm" style="align-self:flex-start;">Voir le tuto</a></div></div>';
  }).join("") : '<p style="color:var(--text-soft)">Bientôt les premiers tutos.</p>';

  var recentReviews = STATE.reviews.slice(-3).reverse();
  var hr = document.getElementById("homeReviews");
  hr.innerHTML = recentReviews.length===0
    ? '<div class="review-empty">Les avis de tes premiers clients apparaîtront ici.</div>'
    : '<div class="grid grid-3">' + recentReviews.map(function(r){
        return '<div class="card"><div class="card-body"><div class="stars">'+starsSvg(r.rating)+'</div>'+
          '<p style="margin-top:8px;">"'+esc(r.comment)+'"</p><strong style="font-size:13px;">'+esc(r.name)+'</strong></div></div>';
      }).join("") + '</div>';

  refreshWaLinks();
}

/* ============ CARTE ============ */
function renderCarte(){
  var cats = ["Tous"].concat(STATE.dishes.map(function(d){return d.category;}).filter(function(v,i,a){return a.indexOf(v)===i;}));
  document.getElementById("catFilters").innerHTML = cats.map(function(c){
    return '<button class="cat-btn'+(STATE.filterCategory===c?" active":"")+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>';
  }).join("");
  var list = STATE.dishes.filter(function(d){ return STATE.filterCategory==="Tous" || d.category===STATE.filterCategory; });
  var ml = document.getElementById("menuList");
  if(list.length===0){ ml.innerHTML = '<p style="padding:24px 0;color:var(--text-soft);">Aucun plat dans cette catégorie pour le moment.</p>'; return; }
  ml.innerHTML = list.map(function(d){
    var inCart = STATE.cart.filter(function(c){return c.id===d.id;})[0];
    var qty = inCart ? inCart.qty : 0;
    return '<div class="menu-row" data-id="'+d.id+'">'+
      '<div class="menu-thumb">'+mediaBlock(d.photo,d.name,categoryAccent(d.category))+'</div>'+
      '<div class="menu-info"><h3>'+esc(d.name)+' <span class="pill-tag">'+esc(d.category)+'</span></h3><p>'+esc(d.desc)+'</p></div>'+
      '<div class="menu-price">'+euros(d.price)+'</div>'+
      '<div class="qty-stepper"><button type="button" class="qminus" aria-label="Retirer une part">−</button>'+
      '<span class="qval">'+qty+'</span><button type="button" class="qplus" aria-label="Ajouter une part">+</button></div>'+
      '</div>';
  }).join("");
}
document.addEventListener("click", function(e){
  var catBtn = e.target.closest(".cat-btn");
  if(catBtn){ STATE.filterCategory = catBtn.dataset.cat; renderCarte(); return; }
  var row = e.target.closest(".menu-row");
  if(row && (e.target.closest(".qplus") || e.target.closest(".qminus"))){
    var id = row.dataset.id;
    var dish = STATE.dishes.filter(function(d){return d.id===id;})[0];
    if(!dish) return;
    var item = STATE.cart.filter(function(c){return c.id===id;})[0];
    if(e.target.closest(".qplus")){
      if(item) item.qty++; else STATE.cart.push({id:id,name:dish.name,price:dish.price,qty:1});
    } else if(item){
      item.qty--; if(item.qty<=0) STATE.cart = STATE.cart.filter(function(c){return c.id!==id;});
    }
    row.querySelector(".qval").textContent = (STATE.cart.filter(function(c){return c.id===id;})[0]||{}).qty || 0;
    updateCartCount();
  }
});

/* ============ PANIER ============ */
function updateCartCount(){
  var count = STATE.cart.reduce(function(s,i){return s+i.qty;},0);
  var badge = document.getElementById("cartCount");
  badge.textContent = count; badge.hidden = count===0;
  renderCartBody();
}
function renderCartBody(){
  var body = document.getElementById("cartBody"), foot = document.getElementById("cartFoot");
  if(STATE.cart.length===0){
    body.innerHTML = '<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2l2.6 12.4a2 2 0 002 1.6h8.4a2 2 0 002-1.6L21 7H6"/></svg><p>Ta commande est vide.<br>Ajoute des plats depuis la carte.</p></div>';
    foot.hidden = true; return;
  }
  foot.hidden = false;
  body.innerHTML = STATE.cart.map(function(i){
    return '<div class="cart-item"><div><div class="cart-item-name">'+esc(i.name)+'</div>'+
      '<div class="cart-item-meta">'+i.qty+' × '+euros(i.price)+'</div>'+
      '<button class="cart-item-remove" data-id="'+i.id+'">Retirer</button></div>'+
      '<div style="font-weight:700;">'+euros(i.price*i.qty)+'</div></div>';
  }).join("");
  var total = STATE.cart.reduce(function(s,i){return s+i.price*i.qty;},0);
  document.getElementById("cartTotal").textContent = euros(total);
}
document.getElementById("cartBody").addEventListener("click", function(e){
  var btn = e.target.closest(".cart-item-remove");
  if(!btn) return;
  STATE.cart = STATE.cart.filter(function(c){return c.id!==btn.dataset.id;});
  updateCartCount(); renderCarte();
});
function openCart(){ document.getElementById("cartDrawer").classList.add("open"); document.getElementById("cartOverlay").classList.add("open"); }
function closeCart(){ document.getElementById("cartDrawer").classList.remove("open"); document.getElementById("cartOverlay").classList.remove("open"); }
document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("cartCloseBtn").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", closeCart);

document.getElementById("sendOrderBtn").addEventListener("click", function(){
  if(STATE.cart.length===0) return;
  var name = document.getElementById("custName").value.trim();
  var address = document.getElementById("custAddress").value.trim();
  var date = document.getElementById("custDate").value;
  var lines = ["Bonjour Clara's Kitchenette, je souhaite commander :",""];
  STATE.cart.forEach(function(i){ lines.push("- "+i.qty+" x "+i.name+" ("+euros(i.price*i.qty)+")"); });
  var total = STATE.cart.reduce(function(s,i){return s+i.price*i.qty;},0);
  lines.push("", "Total estime : "+euros(total));
  if(name) lines.push("", "Nom : "+name);
  if(address) lines.push("Adresse de livraison : "+address);
  if(date) lines.push("Date souhaitee : "+date);
  lines.push("", "Merci !");
  window.open(waBaseLink(lines.join("\n")), "_blank");
});

/* ============ TUTOS ============ */
function renderTutos(){
  var grid = document.getElementById("tutoGrid");
  var detailWrap = document.getElementById("tutoDetailWrap");
  if(STATE.tutorials.length===0){ grid.innerHTML = '<p style="color:var(--text-soft);">Les premiers tutos arrivent bientôt.</p>'; }
  else {
    grid.innerHTML = STATE.tutorials.map(function(t){
      return '<div class="card" style="cursor:pointer;" data-open-tuto="'+t.id+'"><div class="card-media">'+mediaBlock(t.photo,t.title,"linear-gradient(135deg,var(--aubergine),#7a3c56)")+'</div>'+
        '<div class="card-body"><h3>'+esc(t.title)+'</h3><p>'+esc(t.summary)+'</p>'+
        '<span class="btn btn-outline btn-sm" style="align-self:flex-start;">Voir le tuto</span></div></div>';
    }).join("");
  }
  if(STATE.activeTutorial){
    var t = STATE.tutorials.filter(function(x){return x.id===STATE.activeTutorial;})[0];
    if(t){
      var ytId = youTubeId(t.video);
      var mediaHtml;
      if(ytId){ mediaHtml = '<div class="tuto-media"><iframe src="https://www.youtube.com/embed/'+ytId+'" title="'+esc(t.title)+'" allowfullscreen></iframe></div>'; }
      else if(t.photo){ mediaHtml = '<div class="tuto-media"><img src="'+esc(t.photo)+'" alt="'+esc(t.title)+'" onerror="this.parentElement.remove()"></div>'; }
      else { mediaHtml = ""; }
      var videoLink = (!ytId && t.video) ? '<a class="video-link-btn" href="'+esc(t.video)+'" target="_blank" rel="noopener">Voir la vidéo</a>' : "";
      var ing = (t.ingredients||"").split("\n").filter(Boolean);
      var steps = (t.steps||"").split("\n").filter(Boolean);
      detailWrap.innerHTML = '<div class="tuto-detail"><a href="#" class="back" id="tutoBackBtn">← Retour aux tutos</a>'+
        '<h2>'+esc(t.title)+'</h2><p style="color:var(--text-soft);">'+esc(t.summary)+'</p>'+
        mediaHtml + (videoLink?'<p>'+videoLink+'</p>':'') +
        '<div class="tuto-cols"><div><h4>Ingrédients</h4><ul>'+ing.map(function(i){return '<li>'+esc(i)+'</li>';}).join("")+'</ul></div>'+
        '<div><h4>Étapes</h4><ol>'+steps.map(function(s){return '<li>'+esc(s)+'</li>';}).join("")+'</ol></div></div></div>';
    }
  } else { detailWrap.innerHTML = ""; }
}
document.getElementById("tutoGrid").addEventListener("click", function(e){
  var card = e.target.closest("[data-open-tuto]");
  if(!card) return;
  STATE.activeTutorial = card.dataset.openTuto;
  renderTutos();
  document.getElementById("tutoDetailWrap").scrollIntoView({behavior:"smooth"});
});
document.getElementById("tutoDetailWrap").addEventListener("click", function(e){
  if(e.target.id==="tutoBackBtn"){ e.preventDefault(); STATE.activeTutorial=null; renderTutos(); }
});

/* ============ AVIS ============ */
function renderAvis(){
  var avg = STATE.reviews.length ? STATE.reviews.reduce(function(s,r){return s+r.rating;},0)/STATE.reviews.length : 0;
  var rs = document.getElementById("ratingSummary");
  rs.innerHTML = STATE.reviews.length===0
    ? '<div><div class="rating-big">—</div></div><p style="margin:0;color:var(--text-soft);">Aucun avis pour le moment. Sois la première personne à en laisser un !</p>'
    : '<div><div class="rating-big">'+avg.toFixed(1)+'</div><div class="stars">'+starsSvg(Math.round(avg))+'</div></div>'+
      '<p style="margin:0;color:var(--text-soft);">'+STATE.reviews.length+' avis client'+(STATE.reviews.length>1?"s":"")+'</p>';

  var list = document.getElementById("reviewList");
  list.innerHTML = STATE.reviews.length===0 ? "" : STATE.reviews.slice().reverse().map(function(r){
    var date = r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR") : "";
    return '<div class="review-item"><div class="review-head"><span class="review-name">'+esc(r.name)+'</span>'+
      '<span class="review-date">'+esc(date)+'</span></div><div class="stars">'+starsSvg(r.rating)+'</div>'+
      '<p style="margin-top:6px;">'+esc(r.comment)+'</p></div>';
  }).join("");

  var sp = document.getElementById("starPicker");
  sp.innerHTML = [1,2,3,4,5].map(function(i){
    return '<button type="button" data-star="'+i+'" class="'+(i<=STATE.ratingDraft?"on":"")+'"><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/></svg></button>';
  }).join("");
}
document.getElementById("starPicker").addEventListener("click", function(e){
  var b = e.target.closest("button"); if(!b) return;
  STATE.ratingDraft = parseInt(b.dataset.star,10); renderAvis();
});
document.getElementById("reviewForm").addEventListener("submit", function(e){
  e.preventDefault();
  var name = document.getElementById("rvName").value.trim();
  var comment = document.getElementById("rvComment").value.trim();
  if(!name || !comment || STATE.ratingDraft===0){ showToast("Ajoute ton prénom, ta note et un commentaire."); return; }
  API.createReview({name:name, comment:comment, rating:STATE.ratingDraft}).then(function(res){
    if(!res.ok){ showToast((res.data && res.data.error) || "Erreur lors de l'envoi."); return; }
    return loadAll().then(function(){
      document.getElementById("reviewForm").reset(); STATE.ratingDraft = 0;
      renderAvis(); showToast("Merci pour ton avis !");
    });
  }).catch(function(){ showToast("Impossible de contacter le serveur."); });
});

/* ============ FAQ ============ */
var FAQ = [
  {q:"Quels sont les délais de livraison ?", a:"En général sous 24 à 72h selon ta ville et la disponibilité du jour — le créneau exact est confirmé par WhatsApp après ta commande."},
  {q:"Livrez-vous partout en France ?", a:"Oui, la livraison est possible dans toute la France. Les frais et délais varient selon la distance depuis Lyon."},
  {q:"Comment se passe le paiement ?", a:"La commande est d'abord confirmée sur WhatsApp (plats, quantités, adresse), puis les modalités de paiement te sont communiquées directement."},
  {q:"Puis-je signaler une allergie ?", a:"Bien sûr — précise-le dans ton message WhatsApp, certains plats contiennent arachides, gluten ou fruits de mer."}
];
function renderFaq(){
  document.getElementById("faqList").innerHTML = FAQ.map(function(f,i){
    return '<div class="faq-item" data-i="'+i+'"><button class="faq-q" type="button">'+esc(f.q)+'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button><div class="faq-a"><p>'+esc(f.a)+'</p></div></div>';
  }).join("");
}
document.getElementById("faqList").addEventListener("click", function(e){
  var q = e.target.closest(".faq-q"); if(!q) return;
  q.parentElement.classList.toggle("open");
});

/* ============ SÉLECTEURS DE PHOTO (upload + compression) ============ */
var dishPhotoPicker = Upload.wirePicker({
  fileInputId:"dishPhotoFile", urlInputId:"dishPhoto", previewId:"dishPhotoPreview",
  statusId:"dishPhotoStatus", clearBtnId:"dishPhotoClear"
});
var tutoPhotoPicker = Upload.wirePicker({
  fileInputId:"tutoPhotoFile", urlInputId:"tutoPhoto", previewId:"tutoPhotoPreview",
  statusId:"tutoPhotoStatus", clearBtnId:"tutoPhotoClear"
});
var heroPhotoPicker = Upload.wirePicker({
  fileInputId:"setHeroPhotoFile", urlInputId:"setHeroPhoto", previewId:"setHeroPhotoPreview",
  statusId:"setHeroPhotoStatus", clearBtnId:"setHeroPhotoClear"
});

/* ============ ESPACE PRO ============ */
function renderAdmin(){
  var lockWrap = document.getElementById("adminLockWrap");
  var areaWrap = document.getElementById("adminAreaWrap");
  if(!STATE.isAdmin){
    areaWrap.hidden = true;
    lockWrap.innerHTML = '<div class="admin-lock"><h2 style="font-size:20px;">Espace pro</h2>'+
      '<p style="color:var(--text-soft);font-size:14px;">Entre le mot de passe de gestion pour ajouter tes plats, tes tutos et gérer les avis.</p>'+
      '<form id="adminLoginForm"><div class="field" style="text-align:left;"><label for="adminPass">Mot de passe</label>'+
      '<input id="adminPass" type="password" required></div>'+
      '<button class="btn btn-primary btn-block" type="submit">Entrer</button></form></div>';
    document.getElementById("adminLoginForm").addEventListener("submit", function(e){
      e.preventDefault();
      var pass = document.getElementById("adminPass").value;
      API.adminLogin(pass).then(function(res){
        if(res.ok && res.data.ok){ STATE.isAdmin = true; renderAdmin(); }
        else { showToast("Mot de passe incorrect."); }
      }).catch(function(){ showToast("Impossible de contacter le serveur."); });
    });
    return;
  }
  lockWrap.innerHTML = ""; areaWrap.hidden = false;
  document.querySelectorAll(".admin-panel").forEach(function(p){ p.classList.toggle("active", p.id==="panel-"+STATE.adminTab); });
  document.querySelectorAll(".admin-tab-btn").forEach(function(b){ b.classList.toggle("active", b.dataset.tab===STATE.adminTab); });
  renderDishAdminList(); renderTutoAdminList(); renderReviewAdminList(); fillSettingsForm();
}
document.getElementById("adminLogoutBtn").addEventListener("click", function(){
  STATE.isAdmin=false; API.adminLogout(); renderAdmin();
});
document.getElementById("adminTabs").addEventListener("click", function(e){
  var b = e.target.closest(".admin-tab-btn"); if(!b) return;
  STATE.adminTab = b.dataset.tab; renderAdmin();
});

function renderDishAdminList(){
  document.getElementById("dishAdminList").innerHTML = STATE.dishes.map(function(d){
    return '<div class="admin-list-item"><div><strong>'+esc(d.name)+'</strong><div class="meta">'+esc(d.category)+' · '+euros(d.price)+'</div></div>'+
      '<div class="admin-item-actions"><button class="icon-action" data-edit-dish="'+d.id+'" aria-label="Modifier"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>'+
      '<button class="icon-action" data-del-dish="'+d.id+'" aria-label="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14"/></svg></button></div></div>';
  }).join("") || '<p style="color:var(--text-soft);">Aucun plat pour le moment.</p>';
}
function renderTutoAdminList(){
  document.getElementById("tutoAdminList").innerHTML = STATE.tutorials.map(function(t){
    return '<div class="admin-list-item"><div><strong>'+esc(t.title)+'</strong><div class="meta">'+esc(t.summary||"")+'</div></div>'+
      '<div class="admin-item-actions"><button class="icon-action" data-edit-tuto="'+t.id+'" aria-label="Modifier"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>'+
      '<button class="icon-action" data-del-tuto="'+t.id+'" aria-label="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14"/></svg></button></div></div>';
  }).join("") || '<p style="color:var(--text-soft);">Aucun tuto pour le moment.</p>';
}
function renderReviewAdminList(){
  document.getElementById("reviewAdminList").innerHTML = STATE.reviews.slice().reverse().map(function(r){
    return '<div class="admin-list-item"><div><strong>'+esc(r.name)+'</strong> — <span class="stars" style="display:inline-flex;">'+starsSvg(r.rating)+'</span>'+
      '<div class="meta">'+esc(r.comment)+'</div></div>'+
      '<div class="admin-item-actions"><button class="icon-action" data-del-review="'+r.id+'" aria-label="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14"/></svg></button></div></div>';
  }).join("") || '<p style="color:var(--text-soft);">Aucun avis pour le moment.</p>';
}
function fillSettingsForm(){
  document.getElementById("setWhatsapp").value = STATE.settings.whatsapp||"";
  document.getElementById("setVille").value = STATE.settings.ville||"";
  document.getElementById("setTiktok").value = STATE.settings.tiktok||"";
  document.getElementById("setHeroTitle").value = STATE.settings.heroTitle||"";
  document.getElementById("setHeroSub").value = STATE.settings.heroSub||"";
  document.getElementById("setHeroPhoto").value = STATE.settings.heroPhoto||"";
  document.getElementById("setAbout").value = STATE.settings.about||"";
  heroPhotoPicker.refresh();
}

/* -- formulaire plat -- */
document.getElementById("dishForm").addEventListener("submit", function(e){
  e.preventDefault();
  var id = document.getElementById("dishId").value;
  var payload = {
    name: document.getElementById("dishName").value.trim(),
    category: document.getElementById("dishCat").value,
    price: parseFloat(document.getElementById("dishPrice").value)||0,
    photo: document.getElementById("dishPhoto").value.trim(),
    desc: document.getElementById("dishDesc").value.trim()
  };
  var req = id ? API.updateDish(id, payload) : API.createDish(payload);
  req.then(function(res){
    if(!res.ok){ showToast((res.data && res.data.error) || "Erreur lors de l'enregistrement."); return; }
    return loadAll().then(function(){
      document.getElementById("dishForm").reset(); document.getElementById("dishId").value="";
      document.getElementById("dishFormTitle").textContent = "Ajouter un plat";
      document.getElementById("dishFormCancel").hidden = true;
      dishPhotoPicker.refresh();
      renderDishAdminList(); renderCarte(); renderAccueil();
      showToast("Plat enregistré.");
    });
  }).catch(function(){ showToast("Impossible de contacter le serveur."); });
});
document.getElementById("dishFormCancel").addEventListener("click", function(){
  document.getElementById("dishForm").reset(); document.getElementById("dishId").value="";
  document.getElementById("dishFormTitle").textContent = "Ajouter un plat";
  dishPhotoPicker.refresh();
  this.hidden = true;
});
document.getElementById("dishAdminList").addEventListener("click", function(e){
  var editBtn = e.target.closest("[data-edit-dish]");
  var delBtn = e.target.closest("[data-del-dish]");
  if(editBtn){
    var d = STATE.dishes.filter(function(x){return x.id===editBtn.dataset.editDish;})[0]; if(!d) return;
    document.getElementById("dishId").value=d.id; document.getElementById("dishName").value=d.name;
    document.getElementById("dishCat").value=d.category; document.getElementById("dishPrice").value=d.price;
    document.getElementById("dishPhoto").value=d.photo||""; document.getElementById("dishDesc").value=d.desc||"";
    dishPhotoPicker.refresh();
    document.getElementById("dishFormTitle").textContent = "Modifier « "+d.name+" »";
    document.getElementById("dishFormCancel").hidden = false;
    document.getElementById("dishForm").scrollIntoView({behavior:"smooth"});
  }
  if(delBtn){
    if(!confirm("Supprimer ce plat ?")) return;
    API.deleteDish(delBtn.dataset.delDish).then(function(res){
      if(!res.ok){ showToast((res.data && res.data.error) || "Erreur lors de la suppression."); return; }
      return loadAll().then(function(){ renderDishAdminList(); renderCarte(); renderAccueil(); showToast("Plat supprimé."); });
    }).catch(function(){ showToast("Impossible de contacter le serveur."); });
  }
});

/* -- formulaire tuto -- */
document.getElementById("tutoForm").addEventListener("submit", function(e){
  e.preventDefault();
  var id = document.getElementById("tutoId").value;
  var payload = {
    title: document.getElementById("tutoTitle").value.trim(),
    photo: document.getElementById("tutoPhoto").value.trim(),
    video: document.getElementById("tutoVideo").value.trim(),
    summary: document.getElementById("tutoSummary").value.trim(),
    ingredients: document.getElementById("tutoIngredients").value,
    steps: document.getElementById("tutoSteps").value
  };
  var req = id ? API.updateTutorial(id, payload) : API.createTutorial(payload);
  req.then(function(res){
    if(!res.ok){ showToast((res.data && res.data.error) || "Erreur lors de l'enregistrement."); return; }
    return loadAll().then(function(){
      document.getElementById("tutoForm").reset(); document.getElementById("tutoId").value="";
      document.getElementById("tutoFormTitle").textContent = "Ajouter un tuto";
      document.getElementById("tutoFormCancel").hidden = true;
      tutoPhotoPicker.refresh();
      renderTutoAdminList(); renderTutos(); renderAccueil();
      showToast("Tuto enregistré.");
    });
  }).catch(function(){ showToast("Impossible de contacter le serveur."); });
});
document.getElementById("tutoFormCancel").addEventListener("click", function(){
  document.getElementById("tutoForm").reset(); document.getElementById("tutoId").value="";
  document.getElementById("tutoFormTitle").textContent = "Ajouter un tuto";
  tutoPhotoPicker.refresh();
  this.hidden = true;
});
document.getElementById("tutoAdminList").addEventListener("click", function(e){
  var editBtn = e.target.closest("[data-edit-tuto]");
  var delBtn = e.target.closest("[data-del-tuto]");
  if(editBtn){
    var t = STATE.tutorials.filter(function(x){return x.id===editBtn.dataset.editTuto;})[0]; if(!t) return;
    document.getElementById("tutoId").value=t.id; document.getElementById("tutoTitle").value=t.title;
    document.getElementById("tutoPhoto").value=t.photo||""; document.getElementById("tutoVideo").value=t.video||"";
    document.getElementById("tutoSummary").value=t.summary||""; document.getElementById("tutoIngredients").value=t.ingredients||"";
    document.getElementById("tutoSteps").value=t.steps||"";
    tutoPhotoPicker.refresh();
    document.getElementById("tutoFormTitle").textContent = "Modifier « "+t.title+" »";
    document.getElementById("tutoFormCancel").hidden = false;
    document.getElementById("tutoForm").scrollIntoView({behavior:"smooth"});
  }
  if(delBtn){
    if(!confirm("Supprimer ce tuto ?")) return;
    API.deleteTutorial(delBtn.dataset.delTuto).then(function(res){
      if(!res.ok){ showToast((res.data && res.data.error) || "Erreur lors de la suppression."); return; }
      return loadAll().then(function(){ renderTutoAdminList(); renderTutos(); renderAccueil(); showToast("Tuto supprimé."); });
    }).catch(function(){ showToast("Impossible de contacter le serveur."); });
  }
});

/* -- modération des avis -- */
document.getElementById("reviewAdminList").addEventListener("click", function(e){
  var delBtn = e.target.closest("[data-del-review]"); if(!delBtn) return;
  if(!confirm("Supprimer cet avis ?")) return;
  API.deleteReview(delBtn.dataset.delReview).then(function(res){
    if(!res.ok){ showToast((res.data && res.data.error) || "Erreur lors de la suppression."); return; }
    return loadAll().then(function(){ renderReviewAdminList(); renderAvis(); renderAccueil(); showToast("Avis supprimé."); });
  }).catch(function(){ showToast("Impossible de contacter le serveur."); });
});

/* -- réglages -- */
document.getElementById("settingsForm").addEventListener("submit", function(e){
  e.preventDefault();
  var payload = {
    whatsapp: document.getElementById("setWhatsapp").value.trim(),
    ville: document.getElementById("setVille").value.trim(),
    tiktok: document.getElementById("setTiktok").value.trim(),
    heroTitle: document.getElementById("setHeroTitle").value.trim(),
    heroSub: document.getElementById("setHeroSub").value.trim(),
    heroPhoto: document.getElementById("setHeroPhoto").value.trim(),
    about: document.getElementById("setAbout").value.trim()
  };
  API.updateSettings(payload).then(function(res){
    if(!res.ok){ showToast((res.data && res.data.error) || "Erreur lors de l'enregistrement."); return; }
    return loadAll().then(function(){ renderAccueil(); showToast("Réglages enregistrés."); });
  }).catch(function(){ showToast("Impossible de contacter le serveur."); });
});

/* ============ DÉMARRAGE ============ */
document.getElementById("year").textContent = new Date().getFullYear();

var loadingText = document.getElementById("loadingText");
var slowTimer = setTimeout(function(){
  if(loadingText) loadingText.textContent = "Le serveur se réveille (jusqu'à 30-50 secondes après une pause) — merci de patienter…";
}, 4000);

loadAll().then(function(){
  renderAccueil(); renderFaq(); updateCartCount(); route();
}).catch(function(err){
  console.error(err);
  if(loadingText) loadingText.textContent = "Impossible de contacter le serveur pour le moment. Vérifie la variable MONGODB_URI sur Render, puis recharge la page.";
  return;
}).finally(function(){
  clearTimeout(slowTimer);
  var overlay = document.getElementById("loadingOverlay");
  if(overlay) setTimeout(function(){ overlay.style.display = "none"; }, 250);
});

})();
