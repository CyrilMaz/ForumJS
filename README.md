# ForumJS - Front React + Vite

Interface front d'un forum réalisée avec React et Vite.

## Installation

```bash
npm install
npm run dev
```

Puis ouvrir l'URL affichée par Vite, généralement `http://localhost:5172`.
### Comment changer de port :

```bash
npm run dev -- --port 3000
```

## Scripts

```bash
npm run dev      # lancer le serveur de développement
npm run build    # générer la version production
npm run preview  # prévisualiser le build
```

## Structure

```txt
index.html
src/
  main.jsx
  App.jsx
  styles.css
vite.config.js
```

## À connecter ensuite au backend

- Authentification : inscription, connexion, session cookie
- Posts : création, modification, suppression
- Commentaires
- Likes / dislikes
- Filtres par catégories, posts de l'utilisateur, posts aimés
