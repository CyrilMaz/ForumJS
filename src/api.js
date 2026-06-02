// Point de connexion à l'API — remplacer les implémentations par des fetch() quand le backend est prêt.
// const API_URL = 'http://localhost:3000/api'

const mockPosts = [
  {
    id: 1,
    title: 'Bienvenue sur ForumJS',
    author: 'Cyril',
    category: 'Général',
    content: 'Présentez-vous, posez vos questions et partagez vos idées autour du projet.',
    likes: 12,
    dislikes: 1,
    comments: [
      { id: 1, author: 'Nathan', content: 'La structure React/Vite est prête.' },
    ],
  },
  {
    id: 2,
    title: 'Comment organiser les catégories ?',
    author: 'Nathan',
    category: 'Développement',
    content: 'On peut utiliser les catégories comme des sous-forums : Go, JS, Docker, SQLite...',
    likes: 8,
    dislikes: 0,
    comments: [],
  },
]

export async function fetchPosts() {
  // return fetch(`${API_URL}/posts`).then(r => r.json())
  return mockPosts
}

export async function createPost(form) {
  // return fetch(`${API_URL}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json())
  return { id: Date.now(), ...form, likes: 0, dislikes: 0, comments: [] }
}

export async function votePost(postId, field) {
  // return fetch(`${API_URL}/posts/${postId}/vote`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ field }) }).then(r => r.json())
  return { postId, field }
}
