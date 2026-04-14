import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

function getRoleFromSession(session) {
  return session?.user?.user_metadata?.role ?? null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const role = getRoleFromSession(session);
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{ session, signIn, signOut, role, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
