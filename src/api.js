// Point de connexion à l'API — remplacer les implémentations par des fetch() quand le backend est prêt.
const API_URL = "/api"

export async function fetchPosts() {
  return apiFetch('/posts');
}


export async function createPost(form, token) {
  return apiFetch('/posts', { method: 'POST', body: JSON.stringify(form) }, token);
}


export async function votePost(postId, value, token) {
  return apiFetch(`/posts/${postId}/vote`, { method: 'PATCH', body: JSON.stringify({ value }) }, token);
}

export async function createComment(postId, content, token) {
  return apiFetch(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }, token);
}

export async function fetchCategories() {
  return apiFetch('/categories');
}

export async function apiFetch(path, options ={}, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const ress = await fetch(`/api${path}`, { ...options, headers });
  const data = await ress.json();
  if (!ress.ok) throw new Error(data.message || 'Erreur serveur');
  return data
}