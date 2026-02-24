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
export const getOrCreateUserProfile = async (user, inviteCode = null) => {
  if (!user) return null;

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    // Update last login
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
    return userDoc.data();
  }

  // Create new profile with tier
  const profile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL || null,
    tier: 'free',
    inviteCode: inviteCode || null,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  };

  await setDoc(userRef, profile);

  // Mark invite code as used
  if (inviteCode) {
    try {
      await useInviteCode(inviteCode, user.uid);
    } catch (error) {
      console.error('Error marking invite code as used:', error);
    }
  }

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

// ─────────────────────────────────────────────────────────────────────────────
// INVITE CODES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a random invite code
 */
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars (0,O,1,I)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Create a new invite code (admin only)
 */
export const createInviteCode = async (creatorId, maxUses = 1) => {
  const code = generateCode();
  const codeRef = doc(db, 'inviteCodes', code);

  await setDoc(codeRef, {
    code,
    createdBy: creatorId,
    createdAt: serverTimestamp(),
    maxUses,
    uses: 0,
    usedBy: [],
    active: true
  });

  return code;
};

/**
 * Validate an invite code
 */
export const validateInviteCode = async (code) => {
  if (!code) return { valid: false, error: 'No code provided' };

  const codeRef = doc(db, 'inviteCodes', code.toUpperCase());
  const codeDoc = await getDoc(codeRef);

  if (!codeDoc.exists()) {
    return { valid: false, error: 'Invalid invite code' };
  }

  const codeData = codeDoc.data();

  if (!codeData.active) {
    return { valid: false, error: 'This invite code is no longer active' };
  }

  if (codeData.uses >= codeData.maxUses) {
    return { valid: false, error: 'This invite code has reached its usage limit' };
  }

  return { valid: true, codeData };
};

/**
 * Use an invite code (mark as used by a user)
 */
export const useInviteCode = async (code, userId) => {
  const codeRef = doc(db, 'inviteCodes', code.toUpperCase());
  const codeDoc = await getDoc(codeRef);

  if (!codeDoc.exists()) {
    throw new Error('Invalid invite code');
  }

  const codeData = codeDoc.data();

  await updateDoc(codeRef, {
    uses: codeData.uses + 1,
    usedBy: [...codeData.usedBy, { userId, usedAt: new Date().toISOString() }]
  });
};

/**
 * Get all invite codes (admin only)
 */
export const getAllInviteCodes = async () => {
  const codesRef = collection(db, 'inviteCodes');
  const q = query(codesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Deactivate an invite code
 */
export const deactivateInviteCode = async (code) => {
  const codeRef = doc(db, 'inviteCodes', code);
  await updateDoc(codeRef, { active: false });
};

// ─────────────────────────────────────────────────────────────────────────────
// USER TIERS & SUBSCRIPTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * User tier constants
 */
export const USER_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ADMIN: 'admin'
};

/**
 * Feature limits by tier
 */
export const TIER_LIMITS = {
  [USER_TIERS.FREE]: {
    maxTrades: 10,
    maxWatchlist: 5,
    advancedCharts: false,
    exportData: false,
    prioritySupport: false
  },
  [USER_TIERS.PREMIUM]: {
    maxTrades: Infinity,
    maxWatchlist: Infinity,
    advancedCharts: true,
    exportData: true,
    prioritySupport: true
  },
  [USER_TIERS.ADMIN]: {
    maxTrades: Infinity,
    maxWatchlist: Infinity,
    advancedCharts: true,
    exportData: true,
    prioritySupport: true,
    manageUsers: true,
    createInviteCodes: true
  }
};

/**
 * Get user profile with tier info
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;

  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) return null;

  return userDoc.data();
};

/**
 * Update user tier
 */
export const updateUserTier = async (userId, tier) => {
  if (!userId) throw new Error('User not authenticated');
  if (!Object.values(USER_TIERS).includes(tier)) {
    throw new Error('Invalid tier');
  }

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    tier,
    tierUpdatedAt: serverTimestamp()
  });
};

/**
 * Check if user can perform action based on tier
 */
export const checkTierPermission = async (userId, feature) => {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  const tier = profile.tier || USER_TIERS.FREE;
  const limits = TIER_LIMITS[tier];

  return limits[feature] || false;
};

/**
 * Get user's usage stats
 */
export const getUserUsageStats = async (userId) => {
  if (!userId) return null;

  const trades = await getUserTrades(userId);
  const watchlist = await getUserWatchlist(userId);
  const profile = await getUserProfile(userId);

  const tier = profile?.tier || USER_TIERS.FREE;
  const limits = TIER_LIMITS[tier];

  return {
    trades: {
      count: trades.length,
      limit: limits.maxTrades,
      remaining: Math.max(0, limits.maxTrades - trades.length)
    },
    watchlist: {
      count: watchlist.length,
      limit: limits.maxWatchlist,
      remaining: Math.max(0, limits.maxWatchlist - watchlist.length)
    },
    tier,
    features: limits
  };
};

export { db };
