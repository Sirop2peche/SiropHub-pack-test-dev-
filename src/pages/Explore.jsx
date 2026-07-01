import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PackCard from '../components/ui/PackCard';
import { getPacks } from '../lib/firestore';
import styles from './Explore.module.css';

const CATEGORIES = ['Tous', 'PvP', 'Bedwars', 'Faithful', 'Réaliste', 'Animé', 'Resource Pack'];
const SORTS = [
  { label: 'Plus récents', value: 'createdAt' },
  { label: 'Tendance',     value: 'downloadsCount' },
  { label: 'Mieux notés', value: 'avgRating' },
  { label: 'Plus likés',  value: 'likesCount' },
];

// Packs de démo pendant que Firestore est vide
const DEMO_PACKS = Array.from({ length: 12 }, (_, i) => ({
  id: `demo-${i}`,
  title: ['CrystalPvP 16x','FaithBed 32x','Sapphire Faithful','AniPack Pro','UltraRealist 64x','MiniBed Clean','NovaSky PvP','EmeraldFaith','BlazePvP','CosmicBed','ShadowPvP','TropicalPack'][i],
  authorPseudo: ['Sirop2peche','NovaCreator','AquaStudio','PixelForge','NightRenderer','IceDev','SkyDev','EmeraldDev','BlazeDev','CosmicDev','ShadowDev','TropicalDev'][i],
  category: ['PvP','Bedwars','Faithful','Animé','Réaliste','Bedwars','PvP','Faithful','PvP','Bedwars','PvP','Resource Pack'][i],
  resolution: ['16x','32x','32x','16x','64x','16x','16x','32x','16x','16x','16x','32x'][i],
  downloadsCount: [12400,8100,21000,5200,3900,9300,7600,4500,6100,3200,5800,2900][i],
  likesCount: [340,210,560,120,89,230,180,110,150,78,140,65][i],
  avgRating: [4.8,4.6,4.9,4.4,4.7,4.5,4.6,4.3,4.7,4.2,4.5,4.1][i],
  previewImages: [],
  status: 'published',
}));

export default function Explore() {
  const [packs, setPacks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState('Tous');
  const [sort, setSort]           = useState('createdAt');
  const [search, setSearch]       = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPacks({ sortBy: sort, category: category === 'Tous' ? null : category });
      // Si Firestore est vide, on affiche les démos
      setPacks(data.length > 0 ? data : DEMO_PACKS);
    } catch {
      setPacks(DEMO_PACKS);
    } finally {
      setLoading(false);
    }
  }, [sort, category]);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? packs.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.authorPseudo || '').toLowerCase().includes(search.toLowerCase())
      )
    : packs;

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Header */}
        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>Explorer les packs</h1>
            <p className={styles.sub}>Découvre les créations de la communauté SiropHub</p>
          </div>
          <Link to="/upload" className="btn btn-primary">+ Publier un pack</Link>
        </div>

        {/* Contrôles */}
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
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div className={styles.sortWrap}>
            {SORTS.map(s => (
              <button
                key={s.value}
                className={`${styles.sortBtn} ${sort === s.value ? styles.sortActive : ''}`}
                onClick={() => setSort(s.value)}
              >{s.label}</button>
            ))}
          </div>
        </div>

        {/* Filtres catégorie */}
        <div className={styles.cats}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`${styles.catBtn} ${category === c ? styles.catActive : ''}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>

        {/* Résultats */}
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`card ${styles.skeleton}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span style={{ fontSize: 48 }}>📭</span>
            <p>Aucun pack trouvé{search ? ` pour "${search}"` : ''}.</p>
            {search && <button className="btn btn-ghost" onClick={() => setSearch('')}>Effacer la recherche</button>}
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
