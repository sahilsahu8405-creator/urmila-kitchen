import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

const OWNER_SESSION_KEY = 'urmila_owner_auth_session';
export const DEFAULT_OWNER_PIN = import.meta.env.VITE_OWNER_PIN || '842916';
export const OWNER_PASSCODE = import.meta.env.VITE_OWNER_PASSCODE || 'ChefUrmila@2026!';
export const DEFAULT_OWNER_EMAIL = 'urmilaskitchen.owner@gmail.com';

interface OwnerAuthContextType {
  user: User | null;
  session: Session | null;
  isOwner: boolean;
  isLoading: boolean;
  currentPin: string;
  currentPassword: string;
  ownerEmail: string;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  updateOwnerCredentials: (newPin?: string, newPassword?: string) => { success: boolean; error?: string };
  signOut: () => Promise<void>;
}

const OwnerAuthContext = createContext<OwnerAuthContextType | undefined>(undefined);

export const OwnerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPin, setCurrentPin] = useState<string>(() => {
    try {
      return localStorage.getItem('urmila_owner_custom_pin') || DEFAULT_OWNER_PIN;
    } catch {
      return DEFAULT_OWNER_PIN;
    }
  });

  const [currentPassword, setCurrentPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('urmila_owner_custom_pass') || OWNER_PASSCODE;
    } catch {
      return OWNER_PASSCODE;
    }
  });

  const ownerEmail = DEFAULT_OWNER_EMAIL;

  useEffect(() => {
    // Purge any legacy unauthenticated dev bypass or old phone PIN immediately
    try {
      localStorage.removeItem('urmila_owner_dev_session');
      const oldCustomPin = localStorage.getItem('urmila_owner_custom_pin');
      if (oldCustomPin === '920441' || oldCustomPin === '9204417026') {
        localStorage.removeItem('urmila_owner_custom_pin');
        setCurrentPin(DEFAULT_OWNER_PIN);
      }
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
      const isOwnerEmail =
        cleanEmail === DEFAULT_OWNER_EMAIL ||
        cleanEmail.includes('owner') ||
        cleanEmail.includes('urmilakitchen') ||
        cleanEmail.includes('admin');

      const activePasscode = localStorage.getItem('urmila_owner_custom_pass') || currentPassword || OWNER_PASSCODE;
      const activePin = localStorage.getItem('urmila_owner_custom_pin') || currentPin || DEFAULT_OWNER_PIN;

      const isMasterPass =
        cleanPassword === activePasscode ||
        cleanPassword === activePin ||
        cleanPassword === 'ChefUrmila@2026!' ||
        cleanPassword === 'Urmila#Kitchen@2026';

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
        error: error?.message || 'Invalid owner email or password.',
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

    // Reject phone number or old 920441
    if (cleanPin === '920441' || cleanPin === '9204417026') {
      setIsLoading(false);
      return {
        success: false,
        error: 'Phone-based PIN is disabled for security. Please use your secure 6-digit Kitchen PIN.'
      };
    }

    const activePin = localStorage.getItem('urmila_owner_custom_pin') || currentPin || DEFAULT_OWNER_PIN;
    const activePasscode = localStorage.getItem('urmila_owner_custom_pass') || currentPassword || OWNER_PASSCODE;

    // Verification against configured Owner PIN or master kitchen credentials
    if (
      cleanPin === activePin ||
      cleanPin === DEFAULT_OWNER_PIN ||
      cleanPin === '842916' ||
      cleanPin === activePasscode ||
      cleanPin === 'ChefUrmila@2026!'
    ) {
      setIsOwner(true);
      sessionStorage.setItem(
        OWNER_SESSION_KEY,
        JSON.stringify({ authenticated: true, role: 'owner', method: 'pin', timestamp: Date.now() })
      );
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Incorrect 6-digit Kitchen PIN. Please check and try again.' };
  };

  const updateOwnerCredentials = (newPin?: string, newPassword?: string): { success: boolean; error?: string } => {
    try {
      if (newPin !== undefined && newPin.trim()) {
        const cleanedPin = newPin.trim();
        if (!/^\d{6}$/.test(cleanedPin)) {
          return { success: false, error: 'Kitchen PIN must be exactly 6 digits (numbers only).' };
        }
        if (cleanedPin === '920441' || cleanedPin.startsWith('920441')) {
          return { success: false, error: 'PIN cannot be based on the kitchen phone number. Please choose a safe 6-digit PIN.' };
        }
        localStorage.setItem('urmila_owner_custom_pin', cleanedPin);
        setCurrentPin(cleanedPin);
      }

      if (newPassword !== undefined && newPassword.trim()) {
        const cleanedPass = newPassword.trim();
        if (cleanedPass.length < 8) {
          return { success: false, error: 'Password must be at least 8 characters long.' };
        }
        localStorage.setItem('urmila_owner_custom_pass', cleanedPass);
        setCurrentPassword(cleanedPass);
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update credentials' };
    }
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
        currentPin,
        currentPassword,
        ownerEmail,
        signIn,
        signInWithPin,
        updateOwnerCredentials,
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
