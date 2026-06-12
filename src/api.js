// Point de connexion à l'API — remplacer les implémentations par des fetch() quand le backend est prêt.
const API_URL = "/api"

export async function fetchPosts() {
  return fetch(`${API_URL}/posts`).then(r => r.json())
}

export async function createPost(form) {
  return fetch(`${API_URL}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json())}

export async function votePost(postId, field) {
  return fetch(`${API_URL}/posts/${postId}/vote`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ field }) }).then(r => r.json())
  
}
