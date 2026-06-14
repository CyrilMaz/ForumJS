import { useState } from 'react';
import './LoginModal.css';
import googleLogo from './google.png';
import githubLogo from './github.png';

export function LoginModal({ onClose, onLogin }) {
  
    const [form, setForm] = useState({ email: '', password: '', username: '' }); 
    const [mode, setMode] = useState('login');

    async function handleSubmit(e) {
        e.preventDefault();
        const res = await fetch(`/api/auth/${mode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
        const data = await res.json()
        if (res.ok) {
            onLogin({token: data.token, username: data.username })
            onClose()
            }
        }
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2 className="ConnectModal-title">Connectez vous pour accéder à toutes nos fonctionnalités</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input type="email" name="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                    </label>
                    {mode === 'register' && (
                    <label>
                        Nom d'utilisateur
                        <input name="username" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} />
                    </label>
                    )}
                    <label>
                        Mot de passe
                        <input type="password" name="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                    </label>
                    <button type="submit">{mode === 'register' ? 'S\'inscrire' : 'Se connecter'}</button>
                </form>
                <a className="toggle-mode" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                    {mode === 'login' ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous'}
                </a>
                <center>ou</center>
                <button className="btn_siwg"><img src={googleLogo} className="Google_logo"/>Se connecter avec Google</button>
                <button className="btn_siwg"><img src={githubLogo} className="GitHub_logo"/>Se connecter avec GitHub</button>            </div>
        </div>
    );
}