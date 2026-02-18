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
      activation_credentials: {
        Row: {
          created_at: string
          created_by: string
          credential_type: string
          encrypted_data: string
          encryption_iv: string
          encryption_tag: string
          expires_at: string | null
          id: string
          last_verified_at: string | null
          metadata: Json | null
          request_id: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          service_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          credential_type: string
          encrypted_data: string
          encryption_iv: string
          encryption_tag: string
          expires_at?: string | null
          id?: string
          last_verified_at?: string | null
          metadata?: Json | null
          request_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          service_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          credential_type?: string
          encrypted_data?: string
          encryption_iv?: string
          encryption_tag?: string
          expires_at?: string | null
          id?: string
          last_verified_at?: string | null
          metadata?: Json | null
          request_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          service_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activation_credentials_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "installation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
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
      admin_notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          metadata: Json | null
          read: boolean
          severity: string
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          severity?: string
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          severity?: string
          title?: string
          type?: string
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
      agent_heartbeats: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          message: string
          metadata: Json
          status: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json
          status?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json
          status?: string
        }
        Relationships: []
      }
      agent_registry: {
        Row: {
          codename: string
          created_at: string
          fn_description: string
          has_site_scan: boolean
          id: string
          module: string
          ref_id: string
          sort_order: number
          system_impact: string
        }
        Insert: {
          codename: string
          created_at?: string
          fn_description?: string
          has_site_scan?: boolean
          id: string
          module: string
          ref_id?: string
          sort_order?: number
          system_impact?: string
        }
        Update: {
          codename?: string
          created_at?: string
          fn_description?: string
          has_site_scan?: boolean
          id?: string
          module?: string
          ref_id?: string
          sort_order?: number
          system_impact?: string
        }
        Relationships: []
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
          configuration_fields: Json | null
          created_at: string
          current_version: string | null
          description: string
          featured: boolean
          guide_file_path: string | null
          how_it_works: string[]
          id: string
          important_notes: string[]
          includes: string[]
          n8n_template_ids: string[] | null
          name: string
          price_cents: number
          published_at: string | null
          required_integrations: Json | null
          requirements: string[]
          sectors: string[]
          setup_time_max: number
          setup_time_min: number
          short_outcome: string
          slug: string
          status: string
          systems: string[]
          updated_at: string
          webhook_url: string | null
          workflow_file_path: string | null
          workflow_file_url: string | null
          workflow_id: string | null
        }
        Insert: {
          capacity_recovered_max?: number
          capacity_recovered_min?: number
          configuration_fields?: Json | null
          created_at?: string
          current_version?: string | null
          description: string
          featured?: boolean
          guide_file_path?: string | null
          how_it_works?: string[]
          id?: string
          important_notes?: string[]
          includes?: string[]
          n8n_template_ids?: string[] | null
          name: string
          price_cents?: number
          published_at?: string | null
          required_integrations?: Json | null
          requirements?: string[]
          sectors?: string[]
          setup_time_max?: number
          setup_time_min?: number
          short_outcome: string
          slug: string
          status?: string
          systems?: string[]
          updated_at?: string
          webhook_url?: string | null
          workflow_file_path?: string | null
          workflow_file_url?: string | null
          workflow_id?: string | null
        }
        Update: {
          capacity_recovered_max?: number
          capacity_recovered_min?: number
          configuration_fields?: Json | null
          created_at?: string
          current_version?: string | null
          description?: string
          featured?: boolean
          guide_file_path?: string | null
          how_it_works?: string[]
          id?: string
          important_notes?: string[]
          includes?: string[]
          n8n_template_ids?: string[] | null
          name?: string
          price_cents?: number
          published_at?: string | null
          required_integrations?: Json | null
          requirements?: string[]
          sectors?: string[]
          setup_time_max?: number
          setup_time_min?: number
          short_outcome?: string
          slug?: string
          status?: string
          systems?: string[]
          updated_at?: string
          webhook_url?: string | null
          workflow_file_path?: string | null
          workflow_file_url?: string | null
          workflow_id?: string | null
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
          credentials_count: number | null
          credentials_submitted_at: string | null
          credentials_verified_at: string | null
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
          user_id: string | null
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
          credentials_count?: number | null
          credentials_submitted_at?: string | null
          credentials_verified_at?: string | null
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
          user_id?: string | null
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
          credentials_count?: number | null
          credentials_submitted_at?: string | null
          credentials_verified_at?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      integration_connections: {
        Row: {
          activation_request_id: string | null
          connected_email: string | null
          created_at: string
          encrypted_payload: string | null
          encryption_iv: string | null
          encryption_tag: string | null
          expires_at: string | null
          granted_scopes: string[] | null
          id: string
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activation_request_id?: string | null
          connected_email?: string | null
          created_at?: string
          encrypted_payload?: string | null
          encryption_iv?: string | null
          encryption_tag?: string | null
          expires_at?: string | null
          granted_scopes?: string[] | null
          id?: string
          provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activation_request_id?: string | null
          connected_email?: string | null
          created_at?: string
          encrypted_payload?: string | null
          encryption_iv?: string | null
          encryption_tag?: string | null
          expires_at?: string | null
          granted_scopes?: string[] | null
          id?: string
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_activation_request_id_fkey"
            columns: ["activation_request_id"]
            isOneToOne: false
            referencedRelation: "installation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_mappings: {
        Row: {
          activation_request_id: string | null
          automation_id: string | null
          bundle_id: string | null
          created_at: string
          credentials_reference_id: string | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          last_webhook_response: Json | null
          metadata: Json | null
          n8n_credential_ids: string[]
          n8n_workflow_ids: string[]
          provisioned_at: string | null
          status: string
          updated_at: string
          user_id: string
          webhook_status: string | null
          webhook_url: string | null
        }
        Insert: {
          activation_request_id?: string | null
          automation_id?: string | null
          bundle_id?: string | null
          created_at?: string
          credentials_reference_id?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          last_webhook_response?: Json | null
          metadata?: Json | null
          n8n_credential_ids?: string[]
          n8n_workflow_ids?: string[]
          provisioned_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          webhook_status?: string | null
          webhook_url?: string | null
        }
        Update: {
          activation_request_id?: string | null
          automation_id?: string | null
          bundle_id?: string | null
          created_at?: string
          credentials_reference_id?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          last_webhook_response?: Json | null
          metadata?: Json | null
          n8n_credential_ids?: string[]
          n8n_workflow_ids?: string[]
          provisioned_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          webhook_status?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "n8n_mappings_activation_request_id_fkey"
            columns: ["activation_request_id"]
            isOneToOne: false
            referencedRelation: "installation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "n8n_mappings_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "n8n_mappings_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "automation_bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_workflow_templates: {
        Row: {
          automation_agent_id: string | null
          created_at: string
          description: string | null
          detected_providers: string[] | null
          file_hash: string | null
          id: string
          imported_by: string | null
          name: string
          node_count: number | null
          original_filename: string | null
          slug: string
          trigger_type: string | null
          updated_at: string
          workflow_json: Json
        }
        Insert: {
          automation_agent_id?: string | null
          created_at?: string
          description?: string | null
          detected_providers?: string[] | null
          file_hash?: string | null
          id?: string
          imported_by?: string | null
          name: string
          node_count?: number | null
          original_filename?: string | null
          slug: string
          trigger_type?: string | null
          updated_at?: string
          workflow_json: Json
        }
        Update: {
          automation_agent_id?: string | null
          created_at?: string
          description?: string | null
          detected_providers?: string[] | null
          file_hash?: string | null
          id?: string
          imported_by?: string | null
          name?: string
          node_count?: number | null
          original_filename?: string | null
          slug?: string
          trigger_type?: string | null
          updated_at?: string
          workflow_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "n8n_workflow_templates_automation_agent_id_fkey"
            columns: ["automation_agent_id"]
            isOneToOne: false
            referencedRelation: "automation_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      nexus_config: {
        Row: {
          id: string
          operational_mode: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          operational_mode?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          operational_mode?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          activation_request_id: string | null
          created_at: string
          expires_at: string
          id: string
          provider: string
          redirect_path: string | null
          state_token: string
          user_id: string
        }
        Insert: {
          activation_request_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          provider: string
          redirect_path?: string | null
          state_token: string
          user_id: string
        }
        Update: {
          activation_request_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          provider?: string
          redirect_path?: string | null
          state_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_states_activation_request_id_fkey"
            columns: ["activation_request_id"]
            isOneToOne: false
            referencedRelation: "installation_requests"
            referencedColumns: ["id"]
          },
        ]
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
      sovereign_bridge: {
        Row: {
          behavioral_data: Json | null
          created_at: string
          id: string
          is_human_verified: boolean
          updated_at: string
          user_id: string
          veracity_score: number | null
          verification_source: string | null
        }
        Insert: {
          behavioral_data?: Json | null
          created_at?: string
          id?: string
          is_human_verified?: boolean
          updated_at?: string
          user_id: string
          veracity_score?: number | null
          verification_source?: string | null
        }
        Update: {
          behavioral_data?: Json | null
          created_at?: string
          id?: string
          is_human_verified?: boolean
          updated_at?: string
          user_id?: string
          veracity_score?: number | null
          verification_source?: string | null
        }
        Relationships: []
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
      vps_instances: {
        Row: {
          activation_request_id: string | null
          agent_deploy_error: string | null
          agents_deployed: boolean
          agents_deployed_at: string | null
          created_at: string
          credentials_viewed_at: string | null
          encrypted_n8n_credentials: string | null
          encrypted_ssh_private_key: string | null
          encrypted_ssh_public_key: string | null
          hostname: string | null
          id: string
          ip_address: string | null
          n8n_encryption_iv: string | null
          n8n_encryption_tag: string | null
          n8n_instance_url: string | null
          notes: string | null
          plan: string | null
          region: string | null
          ssh_encryption_iv: string | null
          ssh_encryption_tag: string | null
          ssh_key_label: string | null
          status: string
          triggered_by: string | null
          updated_at: string
          user_id: string
          virtual_machine_id: string | null
        }
        Insert: {
          activation_request_id?: string | null
          agent_deploy_error?: string | null
          agents_deployed?: boolean
          agents_deployed_at?: string | null
          created_at?: string
          credentials_viewed_at?: string | null
          encrypted_n8n_credentials?: string | null
          encrypted_ssh_private_key?: string | null
          encrypted_ssh_public_key?: string | null
          hostname?: string | null
          id?: string
          ip_address?: string | null
          n8n_encryption_iv?: string | null
          n8n_encryption_tag?: string | null
          n8n_instance_url?: string | null
          notes?: string | null
          plan?: string | null
          region?: string | null
          ssh_encryption_iv?: string | null
          ssh_encryption_tag?: string | null
          ssh_key_label?: string | null
          status?: string
          triggered_by?: string | null
          updated_at?: string
          user_id: string
          virtual_machine_id?: string | null
        }
        Update: {
          activation_request_id?: string | null
          agent_deploy_error?: string | null
          agents_deployed?: boolean
          agents_deployed_at?: string | null
          created_at?: string
          credentials_viewed_at?: string | null
          encrypted_n8n_credentials?: string | null
          encrypted_ssh_private_key?: string | null
          encrypted_ssh_public_key?: string | null
          hostname?: string | null
          id?: string
          ip_address?: string | null
          n8n_encryption_iv?: string | null
          n8n_encryption_tag?: string | null
          n8n_instance_url?: string | null
          notes?: string | null
          plan?: string | null
          region?: string | null
          ssh_encryption_iv?: string | null
          ssh_encryption_tag?: string | null
          ssh_key_label?: string | null
          status?: string
          triggered_by?: string | null
          updated_at?: string
          user_id?: string
          virtual_machine_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_email: { Args: never; Returns: string }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_cooldown_seconds?: number
          p_identifier: string
        }
        Returns: boolean
      }
      cleanup_expired_oauth_states: { Args: never; Returns: undefined }
      cleanup_old_edge_logs: { Args: never; Returns: undefined }
      cleanup_old_heartbeats: { Args: never; Returns: undefined }
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
