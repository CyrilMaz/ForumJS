import { useEffect, useState } from 'react';
import { LoginModal } from './components/LoginModal/LoginModal';
import { fetchPosts, createPost, votePost } from './api';

function Header({ lightMode, onTogglelightMode, onOpenLogin, user }) {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">Forum web</p>
        <h1>ForumJS</h1>
      </div>
      <nav className="nav">
        <a href="#posts">Posts</a>
        <a href="#create">Créer</a>
        <button
          type="button"
          onClick={onTogglelightMode}
          title={lightMode ? 'Passer en mode sombre' : 'Passer en mode clair'}
        >
          {lightMode ? '🌙' : '☀️︎'}
        </button>
        <button type="button" className="btn-login" onClick={onOpenLogin}>
          {user ? <span>Connecté en tant que: {user.username}</span> : 
          <button type="button" className="btn-login" 
          onClick={onOpenLogin}>se connecter</button>}
        </button>
      </nav>
    </header>
  );
}

function PostCard({ post, onVote, isNew }) {
  const [bumped, setBumped] = useState(null);

  function handleVote(field) {
    setBumped(field);
    onVote(post.id, field);
    setTimeout(() => setBumped(null), 300);
  }

  return (
    <article className={`post-card${isNew ? ' post-card--new' : ''}`}>
      <div className="post-meta">
        <span>{post.category}</span>
        <span>par {post.author}</span>
      </div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <div className="post-actions">
        <button
          type="button"
          className={bumped === 'likes' ? 'bumped' : ''}
          onClick={() => handleVote('likes')}
        >
          👍 {post.likes}
        </button>
        <button
          type="button"
          className={bumped === 'dislikes' ? 'bumped' : ''}
          onClick={() => handleVote('dislikes')}
        >
          👎 {post.dislikes}
        </button>
        <span>{post.comments.length} commentaire(s)</span>
      </div>
      {post.comments.length > 0 && (
        <div className="comments">
          {post.comments.map((comment) => (
            <p key={comment.id}>
              <strong>{comment.author}</strong> — {comment.content}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}

function CreatePostForm({ onCreatePost }) {
  const [form, setForm] = useState({ title: '', content: '' });

  function updateField(e) {
    setForm((cur) => ({ ...cur, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    onCreatePost(form);
    setForm({ title: '', content: '' });
  }

  return (
    <section id="create" className="panel create-post">
      <h2>Créer un post</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Titre
          <input name="title" value={form.title} onChange={updateField} placeholder="Sujet du post" />
        </label>
        <label>
          Message
          <textarea name="content" value={form.content} onChange={updateField} placeholder="Votre message" rows="5" />
        </label>
        <button type="submit">Publier</button>
      </form>
    </section>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newIds, setNewIds] = useState(new Set());
  const [lightMode, setLightMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: light)').matches
  );
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  async function handleVote(postId, field) {
    setPosts((cur) =>
      cur.map((p) => (p.id === postId ? { ...p, [field]: p[field] + 1 } : p))
    );
    await votePost(postId, field);
  }

  async function handleCreatePost(form) {
    const newPost = await createPost(form);
    setPosts((cur) => [newPost, ...cur]);
    setNewIds((cur) => new Set(cur).add(newPost.id));
    setTimeout(() => {
      setNewIds((cur) => {
        const next = new Set(cur);
        next.delete(newPost.id);
        return next;
      });
    }, 600);
  }

  return (
    <main className={lightMode ? 'app light' : 'app dark'}>
      <Header
        lightMode={lightMode}
        onTogglelightMode={() => setLightMode((m) => !m)}
        onOpenLogin={() => setShowLogin(true)}
        user={user}
      />
      <section className="hero">
        <p className="eyebrow">Projet Ynov</p>
        <h2>Forum de puants en développement</h2>
        <p>Affichage, votes et création de posts — 100 % local.</p>
      </section>
      <section id="posts" className="posts-list">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onVote={handleVote} isNew={newIds.has(post.id)} />
        ))}
      </section>
      <CreatePostForm onCreatePost={handleCreatePost} />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={setUser} />}
    </main>
  );
}
