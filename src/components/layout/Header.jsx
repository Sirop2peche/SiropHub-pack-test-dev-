import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <Logo size={28} showWordmark />
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <div className={styles.navGroup}>
            <Link to="/tools" className={styles.navLink}>
              <span className={styles.dot} style={{ background: 'var(--accent-indigo)' }} />
              Outils
            </Link>
            <Link to="/explore" className={styles.navLink}>
              <span className={styles.dot} style={{ background: 'var(--accent-green)' }} />
              Packs
            </Link>
            <Link to="/communities" className={styles.navLink}>Communautés</Link>
            <Link to="/converter" className={`${styles.navLink} ${styles.navHighlight}`}>
              Convertisseur
            </Link>
          </div>
        </nav>

        <div className={styles.actions}>
          <Link to="/auth" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
            Connexion
          </Link>
          <Link to="/auth?signup" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            Créer un compte
          </Link>
          <button
            className={styles.burger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
