import { useState, useEffect, createContext, useContext } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true); setError(null);
    try { await signInWithPopup(auth, googleProvider); }
    catch (err) { setError(err.message); setLoading(false); throw err; }
  };

  const loginWithEmail = async (email, password) => {
    setLoading(true); setError(null);
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (err) { setError(err.message); setLoading(false); throw err; }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    setLoading(true); setError(null);
    try {
      const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) await updateProfile(u, { displayName });
    }
    catch (err) { setError(err.message); setLoading(false); throw err; }
  };

  const logout = async () => {
    setLoading(true); setError(null);
    try { await signOut(auth); }
    catch (err) { setError(err.message); setLoading(false); throw err; }
  };

  return (
    <AuthContext.Provider value={{
      user, loading, error, loginWithGoogle, loginWithEmail, signUpWithEmail, logout, isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
