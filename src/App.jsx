import { useEffect, useState } from 'react';
import { LoginModal } from './components/LoginModal/LoginModal';
import { fetchPosts, createPost, votePost, fetchCategories, deletePost, deleteComment } from './api';
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
        <h1>Let's TALK</h1>
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

function PostCard({ post, onVote, onComment, onDelete, onDeleteComment, user, isNew }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      {post.image && <img src={post.image} alt={post.title} className="post-image" />}
      <div className="post-actions">
        <button onClick={() => onVote(post.id, 1)}>👍 {post.likes}</button>
        <button onClick={() => onVote(post.id, 0)}>👎 {post.dislikes}</button>
        <button onClick={() => setShowComments(s => !s)}>
          {post.comments.length} commentaire(s)
        </button>
        {user?.id === post.user_id && (
          showDeleteConfirm ? (
            <span>
              Confirmer ?
              <button onClick={() => onDelete(post.id)}>Oui</button>
              <button onClick={() => setShowDeleteConfirm(false)}>Non</button>
            </span>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)}>🗑 Supprimer</button>
          )
        )}
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
            <p key={c.id}>
              <strong>{c.author}</strong> — {c.content}
              {user?.id === c.user_id && (
                <button className="btn-delete" onClick={() => onDeleteComment(post.id, c.id)}>✕</button>
              )}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}


function CreatePostForm({ onCreatePost, categories }) {
  const [form, setForm] = useState({ title: '', content: '', category_ids: [] });
  const [image, setImage] = useState(null);

  function updateField(e) {
    setForm((cur) => ({ ...cur, [e.target.name]: e.target.value }));
  }

  function handleCategoryChange(e) {
  const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
  setForm(cur => ({ ...cur, category_ids: selected }));
}

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.category_ids.length) return;
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    form.category_ids.forEach(id => formData.append('category_ids', id));
    if (image) formData.append('image', image);
    onCreatePost(formData);
    setForm({ title: '', content: '', category_ids: [] });
    setImage(null);
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
          Catégorie
          <select name="category_ids" value={form.category_ids} onChange={handleCategoryChange} multiple>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label class="btn-file">
          Image (optionnel)
          <input type="file" accept="image/jpeg,image/png,image/gif" onChange={e => setImage(e.target.files[0])} />
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
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

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
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeLiked, setActiveLiked] = useState(null);

  function addToast(message, type = 'error') {
    const id = Date.now();
    setToasts(cur => [...cur, { id, message, type }]);
    setTimeout(() => setToasts(cur => cur.filter(t => t.id !== id)), 4000)
  }

  useEffect(() => {
    fetchPosts(activeCategory, activeUserId, activeLiked).then(setPosts);
  }, [activeCategory, activeUserId, activeLiked]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  async function handleVote(postId, value) {
    if (!user) return addToast('Connectez-vous pour voter')
    try {
      const counts = await votePost(postId, value, user.token);
      setPosts(cur => cur.map(p => p.id === postId ? { ...p, ...counts } : p));
    } catch (err) {
      addToast(err.message);
    }
  }

  async function handleDeletePost(postId) {
    try {
      await deletePost(postId, user.token);
      setPosts(cur => cur.filter(p => p.id !== postId));
    } catch (err) {
      addToast(err.message);
    }
  }

  async function handleDeleteComment(postId, commentId) {
    try {
      await deleteComment(postId, commentId, user.token);
      setPosts(cur => cur.map(p => p.id === postId 
        ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
        : p
      ));
    } catch (err) {
      addToast(err.message);
    }
  }

  function handleCategory(e) {
    const id = Number(e.target.value);
    setForm(cur => ({ 
      ...cur,
      category_ids: e.target.checked
        ? [...cur.category_ids, id]
        : cur.category_ids.filter(c => c !== id)
    }))
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
      addToast(err.message);
    }
  }

  async function handleCreatePost(form) {
    try {
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
    } catch (err) {
      addToast(err.message);
    }
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
        <p>lucas met nous 20 stp</p>
      </section>
      <div className="filters">
        <button className={!activeCategory ? 'active' : ''} onClick={() => setActiveCategory(null)}>Tous</button>
        {categories.map(c => (
          <button key={c.id} className={activeCategory === c.id ? 'active' : ''} onClick={() => setActiveCategory(c.id)}>
            {c.name}
          </button>
        ))}
        {user && (
          <button
            className={activeUserId === user.id ? 'active' : ''}
            onClick={() => setActiveUserId(activeUserId === user.id ? null : user.id)}
          >
            Mes posts
          </button>
        )}
        {user && (
          <button
            className={activeLiked === user.id ? 'active' : ''}
            onClick={() => setActiveLiked(activeLiked === user.id ? null : user.id)}
          >
            Mes likes
          </button>
        )}
      </div>
      <section id="posts" className="posts-list">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onVote={handleVote} 
            onComment={handleComment}
            user={user}
            isNew={newIds.has(post.id)}
            onDelete={handleDeletePost}
            onDeleteComment={handleDeleteComment}
          />
        ))}
      </section>
      {user && <CreatePostForm onCreatePost={handleCreatePost} categories={categories} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} onError={addToast} />}
        <Toast toasts={toasts} />
    </main>
  );
}
