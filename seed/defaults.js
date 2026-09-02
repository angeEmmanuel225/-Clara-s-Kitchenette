// Contenu de démonstration inséré automatiquement au tout premier démarrage,
// uniquement si la base de données est vide. Modifie ou supprime ces éléments
// depuis l'espace pro du site une fois en ligne — ce fichier ne sert qu'à
// éviter un site vide au lancement.

const DEFAULT_DISHES = [
  { name: "Riz sauce graine", category: "Plats", price: 13, photo: "", featured: true,
    desc: "Riz parfumé nappé d'une sauce à base de noix de palme, mijotée longuement à la façon ivoirienne." },
  { name: "Attiéké, poisson braisé", category: "Plats", price: 14, photo: "",
    desc: "Semoule de manioc fermentée, poisson braisé aux épices, oignons et tomates fraîches." },
  { name: "Foutou banane, sauce arachide", category: "Plats", price: 13, photo: "",
    desc: "Pâte de banane plantain pilée, sauce arachide onctueuse, viande ou poisson au choix." },
  { name: "Tô, sauce gombo", category: "Plats", price: 12, photo: "",
    desc: "Spécialité burkinabée et malienne : pâte de mil moelleuse, sauce gombo mijotée." },
  { name: "Quiche maison", category: "Plats", price: 11, photo: "",
    desc: "Une touche d'Europe entre deux plats d'Afrique : pâte maison, lardons, crème fraîche." },
  { name: "Alloco", category: "Accompagnements", price: 6, photo: "",
    desc: "Bananes plantain frites, servies avec une sauce pimentée maison." },
  { name: "Jus de bissap", category: "Boissons", price: 4, photo: "",
    desc: "Infusion glacée de fleurs d'hibiscus, gingembre et menthe fraîche." },
  { name: "Beignets sucrés", category: "Desserts", price: 5, photo: "",
    desc: "Petits beignets moelleux façon « puff-puff », sucre vanillé." },
];

const DEFAULT_TUTORIALS = [
  { title: "Réussir sa sauce graine maison", photo: "", video: "",
    summary: "La base d'un bon riz sauce graine : la cuisson lente qui fait toute la différence.",
    ingredients: "500g de concentré de noix de palme\n1 oignon\n2 gousses d'ail\nPoisson fumé ou viande au choix\nPiment, sel, cube",
    steps: "Faire revenir l'oignon et l'ail.\nAjouter le concentré de noix de palme et un peu d'eau.\nLaisser mijoter 40 minutes à feu doux en remuant régulièrement.\nAjouter la viande ou le poisson, rectifier l'assaisonnement." },
  { title: "Le secret d'un bon attiéké", photo: "", video: "",
    summary: "Comment réchauffer et parfumer l'attiéké pour qu'il reste léger et parfumé.",
    ingredients: "Attiéké (semoule de manioc)\nUn filet d'huile\nUn peu d'eau chaude",
    steps: "Humidifier légèrement l'attiéké.\nCuire à la vapeur 5 à 10 minutes.\nAérer à la fourchette avant de servir." },
  { title: "Bissap glacé en 10 minutes", photo: "", video: "",
    summary: "La boisson rafraîchissante à préparer la veille pour un maximum de saveur.",
    ingredients: "1 tasse de fleurs d'hibiscus séchées\n1L d'eau\nSucre ou miel\nGingembre frais, menthe",
    steps: "Faire infuser les fleurs dans l'eau chaude 15 minutes.\nFiltrer, sucrer, ajouter le gingembre râpé.\nLaisser refroidir puis réfrigérer avant de servir avec de la menthe." },
];

module.exports = { DEFAULT_DISHES, DEFAULT_TUTORIALS };
