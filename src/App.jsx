import { useEffect, useMemo, useState } from 'react';
import { LoginModal } from './components/LoginModal/LoginModal';


const initialPosts = [
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
];

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
          <select name="category" value={form.category} onChange={updateField}>
            {categories.filter((category) => category !== 'Tous').map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
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
  const [posts, setPosts] = useState(initialPosts);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [lightMode, setLightMode] = useState(() => window.matchMedia('(prefers-color-scheme: light)').matches)
  const [showLogin, setShowLogin] = useState(false);


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  const visiblePosts = useMemo(() => {
    if (activeCategory === 'Tous') return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [posts, activeCategory]);

  function handleVote(postId, field) {
    setPosts((currentPosts) => currentPosts.map((post) => (
      post.id === postId ? { ...post, [field]: post[field] + 1 } : post
    )));
  }

  function handleCreatePost(form) {
    const newPost = {
      id: Date.now(),
      title: form.title.trim(),
      author: 'Utilisateur',
      category: form.category,
      content: form.content.trim(),
      likes: 0,
      dislikes: 0,
      comments: [],
    };
    setPosts((currentPosts) => [newPost, ...currentPosts]);
  }

  return (
    <main className={lightMode ? 'app light' : 'app'}>
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
