import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial user state from Supabase session
    const getInitialUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        setProfile(profileData);
      }
      setLoading(false);
    };

    getInitialUser();

    // Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // LOGIN via Supabase Auth
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  // REGISTER via Supabase Auth
  const signUp = async (username, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) throw error;

    // Create corresponding profile record if user created
    if (data?.user) {
      await supabase.from('profiles').insert([
        {
          id: data.user.id,
          username,
          role: 'USER',
          avatar_url: ''
        }
      ]);
    }

    return data;
  };

  // LOGOUT via Supabase Auth
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};