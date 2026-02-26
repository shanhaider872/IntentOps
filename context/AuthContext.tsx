import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Profile } from '../types';

interface AuthContextType {
  user: Profile | null;
  userEmail: string | null;
  isLoading: boolean;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let isInitialized = false;

    // Listen for auth changes - this handles both initial session and future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        // Store GitHub token if available
        if (session.provider_token) {
          localStorage.setItem('github_token', session.provider_token);
        }
        // Store email from auth session
        setUserEmail(session.user.email || null);
        await fetchProfile(session.user.id);
        setIsLoading(false);
        isInitialized = true;
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserEmail(null);
        localStorage.removeItem('github_token');
        setIsLoading(false);
        isInitialized = true;
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Handle token refresh
        setUserEmail(session.user.email || null);
        if (session.provider_token) {
          localStorage.setItem('github_token', session.provider_token);
        }
      } else if (event === 'INITIAL_SESSION') {
        // This fires on app startup with the restored session
        if (session?.user) {
          console.log('Initial session restored for:', session.user.email);
          setUserEmail(session.user.email || null);
          if (session.provider_token) {
            localStorage.setItem('github_token', session.provider_token);
          }
          await fetchProfile(session.user.id);
        } else {
          console.log('No initial session found');
        }
        setIsLoading(false);
        isInitialized = true;
      }
    });

    // Fallback: if auth state doesn't fire within 2 seconds, force loading to false
    const timeoutId = setTimeout(() => {
      if (mounted && !isInitialized) {
        console.warn('Auth state change timeout - forcing loading to false');
        setIsLoading(false);
        isInitialized = true;
      }
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist yet, create a minimal profile from session data
        if (error.code === 'PGRST116') {
          console.log('Profile does not exist, waiting for database sync...');
          // Give database a moment to sync
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (retryError) {
            console.error('Profile still not found after retry:', retryError);
            return;
          }
          
          setUser(retryData);
        }
        return;
      }

      setUser(data);
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('GitHub OAuth error:', error);
        alert(`Sign in failed: ${error.message}`);
        throw error;
      }
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
    setUser(null);
  };

  const refreshUser = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userEmail, isLoading, signInWithGitHub, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
