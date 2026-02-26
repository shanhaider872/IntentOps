import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback: Processing OAuth redirect...');
        
        // Supabase automatically handles the OAuth code from the URL
        // Wait for the session to be fully established
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get the session - it should be available now
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setStatus('error');
          setTimeout(() => window.location.href = '/', 2000);
          return;
        }
        
        if (session?.user) {
          // Store GitHub token if available
          if (session.provider_token) {
            localStorage.setItem('github_token', session.provider_token);
            console.log('GitHub token stored successfully');
          }
          
          // Also store the access token for general use
          if (session.access_token) {
            localStorage.setItem('supabase_access_token', session.access_token);
          }
          
          console.log('Session established for:', session.user.email);
          setStatus('success');
          
          // Give the auth listener time to process and update state
          // Then redirect to home
          setTimeout(() => {
            console.log('Redirecting to home...');
            window.location.href = '/';
          }, 1000);
        } else {
          console.log('No session found yet, redirecting to home');
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setTimeout(() => window.location.href = '/', 2000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#0f172a'
    }}>
      {status === 'processing' && (
        <>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #334155',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#e2e8f0', marginTop: '16px' }}>Processing login...</p>
        </>
      )}
      {status === 'success' && (
        <p style={{ color: '#10b981' }}>✓ Login successful! Redirecting...</p>
      )}
      {status === 'error' && (
        <p style={{ color: '#f43f5e' }}>⚠ Login failed. Redirecting...</p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
