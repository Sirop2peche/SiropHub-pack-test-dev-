import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/ui/Logo';
import styles from './Auth.module.css';

export default function Auth() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const isSignup  = location.search.includes('signup');

  const [mode, setMode]       = useState(isSignup ? 'signup' : 'login');
  const [pseudo, setPseudo]   = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate('/'); }, [user]);

  const friendlyError = (code) => {
    const map = {
      'auth/email-already-in-use': 'Cet email est déjà utilisé.',
      'auth/invalid-email': 'Email invalide.',
      'auth/weak-password': 'Mot de passe trop court (6 caractères min).',
      'auth/user-not-found': 'Aucun compte avec cet email.',
      'auth/wrong-password': 'Mot de passe incorrect.',
      'auth/invalid-credential': 'Email ou mot de passe incorrect.',
      'auth/popup-closed-by-user': 'Connexion annulée.',
    };
    return map[code] || 'Une erreur est survenue, réessaie.';
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: pseudo });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Link to="/"><Logo size={32} showWordmark /></Link>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >Connexion</button>
          <button
            className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >Inscription</button>
        </div>

        <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>

        <div className={styles.divider}><span>ou</span></div>

        <form onSubmit={handleEmail} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.field}>
              <label className={styles.label}>Pseudo</label>
              <input
                className={styles.input}
                type="text"
                placeholder="MonPseudo"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                required minLength={3} maxLength={24}
                autoComplete="username"
              />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="toi@exemple.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Mot de passe</label>
            <input
              className={styles.input}
              type="password"
              placeholder={mode === 'signup' ? 'Minimum 6 caractères' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <p className={styles.error}>⚠ {error}</p>}

          <button className={`btn btn-primary ${styles.submit}`} type="submit" disabled={loading}>
            {loading ? 'Chargement…' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>

        <p className={styles.legal}>
          En continuant, tu acceptes nos <Link to="/legal">conditions d'utilisation</Link>.
          SiropHub n'est pas affilié à Mojang / Microsoft.
        </p>
      </div>
    </div>
  );
}
