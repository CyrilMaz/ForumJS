# ForumJS - Front React + Vite

Interface front d'un forum réalisée avec React et Vite.

## Installation

```bash
npm install
npm run dev
```

Puis ouvrir l'URL affichée par Vite, généralement `http://localhost:5172`.
### Comment changer de port :

## Installation in case of local use, but it should be on Docker so it should not be necessary to install it locally.
To install the project, follow these steps:
1. Clone the repository:
   `git clone https://github.com/CyrilMaz/ForumJS.git `
2. Navigate to the project directory:
   `cd forumjs`
3. Install the dependencies:
   `npm install`
4. Start the application:
   `npm start`

## Github Repository

### Main branch
name : main
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
