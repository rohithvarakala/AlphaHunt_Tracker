import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import app from '../firebase';

// Initialize Firestore
const db = getFirestore(app);

// ─────────────────────────────────────────────────────────────────────────────
// TRADES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all trades for a user
 */
export const getUserTrades = async (userId) => {
  if (!userId) return [];

  try {
    const tradesRef = collection(db, 'users', userId, 'trades');
    const q = query(tradesRef, orderBy('entryDate', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
};

/**
 * Subscribe to real-time trade updates
 */
export const subscribeToTrades = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const tradesRef = collection(db, 'users', userId, 'trades');
  const q = query(tradesRef, orderBy('entryDate', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const trades = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(trades);
  }, (error) => {
    console.error('Error subscribing to trades:', error);
    callback([]);
  });
};

/**
 * Add a new trade
 */
export const addTrade = async (userId, trade) => {
  if (!userId) throw new Error('User not authenticated');

  const tradesRef = collection(db, 'users', userId, 'trades');
  const tradeData = {
    ...trade,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(tradesRef, tradeData);
  return { id: docRef.id, ...tradeData };
};

/**
 * Update an existing trade
 */
export const updateTrade = async (userId, tradeId, updates) => {
  if (!userId) throw new Error('User not authenticated');

  const tradeRef = doc(db, 'users', userId, 'trades', tradeId);
  await updateDoc(tradeRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

/**
 * Delete a trade
 */
export const deleteTrade = async (userId, tradeId) => {
  if (!userId) throw new Error('User not authenticated');

  const tradeRef = doc(db, 'users', userId, 'trades', tradeId);
  await deleteDoc(tradeRef);
};

// ─────────────────────────────────────────────────────────────────────────────
// WATCHLIST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get user's watchlist
 */
export const getUserWatchlist = async (userId) => {
  if (!userId) return [];

  try {
    const watchlistRef = collection(db, 'users', userId, 'watchlist');
    const snapshot = await getDocs(watchlistRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
};

/**
 * Subscribe to real-time watchlist updates
 */
export const subscribeToWatchlist = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const watchlistRef = collection(db, 'users', userId, 'watchlist');

  return onSnapshot(watchlistRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(items);
  }, (error) => {
    console.error('Error subscribing to watchlist:', error);
    callback([]);
  });
};

/**
 * Add stock to watchlist
 */
export const addToWatchlist = async (userId, stock) => {
  if (!userId) throw new Error('User not authenticated');

  // Use symbol as document ID to prevent duplicates
  const watchlistRef = doc(db, 'users', userId, 'watchlist', stock.symbol);

  await setDoc(watchlistRef, {
    ...stock,
    alerts: true,
    addedAt: serverTimestamp()
  });
};

/**
 * Remove stock from watchlist
 */
export const removeFromWatchlist = async (userId, symbol) => {
  if (!userId) throw new Error('User not authenticated');

  const watchlistRef = doc(db, 'users', userId, 'watchlist', symbol);
  await deleteDoc(watchlistRef);
};

/**
 * Toggle alerts for a watchlist item
 */
export const toggleWatchlistAlerts = async (userId, symbol, alertsEnabled) => {
  if (!userId) throw new Error('User not authenticated');

  const watchlistRef = doc(db, 'users', userId, 'watchlist', symbol);
  await updateDoc(watchlistRef, { alerts: alertsEnabled });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC TRADE FEED (for followers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get public trade feed (trades shared by verified traders)
 */
export const getPublicTradeFeed = async (limit = 20) => {
  try {
    const feedRef = collection(db, 'publicTrades');
    const q = query(feedRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching public trade feed:', error);
    return [];
  }
};

/**
 * Share a trade to public feed
 */
export const shareTradeToFeed = async (userId, trade, rationale) => {
  if (!userId) throw new Error('User not authenticated');

  const feedRef = collection(db, 'publicTrades');

  await addDoc(feedRef, {
    ...trade,
    rationale,
    traderId: userId,
    verified: true,
    timestamp: serverTimestamp()
  });
};

/**
 * Subscribe to public trade feed updates
 */
export const subscribeToPublicFeed = (callback, limit = 20) => {
  const feedRef = collection(db, 'publicTrades');
  const q = query(feedRef, orderBy('timestamp', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const trades = snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(trades);
  }, (error) => {
    console.error('Error subscribing to public feed:', error);
    callback([]);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get or create user profile
 */
export const getOrCreateUserProfile = async (user) => {
  if (!user) return null;

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return userDoc.data();
  }

  // Create new profile
  const profile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  };

  await setDoc(userRef, profile);
  return profile;
};

/**
 * Update last login
 */
export const updateLastLogin = async (userId) => {
  if (!userId) return;

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { lastLogin: serverTimestamp() });
};

export { db };
