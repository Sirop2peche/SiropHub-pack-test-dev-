import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Charger ou créer le profil Firestore
        const ref = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          // Première connexion → créer le profil
          const newProfile = {
            uid: firebaseUser.uid,
            pseudo: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            pseudoLower: (firebaseUser.displayName || firebaseUser.email.split('@')[0]).toLowerCase(),
            avatarUrl: firebaseUser.photoURL || null,
            bannerUrl: null,
            bio: '',
            links: { discord: '', youtube: '', twitter: '' },
            badges: [],
            followersCount: 0,
            followingCreatorsCount: 0,
            packsCount: 0,
            totalDownloads: 0,
            notificationPrefs: { newPackFromFollowed: true, commentReply: true, packUpdated: true },
            createdAt: serverTimestamp(),
          };
          await setDoc(ref, newProfile);
          setProfile(newProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
