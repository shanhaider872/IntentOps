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

  // Initialize auth on component mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Check if there's a stored session in Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          console.log('Session found for:', session.user.email);
          setUserEmail(session.user.email || null);
          
          if (session.provider_token) {
            localStorage.setItem('github_token', session.provider_token);
          }
          
          // Fetch the user's profile
          await fetchProfile(session.user.id);
        } else {
          console.log('No session found');
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up listener for future auth changes (sign out, token refresh, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user.email);
        setUserEmail(session.user.email || null);
        if (session.provider_token) {
          localStorage.setItem('github_token', session.provider_token);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setUserEmail(null);
        localStorage.removeItem('github_token');
      }
    });

    return () => {
      mounted = false;
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
        if (error.code === 'PGRST116' || error.status === 406) {
          console.log('Profile does not exist yet');
          return;
        }
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        console.log('Profile fetched:', data.email);
        setUser(data);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    }
  };

  const createProfile = async (userId: string, email: string, fullName?: string, avatarUrl?: string) => {
    try {
      console.log('Creating profile for:', email);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName || null,
          avatar_url: avatarUrl || null,
          github_username: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      setUser(data);
      console.log('Profile created successfully');
    } catch (err) {
      console.error('Error in createProfile:', err);
      throw err;
    }
  };

  const signInWithGitHub = async () => {
    try {
      console.log('Starting GitHub OAuth sign in...');
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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      setUser(null);
      setUserEmail(null);
    } catch (err) {
      console.error('Sign out error:', err);
      throw err;
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  // Expose createProfile through context
  const contextValue = {
    user,
    userEmail,
    isLoading,
    signInWithGitHub,
    signOut,
    refreshUser,
    createProfile,
  };

  return (
    <AuthContext.Provider value={contextValue as any}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context as AuthContextType & { createProfile: (userId: string, email: string, fullName?: string, avatarUrl?: string) => Promise<void> };
};
