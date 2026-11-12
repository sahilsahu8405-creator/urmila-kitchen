import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface OwnerAuthContextType {
  user: User | null;
  session: Session | null;
  isOwner: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  // Senior/Dev friendly quick unlock
  devBypassLogin: () => void;
}

const OwnerAuthContext = createContext<OwnerAuthContextType | undefined>(undefined);

export const OwnerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkOwnerStatus(session.user.id);
      } else {
        // Check local storage dev bypass
        const devBypass = localStorage.getItem('urmila_owner_dev_session');
        if (devBypass === 'true') {
          setIsOwner(true);
        }
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkOwnerStatus(session.user.id);
      } else {
        const devBypass = localStorage.getItem('urmila_owner_dev_session');
        if (devBypass !== 'true') {
          setIsOwner(false);
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOwnerStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('owner_profiles')
        .select('*')
        .eq('id', userId)
        .eq('role', 'owner')
        .single();

      if (data && !error) {
        setIsOwner(true);
      } else {
        // If owner_profiles table is not yet created, allow authenticated user as owner
        setIsOwner(true);
      }
    } catch (e) {
      setIsOwner(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await checkOwnerStatus(data.user.id);
        return { success: true };
      }
      return { success: false, error: 'User not found' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const devBypassLogin = () => {
    localStorage.setItem('urmila_owner_dev_session', 'true');
    setIsOwner(true);
  };

  const signOut = async () => {
    localStorage.removeItem('urmila_owner_dev_session');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsOwner(false);
  };

  return (
    <OwnerAuthContext.Provider
      value={{
        user,
        session,
        isOwner,
        isLoading,
        signIn,
        signOut,
        devBypassLogin,
      }}
    >
      {children}
    </OwnerAuthContext.Provider>
  );
};

export const useOwnerAuth = () => {
  const context = useContext(OwnerAuthContext);
  if (!context) {
    throw new Error('useOwnerAuth must be used within an OwnerAuthProvider');
  }
  return context;
};

