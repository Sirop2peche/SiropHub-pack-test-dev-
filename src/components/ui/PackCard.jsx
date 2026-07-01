import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PackCard.module.css';

const CATEGORY_COLORS = {
  PvP: '#ef4444', Bedwars: '#22C55E', Faithful: '#06b6d4',
  Réaliste: '#8b5cf6', Animé: '#f59e0b', 'Resource Pack': '#6366F1',
};

export default function PackCard({ pack }) {
  const color = CATEGORY_COLORS[pack.category] || '#6366F1';
  const thumb = pack.previewImages?.[0];

  return (
    <Link to={`/pack/${pack.id}`} className={`card ${styles.card}`}>
      <div className={styles.thumb} style={{ background: thumb ? undefined : `${color}18` }}>
        {thumb
          ? <img src={thumb} alt={pack.title} className={styles.img} />
          : <span className={styles.placeholder}>📦</span>
        }
        <span className={`badge badge-green ${styles.cat}`}>{pack.category}</span>
        {pack.resolution && <span className={`badge badge-indigo ${styles.res}`}>{pack.resolution}</span>}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{pack.title}</h3>
        <p className={styles.author}>par {pack.authorPseudo || 'Créateur'}</p>
        <div className={styles.stats}>
          <span title="Téléchargements">⬇ {fmtNum(pack.downloadsCount)}</span>
          {pack.avgRating > 0 && <span title="Note">★ {pack.avgRating.toFixed(1)}</span>}
          <span title="Likes">♥ {fmtNum(pack.likesCount)}</span>
        </div>
      </div>
    </Link>
  );
}

function fmtNum(n = 0) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
}
