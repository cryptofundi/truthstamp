/**
 * TruthStamp Supabase client
 *
 * Provides:
 *   window.tsAuth.signUp(email, password, displayName)
 *   window.tsAuth.signIn(email, password)
 *   window.tsAuth.signOut()
 *   window.tsAuth.getUser()         — current logged-in user (or null)
 *   window.tsAuth.getProfile()      — profile row from public.profiles
 *   window.tsAuth.onAuthChange(cb)  — subscribe to login/logout events
 *
 *   window.tsDB                     — direct Supabase client for queries
 *
 * This file requires:
 *   1. js/config.js to be loaded BEFORE this file
 *   2. The @supabase/supabase-js library (loaded via CDN below)
 */

(function() {
  'use strict';

  if (!window.TRUTHSTAMP_CONFIG) {
    console.error('TruthStamp: config.js must be loaded before supabase-client.js');
    return;
  }

  const cfg = window.TRUTHSTAMP_CONFIG;

  // Load Supabase library from CDN if not already present
  // (We load it dynamically so we don't require every page to script-tag it)
  if (typeof window.supabase === 'undefined') {
    console.error('TruthStamp: Supabase library not loaded. Add the CDN script tag before this file.');
    return;
  }

  // Initialize the client (singleton — one per page)
  const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,        // keep user logged in across pages
      autoRefreshToken: true,      // refresh JWT before it expires
      detectSessionInUrl: true,    // for OAuth callbacks
      storage: window.localStorage // use localStorage (default)
    }
  });

  window.tsDB = sb;

  // ----------------------------------------------------------------
  // Auth helpers
  // ----------------------------------------------------------------

  const tsAuth = {
    /**
     * Sign up a new user with email + password.
     * Profile row is auto-created by our Postgres trigger (handle_new_user).
     * 10 free credits are auto-granted by grant_signup_bonus().
     *
     * Returns { user, error }.
     */
    async signUp(email, password, displayName) {
      const { data, error } = await sb.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            name: displayName || email.split('@')[0],
            signup_source: 'web'
          }
        }
      });
      return { user: data?.user || null, error };
    },

    /**
     * Log in with email + password.
     * Returns { user, session, error }.
     */
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      });
      return { user: data?.user || null, session: data?.session || null, error };
    },

    /**
     * Sign out the current user. Clears session from storage.
     */
    async signOut() {
      const { error } = await sb.auth.signOut();
      return { error };
    },

    /**
     * Send a password reset email.
     */
    async sendPasswordReset(email) {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + '/auth.html'
      });
      return { error };
    },

    /**
     * Get the currently logged-in user (or null).
     * This is async because Supabase reads from secure storage.
     */
    async getUser() {
      const { data: { user } } = await sb.auth.getUser();
      return user;
    },

    /**
     * Get the current session (with access token, etc.) or null.
     */
    async getSession() {
      const { data: { session } } = await sb.auth.getSession();
      return session;
    },

    /**
     * Get the user's profile row from public.profiles.
     * Returns the profile object or null.
     */
    async getProfile() {
      const user = await this.getUser();
      if (!user) return null;

      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Failed to load profile:', error);
        return null;
      }
      return data;
    },

    /**
     * Subscribe to auth state changes (login, logout, token refresh).
     * Callback receives (event, session). Returns the subscription
     * (call .unsubscribe() to stop).
     */
    onAuthChange(callback) {
      return sb.auth.onAuthStateChange(callback);
    }
  };

  window.tsAuth = tsAuth;

  // ----------------------------------------------------------------
  // Convenience: redirect to login if not authenticated
  // ----------------------------------------------------------------

  /**
   * Call this on protected pages. Redirects to auth.html if not logged in.
   * Returns the user if logged in, otherwise null (after redirect kicks off).
   */
  window.tsRequireAuth = async function() {
    const user = await tsAuth.getUser();
    if (!user) {
      const returnTo = encodeURIComponent(window.location.pathname);
      window.location.href = cfg.LOGIN_REDIRECT + '?return_to=' + returnTo;
      return null;
    }
    return user;
  };

  /**
   * Call this on auth.html. If user is already logged in, redirect to dashboard.
   */
  window.tsRedirectIfAuthed = async function() {
    const user = await tsAuth.getUser();
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('return_to');
      window.location.href = returnTo || cfg.POST_AUTH_REDIRECT;
    }
  };

  console.log('[TruthStamp] Supabase client ready. URL:', cfg.SUPABASE_URL);
})();
