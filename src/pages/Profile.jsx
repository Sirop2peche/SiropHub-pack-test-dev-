import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserByPseudo, getUserPacks, toggleFollow, isFollowing, updateUserProfile } from '../lib/firestore';
import PackCard from '../components/ui/PackCard';
import styles from './Profile.module.css';

export default function Profile() {
  const { pseudo } = useParams();
  const { user, profile: myProfile, setProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfileState] = useState(null);
  const [packs, setPacks]   = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const isOwn = myProfile?.pseudo === pseudo || myProfile?.pseudoLower === pseudo?.toLowerCase();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getUserByPseudo(pseudo);
      if (!data) { navigate('/explore'); return; }
      setProfileState(data);
      setEditForm({ pseudo: data.pseudo, bio: data.bio || '', links: data.links || {} });

      const [packsData, followingData] = await Promise.all([
        getUserPacks(data.uid || data.id),
        user && !isOwn ? isFollowing(data.uid || data.id, user.uid) : Promise.resolve(false),
      ]);
      setPacks(packsData);
      setFollowing(followingData);
      setLoading(false);
    })();
  }, [pseudo, user]);

  const handleFollow = async () => {
    if (!user) return navigate('/auth');
    setFollowing(f => !f);
    setProfileState(p => ({ ...p, followersCount: p.followersCount + (following ? -1 : 1) }));
    await toggleFollow(profile.uid || profile.id, user.uid, following);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateUserProfile(user.uid, {
      pseudo: editForm.pseudo,
      bio: editForm.bio,
      links: editForm.links,
    });
    setProfileState(p => ({ ...p, ...editForm }));
    setProfile(p => ({ ...p, ...editForm }));
    setEditMode(false);
    setSaving(false);
  };

  if (loading) return (
    <div className={styles.loadWrap}><div className={styles.spinner} /></div>
  );

  if (!profile) return null;

  return (
    <div className={styles.page}>
      {/* Bannière */}
      <div className={styles.banner} style={{ background: profile.bannerUrl ? `url(${profile.bannerUrl}) center/cover` : 'linear-gradient(135deg, #1C2030 0%, #0F1115 100%)' }}>
        <div className="container">
          <div className={styles.bannerInner}>
            <div className={styles.avatar}>
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt={profile.pseudo} />
                : <span className={styles.avatarFallback}>{profile.pseudo?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div className={styles.bannerInfo}>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>{profile.pseudo}</h1>
                {profile.badges?.includes('verified') && <span className="badge badge-green">✓ Vérifié</span>}
                {profile.badges?.includes('early_member') && <span className="badge badge-indigo">Fondateur</span>}
              </div>
              {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
              <div className={styles.profileStats}>
                <span><strong>{profile.packsCount || packs.length}</strong> packs</span>
                <span><strong>{fmtNum(profile.totalDownloads || 0)}</strong> téléchargements</span>
                <span><strong>{fmtNum(profile.followersCount || 0)}</strong> abonnés</span>
              </div>
            </div>
            <div className={styles.bannerActions}>
              {isOwn ? (
                <button className="btn btn-ghost" onClick={() => setEditMode(true)}>✏️ Modifier le profil</button>
              ) : (
                <button className={`btn ${following ? 'btn-ghost' : 'btn-primary'}`} onClick={handleFollow}>
                  {following ? '✓ Abonné' : '+ Suivre'}
                </button>
              )}
            </div>
          </div>
          {/* Liens sociaux */}
          {(profile.links?.discord || profile.links?.youtube || profile.links?.twitter) && (
            <div className={styles.links}>
              {profile.links?.discord && <a href={`https://discord.gg/${profile.links.discord}`} target="_blank" className={styles.socialLink}>Discord</a>}
              {profile.links?.youtube && <a href={profile.links.youtube} target="_blank" className={styles.socialLink}>YouTube</a>}
              {profile.links?.twitter && <a href={`https://twitter.com/${profile.links.twitter}`} target="_blank" className={styles.socialLink}>Twitter/X</a>}
            </div>
          )}
        </div>
      </div>

      {/* Packs */}
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <h2 className={styles.sectionTitle}>
          Packs publiés <span className={styles.count}>({packs.length})</span>
        </h2>
        {packs.length === 0 ? (
          <div className={styles.empty}>
            <span style={{ fontSize: 48 }}>📭</span>
            <p>{isOwn ? "Tu n'as pas encore publié de pack." : `${profile.pseudo} n'a pas encore publié de pack.`}</p>
            {isOwn && <Link to="/upload" className="btn btn-primary">Publier mon premier pack</Link>}
          </div>
        ) : (
          <div className={styles.grid}>
            {packs.map(p => <PackCard key={p.id} pack={p} />)}
          </div>
        )}
      </div>

      {/* Modal edit */}
      {editMode && (
        <div className={styles.modalOverlay} onClick={() => setEditMode(false)}>
          <div className={`card ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Modifier mon profil</h2>

            <div className={styles.field}>
              <label className={styles.label}>Pseudo</label>
              <input className={styles.input} value={editForm.pseudo}
                onChange={e => setEditForm(f => ({ ...f, pseudo: e.target.value }))} maxLength={24} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Bio</label>
              <textarea className={`${styles.input} ${styles.textarea}`} rows={3} value={editForm.bio}
                onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} maxLength={160}
                placeholder="Décris-toi en quelques mots…" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Discord (serveur ID ou lien)</label>
              <input className={styles.input} value={editForm.links?.discord || ''}
                onChange={e => setEditForm(f => ({ ...f, links: { ...f.links, discord: e.target.value } }))} placeholder="MonServeur" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>YouTube (lien de ta chaîne)</label>
              <input className={styles.input} value={editForm.links?.youtube || ''}
                onChange={e => setEditForm(f => ({ ...f, links: { ...f.links, youtube: e.target.value } }))} placeholder="https://youtube.com/@machaîne" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Twitter/X (@pseudo)</label>
              <input className={styles.input} value={editForm.links?.twitter || ''}
                onChange={e => setEditForm(f => ({ ...f, links: { ...f.links, twitter: e.target.value } }))} placeholder="MonPseudo" />
            </div>

            <div className={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setEditMode(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function fmtNum(n = 0) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
}
