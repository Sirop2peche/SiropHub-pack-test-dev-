import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/firestore';
import styles from './Notifications.module.css';

const TYPE_LABELS = {
  new_pack: { icon: '📦', label: 'Nouveau pack' },
  comment_reply: { icon: '💬', label: 'Réponse' },
  pack_updated: { icon: '🔄', label: 'Pack mis à jour' },
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    getNotifications(user.uid).then(d => { setNotifs(d); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const handleRead = async (id) => {
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    await markNotificationRead(id);
  };

  const handleReadAll = async () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    await markAllNotificationsRead(user.uid);
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>Notifications</h1>
            {unread > 0 && <p className={styles.sub}>{unread} non lue{unread > 1 ? 's' : ''}</p>}
          </div>
          {unread > 0 && (
            <button className="btn btn-ghost" onClick={handleReadAll}>Tout marquer comme lu</button>
          )}
        </div>

        {loading ? (
          <div className={styles.list}>
            {Array.from({length: 5}).map((_,i) => <div key={i} className={`card ${styles.skeleton}`} />)}
          </div>
        ) : notifs.length === 0 ? (
          <div className={styles.empty}>
            <span style={{fontSize:48}}>🔔</span>
            <p>Aucune notification pour l'instant.</p>
            <p className={styles.emptySub}>Suis des créateurs pour être notifié de leurs nouveaux packs.</p>
            <Link to="/explore" className="btn btn-ghost">Explorer les packs</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {notifs.map(n => {
              const meta = TYPE_LABELS[n.type] || { icon: '🔔', label: 'Notification' };
              return (
                <div
                  key={n.id}
                  className={`card ${styles.notif} ${!n.read ? styles.notifUnread : ''}`}
                  onClick={() => { handleRead(n.id); if (n.relatedPackId) navigate(`/pack/${n.relatedPackId}`); }}
                >
                  <span className={styles.notifIcon}>{meta.icon}</span>
                  <div className={styles.notifBody}>
                    <p className={styles.notifType}>{meta.label}</p>
                    <p className={styles.notifText}>
                      {n.type === 'new_pack' && 'Un créateur que tu suis a publié un nouveau pack.'}
                      {n.type === 'comment_reply' && 'Quelqu\'un a répondu à ton commentaire.'}
                      {n.type === 'pack_updated' && 'Un pack que tu as liké a été mis à jour.'}
                    </p>
                    <p className={styles.notifDate}>{n.createdAt?.toDate?.().toLocaleDateString('fr-FR') || 'Récemment'}</p>
                  </div>
                  {!n.read && <span className={styles.dot} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
