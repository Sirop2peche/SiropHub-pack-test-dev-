import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import styles from './Footer.module.css';

const COLS = [
  {
    title: 'Outils',
    links: [
      { label: 'Convertisseur', to: '/converter' },
      { label: 'Éditeur de skin', to: '/tools/skin-editor' },
      { label: 'Avatar Maker', to: '/tools/avatar-maker' },
      { label: 'Custom Paintings', to: '/tools/paintings' },
      { label: 'Music Disc Maker', to: '/tools/music-disc' },
      { label: 'HUD Customizer', to: '/tools/hud' },
    ],
  },
  {
    title: 'Communauté',
    links: [
      { label: 'Explorer les packs', to: '/explore' },
      { label: 'Publier un pack', to: '/upload' },
      { label: 'Communautés', to: '/communities' },
      { label: 'Notifications', to: '/notifications' },
    ],
  },
  {
    title: 'Compte',
    links: [
      { label: 'Connexion', to: '/auth' },
      { label: 'Créer un compte', to: '/auth?signup' },
      { label: 'Mon profil', to: '/profile' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo size={28} showWordmark />
          <p className={styles.tagline}>
            Le seul endroit où tu crées<br />ET partages tes packs Bedrock.
          </p>
          <p className={styles.legal}>
            Non affilié à Mojang / Microsoft.
          </p>
        </div>

        <div className={styles.cols}>
          {COLS.map((col) => (
            <div key={col.title} className={styles.col}>
              <h4 className={styles.colTitle}>{col.title}</h4>
              <ul className={styles.colLinks}>
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className={styles.colLink}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span className={styles.copy}>© 2025 SiropHub — Gratuit, dans ton navigateur.</span>
          <div className={styles.bottomLinks}>
            <Link to="/legal" className={styles.bottomLink}>Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
