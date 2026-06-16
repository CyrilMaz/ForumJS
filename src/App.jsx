import { useEffect, useState } from 'react';
import { LoginModal } from './components/LoginModal/LoginModal';
import { fetchPosts, createPost, votePost } from './api';
import { createComment } from './api';

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}
function Header({ lightMode, onTogglelightMode, onOpenLogin, user, onLogout }) {
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
        {user ? (
          <div className="user-menu">
          <span>Connecté en tant que: {user.username}</span>
            <div className="user-dropdown">
              <button onClick={onLogout}>Se déconnecter</button>
            </div>
          </div>
        ) : (
      <button type="button" className="btn-login" onClick={onOpenLogin}>se connecter</button>
    )}


      </nav>
    </header>
  );
}

function PostCard({ post, onVote, onComment, user, isNew }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    await onComment(post.id, commentText);
    setCommentText('');
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
        <button onClick={() => onVote(post.id, 1)}>👍 {post.likes}</button>
        <button onClick={() => onVote(post.id, 0)}>👎 {post.dislikes}</button>
        <button onClick={() => setShowComments(s => !s)}>
          {post.comments.length} commentaire(s)
        </button>
      </div>
      {showComments && (
        <div className="comments">
          {user && (
            <form onSubmit={handleComment}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Votre commentaire..." />
              <button type="submit">Envoyer</button>
            </form>
          )}
          {post.comments.map(c => (
            <p key={c.id}><strong>{c.author}</strong> — {c.content}</p>
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
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [posts, setPosts] = useState([]);
  const [newIds, setNewIds] = useState(new Set());
  const [lightMode, setLightMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: light)').matches
  );
  const [showLogin, setShowLogin] = useState(false);

  function addToast(message, type = 'error') {
    const id = Date.now();
    setToasts(cur => [...cur, { id, message, type }]);
    setTimeout(() => setToasts(cur => cur.filter(t => t.id !== id)), 4000)
  }

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  async function handleVote(postId, value) {
    if (!user) return addToast('Connectez-vous pour voter')
    try {
      const counts = await votePost(postId, value, user.token);
      setPosts(cur => cur.map(p => p.id === postId ? { ...p, ...counts } : p));
    } catch (err) {
      addToast(err.message)
    }
  }

  function handleLogin(userData) {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  async function handleComment(postId, content) {
    try {
      const comment = await createComment(postId, content, user.token)
      setPosts(cur => cur.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p))
    } catch (err) {
      addToast(err.message)
    }
  }

  async function handleCreatePost(form) {
    const newPost = await createPost(form, user.token);
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
        onLogout={() => { setUser(null); localStorage.removeItem('user'); }}
      />
      <section className="hero">
        <p className="eyebrow">Projet Ynov</p>
        <h2>Forum sans sujet précis</h2>
        <p>lucas mets nous 20 stp</p>
      </section>
      <section id="posts" className="posts-list">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onVote={handleVote} 
            onComment={handleComment}
            user={user}
            isNew={newIds.has(post.id)} 
          />
        ))}
      </section>
      {user && <CreatePostForm onCreatePost={handleCreatePost} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} onError={addToast} />}
        <Toast toasts={toasts} />
    </main>
  );
}
