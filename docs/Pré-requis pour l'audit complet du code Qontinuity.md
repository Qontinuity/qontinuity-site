# 📋 Pré-requis pour l'audit complet du code Qontinuity

## 🎯 Objectifs de l'audit

- **Nettoyer** le code legacy et les fichiers inutiles
- **Unifier** les systèmes d'authentification 
- **Optimiser** l'architecture générale
- **Documenter** tous les workflows existants
- **Sécuriser** les suppressions de fichiers

---

## 📁 Informations nécessaires

### 1. Structure générale du projet

#### Architecture des pages
```bash
# Commande à exécuter :
find src/pages -name "*.astro" | sort
```
**But :** Avoir la liste complète de toutes les pages existantes

#### Structure des composants
```bash
# Commande à exécuter :
find src/components -name "*.astro" | sort
```

#### Fichiers de configuration
- `astro.config.mjs`
- `package.json` 
- `tsconfig.json`
- Fichiers dans `/src/lib/`

### 2. Collections et données Strapi

#### Collections existantes
- **Users** (avec champs personnalisés)
- **Entreprises** 
- **Formations**
- **Articles**
- **Catégories**
- **FAQ**
- **Action-blocks**
- **Listes d'attente**
- **Inscriptions aux sessions**
- **Sessions de formation**

#### Relations entre collections
- User ↔ Entreprise
- Formation ↔ Sessions
- Formation ↔ Catégorie
- Autres relations à identifier

### 3. État actuel des workflows

#### ✅ Workflows fonctionnels confirmés
- **Inscription entreprise** : Système unifié avec création User + Entreprise
- **Authentification Users** : Via collection Users Strapi
- **Affichage formations** : Pages dynamiques avec sessions
- **Liste d'attente** : Formulaire fonctionnel

#### ❓ Workflows à vérifier
- **Dashboard entreprise** : Fonctionnalité et utilité ?
- **Authentification entreprise legacy** : `/entreprise/login.astro` encore nécessaire ?
- **Inscription aux sessions** : Process complet ?
- **Gestion des collaborateurs** : Implémenté ?

### 4. Fichiers prioritaires à examiner

#### Système d'authentification
- `/src/pages/espace-client/login.astro`
- `/src/pages/espace-client/register.astro` 
- `/src/pages/espace-client/dashboard.astro`
- `/src/pages/entreprise/login.astro` ⚠️ (legacy ?)
- `/src/pages/entreprise/dashboard.astro` ⚠️ (utilisé ?)

#### Workflows d'inscription
- `/src/pages/formations/[slug].astro`
- `/src/pages/inscriptions/` (tous les fichiers)
- Pages de paiement/validation (si existantes)

#### Navigation et routing
- Composants de navigation principaux
- Fichiers de menu/header
- Redirections et middleware

### 5. Références croisées identifiées

#### Références à `/entreprise/login` trouvées dans :
- `src/pages/formations/[slug].astro` (lien de test)
- `src/pages/entreprise/dashboard.astro` (3 redirections)

#### Autres références potentielles à chercher
```bash
# Commandes à exécuter :
grep -r "dashboard" src/ --exclude-dir=node_modules
grep -r "login" src/ --exclude-dir=node_modules | grep -v console.log
grep -r "register" src/ --exclude-dir=node_modules
grep -r "auth" src/ --exclude-dir=node_modules
```

---

## 📊 Documentation de référence

### Documents existants à fournir
1. **Documentation inscription entreprise** (créée aujourd'hui)
2. **Résumés des sessions précédentes** :
   - Session nettoyage (23 mai 2025)
   - Audit VPS (23 mai 2025) 
   - Bug Strapi relations (26 mai 2025)
   - Inscription utilisateur 2 étapes (27 mai 2025)

### Informations sur l'environnement
- **VPS** : srv794185.hstgr.cloud (82.112.254.196)
- **Strapi** : http://82.112.254.196:1337
- **n8n** : https://n8n.srv794185.hstgr.cloud/
- **Stack** : Astro 5.1.6 + Vue.js + Tailwind CSS 4.0 + Strapi

---

## 🔍 Points spécifiques à examiner

### 1. Duplication de systèmes d'auth
- Coexistence `/espace-client/` vs `/entreprise/`
- Cookies et sessions multiples
- APIs d'authentification utilisées

### 2. Pages et composants inutilisés
- Templates du thème Lexington restants
- Composants orphelins
- Pages de test ou développement

### 3. Configuration et optimisations
- Imports inutiles dans package.json
- Configuration Astro optimale
- Performance et SEO

### 4. Cohérence UX/UI
- Styles et composants dupliqués
- Navigation incohérente
- Expérience utilisateur fragmentée

---

## 🚀 Livrables attendus de l'audit

### 1. Rapport d'audit complet
- Liste des fichiers à supprimer
- Architecture recommandée
- Plan de migration/nettoyage

### 2. Documentation mise à jour
- Workflows complets documentés
- Architecture finale recommandée
- Guide de maintenance

### 3. Roadmap de nettoyage
- Ordre des suppressions/modifications
- Tests de régression à effectuer
- Sauvegarde et rollback

---

## 📝 Format de la nouvelle conversation

### Message d'ouverture suggéré
```
Audit complet du code Qontinuity

Contexte : On vient de finaliser le système d'inscription entreprise 
(31 mai 2025). Le code fonctionne parfaitement mais contient encore 
du legacy qu'il faut nettoyer.

Objectif : Audit complet pour optimiser, nettoyer et documenter 
l'architecture.

État actuel : [joindre documentation inscription entreprise]
Architecture : [joindre structure des pages]
Problèmes identifiés : Duplication système auth, fichiers legacy

Peux-tu m'aider à faire un audit méthodique ?
```

### Documents à joindre
1. Documentation inscription entreprise (créée aujourd'hui)
2. Résultat de `find src/pages -name "*.astro" | sort`
3. Liste des collections Strapi
4. Fichiers suspects identifiés (entreprise/login.astro, etc.)

---

**Préparé le 31 mai 2025**  
**Prêt pour audit complet du code Qontinuity 🚀**