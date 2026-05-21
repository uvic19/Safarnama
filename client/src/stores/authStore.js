import { create } from 'zustand';
import { auth, googleProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth listener
  initAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
    return unsubscribe;
  },

  loginWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loginWithEmail: async (email, password) => {
    try {
      set({ loading: true, error: null });
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    try {
      set({ loading: true, error: null });
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(user, { displayName });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await signOut(auth);
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
