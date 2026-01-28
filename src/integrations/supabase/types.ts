export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activation_customer_updates: {
        Row: {
          attachment_url: string | null
          created_at: string
          credential_method: string | null
          credential_reference: string | null
          customer_email: string
          id: string
          message: string | null
          request_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          secure_link: string | null
          status: string
          tool_name: string | null
          update_type: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          credential_method?: string | null
          credential_reference?: string | null
          customer_email: string
          id?: string
          message?: string | null
          request_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          secure_link?: string | null
          status?: string
          tool_name?: string | null
          update_type: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          credential_method?: string | null
          credential_reference?: string | null
          customer_email?: string
          id?: string
          message?: string | null
          request_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          secure_link?: string | null
          status?: string
          tool_name?: string | null
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activation_customer_updates_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "installation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_catalog: {
        Row: {
          agent_key: string
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          model: string | null
          name: string
          output_schema: Json | null
          system_prompt: string
          user_prompt_template: string
        }
        Insert: {
          agent_key: string
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          name: string
          output_schema?: Json | null
          system_prompt: string
          user_prompt_template: string
        }
        Update: {
          agent_key?: string
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          name?: string
          output_schema?: Json | null
          system_prompt?: string
          user_prompt_template?: string
        }
        Relationships: []
      }
      agent_files: {
        Row: {
          agent_id: string
          created_at: string
          file_type: string
          id: string
          storage_path: string
          updated_at: string
          version: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          file_type: string
          id?: string
          storage_path: string
          updated_at?: string
          version?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          file_type?: string
          id?: string
          storage_path?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_files_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "automation_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_runs: {
        Row: {
          agent_key: string | null
          attempt_count: number
          created_at: string
          error: string | null
          id: string
          idempotency_key: string | null
          input_json: Json
          org_id: string
          output_json: Json | null
          output_text: string | null
          relevance_agent_id: string | null
          relevance_trace_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_key?: string | null
          attempt_count?: number
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string | null
          input_json?: Json
          org_id: string
          output_json?: Json | null
          output_text?: string | null
          relevance_agent_id?: string | null
          relevance_trace_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_key?: string | null
          attempt_count?: number
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string | null
          input_json?: Json
          org_id?: string
          output_json?: Json | null
          output_text?: string | null
          relevance_agent_id?: string | null
          relevance_trace_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          absence_test_48h: string
          breakdown_first: string
          consent_ack: boolean
          created_at: string
          decision_maker: boolean
          email: string
          error_message: string | null
          id: string
          n8n_request_id: string | null
          n8n_status: string
          name: string
          notes: string | null
          operational_volume: string
          primary_friction: string
          processing_ms: number | null
          status: string
          tool_entropy: string
        }
        Insert: {
          absence_test_48h: string
          breakdown_first: string
          consent_ack?: boolean
          created_at?: string
          decision_maker: boolean
          email: string
          error_message?: string | null
          id?: string
          n8n_request_id?: string | null
          n8n_status?: string
          name: string
          notes?: string | null
          operational_volume: string
          primary_friction: string
          processing_ms?: number | null
          status?: string
          tool_entropy: string
        }
        Update: {
          absence_test_48h?: string
          breakdown_first?: string
          consent_ack?: boolean
          created_at?: string
          decision_maker?: boolean
          email?: string
          error_message?: string | null
          id?: string
          n8n_request_id?: string | null
          n8n_status?: string
          name?: string
          notes?: string | null
          operational_volume?: string
          primary_friction?: string
          processing_ms?: number | null
          status?: string
          tool_entropy?: string
        }
        Relationships: []
      }
      automation_agents: {
        Row: {
          capacity_recovered_max: number
          capacity_recovered_min: number
          created_at: string
          current_version: string | null
          description: string
          featured: boolean
          guide_file_path: string | null
          how_it_works: string[]
          id: string
          important_notes: string[]
          includes: string[]
          name: string
          price_cents: number
          published_at: string | null
          requirements: string[]
          sectors: string[]
          setup_time_max: number
          setup_time_min: number
          short_outcome: string
          slug: string
          status: string
          systems: string[]
          updated_at: string
          workflow_file_path: string | null
          workflow_file_url: string | null
        }
        Insert: {
          capacity_recovered_max?: number
          capacity_recovered_min?: number
          created_at?: string
          current_version?: string | null
          description: string
          featured?: boolean
          guide_file_path?: string | null
          how_it_works?: string[]
          id?: string
          important_notes?: string[]
          includes?: string[]
          name: string
          price_cents?: number
          published_at?: string | null
          requirements?: string[]
          sectors?: string[]
          setup_time_max?: number
          setup_time_min?: number
          short_outcome: string
          slug: string
          status?: string
          systems?: string[]
          updated_at?: string
          workflow_file_path?: string | null
          workflow_file_url?: string | null
        }
        Update: {
          capacity_recovered_max?: number
          capacity_recovered_min?: number
          created_at?: string
          current_version?: string | null
          description?: string
          featured?: boolean
          guide_file_path?: string | null
          how_it_works?: string[]
          id?: string
          important_notes?: string[]
          includes?: string[]
          name?: string
          price_cents?: number
          published_at?: string | null
          requirements?: string[]
          sectors?: string[]
          setup_time_max?: number
          setup_time_min?: number
          short_outcome?: string
          slug?: string
          status?: string
          systems?: string[]
          updated_at?: string
          workflow_file_path?: string | null
          workflow_file_url?: string | null
        }
        Relationships: []
      }
      automation_bundles: {
        Row: {
          bundle_price_cents: number
          bundle_zip_path: string | null
          created_at: string
          description: string
          featured: boolean
          id: string
          included_agent_ids: string[]
          individual_value_cents: number
          name: string
          objective: string
          published_at: string | null
          sectors: string[]
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          bundle_price_cents?: number
          bundle_zip_path?: string | null
          created_at?: string
          description: string
          featured?: boolean
          id?: string
          included_agent_ids?: string[]
          individual_value_cents?: number
          name: string
          objective: string
          published_at?: string | null
          sectors?: string[]
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          bundle_price_cents?: number
          bundle_zip_path?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          included_agent_ids?: string[]
          individual_value_cents?: number
          name?: string
          objective?: string
          published_at?: string | null
          sectors?: string[]
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_billing: {
        Row: {
          created_at: string | null
          current_price_id: string | null
          current_product_id: string | null
          email_notifications_enabled: boolean | null
          renewal_reminders_enabled: boolean | null
          status: string | null
          stripe_customer_id: string | null
          subscription_end: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_price_id?: string | null
          current_product_id?: string | null
          email_notifications_enabled?: boolean | null
          renewal_reminders_enabled?: boolean | null
          status?: string | null
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_price_id?: string | null
          current_product_id?: string | null
          email_notifications_enabled?: boolean | null
          renewal_reminders_enabled?: boolean | null
          status?: string | null
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          provider: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          provider: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          provider?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          metadata: Json | null
          read: boolean | null
          severity: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read?: boolean | null
          severity?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read?: boolean | null
          severity?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      client_usage_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          item_id: string | null
          item_type: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      deployment_requests: {
        Row: {
          audit_id: string | null
          contact_method: string
          created_at: string
          diagnosis_id: string | null
          email: string
          id: string
          name: string
          notes: string | null
          preferred_involvement: string
          status: string
          timeline: string
          tools_stack: string | null
        }
        Insert: {
          audit_id?: string | null
          contact_method: string
          created_at?: string
          diagnosis_id?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          preferred_involvement: string
          status?: string
          timeline: string
          tools_stack?: string | null
        }
        Update: {
          audit_id?: string | null
          contact_method?: string
          created_at?: string
          diagnosis_id?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          preferred_involvement?: string
          status?: string
          timeline?: string
          tools_stack?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_requests_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_requests_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "diagnoses"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnoses: {
        Row: {
          audit_id: string
          confidence: number
          created_at: string
          disclaimer: string
          id: string
          leak_hours_high: number
          leak_hours_low: number
          next_step: string
          plain_language_cause: string
          primary_failure_mode: string
          raw_signals: Json | null
          readiness_level: string
          recommended_systems: Json
          recovered_hours_high: number
          recovered_hours_low: number
          what_is_happening: string
        }
        Insert: {
          audit_id: string
          confidence?: number
          created_at?: string
          disclaimer?: string
          id?: string
          leak_hours_high: number
          leak_hours_low: number
          next_step?: string
          plain_language_cause: string
          primary_failure_mode: string
          raw_signals?: Json | null
          readiness_level?: string
          recommended_systems?: Json
          recovered_hours_high: number
          recovered_hours_low: number
          what_is_happening: string
        }
        Update: {
          audit_id?: string
          confidence?: number
          created_at?: string
          disclaimer?: string
          id?: string
          leak_hours_high?: number
          leak_hours_low?: number
          next_step?: string
          plain_language_cause?: string
          primary_failure_mode?: string
          raw_signals?: Json | null
          readiness_level?: string
          recommended_systems?: Json
          recovered_hours_high?: number
          recovered_hours_low?: number
          what_is_happening?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: true
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      edge_function_logs: {
        Row: {
          created_at: string
          details: Json | null
          duration_ms: number | null
          function_name: string
          id: string
          ip_address: string | null
          level: string
          message: string
          status_code: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          function_name: string
          id?: string
          ip_address?: string | null
          level?: string
          message: string
          status_code?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          function_name?: string
          id?: string
          ip_address?: string | null
          level?: string
          message?: string
          status_code?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      email_updates: {
        Row: {
          created_at: string
          email: string
          id: string
          source_page: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source_page?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source_page?: string | null
        }
        Relationships: []
      }
      engagement_requests: {
        Row: {
          admin_seen: boolean | null
          calm_in_30_days: string | null
          company_name: string | null
          created_at: string
          current_tools: string[] | null
          email: string
          id: string
          last_contacted_at: string | null
          name: string
          notes_internal: string | null
          operational_pain: string
          primary_goal: string
          status: string
          team_size: string
          website: string | null
        }
        Insert: {
          admin_seen?: boolean | null
          calm_in_30_days?: string | null
          company_name?: string | null
          created_at?: string
          current_tools?: string[] | null
          email: string
          id?: string
          last_contacted_at?: string | null
          name: string
          notes_internal?: string | null
          operational_pain: string
          primary_goal: string
          status?: string
          team_size: string
          website?: string | null
        }
        Update: {
          admin_seen?: boolean | null
          calm_in_30_days?: string | null
          company_name?: string | null
          created_at?: string
          current_tools?: string[] | null
          email?: string
          id?: string
          last_contacted_at?: string | null
          name?: string
          notes_internal?: string | null
          operational_pain?: string
          primary_goal?: string
          status?: string
          team_size?: string
          website?: string | null
        }
        Relationships: []
      }
      installation_requests: {
        Row: {
          activation_eta: string | null
          activation_notes_customer: string | null
          activation_notes_internal: string | null
          automation_id: string | null
          awaiting_credentials_since: string | null
          bundle_id: string | null
          company: string | null
          created_at: string
          customer_visible_status: string | null
          email: string
          id: string
          internal_owner: string | null
          last_notified_status: string | null
          last_reminder_sent_at: string | null
          name: string
          notes: string | null
          preferred_systems: string | null
          purchase_id: string | null
          purchased_item: string | null
          reminder_count: number
          reminders_disabled: boolean
          setup_window: string | null
          status: string | null
          status_updated_at: string | null
        }
        Insert: {
          activation_eta?: string | null
          activation_notes_customer?: string | null
          activation_notes_internal?: string | null
          automation_id?: string | null
          awaiting_credentials_since?: string | null
          bundle_id?: string | null
          company?: string | null
          created_at?: string
          customer_visible_status?: string | null
          email: string
          id?: string
          internal_owner?: string | null
          last_notified_status?: string | null
          last_reminder_sent_at?: string | null
          name: string
          notes?: string | null
          preferred_systems?: string | null
          purchase_id?: string | null
          purchased_item?: string | null
          reminder_count?: number
          reminders_disabled?: boolean
          setup_window?: string | null
          status?: string | null
          status_updated_at?: string | null
        }
        Update: {
          activation_eta?: string | null
          activation_notes_customer?: string | null
          activation_notes_internal?: string | null
          automation_id?: string | null
          awaiting_credentials_since?: string | null
          bundle_id?: string | null
          company?: string | null
          created_at?: string
          customer_visible_status?: string | null
          email?: string
          id?: string
          internal_owner?: string | null
          last_notified_status?: string | null
          last_reminder_sent_at?: string | null
          name?: string
          notes?: string | null
          preferred_systems?: string | null
          purchase_id?: string | null
          purchased_item?: string | null
          reminder_count?: number
          reminders_disabled?: boolean
          setup_window?: string | null
          status?: string | null
          status_updated_at?: string | null
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      org_subscriptions: {
        Row: {
          org_id: string
          period_end: string | null
          period_start: string | null
          plan_id: string | null
          runs_used_this_period: number
          status: string
          updated_at: string | null
        }
        Insert: {
          org_id: string
          period_end?: string | null
          period_start?: string | null
          plan_id?: string | null
          runs_used_this_period?: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          org_id?: string
          period_end?: string | null
          period_start?: string | null
          plan_id?: string | null
          runs_used_this_period?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      plan_entitlements: {
        Row: {
          agent_key: string
          included: boolean | null
          per_agent_run_limit: number | null
          plan_id: string
        }
        Insert: {
          agent_key: string
          included?: boolean | null
          per_agent_run_limit?: number | null
          plan_id: string
        }
        Update: {
          agent_key?: string
          included?: boolean | null
          per_agent_run_limit?: number | null
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_entitlements_agent_key_fkey"
            columns: ["agent_key"]
            isOneToOne: false
            referencedRelation: "agent_catalog"
            referencedColumns: ["agent_key"]
          },
          {
            foreignKeyName: "plan_entitlements_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          monthly_run_limit: number
          name: string
          price_display: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_run_limit?: number
          name: string
          price_display: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_run_limit?: number
          name?: string
          price_display?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          full_name: string | null
          goals: string[] | null
          id: string
          onboarding_complete: boolean | null
          primary_goal: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          goals?: string[] | null
          id: string
          onboarding_complete?: boolean | null
          primary_goal?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          goals?: string[] | null
          id?: string
          onboarding_complete?: boolean | null
          primary_goal?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          created_at: string
          download_count: number | null
          email: string
          id: string
          item_id: string
          item_type: string
          last_download_at: string | null
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          download_count?: number | null
          email: string
          id?: string
          item_id: string
          item_type: string
          last_download_at?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          download_count?: number | null
          email?: string
          id?: string
          item_id?: string
          item_type?: string
          last_download_at?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      relevance_agents: {
        Row: {
          agent_key: string
          created_at: string
          id: string
          is_enabled: boolean
          name: string
          org_id: string
          outbound_secret: string | null
          trigger_url: string
          updated_at: string
        }
        Insert: {
          agent_key: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          name: string
          org_id: string
          outbound_secret?: string | null
          trigger_url: string
          updated_at?: string
        }
        Update: {
          agent_key?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          name?: string
          org_id?: string
          outbound_secret?: string | null
          trigger_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relevance_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      relevance_agents_safe: {
        Row: {
          agent_key: string | null
          created_at: string | null
          id: string | null
          is_enabled: boolean | null
          name: string | null
          org_id: string | null
          outbound_secret: string | null
          trigger_url: string | null
          updated_at: string | null
        }
        Insert: {
          agent_key?: string | null
          created_at?: string | null
          id?: string | null
          is_enabled?: boolean | null
          name?: string | null
          org_id?: string | null
          outbound_secret?: never
          trigger_url?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_key?: string | null
          created_at?: string | null
          id?: string | null
          is_enabled?: boolean | null
          name?: string | null
          org_id?: string | null
          outbound_secret?: never
          trigger_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relevance_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_cooldown_seconds?: number
          p_identifier: string
        }
        Returns: boolean
      }
      cleanup_old_edge_logs: { Args: never; Returns: undefined }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      get_usage_analytics: { Args: { p_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_org_admin_or_owner: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
