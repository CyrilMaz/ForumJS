import { useState } from 'react';
import './LoginModal.css';
import googleLogo from './google.png';
import githubLogo from './github.png';

export function LoginModal({ onClose }) {
  
    const [form, setForm] = useState({ email: '', password: '' });
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2>Connexion</h2>
                <form>
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