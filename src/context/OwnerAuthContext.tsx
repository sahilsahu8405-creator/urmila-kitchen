import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

const OWNER_SESSION_KEY = 'urmila_owner_auth_session';
const DEFAULT_OWNER_PIN = import.meta.env.VITE_OWNER_PIN || '920441';
const OWNER_PASSCODE = import.meta.env.VITE_OWNER_PASSCODE || 'UrmilaKitchen2026!';

interface OwnerAuthContextType {
  user: User | null;
  session: Session | null;
  isOwner: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const OwnerAuthContext = createContext<OwnerAuthContextType | undefined>(undefined);

export const OwnerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Purge any legacy unauthenticated dev bypass immediately
    try {
      localStorage.removeItem('urmila_owner_dev_session');
    } catch {
      // ignore
    }

    // Check for an active session
    const initAuth = async () => {
      try {
        // 1. Check Supabase auth session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsOwner(true);
          setIsLoading(false);
          return;
        }

        // 2. Check secure sessionStorage for verified owner session
        const storedSession = sessionStorage.getItem(OWNER_SESSION_KEY);
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            // Session valid if timestamp is within last 12 hours
            if (parsed && parsed.authenticated && (Date.now() - parsed.timestamp < 12 * 60 * 60 * 1000)) {
              setIsOwner(true);
              setIsLoading(false);
              return;
            }
          } catch {
            sessionStorage.removeItem(OWNER_SESSION_KEY);
          }
        }

        // Not authenticated
        setIsOwner(false);
      } catch (err) {
        console.error('Error during auth check:', err);
        setIsOwner(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setIsOwner(true);
      } else {
        // If not in sessionStorage either, lock access
        const storedSession = sessionStorage.getItem(OWNER_SESSION_KEY);
        if (!storedSession) {
          setIsOwner(false);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // 1. Try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!error && data?.session?.user) {
        setUser(data.user);
        setSession(data.session);
        setIsOwner(true);
        sessionStorage.setItem(
          OWNER_SESSION_KEY,
          JSON.stringify({ authenticated: true, role: 'owner', email: cleanEmail, timestamp: Date.now() })
        );
        setIsLoading(false);
        return { success: true };
      }

      // 2. Check against owner master credentials / kitchen secret
      const isOwnerEmail = cleanEmail.includes('owner') || cleanEmail.includes('urmilakitchen') || cleanEmail.includes('admin') || cleanEmail === 'urmilaskitchen.owner@gmail.com';
      const isMasterPass = cleanPassword === OWNER_PASSCODE || cleanPassword === DEFAULT_OWNER_PIN || cleanPassword === '920441';

      if (isOwnerEmail && isMasterPass) {
        setIsOwner(true);
        sessionStorage.setItem(
          OWNER_SESSION_KEY,
          JSON.stringify({ authenticated: true, role: 'owner', email: cleanEmail, timestamp: Date.now() })
        );
        setIsLoading(false);
        return { success: true };
      }

      // Handle specific Supabase errors cleanly
      if (error?.message?.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          error: 'Email confirmation pending in Supabase. Please verify the email or sign in using your Kitchen PIN.',
        };
      }

      return {
        success: false,
        error: error?.message || 'Invalid owner credentials. Please check your email and password.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPin = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanPin = pin.trim();

    // Verification against configured Owner PIN or master kitchen PIN (920441)
    if (cleanPin === DEFAULT_OWNER_PIN || cleanPin === '920441' || cleanPin === OWNER_PASSCODE) {
      setIsOwner(true);
      sessionStorage.setItem(
        OWNER_SESSION_KEY,
        JSON.stringify({ authenticated: true, role: 'owner', method: 'pin', timestamp: Date.now() })
      );
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Incorrect 6-digit Kitchen PIN. Please try again.' };
  };

  const signOut = async () => {
    try {
      sessionStorage.removeItem(OWNER_SESSION_KEY);
      localStorage.removeItem('urmila_owner_dev_session');
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setUser(null);
      setSession(null);
      setIsOwner(false);
    }
  };

  return (
    <OwnerAuthContext.Provider
      value={{
        user,
        session,
        isOwner,
        isLoading,
        signIn,
        signInWithPin,
        signOut,
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
