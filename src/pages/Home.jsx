import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

/* ── Données statiques ── */
const TOOLS = [
  { icon: '🔄', name: 'Convertisseur', desc: 'Java ↔ Bedrock en un clic', to: '/converter', accent: 'indigo', badge: null },
  { icon: '🎨', name: 'Éditeur de skin 3D', desc: 'Dessine sur ton personnage en vue 3D', to: '/tools/skin-editor', accent: 'indigo', badge: null },
  { icon: '👤', name: 'Avatar Maker', desc: 'Génère ton avatar depuis ton skin', to: '/tools/avatar-maker', accent: 'indigo', badge: 'Nouveau' },
  { icon: '🖼️', name: 'Custom Paintings', desc: 'Remplace les tableaux du jeu', to: '/tools/paintings', accent: 'indigo', badge: null },
  { icon: '🎵', name: 'Music Disc Maker', desc: 'Tes musiques dans les disques vanilla', to: '/tools/music-disc', accent: 'indigo', badge: null },
  { icon: '⚙️', name: 'HUD Customizer', desc: 'Crosshair, cœurs, barre d\'XP…', to: '/tools/hud', accent: 'indigo', badge: null },
];

const PACK_TABS = ['Tendance', 'Plus téléchargés', 'Mieux notés'];
const FILTERS = ['PvP', 'Bedwars', 'Faithful', 'Réaliste', 'Animé'];

const MOCK_PACKS = [
  { id: 1, name: 'CrystalPvP 16x', author: 'Sirop2peche', downloads: '12.4k', rating: 4.8, category: 'PvP', color: '#6366F1' },
  { id: 2, name: 'FaithBed 32x', author: 'NovaCreator', downloads: '8.1k', rating: 4.6, category: 'Bedwars', color: '#22C55E' },
  { id: 3, name: 'Sapphire Faithful', author: 'AquaStudio', downloads: '21k', rating: 4.9, category: 'Faithful', color: '#06b6d4' },
  { id: 4, name: 'AniPack Pro', author: 'PixelForge', downloads: '5.2k', rating: 4.4, category: 'Animé', color: '#f59e0b' },
  { id: 5, name: 'UltraRealist 64x', author: 'NightRenderer', downloads: '3.9k', rating: 4.7, category: 'Réaliste', color: '#8b5cf6' },
  { id: 6, name: 'MiniBed Clean', author: 'IceDev', downloads: '9.3k', rating: 4.5, category: 'Bedwars', color: '#ef4444' },
];

const COMMUNITIES = [
  { name: 'PvP Factory', members: '2.3k', packs: 14, emoji: '⚔️', color: '#ef4444' },
  { name: 'FaithfulBedrock', members: '4.1k', packs: 31, emoji: '🌿', color: '#22C55E' },
  { name: 'PixelForge Studio', members: '890', packs: 8, emoji: '🔨', color: '#6366F1' },
];

const STEPS = [
  { n: '01', title: 'Crée', desc: 'Utilise nos outils (éditeur de skin, convertisseur, HUD…) directement dans ton navigateur. Aucune installation requise.', icon: '🛠️', accent: 'indigo' },
  { n: '02', title: 'Convertis', desc: 'On adapte automatiquement ton pack pour toutes les versions Bedrock compatibles (1.16 → dernière version).', icon: '🔄', accent: 'green' },
  { n: '03', title: 'Partage', desc: 'Publie sur SiropHub, crée ta fiche pack, rejoins une communauté de créateurs — et suis ceux qui t\'inspirent.', icon: '🚀', accent: 'green' },
];

/* ── Composants internes ── */
function PackCard({ pack }) {
  return (
    <Link to={`/pack/${pack.id}`} className={`card ${styles.packCard}`}>
      <div className={styles.packThumb} style={{ background: `${pack.color}22` }}>
        <span style={{ fontSize: 32 }}>📦</span>
        <span className={`badge badge-green ${styles.packCategory}`}>{pack.category}</span>
      </div>
      <div className={styles.packInfo}>
        <h3 className={styles.packName}>{pack.name}</h3>
        <p className={styles.packAuthor}>par {pack.author}</p>
        <div className={styles.packStats}>
          <span>⬇ {pack.downloads}</span>
          <span>★ {pack.rating}</span>
        </div>
      </div>
    </Link>
  );
}

function ToolCard({ tool }) {
  return (
    <Link to={tool.to} className={`card ${styles.toolCard}`}>
      <div className={styles.toolIconWrap} style={{ background: `var(--accent-${tool.accent}-dim, var(--accent-indigo-dim))` }}>
        <span className={styles.toolIcon}>{tool.icon}</span>
      </div>
      <div className={styles.toolText}>
        <div className={styles.toolNameRow}>
          <h3 className={styles.toolName}>{tool.name}</h3>
          {tool.badge && <span className="badge badge-green">{tool.badge}</span>}
        </div>
        <p className={styles.toolDesc}>{tool.desc}</p>
      </div>
      <span className={styles.toolArrow}>→</span>
    </Link>
  );
}

/* ── Page principale ── */
export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeFilter, setActiveFilter] = useState(null);

  const filtered = activeFilter
    ? MOCK_PACKS.filter(p => p.category === activeFilter)
    : MOCK_PACKS;

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className="badge badge-green">✦ Bêta ouverte</span>
              <span className="badge badge-indigo">Bedrock First</span>
            </div>
            <h1 className={styles.heroTitle}>
              Crée, convertis<br />
              <span className={styles.heroAccent}>et partage</span> tes packs<br />
              <span className={styles.heroPixel}>Minecraft Bedrock</span>
            </h1>
            <p className={styles.heroSub}>
              Éditeur de skins, convertisseur Java→Bedrock, générateur de packs
              et une communauté de créateurs — gratuit, dans ton navigateur.
            </p>
            <div className={styles.heroCTAs}>
              <Link to="/tools" className="btn btn-secondary" style={{ fontSize: 15, padding: '12px 24px' }}>
                🛠️ Ouvrir un outil
              </Link>
              <Link to="/explore" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 24px' }}>
                🌿 Explorer les packs
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroGrid}>
              {['⚔️','🌿','🎨','🔮','🏔️','🌊','🔥','🌙'].map((e, i) => (
                <div key={i} className={styles.heroCell} style={{ animationDelay: `${i * 0.15}s` }}>
                  <span>{e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BANDEAU STATS ── */}
      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsRow}>
            {[
              { val: '6', label: 'Outils disponibles' },
              { val: '100%', label: 'Navigateur, aucun install' },
              { val: '0€', label: 'Gratuit pour toujours' },
              { val: 'Bedrock', label: 'Priorité absolue' },
            ].map((s) => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statVal}>{s.val}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUTILS ── */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="badge badge-indigo">🛠️ Outils</span>
            <h2 className={styles.sectionTitle}>Tout ce qu'il te faut pour créer</h2>
            <p className={styles.sectionSub}>6 outils qui tournent 100% dans ton navigateur. Aucun compte requis pour les utiliser.</p>
          </div>
          <div className={styles.toolsGrid}>
            {TOOLS.map(t => <ToolCard key={t.name} tool={t} />)}
          </div>
          <div className={styles.sectionCTA}>
            <Link to="/tools" className="btn btn-ghost">Voir tous les outils →</Link>
          </div>
        </div>
      </section>

      {/* ── PACKS TENDANCE ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="badge badge-green">🌿 Communauté</span>
            <h2 className={styles.sectionTitle}>Packs en tendance</h2>
            <p className={styles.sectionSub}>Les créations les plus populaires de la communauté SiropHub.</p>
          </div>

          <div className={styles.packsControls}>
            <div className={styles.tabs}>
              {PACK_TABS.map((t, i) => (
                <button
                  key={t}
                  className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className={styles.filters}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ''}`}
                  onClick={() => setActiveFilter(activeFilter === f ? null : f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.packsGrid}>
            {filtered.map(p => <PackCard key={p.id} pack={p} />)}
          </div>

          <div className={styles.sectionCTA}>
            <Link to="/explore" className="btn btn-ghost">Parcourir tous les packs →</Link>
          </div>
        </div>
      </section>

      {/* ── 3 ÉTAPES ── */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Du pack au partage en 3 étapes</h2>
            <p className={styles.sectionSub}>
              La boucle complète création → conversion → publication. Unique sur Bedrock.
            </p>
          </div>
          <div className={styles.stepsGrid}>
            {STEPS.map(s => (
              <div key={s.n} className={`card ${styles.stepCard}`}>
                <div className={styles.stepTop}>
                  <span className={`${styles.stepNum} pixel`} style={{ color: s.accent === 'indigo' ? 'var(--accent-indigo)' : 'var(--accent-green)' }}>
                    {s.n}
                  </span>
                  <span className={styles.stepIcon}>{s.icon}</span>
                </div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNAUTÉS ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="badge badge-green">👥 Hubs</span>
            <h2 className={styles.sectionTitle}>Rejoins une communauté</h2>
            <p className={styles.sectionSub}>Des collectifs de créateurs organisés par style de jeu.</p>
          </div>
          <div className={styles.commGrid}>
            {COMMUNITIES.map(c => (
              <div key={c.name} className={`card ${styles.commCard}`}>
                <div className={styles.commIcon} style={{ background: `${c.color}22` }}>
                  <span style={{ fontSize: 28 }}>{c.emoji}</span>
                </div>
                <div className={styles.commInfo}>
                  <h3 className={styles.commName}>{c.name}</h3>
                  <p className={styles.commStats}>{c.members} membres · {c.packs} packs</p>
                </div>
                <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>
                  Suivre
                </button>
              </div>
            ))}
          </div>
          <div className={styles.sectionCTA}>
            <Link to="/communities" className="btn btn-ghost">Explorer les communautés →</Link>
            <Link to="/communities/create" className="btn btn-ghost">Créer la mienne →</Link>
          </div>
        </div>
      </section>

      {/* ── POURQUOI SIROPHUB ── */}
      <section className={styles.section}>
        <div className="container">
          <div className={`card ${styles.whyCard}`}>
            <div className={styles.whyContent}>
              <h2 className={styles.sectionTitle}>Pourquoi SiropHub ?</h2>
              <div className={styles.whyGrid}>
                {[
                  { icon: '🆓', title: 'Gratuit, sans pub', desc: 'Aucun abonnement, aucune pub. Le site vit sur des paliers gratuits cloud.' },
                  { icon: '🌐', title: '100% navigateur', desc: 'Tous les outils tournent dans ton onglet. Aucun fichier envoyé sur un serveur.' },
                  { icon: '🎮', title: 'Bedrock en priorité', desc: 'Export .mcpack natif, conversion multi-version automatique dès 1.16.' },
                  { icon: '👥', title: 'Communauté saine', desc: 'Modération communautaire, signalement, pas de redistribution abusive.' },
                ].map(w => (
                  <div key={w.title} className={styles.whyItem}>
                    <span className={styles.whyIcon}>{w.icon}</span>
                    <div>
                      <h4 className={styles.whyTitle}>{w.title}</h4>
                      <p className={styles.whyDesc}>{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className={`${styles.section} ${styles.ctaSection}`}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>
              Prêt à créer ton premier pack ?
            </h2>
            <p className={styles.ctaSub}>Rejoins la communauté SiropHub — gratuit, sans engagement.</p>
            <div className={styles.ctaBtns}>
              <Link to="/auth?signup" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
                Créer un compte gratuit
              </Link>
              <Link to="/tools" className="btn btn-ghost" style={{ fontSize: 15, padding: '12px 28px' }}>
                Essayer sans compte
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
