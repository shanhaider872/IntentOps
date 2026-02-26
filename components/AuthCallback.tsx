import React, { useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const AuthCallback: React.FC = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback
        // Just wait for the session to be established
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Store GitHub token if available
          if (session.provider_token) {
            localStorage.setItem('github_token', session.provider_token);
          }
          // Redirect to home after successful login
          window.location.href = '/';
        } else {
          // If no session, redirect back to home
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        window.location.href = '/';
      }
    };

    handleCallback();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#0f172a'
    }}>
      <p style={{ color: '#e2e8f0' }}>Processing login...</p>
    </div>
  );
};
