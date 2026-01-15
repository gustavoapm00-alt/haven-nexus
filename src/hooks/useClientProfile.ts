import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

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
  config: Json;
  created_at: string;
  updated_at: string;
}

// Type guard to safely check if config is an object
export function isConfigObject(config: Json): config is { [key: string]: Json | undefined } {
  return typeof config === 'object' && config !== null && !Array.isArray(config);
}

// Safely get a string value from config
export function getConfigValue(config: Json, key: string): string | undefined {
  if (isConfigObject(config) && typeof config[key] === 'string') {
    return config[key] as string;
  }
  return undefined;
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
        // The new columns will be available after migration
        const rawProfile = profileData as Record<string, unknown>;
        setProfile({
          id: profileData.id,
          email: user.email || null,
          full_name: (rawProfile.full_name as string) || profileData.display_name || null,
          company_name: (rawProfile.company_name as string) || null,
          timezone: (rawProfile.timezone as string) || 'America/New_York',
          primary_goal: (rawProfile.primary_goal as string) || null,
          goals: (rawProfile.goals as string[]) || [],
          onboarding_complete: (rawProfile.onboarding_complete as boolean) || false,
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

      if (integrationsData) {
        setIntegrations(integrationsData.map(i => ({
          id: i.id,
          user_id: i.user_id,
          provider: i.provider,
          status: i.status || 'not_configured',
          config: i.config || {},
          created_at: i.created_at || new Date().toISOString(),
          updated_at: i.updated_at || new Date().toISOString(),
        })));
      }
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
        // These fields will be added by migration
        ...(updates.full_name !== undefined && { full_name: updates.full_name }),
        ...(updates.company_name !== undefined && { company_name: updates.company_name }),
        ...(updates.timezone !== undefined && { timezone: updates.timezone }),
        ...(updates.goals !== undefined && { goals: updates.goals }),
        ...(updates.primary_goal !== undefined && { primary_goal: updates.primary_goal }),
        ...(updates.onboarding_complete !== undefined && { onboarding_complete: updates.onboarding_complete }),
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
    config: Record<string, string> = {}
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Convert config to Json type safely
    const jsonConfig: Json = config as { [key: string]: string };

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
        .update({ 
          status, 
          config: jsonConfig, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('client_integrations')
        .insert({ 
          user_id: user.id, 
          provider, 
          status, 
          config: jsonConfig 
        })
        .select()
        .single();
    }

    if (!result.error && result.data) {
      const newIntegration: ClientIntegration = {
        id: result.data.id,
        user_id: result.data.user_id,
        provider: result.data.provider,
        status: result.data.status || 'not_configured',
        config: result.data.config || {},
        created_at: result.data.created_at || new Date().toISOString(),
        updated_at: result.data.updated_at || new Date().toISOString(),
      };

      setIntegrations(prev => {
        const idx = prev.findIndex(i => i.provider === provider);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newIntegration;
          return updated;
        }
        return [...prev, newIntegration];
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
    getConfigValue,
    isConfigObject,
  };
}
