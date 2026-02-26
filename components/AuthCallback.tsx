import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing login...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback: Starting...');
        
        // Wait a moment for Supabase to process the OAuth redirect
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setMessage('Failed to get session');
          setTimeout(() => window.location.href = '/', 2000);
          return;
        }

        if (!session?.user) {
          console.error('No session found after OAuth');
          setStatus('error');
          setMessage('Failed to establish session');
          setTimeout(() => window.location.href = '/', 2000);
          return;
        }

        console.log('Session established for:', session.user.email);
        const authUser = session.user;

        // Check if profile exists in database
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!profileError && existingProfile) {
          // Profile exists, just redirect
          console.log('Profile exists, redirecting...');
          setStatus('success');
          setMessage('Login successful!');
          setTimeout(() => window.location.href = '/', 500);
          return;
        }

        // Profile doesn't exist, create it
        if (profileError?.code === 'PGRST116' || profileError?.status === 406) {
          console.log('Profile does not exist, creating...');
          setMessage('Creating user profile...');
          
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              email: authUser.email || null,
              full_name: authUser.user_metadata?.full_name || null,
              avatar_url: authUser.user_metadata?.avatar_url || null,
              github_username: authUser.user_metadata?.user_name || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (createError) {
            console.error('Error creating profile:', createError);
            // Still redirect even if profile creation fails
            console.log('Redirecting despite profile creation error...');
          } else {
            console.log('Profile created successfully');
          }

          setStatus('success');
          setMessage('Registration successful! Redirecting...');
          setTimeout(() => window.location.href = '/', 500);
          return;
        }

        // Other error while checking profile
        if (profileError) {
          console.error('Error checking profile:', profileError);
          setStatus('error');
          setMessage('Error checking user profile');
          setTimeout(() => window.location.href = '/', 2000);
          return;
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
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
          <p style={{ color: '#e2e8f0', marginTop: '16px' }}>{message}</p>
        </>
      )}
      {status === 'success' && (
        <p style={{ color: '#10b981' }}>✓ {message}</p>
      )}
      {status === 'error' && (
        <p style={{ color: '#f43f5e' }}>⚠ {message}</p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
