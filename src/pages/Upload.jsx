import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPack } from '../lib/firestore';
import { uploadPack } from '../lib/supabase';
import styles from './Upload.module.css';

const CATEGORIES = ['PvP', 'Bedwars', 'Faithful', 'Réaliste', 'Animé', 'Resource Pack'];
const RESOLUTIONS = ['8x', '16x', '32x', '64x', '128x', '256x'];
const VERSIONS = ['1.16', '1.17', '1.18', '1.19', '1.20', '1.21'];
const LICENSES = [
  { value: 'libre', label: 'Libre — Tout le monde peut réutiliser' },
  { value: 'credit_required', label: 'Crédit requis — Réutilisable avec mention' },
  { value: 'no_redistribution', label: 'Non redistribuable — Usage personnel uniquement' },
];

export default function Upload() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', category: '', resolution: '',
    versions: [], license: 'libre', tags: '', credits: '',
    videoUrl: '', changelog: '',
  });
  const [packFile, setPackFile]     = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [step, setStep]             = useState(1); // 1=infos, 2=fichier, 3=médias

  if (!user) {
    return (
      <div className={styles.gate}>
        <span style={{ fontSize: 48 }}>🔐</span>
        <h2>Connexion requise</h2>
        <p>Tu dois être connecté pour publier un pack.</p>
        <Link to="/auth" className="btn btn-primary">Se connecter</Link>
      </div>
    );
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleVersion = (v) => {
    setForm(f => ({
      ...f,
      versions: f.versions.includes(v) ? f.versions.filter(x => x !== v) : [...f.versions, v],
    }));
  };

  const addPreview = () => {
    if (previewUrl.trim()) {
      setPreviewUrls(u => [...u, previewUrl.trim()]);
      setPreviewUrl('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) return setError('Le titre est obligatoire.');
    if (!form.category) return setError('Choisis une catégorie.');
    if (form.versions.length === 0) return setError('Sélectionne au moins une version Bedrock.');
    if (!packFile) return setError('Le fichier du pack est obligatoire.');

    setLoading(true);
    try {
      const packId = crypto.randomUUID();
      const fileUrl = await uploadPack(packFile, packId);

      await createPack({
        id: packId,
        authorId: user.uid,
        authorPseudo: profile?.pseudo || user.displayName || 'Créateur',
        communityId: null,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        resolution: form.resolution || null,
        versions: form.versions,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        license: form.license,
        credits: form.credits.split(',').map(c => c.trim()).filter(Boolean),
        videoUrl: form.videoUrl.trim() || null,
        fileUrl,
        fileSizeBytes: packFile.size,
        previewImages: previewUrls,
        changelog: form.changelog.trim() ? [{ version: '1.0', date: new Date().toISOString(), notes: form.changelog.trim() }] : [],
      });

      navigate(`/pack/${packId}`);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la publication. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.head}>
          <h1 className={styles.title}>Publier un pack</h1>
          <p className={styles.sub}>Partage ta création avec la communauté SiropHub</p>
        </div>

        {/* Stepper */}
        <div className={styles.stepper}>
          {['Informations', 'Fichier', 'Médias'].map((s, i) => (
            <div key={s} className={`${styles.step} ${step === i + 1 ? styles.stepActive : ''} ${step > i + 1 ? styles.stepDone : ''}`}>
              <span className={styles.stepNum}>{step > i + 1 ? '✓' : i + 1}</span>
              <span className={styles.stepLabel}>{s}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Étape 1 — Informations */}
          {step === 1 && (
            <div className={`card ${styles.card}`}>
              <h2 className={styles.cardTitle}>Informations du pack</h2>

              <div className={styles.field}>
                <label className={styles.label}>Titre <span className={styles.req}>*</span></label>
                <input className={styles.input} type="text" placeholder="Mon super pack 16x"
                  value={form.title} onChange={e => set('title', e.target.value)} required maxLength={80} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description <span className={styles.req}>*</span></label>
                <textarea className={`${styles.input} ${styles.textarea}`}
                  placeholder="Décris ton pack : style, contenu, particularités…"
                  value={form.description} onChange={e => set('description', e.target.value)}
                  rows={5} required />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Catégorie <span className={styles.req}>*</span></label>
                  <select className={styles.input} value={form.category} onChange={e => set('category', e.target.value)} required>
                    <option value="">Choisir…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Résolution</label>
                  <select className={styles.input} value={form.resolution} onChange={e => set('resolution', e.target.value)}>
                    <option value="">Non spécifiée</option>
                    {RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Versions Bedrock compatibles <span className={styles.req}>*</span></label>
                <div className={styles.checkGroup}>
                  {VERSIONS.map(v => (
                    <label key={v} className={`${styles.checkItem} ${form.versions.includes(v) ? styles.checkActive : ''}`}>
                      <input type="checkbox" hidden checked={form.versions.includes(v)} onChange={() => toggleVersion(v)} />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Licence</label>
                <select className={styles.input} value={form.license} onChange={e => set('license', e.target.value)}>
                  {LICENSES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Tags <span className={styles.hint}>(séparés par des virgules)</span></label>
                  <input className={styles.input} type="text" placeholder="low fps, clean, smp…"
                    value={form.tags} onChange={e => set('tags', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Crédits <span className={styles.hint}>(collaborateurs)</span></label>
                  <input className={styles.input} type="text" placeholder="Pseudo1, Pseudo2…"
                    value={form.credits} onChange={e => set('credits', e.target.value)} />
                </div>
              </div>

              <div className={styles.actions}>
                <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* Étape 2 — Fichier */}
          {step === 2 && (
            <div className={`card ${styles.card}`}>
              <h2 className={styles.cardTitle}>Fichier du pack</h2>

              <div className={styles.field}>
                <label className={styles.label}>Fichier .mcpack / .mcaddon / .zip <span className={styles.req}>*</span></label>
                <div
                  className={`${styles.dropzone} ${packFile ? styles.dropzoneActive : ''}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setPackFile(f); }}
                >
                  {packFile ? (
                    <div className={styles.fileChosen}>
                      <span>📦</span>
                      <div>
                        <p className={styles.fileName}>{packFile.name}</p>
                        <p className={styles.fileSize}>{(packFile.size / 1024 / 1024).toFixed(2)} Mo</p>
                      </div>
                      <button type="button" className={styles.fileRemove} onClick={() => setPackFile(null)}>✕</button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: 36 }}>📂</span>
                      <p>Glisse ton fichier ici ou</p>
                      <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                        Parcourir
                        <input type="file" hidden accept=".mcpack,.mcaddon,.zip"
                          onChange={e => setPackFile(e.target.files[0])} />
                      </label>
                      <p className={styles.hint}>Formats acceptés : .mcpack, .mcaddon, .zip — Max 50 Mo</p>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Notes de mise à jour <span className={styles.hint}>(optionnel)</span></label>
                <textarea className={`${styles.input} ${styles.textarea}`}
                  placeholder="Quoi de neuf dans cette version ?"
                  value={form.changelog} onChange={e => set('changelog', e.target.value)} rows={3} />
              </div>

              <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Retour</button>
                <button type="button" className="btn btn-primary" onClick={() => { if (!packFile) setError('Sélectionne un fichier.'); else { setError(''); setStep(3); } }}>
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 — Médias */}
          {step === 3 && (
            <div className={`card ${styles.card}`}>
              <h2 className={styles.cardTitle}>Aperçus & médias</h2>

              <div className={styles.field}>
                <label className={styles.label}>Images de preview <span className={styles.hint}>(URLs d'images)</span></label>
                <div className={styles.urlRow}>
                  <input className={styles.input} type="url" placeholder="https://i.imgur.com/monpack.png"
                    value={previewUrl} onChange={e => setPreviewUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPreview())} />
                  <button type="button" className="btn btn-ghost" onClick={addPreview}>Ajouter</button>
                </div>
                {previewUrls.length > 0 && (
                  <div className={styles.previews}>
                    {previewUrls.map((url, i) => (
                      <div key={i} className={styles.previewItem}>
                        <img src={url} alt="" className={styles.previewImg} onError={e => e.target.style.display='none'} />
                        <button type="button" className={styles.previewRemove}
                          onClick={() => setPreviewUrls(u => u.filter((_, j) => j !== i))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Vidéo YouTube <span className={styles.hint}>(optionnel)</span></label>
                <input className={styles.input} type="url" placeholder="https://youtube.com/watch?v=…"
                  value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} />
              </div>

              {error && <p className={styles.error}>⚠ {error}</p>}

              <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>← Retour</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Publication…' : '🚀 Publier le pack'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
