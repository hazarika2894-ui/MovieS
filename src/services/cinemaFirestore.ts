import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserRatingEntry, WatchlistEntry, WatchlistStatus } from '../types/cinema';

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function sanitizeId(value: string, maxLen: number): string {
  const trimmed = value.trim().slice(0, maxLen);
  if (!trimmed || !VALID_ID_REGEX.test(trimmed)) {
    throw new Error('Invalid identifier format.');
  }
  return trimmed;
}

export function subscribeToWatchlist(
  userId: string,
  onData: (items: Record<string, WatchlistEntry>) => void
): () => void {
  const safeUserId = sanitizeId(userId, 128);
  const path = `users/${safeUserId}/watchlist`;
  const q = query(collection(db, path), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const map: Record<string, WatchlistEntry> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        map[docSnap.id] = {
          userId: String(data.userId ?? safeUserId),
          movieId: String(data.movieId ?? docSnap.id),
          status: (data.status as WatchlistStatus) ?? 'plan_to_watch',
          notes: typeof data.notes === 'string' ? data.notes : '',
          addedAt: data.addedAt?.toDate ? data.addedAt.toDate() : null,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
        };
      });
      onData(map);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addOrUpdateWatchlistItem(params: {
  userId: string;
  movieId: string;
  status: WatchlistStatus;
  notes?: string;
  exists: boolean;
}): Promise<void> {
  const safeUserId = sanitizeId(params.userId, 128);
  const safeMovieId = sanitizeId(params.movieId, 64);
  const safeNotes = (params.notes ?? '').trim().slice(0, 500);
  const path = `users/${safeUserId}/watchlist/${safeMovieId}`;
  const ref = doc(db, 'users', safeUserId, 'watchlist', safeMovieId);

  try {
    if (!params.exists) {
      await setDoc(ref, {
        userId: safeUserId,
        movieId: safeMovieId,
        status: params.status,
        notes: safeNotes,
        addedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        status: params.status,
        notes: safeNotes,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      params.exists ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function removeWatchlistItem(userId: string, movieId: string): Promise<void> {
  const safeUserId = sanitizeId(userId, 128);
  const safeMovieId = sanitizeId(movieId, 64);
  const path = `users/${safeUserId}/watchlist/${safeMovieId}`;
  const ref = doc(db, 'users', safeUserId, 'watchlist', safeMovieId);

  try {
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToAllRatings(
  onData: (ratings: UserRatingEntry[]) => void
): () => void {
  const path = 'ratings';
  const q = query(collection(db, path), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserRatingEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const scoreNum = Number(data.score);
        if (Number.isInteger(scoreNum) && scoreNum >= 1 && scoreNum <= 5) {
          list.push({
            id: docSnap.id,
            userId: String(data.userId ?? ''),
            authorName: String(data.authorName ?? 'Cinema Member'),
            movieId: String(data.movieId ?? ''),
            score: scoreNum,
            review: typeof data.review === 'string' ? data.review : '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
          });
        }
      });
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function submitUserRating(params: {
  userId: string;
  authorName: string;
  movieId: string;
  score: number;
  review: string;
  exists: boolean;
}): Promise<void> {
  const safeUserId = sanitizeId(params.userId, 128);
  const safeMovieId = sanitizeId(params.movieId, 64);
  const ratingId = `${safeUserId}_${safeMovieId}`;
  const safeAuthor = (params.authorName || 'Cinema Member').trim().slice(0, 80) || 'Cinema Member';
  const safeReview = params.review.trim().slice(0, 600);
  const safeScore = Math.max(1, Math.min(5, Math.round(params.score)));
  const path = `ratings/${ratingId}`;
  const ref = doc(db, 'ratings', ratingId);

  try {
    if (!params.exists) {
      await setDoc(ref, {
        userId: safeUserId,
        authorName: safeAuthor,
        movieId: safeMovieId,
        score: safeScore,
        review: safeReview,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        authorName: safeAuthor,
        score: safeScore,
        review: safeReview,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      params.exists ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function deleteUserRating(userId: string, movieId: string): Promise<void> {
  const safeUserId = sanitizeId(userId, 128);
  const safeMovieId = sanitizeId(movieId, 64);
  const ratingId = `${safeUserId}_${safeMovieId}`;
  const path = `ratings/${ratingId}`;
  const ref = doc(db, 'ratings', ratingId);

  try {
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
