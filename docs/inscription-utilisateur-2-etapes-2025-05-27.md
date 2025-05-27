# 📝 Inscription utilisateur avec données complètes - 27 mai 2025

## 📋 Contexte

**Problème initial :** Le formulaire d'inscription collectait nom, prénom et entreprise mais ces données n'étaient pas envoyées à Strapi.

**Cause :** L'API standard Strapi `/api/auth/local/register` n'accepte que username, email et password.

**Solution implémentée :** Inscription en 2 étapes pour contourner cette limitation.

## 🔧 Solution technique

### Architecture en 2 requêtes

1. **Étape 1 : Création du compte**
   - Endpoint : `/api/auth/local/register`
   - Données : username, email, password
   - Retour : JWT + user basique

2. **Étape 2 : Mise à jour du profil**
   - Endpoint : `/api/users/{id}`
   - Méthode : PUT
   - Auth : Bearer JWT
   - Données : nom, prenom, entreprise

### Code implémenté dans register.astro

```javascript
// Étape 1 : Créer le compte
const response = await fetch('http://82.112.254.196:1337/api/auth/local/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: email,
    email: email,
    password: password,
  })
});

const data = await response.json();

if (response.ok) {
  // Étape 2 : Mettre à jour les infos
  const updateResponse = await fetch(`http://82.112.254.196:1337/api/users/${data.user.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.jwt}`
    },
    body: JSON.stringify({
      nom: nom,
      prenom: prenom,
      entreprise: entreprise || ''
    })
  });
}
```

## 📊 Champs utilisateur dans Strapi

### Champs standards
- username (Text)
- email (Email)
- password (Password)
- confirmed (Boolean)
- blocked (Boolean)
- role (Relation)

### Champs personnalisés ajoutés
- **nom** (Text)
- **prenom** (Text)
- **telephone** (Text)
- **entreprise** (Text)
- **inscriptions** (Relation avec inscriptions_aux_sessions)

## 🚨 Tentative d'endpoint custom (non fonctionnelle)

Nous avons tenté de créer un endpoint custom `/api/auth/register-complete` via :
- `/src/extensions/users-permissions/strapi-server/controllers/auth.js`
- `/src/extensions/users-permissions/strapi-server/index.js`

**Problème :** L'endpoint n'était pas reconnu par Strapi malgré le rechargement.

**Solution adoptée :** Approche en 2 requêtes qui fonctionne parfaitement.

## ✅ Résultat final

- ✅ Toutes les données sont maintenant sauvegardées
- ✅ Le dashboard affiche nom, prénom et entreprise
- ✅ Solution simple et maintenable
- ✅ Pas de modification de Strapi nécessaire

## 💡 Évolutions possibles

1. **Ajouter le téléphone** dans le formulaire register
2. **Optimiser en 1 requête** si Strapi évolue
3. **Validation côté serveur** des champs supplémentaires
4. **Champs conditionnels** selon le type d'utilisateur

## 🔧 Maintenance

### Pour ajouter un nouveau champ :
1. Ajouter le champ dans Strapi Admin (Content-Type Builder > User)
2. Ajouter l'input dans register.astro
3. Ajouter le champ dans la 2e requête PUT
4. Mettre à jour l'affichage dans dashboard.astro

### Fichiers concernés :
- `/src/pages/espace-client/register.astro`
- `/src/pages/espace-client/dashboard.astro`
- Strapi : Content-Type User

---

**Session réalisée le 27 mai 2025**  
**Durée :** ~1h30  
**Résultat :** Inscription complète fonctionnelle ✨