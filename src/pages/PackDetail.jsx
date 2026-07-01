import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPack, toggleLike, isLiked, ratePack, getUserRating, addComment, getComments, incrementDownloads, getUser } from '../lib/firestore';
import styles from './PackDetail.module.css';

function Stars({ value = 0, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          className={`${styles.star} ${(hover || value) >= n ? styles.starFilled : ''}`}
          onClick={() => interactive && onChange?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >★</span>
      ))}
    </div>
  );
}

export default function PackDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pack, setPack]         = useState(null);
  const [author, setAuthor]     = useState(null);
  const [liked, setLiked]       = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getPack(id);
      if (!data) { navigate('/explore'); return; }
      setPack(data);

      const [authorData, commentsData] = await Promise.all([
        getUser(data.authorId),
        getComments(id),
      ]);
      setAuthor(authorData);
      setComments(commentsData);

      if (user) {
        const [likedData, ratingData] = await Promise.all([
          isLiked(id, user.uid),
          getUserRating(id, user.uid),
        ]);
        setLiked(likedData);
        setMyRating(ratingData?.stars || 0);
      }
      setLoading(false);
    })();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return navigate('/auth');
    setLiked(l => !l);
    setPack(p => ({ ...p, likesCount: p.likesCount + (liked ? -1 : 1) }));
    await toggleLike(id, user.uid, liked);
  };

  const handleDownload = async () => {
    await incrementDownloads(id);
    window.open(pack.fileUrl, '_blank');
  };

  const handleRate = async (stars) => {
    if (!user) return navigate('/auth');
    setMyRating(stars);
    await ratePack(id, user.uid, stars);
    const updated = await getPack(id);
    setPack(updated);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/auth');
    if (!commentText.trim()) return;
    setSubmitting(true);
    await addComment(id, user.uid, commentText.trim());
    const updated = await getComments(id);
    setComments(updated);
    setCommentText('');
    setSubmitting(false);
  };

  if (loading) return (
    <div className={styles.loadWrap}>
      <div className={styles.loadPulse} />
    </div>
  );

  if (!pack) return null;

  const images = pack.previewImages || [];

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/explore" className={styles.back}>← Explorer les packs</Link>

        <div className={styles.layout}>
          {/* Colonne gauche — visuels */}
          <div className={styles.left}>
            <div className={styles.mainImg}>
              {images[imgIndex]
                ? <img src={images[imgIndex]} alt={pack.title} className={styles.img} />
                : <div className={styles.noImg}><span>📦</span></div>
              }
            </div>
            {images.length > 1 && (
              <div className={styles.thumbs}>
                {images.map((url, i) => (
                  <button key={i} className={`${styles.thumb} ${imgIndex === i ? styles.thumbActive : ''}`}
                    onClick={() => setImgIndex(i)}>
                    <img src={url} alt="" />
                  </button>
                ))}
              </div>
            )}
            {pack.videoUrl && (
              <a href={pack.videoUrl} target="_blank" rel="noopener noreferrer" className={`btn btn-ghost ${styles.videoBtn}`}>
                ▶ Voir la vidéo de preview
              </a>
            )}
          </div>

          {/* Colonne droite — infos */}
          <div className={styles.right}>
            <div className={styles.badges}>
              <span className="badge badge-green">{pack.category}</span>
              {pack.resolution && <span className="badge badge-indigo">{pack.resolution}</span>}
            </div>

            <h1 className={styles.title}>{pack.title}</h1>

            <Link to={`/profile/${author?.pseudo || pack.authorId}`} className={styles.author}>
              <div className={styles.authorAvatar}>
                {author?.avatarUrl
                  ? <img src={author.avatarUrl} alt="" />
                  : <span>👤</span>
                }
              </div>
              <div>
                <p className={styles.authorName}>{author?.pseudo || 'Créateur'}</p>
                <p className={styles.authorSub}>{author?.packsCount || 0} packs publiés</p>
              </div>
            </Link>

            <div className={styles.statsRow}>
              <div className={styles.stat}><span>⬇</span><strong>{fmtNum(pack.downloadsCount)}</strong><small>téléchargements</small></div>
              <div className={styles.stat}><span>♥</span><strong>{fmtNum(pack.likesCount)}</strong><small>likes</small></div>
              {pack.avgRating > 0 && <div className={styles.stat}><span>★</span><strong>{pack.avgRating.toFixed(1)}</strong><small>/ 5 ({pack.ratingsCount})</small></div>}
            </div>

            {/* CTA */}
            <div className={styles.ctas}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px' }} onClick={handleDownload}>
                ⬇ Télécharger
              </button>
              <button
                className={`btn btn-ghost ${liked ? styles.liked : ''}`}
                onClick={handleLike}
                title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >{liked ? '♥' : '♡'}</button>
            </div>

            {/* Versions */}
            {pack.versions?.length > 0 && (
              <div className={styles.infoBlock}>
                <p className={styles.infoLabel}>Versions compatibles</p>
                <div className={styles.versionList}>
                  {pack.versions.map(v => <span key={v} className={styles.versionBadge}>{v}</span>)}
                </div>
              </div>
            )}

            {/* Description */}
            <div className={styles.infoBlock}>
              <p className={styles.infoLabel}>Description</p>
              <p className={styles.desc}>{pack.description}</p>
            </div>

            {/* Tags */}
            {pack.tags?.length > 0 && (
              <div className={styles.tags}>
                {pack.tags.map(t => <span key={t} className={styles.tag}>#{t}</span>)}
              </div>
            )}

            {/* Licence */}
            <div className={styles.infoBlock}>
              <p className={styles.infoLabel}>Licence</p>
              <p className={styles.licenseText}>
                {pack.license === 'libre' && '✅ Libre — réutilisable librement'}
                {pack.license === 'credit_required' && '🔗 Réutilisable avec crédit'}
                {pack.license === 'no_redistribution' && '🚫 Non redistribuable'}
              </p>
            </div>

            {/* Note */}
            <div className={styles.rateBlock}>
              <p className={styles.infoLabel}>Donner une note</p>
              <Stars value={myRating} interactive onChange={handleRate} />
              {myRating > 0 && <p className={styles.ratedMsg}>Tu as noté {myRating}/5 ✓</p>}
            </div>
          </div>
        </div>

        {/* Commentaires */}
        <section className={styles.comments}>
          <h2 className={styles.commTitle}>Commentaires ({comments.length})</h2>

          {user ? (
            <form onSubmit={handleComment} className={styles.commForm}>
              <textarea
                className={styles.commInput}
                placeholder="Laisse un commentaire…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting || !commentText.trim()}>
                {submitting ? 'Envoi…' : 'Commenter'}
              </button>
            </form>
          ) : (
            <p className={styles.commLogin}>
              <Link to="/auth" className={styles.commLoginLink}>Connecte-toi</Link> pour laisser un commentaire.
            </p>
          )}

          <div className={styles.commList}>
            {comments.length === 0
              ? <p className={styles.noComm}>Aucun commentaire pour l'instant. Sois le premier !</p>
              : comments.map(c => (
                <div key={c.id} className={`card ${styles.commItem}`}>
                  <div className={styles.commHeader}>
                    <span className={styles.commAuthor}>👤 {c.authorId.slice(0, 8)}…</span>
                    <span className={styles.commDate}>{c.createdAt?.toDate?.().toLocaleDateString('fr-FR') || 'Récemment'}</span>
                  </div>
                  <p className={styles.commText}>{c.text}</p>
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </div>
  );
}

function fmtNum(n = 0) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
}
