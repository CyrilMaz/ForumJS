import { useState } from 'react';
import './LoginModal.css';
import googleLogo from './google.png';
import githubLogo from './github.png';

export function LoginModal({ onClose, onLogin }) {
  
    const [form, setForm] = useState({ email: '', password: '' });

    async function handleSubmit(e) {
        e.preventDefault();
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
        const data = await res.json()
        if (res.ok) {
            onLogin(data.token)
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
                    <label>
                        Mot de passe
                        <input type="password" name="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                    </label>
                    <button type="submit">Se connecter</button>
                </form>
                <center>ou</center>
                <button className="btn_siwg"><img src={googleLogo} className="Google_logo"/>Se connecter avec Google</button>
                <button className="btn_siwg"><img src={githubLogo} className="GitHub_logo"/>Se connecter avec GitHub</button>            </div>
        </div>
    );
}