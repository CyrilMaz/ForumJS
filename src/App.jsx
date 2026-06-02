import { useEffect, useMemo, useRef, useState } from 'react';
import { LoginModal } from './components/LoginModal/LoginModal';
import { fetchPosts, createPost, votePost } from './api';

const categories = ['Tous', 'Général', 'Développement', 'Docker', 'SQLite'];

function Header({ lightMode, onTogglelightMode, onOpenLogin}) {
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
          title={lightMode ? 'Passer en mode sombre' : 'Passer en mode clair'}>
          {lightMode ? '🌙' : '☀️︎'}
        </button>
        <button 
          type="button" 
          className="btn-login"
          onClick={onOpenLogin}
        >
          se connecter
        </button>
      </nav>
    </header>
  );
}

function Filters({ activeCategory, onChangeCategory }) {
  return (
    <section className="panel filters" aria-label="Filtres des posts">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={activeCategory === category ? 'active' : ''}
          onClick={() => onChangeCategory(category)}
        >
          {category}
        </button>
      ))}
    </section>
  );
}

function PostCard({ post, onVote }) {
  return (
    <article className="post-card">
      <div className="post-meta">
        <span>{post.category}</span>
        <span>par {post.author}</span>
      </div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <div className="post-actions">
        <button type="button" onClick={() => onVote(post.id, 'likes')}>👍 {post.likes}</button>
        <button type="button" onClick={() => onVote(post.id, 'dislikes')}>👎 {post.dislikes}</button>
        <span>{post.comments.length} commentaire(s)</span>
      </div>
      <div className="comments">
        {post.comments.map((comment) => (
          <p key={comment.id}><strong>{comment.author}</strong> — {comment.content}</p>
        ))}
      </div>
    </article>
  );
}

function CustomSelect({ name, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(option) {
    onChange({ target: { name, value: option } });
    setOpen(false);
  }

  return (
    <div className="custom-select" ref={ref}>
      <div className="selected" onClick={() => setOpen((o) => !o)}>
        {value}
      </div>
      <ul className={`options${open ? ' open' : ''}`}>
        {options.map((option) => (
          <li key={option} onClick={() => handleSelect(option)}>
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreatePostForm({ onCreatePost }) {
  const [form, setForm] = useState({ title: '', category: 'Général', content: '' });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    onCreatePost(form);
    setForm({ title: '', category: 'Général', content: '' });
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
          <CustomSelect
            name="category"
            value={form.category}
            onChange={updateField}
            options={categories.filter((c) => c !== 'Tous')}
          />
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
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [lightMode, setLightMode] = useState(() => window.matchMedia('(prefers-color-scheme: light)').matches)
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  const visiblePosts = useMemo(() => {
    if (activeCategory === 'Tous') return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [posts, activeCategory]);

  async function handleVote(postId, field) {
    await votePost(postId, field);
    setPosts((current) => current.map((post) =>
      post.id === postId ? { ...post, [field]: post[field] + 1 } : post
    ));
  }

  async function handleCreatePost(form) {
    const newPost = await createPost({
      title: form.title.trim(),
      author: 'Utilisateur',
      category: form.category,
      content: form.content.trim(),
    });
    setPosts((current) => [newPost, ...current]);
  }

  return (
    <main className={lightMode ? 'app light' : 'app dark'}>
      <Header
        lightMode={lightMode}
        onTogglelightMode={() => setLightMode(!lightMode)}
        onOpenLogin={() => setShowLogin(true)}
      />
      <section className="hero">
        <p className="eyebrow">Projet Ynov</p>
        <h2>Un forum clair, responsive et prêt à connecter à ton backend.</h2>
        <p>Cette interface gère déjà l’affichage, les filtres, les votes locaux et la création de posts côté front.</p>
      </section>
      <Filters activeCategory={activeCategory} onChangeCategory={setActiveCategory} />
      <section id="posts" className="posts-list">
        {visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} onVote={handleVote} />
        ))}
      </section>
      <CreatePostForm onCreatePost={handleCreatePost} />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </main>
  );
}
