import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, appleProvider } from '../firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { getOrCreateUserProfile, getUserProfile, validateInviteCode } from '../services/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /**
   * Sign up with email/password (requires invite code)
   */
  const signUpWithEmail = async (email, password, displayName, inviteCode) => {
    try {
      setError(null);

      // Validate invite code first
      const validation = await validateInviteCode(inviteCode);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Create Firebase auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      await updateProfile(result.user, { displayName });

      // Create user profile with invite code
      const profile = await getOrCreateUserProfile(result.user, inviteCode.toUpperCase());
      setUserProfile(profile);

      return result.user;
    } catch (err) {
      const message = getAuthErrorMessage(err.code) || err.message;
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Sign in with email/password
   */
  const signInWithEmail = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getOrCreateUserProfile(result.user);
      setUserProfile(profile);
      return result.user;
    } catch (err) {
      const message = getAuthErrorMessage(err.code) || err.message;
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Sign in with Google (requires invite code for new users)
   */
  const signInWithGoogle = async (inviteCode = null) => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);

      // Check if this is a new user
      const existingProfile = await getUserProfile(result.user.uid);

      if (!existingProfile && !inviteCode) {
        // New user without invite code - sign them out
        await signOut(auth);
        throw new Error('Invite code required for new accounts');
      }

      if (!existingProfile && inviteCode) {
        // Validate invite code for new users
        const validation = await validateInviteCode(inviteCode);
        if (!validation.valid) {
          await signOut(auth);
          throw new Error(validation.error);
        }
      }

      const profile = await getOrCreateUserProfile(result.user, inviteCode);
      setUserProfile(profile);
      return result.user;
    } catch (err) {
      const message = getAuthErrorMessage(err.code) || err.message;
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Sign in with Apple (requires invite code for new users)
   */
  const signInWithApple = async (inviteCode = null) => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, appleProvider);

      // Check if this is a new user
      const existingProfile = await getUserProfile(result.user.uid);

      if (!existingProfile && !inviteCode) {
        await signOut(auth);
        throw new Error('Invite code required for new accounts');
      }

      if (!existingProfile && inviteCode) {
        const validation = await validateInviteCode(inviteCode);
        if (!validation.valid) {
          await signOut(auth);
          throw new Error(validation.error);
        }
      }

      const profile = await getOrCreateUserProfile(result.user, inviteCode);
      setUserProfile(profile);
      return result.user;
    } catch (err) {
      const message = getAuthErrorMessage(err.code) || err.message;
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const message = getAuthErrorMessage(err.code) || err.message;
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Sign out
   */
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  /**
   * Check if user has a specific tier
   */
  const hasTier = (requiredTier) => {
    if (!userProfile) return false;
    const tier = userProfile.tier || 'free';

    if (requiredTier === 'free') return true;
    if (requiredTier === 'premium') return tier === 'premium' || tier === 'admin';
    if (requiredTier === 'admin') return tier === 'admin';

    return false;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return userProfile?.tier === 'admin';
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    logout,
    hasTier,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getAuthErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'This sign-in method is not enabled',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/popup-closed-by-user': 'Sign-in popup was closed',
    'auth/cancelled-popup-request': 'Sign-in was cancelled',
    'auth/popup-blocked': 'Sign-in popup was blocked by browser'
  };
  return messages[code] || null;
}
