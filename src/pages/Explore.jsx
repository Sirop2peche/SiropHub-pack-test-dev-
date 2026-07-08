import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PackCard from '../components/ui/PackCard';
import { getPacks } from '../lib/firestore';
import styles from './Explore.module.css';

const CATEGORIES = ['Tous', 'PvP', 'Bedwars', 'Faithful', 'Réaliste', 'Animé', 'Resource Pack'];
const SORTS = [
  { label: 'Plus récents',  value: 'createdAt' },
  { label: 'Tendance',      value: 'downloadsCount' },
  { label: 'Mieux notés',  value: 'avgRating' },
  { label: 'Plus likés',   value: 'likesCount' },
];

export default function Explore() {
  const [packs, setPacks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isEmpty, setIsEmpty]   = useState(false);
  const [category, setCategory] = useState('Tous');
  const [sort, setSort]         = useState('createdAt');
  const [search, setSearch]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPacks({ sortBy: sort, category: category === 'Tous' ? null : category });
      setPacks(data);
      setIsEmpty(data.length === 0);
    } catch (err) {
      console.error(err);
      setPacks([]);
      setIsEmpty(true);
    } finally {
      setLoading(false);
    }
  }, [sort, category]);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? packs.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        (p.authorPseudo || '').toLowerCase().includes(search.toLowerCase())
      )
    : packs;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>Explorer les packs</h1>
            <p className={styles.sub}>Découvre les créations de la communauté SiropHub</p>
          </div>
          <Link to="/upload" className="btn btn-primary">+ Publier un pack</Link>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.search}
              type="text"
              placeholder="Rechercher un pack, un créateur…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>}
          </div>
          <div className={styles.sortWrap}>
            {SORTS.map(s => (
              <button key={s.value}
                className={`${styles.sortBtn} ${sort === s.value ? styles.sortActive : ''}`}
                onClick={() => setSort(s.value)}>{s.label}</button>
            ))}
          </div>
        </div>

        <div className={styles.cats}>
          {CATEGORIES.map(c => (
            <button key={c}
              className={`${styles.catBtn} ${category === c ? styles.catActive : ''}`}
              onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className={`card ${styles.skeleton}`} />)}
          </div>
        ) : isEmpty || filtered.length === 0 ? (
          <div className={styles.empty}>
            <span style={{ fontSize: 48 }}>📭</span>
            <p>{search ? `Aucun pack trouvé pour "${search}".` : 'Aucun pack publié pour l\'instant.'}</p>
            <p className={styles.emptySub}>Sois le premier à publier un pack !</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {search && <button className="btn btn-ghost" onClick={() => setSearch('')}>Effacer la recherche</button>}
              <Link to="/upload" className="btn btn-primary">Publier un pack</Link>
            </div>
          </div>
        ) : (
          <>
            <p className={styles.count}>{filtered.length} pack{filtered.length > 1 ? 's' : ''}</p>
            <div className={styles.grid}>
              {filtered.map(p => <PackCard key={p.id} pack={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
