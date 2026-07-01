import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, increment, arrayUnion, arrayRemove, runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';

// ── PACKS ──────────────────────────────────────────────────────────────────

export async function createPack(data) {
  const ref = await addDoc(collection(db, 'packs'), {
    ...data,
    downloadsCount: 0,
    likesCount: 0,
    avgRating: 0,
    ratingsCount: 0,
    status: 'published',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPack(id) {
  const snap = await getDoc(doc(db, 'packs', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getPacks({ sortBy = 'createdAt', category = null, pageSize = 12, after = null } = {}) {
  const constraints = [
    where('status', '==', 'published'),
    orderBy(sortBy, 'desc'),
    limit(pageSize),
  ];
  if (category) constraints.splice(1, 0, where('category', '==', category));
  if (after) constraints.push(startAfter(after));

  const snap = await getDocs(query(collection(db, 'packs'), ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getUserPacks(uid) {
  const snap = await getDocs(query(
    collection(db, 'packs'),
    where('authorId', '==', uid),
    where('status', '==', 'published'),
    orderBy('createdAt', 'desc'),
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function incrementDownloads(packId) {
  await updateDoc(doc(db, 'packs', packId), { downloadsCount: increment(1) });
}

// ── LIKES ──────────────────────────────────────────────────────────────────

export async function toggleLike(packId, userId, liked) {
  const packRef = doc(db, 'packs', packId);
  const likeRef = doc(db, 'users', userId, 'likedPacks', packId);

  await runTransaction(db, async (tx) => {
    if (liked) {
      tx.delete(likeRef);
      tx.update(packRef, { likesCount: increment(-1) });
    } else {
      tx.set(likeRef, { packId, likedAt: serverTimestamp() });
      tx.update(packRef, { likesCount: increment(1) });
    }
  });
}

export async function isLiked(packId, userId) {
  const snap = await getDoc(doc(db, 'users', userId, 'likedPacks', packId));
  return snap.exists();
}

export async function getLikedPacks(userId) {
  const snap = await getDocs(collection(db, 'users', userId, 'likedPacks'));
  return snap.docs.map(d => d.id);
}

// ── RATINGS ────────────────────────────────────────────────────────────────

export async function ratePack(packId, userId, stars, review = '') {
  const ratingId = `${packId}_${userId}`;
  const ratingRef = doc(db, 'ratings', ratingId);
  const packRef = doc(db, 'packs', packId);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(ratingRef);
    const pack = await tx.get(packRef);
    const { avgRating = 0, ratingsCount = 0 } = pack.data();

    let newAvg, newCount;
    if (existing.exists()) {
      const oldStars = existing.data().stars;
      newCount = ratingsCount;
      newAvg = ((avgRating * ratingsCount) - oldStars + stars) / ratingsCount;
    } else {
      newCount = ratingsCount + 1;
      newAvg = ((avgRating * ratingsCount) + stars) / newCount;
    }

    tx.set(ratingRef, { packId, userId, stars, review, createdAt: serverTimestamp() });
    tx.update(packRef, { avgRating: Math.round(newAvg * 10) / 10, ratingsCount: newCount });
  });
}

export async function getUserRating(packId, userId) {
  const snap = await getDoc(doc(db, 'ratings', `${packId}_${userId}`));
  return snap.exists() ? snap.data() : null;
}

// ── COMMENTS ───────────────────────────────────────────────────────────────

export async function addComment(packId, authorId, text, parentId = null) {
  return addDoc(collection(db, 'comments'), {
    packId, authorId, text,
    parentCommentId: parentId,
    status: 'visible',
    createdAt: serverTimestamp(),
  });
}

export async function getComments(packId) {
  const snap = await getDocs(query(
    collection(db, 'comments'),
    where('packId', '==', packId),
    where('status', '==', 'visible'),
    orderBy('createdAt', 'asc'),
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── USERS ──────────────────────────────────────────────────────────────────

export async function getUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getUserByPseudo(pseudo) {
  const snap = await getDocs(query(
    collection(db, 'users'),
    where('pseudoLower', '==', pseudo.toLowerCase()),
    limit(1),
  ));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    pseudoLower: data.pseudo ? data.pseudo.toLowerCase() : undefined,
  });
}

// ── FOLLOW ─────────────────────────────────────────────────────────────────

export async function toggleFollow(targetUid, followerUid, isFollowing) {
  const followRef = doc(db, 'users', followerUid, 'follows', targetUid);
  const targetRef = doc(db, 'users', targetUid);
  const followerRef = doc(db, 'users', followerUid);

  await runTransaction(db, async (tx) => {
    if (isFollowing) {
      tx.delete(followRef);
      tx.update(targetRef, { followersCount: increment(-1) });
      tx.update(followerRef, { followingCreatorsCount: increment(-1) });
    } else {
      tx.set(followRef, { targetUid, followedAt: serverTimestamp() });
      tx.update(targetRef, { followersCount: increment(1) });
      tx.update(followerRef, { followingCreatorsCount: increment(1) });
    }
  });
}

export async function isFollowing(targetUid, followerUid) {
  const snap = await getDoc(doc(db, 'users', followerUid, 'follows', targetUid));
  return snap.exists();
}

// ── COMMUNITIES ────────────────────────────────────────────────────────────

export async function getCommunities(pageSize = 12) {
  const snap = await getDocs(query(
    collection(db, 'communities'),
    orderBy('membersCount', 'desc'),
    limit(pageSize),
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getCommunity(id) {
  const snap = await getDoc(doc(db, 'communities', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createCommunity(data) {
  return addDoc(collection(db, 'communities'), {
    ...data,
    membersCount: 0,
    packsCount: 0,
    createdAt: serverTimestamp(),
  });
}

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────

export async function getNotifications(userId, pageSize = 20) {
  const snap = await getDocs(query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function markNotificationRead(notifId) {
  await updateDoc(doc(db, 'notifications', notifId), { read: true });
}

export async function markAllNotificationsRead(userId) {
  const snap = await getDocs(query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
  ));
  const batch = snap.docs.map(d => updateDoc(d.ref, { read: true }));
  await Promise.all(batch);
}
