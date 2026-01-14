import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ClientProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  timezone: string | null;
  primary_goal: string | null;
  goals: string[];
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientIntegration {
  id: string;
  user_id: string;
  provider: string;
  status: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function useClientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [integrations, setIntegrations] = useState<ClientIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIntegrations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch profile from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        // Map the existing profiles table to our ClientProfile interface
        setProfile({
          id: profileData.id,
          email: user.email || null,
          full_name: profileData.display_name,
          company_name: null, // Will be stored in metadata or separate field
          timezone: 'America/New_York',
          primary_goal: null,
          goals: [],
          onboarding_complete: false, // Default, check metadata
          created_at: profileData.created_at,
          updated_at: profileData.updated_at,
        });
      } else {
        // Create minimal profile - the actual profile creation happens on auth
        setProfile({
          id: user.id,
          email: user.email || null,
          full_name: null,
          company_name: null,
          timezone: 'America/New_York',
          primary_goal: null,
          goals: [],
          onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Fetch integrations
      const { data: integrationsData } = await supabase
        .from('client_integrations')
        .select('*')
        .eq('user_id', user.id);

      setIntegrations((integrationsData || []) as ClientIntegration[]);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<ClientProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Update the profiles table with mapped fields
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: updates.full_name,
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  const upsertIntegration = async (
    provider: string, 
    status: string, 
    config: Record<string, unknown> = {}
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    // First check if exists
    const { data: existing } = await supabase
      .from('client_integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from('client_integrations')
        .update({ status, config, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('client_integrations')
        .insert({ user_id: user.id, provider, status, config })
        .select()
        .single();
    }

    if (!result.error && result.data) {
      setIntegrations(prev => {
        const idx = prev.findIndex(i => i.provider === provider);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = result.data as ClientIntegration;
          return updated;
        }
        return [...prev, result.data as ClientIntegration];
      });
    }

    return result;
  };

  return {
    profile,
    integrations,
    isLoading,
    updateProfile,
    upsertIntegration,
    refetch: fetchProfile,
  };
}
