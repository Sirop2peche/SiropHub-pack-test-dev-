import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCommunities, getCommunity, createCommunity, getPacks } from '../lib/firestore';
import PackCard from '../components/ui/PackCard';
import styles from './Communities.module.css';

/* ── Liste des communautés ── */
export function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getCommunities().then(d => { setCommunities(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    await createCommunity({ name: form.name.trim(), description: form.description.trim(), ownerId: user.uid, bannerUrl: '', contributorIds: [user.uid] });
    const updated = await getCommunities();
    setCommunities(updated);
    setShowCreate(false);
    setForm({ name: '', description: '' });
    setCreating(false);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>Communautés</h1>
            <p className={styles.sub}>Des collectifs de créateurs organisés par style</p>
          </div>
          {user && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Créer une communauté</button>}
        </div>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({length: 6}).map((_,i) => <div key={i} className={`card ${styles.skeleton}`} />)}
          </div>
        ) : communities.length === 0 ? (
          <div className={styles.empty}>
            <span style={{fontSize:48}}>👥</span>
            <p>Aucune communauté pour l'instant.</p>
            {user && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Créer la première !</button>}
            {!user && <Link to="/auth" className="btn btn-primary">Se connecter pour créer</Link>}
          </div>
        ) : (
          <div className={styles.commGrid}>
            {communities.map(c => (
              <Link key={c.id} to={`/community/${c.id}`} className={`card ${styles.commCard}`}>
                <div className={styles.commBanner} style={{ background: c.bannerUrl ? `url(${c.bannerUrl}) center/cover` : 'linear-gradient(135deg,#1C2030,#0F1115)' }}>
                  <span className={styles.commEmoji}>👥</span>
                </div>
                <div className={styles.commInfo}>
                  <h3 className={styles.commName}>{c.name}</h3>
                  <p className={styles.commDesc}>{c.description || 'Pas de description.'}</p>
                  <div className={styles.commStats}>
                    <span>👥 {fmtNum(c.membersCount)} membres</span>
                    <span>📦 {c.packsCount} packs</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modal créer */}
      {showCreate && (
        <div className={styles.overlay} onClick={() => setShowCreate(false)}>
          <div className={`card ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Créer une communauté</h2>
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nom</label>
                <input className={styles.input} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required maxLength={48} placeholder="Ma communauté" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea className={`${styles.input} ${styles.textarea}`} rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} maxLength={280} placeholder="De quoi parle votre communauté ?" />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Création…' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Page d'une communauté ── */
export function CommunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getCommunity(id);
      if (!data) { navigate('/communities'); return; }
      setCommunity(data);
      const packsData = await getPacks({ category: null });
      setPacks(packsData.filter(p => p.communityId === id));
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className={styles.loadWrap}><div className={styles.spinner} /></div>;
  if (!community) return null;

  return (
    <div className={styles.page}>
      <div className={styles.commDetailBanner} style={{ background: community.bannerUrl ? `url(${community.bannerUrl}) center/cover` : 'linear-gradient(135deg,#1C2030,#0F1115)' }}>
        <div className="container">
          <Link to="/communities" className={styles.back}>← Communautés</Link>
          <div className={styles.commDetailHead}>
            <div className={styles.commDetailIcon}>👥</div>
            <div>
              <h1 className={styles.commDetailName}>{community.name}</h1>
              <p className={styles.commDetailDesc}>{community.description}</p>
              <div className={styles.commStats}>
                <span>👥 {fmtNum(community.membersCount)} membres</span>
                <span>📦 {community.packsCount} packs</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }}>+ Rejoindre</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <h2 className={styles.sectionTitle}>Packs de la communauté</h2>
        {packs.length === 0 ? (
          <div className={styles.empty}>
            <span style={{fontSize:48}}>📭</span>
            <p>Aucun pack publié dans cette communauté pour l'instant.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {packs.map(p => <PackCard key={p.id} pack={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function fmtNum(n = 0) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
}
