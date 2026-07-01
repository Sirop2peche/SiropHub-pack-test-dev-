import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, profile, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}><Logo size={28} showWordmark /></Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <div className={styles.navGroup}>
            <Link to="/explore"       className={styles.navLink}><span className={styles.dot} style={{background:'var(--accent-green)'}}/>Packs</Link>
            <Link to="/communities"   className={styles.navLink}>Communautés</Link>
            <Link to="/upload"        className={`${styles.navLink} ${styles.navHighlight}`}>+ Publier</Link>
          </div>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setDropOpen(d => !d)}>
                <div className={styles.userAvatar}>
                  {profile?.avatarUrl
                    ? <img src={profile.avatarUrl} alt="" />
                    : <span>{(profile?.pseudo || user.email)?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <span className={styles.userPseudo}>{profile?.pseudo || 'Moi'}</span>
                <span style={{fontSize:10}}>▾</span>
              </button>
              {dropOpen && (
                <div className={styles.drop}>
                  <Link to={`/profile/${profile?.pseudo || user.uid}`} className={styles.dropItem}>👤 Mon profil</Link>
                  <Link to="/upload" className={styles.dropItem}>📦 Publier un pack</Link>
                  <Link to="/notifications" className={styles.dropItem}>🔔 Notifications</Link>
                  <div className={styles.dropDivider} />
                  <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout}>Se déconnecter</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth" className="btn btn-ghost" style={{padding:'8px 16px',fontSize:13}}>Connexion</Link>
              <Link to="/auth?signup" className="btn btn-primary" style={{padding:'8px 16px',fontSize:13}}>Créer un compte</Link>
            </>
          )}
          <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </div>
    </header>
  );
}
