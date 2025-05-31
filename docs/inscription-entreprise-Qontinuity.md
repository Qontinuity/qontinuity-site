# 📋 Documentation - Système d'inscription entreprise Qontinuity

## ✅ Système final fonctionnel - 31 mai 2025

### 🎯 Objectif atteint
Permettre aux entreprises de s'inscrire automatiquement via un flux unifié, sans double choix du type de compte.

---

## 🏗️ Architecture finale

### Collections Strapi
- **Users** : Utilisateurs avec champs personnalisés
  - `is_entreprise` (Boolean) : Indique si c'est un compte entreprise
  - `rattachement` (Relation) : Lien vers l'entreprise (One-to-One)
  
- **Entreprises** : Données des sociétés
  - `responsable` (Relation) : Lien vers le User responsable (One-to-One)
  - `adresse` (Rich Text Blocks) : Adresse formatée en JSON

### Système d'authentification unifié
- ✅ **1 seul register** : `/espace-client/register.astro`
- ✅ **1 seul login principal** : `/espace-client/login.astro`
- ✅ **API Strapi Users** pour l'authentification

---

## 🔧 Implémentation technique

### 1. Transmission du paramètre type

#### formations/[slug].astro
```javascript
// Mode entreprise - redirection avec paramètre type
if (isIntra) {
  if (isAuthenticated) {
    window.location.href = `/inscriptions/inscription_session?session=${sessionId}&mode=entreprise`;
  } else {
    window.location.href = `/espace-client/login?redirect=${encodeURIComponent('/inscriptions/inscription_session?session=' + sessionId + '&mode=entreprise')}&type=entreprise`;
  }
}
```

#### espace-client/login.astro
```javascript
// Transmission automatique de tous les paramètres URL
<a href={`/espace-client/register${Astro.url.search}`}>
  Créer un compte
</a>
```

### 2. Détection et pré-sélection dans register.astro

#### Détection du paramètre
```javascript
const forceEntreprise = Astro.url.searchParams.get('type') === 'entreprise';
```

#### Pré-sélection des radio buttons
```html
<input
  id="type-personal"
  name="account-type"
  type="radio"
  value="personal"
  checked={!forceEntreprise}
/>
<input
  id="type-entreprise"
  name="account-type"
  type="radio"
  value="entreprise"
  checked={forceEntreprise}
/>
```

### 3. Création des données

#### Format des données entreprise
```javascript
let entrepriseData = null;
if (isEntreprise) {
  entrepriseData = {
    nom: formData.get('nom-entreprise') as string,
    siret: formData.get('siret') as string,
    adresse: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: formData.get('adresse') as string
          }
        ]
      }
    ], // Format Rich Text Blocks
    secteur_activite: formData.get('secteur_activite') as string || '',
    taille: formData.get('taille') as string || ''
  };
}
```

#### Valeurs taille (énumération Strapi)
```html
<select id="taille" name="taille">
  <option value="">-- Sélectionner --</option>
  <option value="de 1 à 10">TPE (moins de 10 salariés)</option>
  <option value="de 11 à 50">PME (10 à 50 salariés)</option>
  <option value="de 51 à 100">PME (51 à 100 salariés)</option>
  <option value="de 101 à 200">ETI (101 à 200 salariés)</option>
  <option value="de 201 à 500">ETI (201 à 500 salariés)</option>
  <option value="de 501 à 1000">Grande entreprise (501 à 1000 salariés)</option>
  <option value="de 1001 et plus">Grande entreprise (1000+ salariés)</option>
</select>
```

### 4. Processus de création

#### Étape 1 : Création User
```javascript
const response = await fetch('http://82.112.254.196:1337/api/auth/local/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: email,
    email: email,
    password: password,
  }),
});
```

#### Étape 2 : Mise à jour User avec données personnalisées
```javascript
const updateResponse = await fetch(`http://82.112.254.196:1337/api/users/${data.user.id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.jwt}`
  },
  body: JSON.stringify({
    nom: nom,
    prenom: prenom,
    entreprise: entreprise || '',
    telephone: telephone || '',
    is_entreprise: isEntreprise
  })
});
```

#### Étape 3 : Création Entreprise (si compte entreprise)
```javascript
if (isEntreprise && entrepriseData) {
  const createEntrepriseResponse = await fetch('http://82.112.254.196:1337/api/entreprises', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.jwt}`
    },
    body: JSON.stringify({
      data: {
        nom: entrepriseData.nom,
        siret: entrepriseData.siret,
        adresse: entrepriseData.adresse,
        secteur_activite: entrepriseData.secteur_activite,
        taille: entrepriseData.taille,
        responsable: {
          connect: [data.user.id]
        }
      }
    })
  });
}
```

#### Étape 4 : Liaison bidirectionnelle User ↔ Entreprise
```javascript
if (createEntrepriseResponse.ok) {
  const entrepriseResult = await createEntrepriseResponse.json();
  
  // Mettre à jour l'utilisateur avec le lien vers l'entreprise
  await fetch(`http://82.112.254.196:1337/api/users/${data.user.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.jwt}`
    },
    body: JSON.stringify({
      rattachement: entrepriseResult.data.id
    })
  });
}
```

---

## ⚙️ Configuration Strapi

### Permissions nécessaires

#### Role Public - Entreprises
- ✅ `create` : Création d'entreprises
- ✅ `find` : Lecture liste entreprises
- ✅ `findOne` : Lecture entreprise individuelle

#### Role Public - Users-permissions > USER
- ✅ `find` : Lecture liste users
- ✅ `findOne` : Lecture user individuel
- ✅ `update` : Mise à jour users

### Champs Rich Text
**Important** : Le champ `adresse` est configuré en **Rich Text (Blocks)**, nécessitant un format JSON :
```javascript
adresse: [
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: "Adresse complète"
      }
    ]
  }
]
```

---

## 🧪 Tests et validation

### APIs de vérification

#### Lister les entreprises avec responsables
```
GET http://82.112.254.196:1337/api/entreprises?populate=responsable
```

#### Vérifier un utilisateur avec rattachement
```
GET http://82.112.254.196:1337/api/users?filters[email][$eq]=email@example.com&populate=rattachement
```

### Exemples de données réussies

#### Entreprise créée
```json
{
  "id": 6,
  "nom": "DigiTech Innovation",
  "siret": "75395128465789",
  "adresse": [
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "text": "15 Rue de la République\r\n69002 Lyon"
        }
      ]
    }
  ],
  "secteur_activite": "Technologies",
  "taille": "de 11 à 50",
  "responsable": {
    "id": 33,
    "nom": "DURAND",
    "prenom": "Marc",
    "email": "marc.durand@digitech.fr",
    "is_entreprise": true
  }
}
```

#### User avec rattachement
```json
{
  "id": 33,
  "nom": "DURAND",
  "prenom": "Marc",
  "email": "marc.durand@digitech.fr",
  "is_entreprise": true,
  "rattachement": {
    "id": 6,
    "nom": "DigiTech Innovation",
    "siret": "75395128465789"
  }
}
```

---

## 🚀 Flux utilisateur final

### Parcours type
1. **Formation** → Toggle "Inscription par votre entreprise" → "Inscrire un collaborateur"
2. **Redirection** → `/espace-client/login?...&type=entreprise`
3. **Clic "Créer un compte"** → `/espace-client/register?...&type=entreprise`
4. **Formulaire pré-configuré** → "Compte entreprise" automatiquement sélectionné
5. **Saisie données** → Informations personnelles + entreprise
6. **Création réussie** → User + Entreprise + Relations bidirectionnelles
7. **Redirection** → Page d'inscription à la formation

### Avantages
- ✅ **Aucun double choix** : L'utilisateur ne choisit qu'une fois le type d'inscription
- ✅ **Flux fluide** : Pré-sélection automatique selon le contexte
- ✅ **Données complètes** : Toutes les informations entreprise sauvegardées
- ✅ **Relations fonctionnelles** : Liaisons User ↔ Entreprise opérationnelles
- ✅ **APIs disponibles** : Interrogation facile des données

---

## 🛠️ Points techniques importants

### Gestion des erreurs courantes

#### Erreur "Invalid key responsable"
**Solution** : Utiliser le format `{ connect: [userId] }` pour les relations Strapi.

#### Erreur énumération "taille"
**Solution** : Utiliser les valeurs exactes : "de 1 à 10", "de 11 à 50", etc.

#### Champ adresse null
**Solution** : Format Rich Text Blocks avec structure JSON paragraphe/children/text.

#### Permissions 403
**Solution** : Configurer les permissions Public pour Users (find/findOne) et Entreprises.

### Debug utile
```javascript
// Logs de débogage dans register.astro
console.log('🏢 entrepriseData créée:', entrepriseData);
console.log('🏢 Réponse création entreprise - Status:', response.status);
console.log('🏢 Réponse création entreprise - OK:', response.ok);
```

---

## 📁 Fichiers modifiés

### Fichiers principaux
1. `src/pages/formations/[slug].astro` - Redirection avec paramètre type
2. `src/pages/espace-client/login.astro` - Transmission paramètres URL
3. `src/pages/espace-client/register.astro` - Détection, formulaire et création

### Configuration Strapi
- **Content-Type Builder** : Collections Users et Entreprises avec relations
- **Settings > Roles** : Permissions Public pour APIs
- **Users & Permissions Plugin** : Configuration authentification

---

## 🎯 Prochaines étapes identifiées

### Page inscription collaborateur
Créer `/inscriptions/inscription_collaborateur.astro` pour permettre aux entreprises d'inscrire leurs salariés aux formations.

### Fonctionnalités à implémenter
- Dashboard entreprise spécifique
- Gestion des collaborateurs
- Historique des inscriptions
- Facturation entreprise

---

**Documentation créée le 31 mai 2025**  
**Système testé et validé ✅**  
**Prêt pour la production 🚀**