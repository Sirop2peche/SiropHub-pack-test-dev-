import React from 'react';
import { Link } from 'react-router-dom';

export function PlaceholderPage({ title, icon, accentColor = 'var(--accent-indigo)' }) {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <span style={{ fontSize: 56 }}>{icon}</span>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: accentColor }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 320 }}>
          Cette page est en cours de développement. Reviens bientôt !
        </p>
        <Link to="/" className="btn btn-ghost">← Retour à l'accueil</Link>
      </div>
    </div>
  );
}

export const Explore = () => <PlaceholderPage title="Explorer les packs" icon="🌿" accentColor="var(--accent-green)" />;
export const Tools = () => <PlaceholderPage title="Tous les outils" icon="🛠️" />;
export const Converter = () => <PlaceholderPage title="Convertisseur Java ↔ Bedrock" icon="🔄" />;
export const Communities = () => <PlaceholderPage title="Communautés" icon="👥" accentColor="var(--accent-green)" />;
export const Auth = () => <PlaceholderPage title="Connexion / Inscription" icon="🔑" />;
export const Upload = () => <PlaceholderPage title="Publier un pack" icon="📦" accentColor="var(--accent-green)" />;
export const NotFound = () => <PlaceholderPage title="Page introuvable" icon="❓" />;
