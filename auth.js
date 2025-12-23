import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Replace these with your NEW project credentials from Settings > API
const SUPABASE_URL = 'https://qzexkscsxkzrgeeqdpvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6ZXhrc2NzeGt6cmdlZXFkcHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODgyNjUsImV4cCI6MjA4MTU2NDI2NX0.ImjOnKK24yxWLNlinwQPCx33n5kdQFYQK2SUkiEy_yc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        storageKey: 'smart-shop-session'
    }
});

/**
 * Checks if a user is logged in and has the correct role.
 * Matches your admin.html logic: checkAuth(['admin'])
 */
export async function checkAuth(allowedRoles = []) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        // Fetch the profile from the public.users table
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

        if (error || !profile) return null;

        // Role-based access control
        if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
            return null;
        }

        return profile;
    } catch (e) {
        return null;
    }
}