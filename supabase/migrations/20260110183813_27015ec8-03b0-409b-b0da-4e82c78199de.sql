-- =================================================================
-- Step 5: Seed Data (10 Agents + 5 Bundles) - Idempotent
-- =================================================================

-- Seed 10 published agents using ON CONFLICT for idempotency
INSERT INTO public.automation_agents (
  slug, name, description, short_outcome, status, price_cents, 
  featured, sectors, systems, how_it_works, includes, requirements, 
  important_notes, setup_time_min, setup_time_max, 
  capacity_recovered_min, capacity_recovered_max, published_at
) VALUES
(
  'lead-intake-router',
  'Lead Intake Router',
  'Automatically routes incoming leads from forms, emails, or webhooks to the correct destination based on configurable rules. Reduces response time and ensures no lead falls through the cracks.',
  'Routes incoming leads to the right team or system automatically.',
  'published',
  4900,
  true,
  ARRAY['Professional Services', 'Healthcare', 'Real Estate'],
  ARRAY['n8n', 'Gmail', 'Slack', 'CRM'],
  ARRAY['Webhook receives new lead data', 'Rules engine evaluates lead attributes', 'Lead routed to appropriate destination', 'Confirmation logged'],
  ARRAY['n8n workflow JSON', 'Deployment guide PDF', 'Configuration checklist'],
  ARRAY['n8n instance', 'API access to lead sources', 'Destination system credentials'],
  ARRAY['Requires webhook endpoint configuration', 'Test with sample leads before production'],
  15, 30, 2, 5,
  NOW()
),
(
  'crm-enrichment-layer',
  'CRM Enrichment Layer',
  'Automatically enriches CRM contacts with additional data from external sources. Keeps your sales team informed with up-to-date prospect information.',
  'Enriches CRM contacts with external data automatically.',
  'published',
  5900,
  true,
  ARRAY['Sales', 'Professional Services', 'B2B'],
  ARRAY['n8n', 'HubSpot', 'Salesforce', 'Clearbit'],
  ARRAY['New contact trigger fires', 'External data sources queried', 'Contact record enriched', 'Sales team notified'],
  ARRAY['n8n workflow JSON', 'Deployment guide PDF', 'API configuration templates'],
  ARRAY['n8n instance', 'CRM API access', 'Enrichment service API keys'],
  ARRAY['API rate limits apply', 'Review data privacy compliance'],
  20, 45, 3, 6,
  NOW()
),
(
  'appointment-confirmations',
  'Appointment Confirmations',
  'Sends automated appointment confirmations and reminders via SMS and email. Reduces no-shows and improves client communication.',
  'Sends automated appointment confirmations and reminders.',
  'published',
  3900,
  true,
  ARRAY['Healthcare', 'Professional Services', 'Wellness'],
  ARRAY['n8n', 'Twilio', 'Gmail', 'Calendly'],
  ARRAY['Appointment scheduled triggers workflow', 'Confirmation sent immediately', 'Reminder sent at configured interval', 'No-show follow-up if needed'],
  ARRAY['n8n workflow JSON', 'Deployment guide PDF', 'Message templates'],
  ARRAY['n8n instance', 'Twilio account', 'Calendar system access'],
  ARRAY['Twilio SMS charges apply', 'Configure timezone correctly'],
  10, 25, 2, 4,
  NOW()
),
(
  'invoice-receipt-automations',
  'Invoice & Receipt Automations',
  'Automates invoice generation, sending, and receipt tracking. Integrates with accounting systems to maintain accurate financial records.',
  'Automates invoice generation and receipt tracking.',
  'published',
  6900,
  true,
  ARRAY['Professional Services', 'E-commerce', 'Logistics'],
  ARRAY['n8n', 'QuickBooks', 'Stripe', 'Gmail'],
  ARRAY['Transaction triggers invoice creation', 'Invoice formatted and sent', 'Payment tracked', 'Receipt generated on payment'],
  ARRAY['n8n workflow JSON', 'Deployment guide PDF', 'Invoice templates'],
  ARRAY['n8n instance', 'Accounting system API', 'Payment processor access'],
  ARRAY['Verify tax calculations', 'Test with small amounts first'],
  25, 45, 4, 8,
  NOW()
),
(
  'customer-support-triage',
  'Customer Support Triage',
  'Routes support tickets to appropriate teams based on content analysis. Prioritizes urgent issues and ensures SLA compliance.',
  'Routes support tickets to the right team automatically.',
  'published',
  5900,
  false,
  ARRAY['E-commerce', 'SaaS', 'Professional Services'],
  ARRAY['n8n', 'Zendesk', 'Intercom', 'Slack'],
  ARRAY['Ticket received via integration', 'Content analyzed for routing', 'Ticket assigned to appropriate queue', 'Escalation rules applied'],
  ARRAY['n8n workflow JSON', 'Deployment guide PDF', 'Routing rules template'],
  ARRAY['n8n instance', 'Support platform API access', 'Team notification channels'],
  ARRAY['Review routing rules periodically', 'Set up escalation paths'],
  20, 40, 3, 6,
  NOW()
),
(
  'content-repurpose-pipeline',
  'Content Repurpose Pipeline',
  'Transforms long-form content into multiple formats for different channels. Maximizes content value across social media, email, and blogs.',
  'Transforms content into multiple formats automatically.',
  'published',
  7900,
  true,
  ARRAY['Marketing', 'Content Creation', 'Media'],
  ARRAY['n8n', 'OpenAI', 'Buffer', 'WordPress'],
  ARRAY['Source content ingested', 'AI transforms into multiple formats', 'Content scheduled across channels', 'Performance tracked'],
  ARRAY['n8n workflow JSON', 'Deployment guide PDF', 'Prompt templates'],
  ARRAY['n8n instance', 'AI API access', 'Social media platform access'],
  ARRAY['Review AI-generated content', 'Customize prompts for brand voice'],
  30, 60, 5, 10,
  NOW()
),
(
  'shopify-order-ops',
  'Shopify Order Ops',
  'Automates order processing, fulfillment notifications, and inventory updates for Shopify stores. Reduces manual order management.',
  'Automates Shopify order processing and notifications.',
  'published',
  6900,
  false,
  ARRAY['E-commerce', 'Retail', 'DTC'],
  ARRAY['n8n', 'Shopify', 'ShipStation', 'Slack'],
  ARRAY['Order placed triggers workflow', 'Inventory checked and updated', 'Fulfillment initiated', 'Customer notified'],
  ARRAY['n8n workflow JSON', 'Deployment guide PDF', 'Shopify webhook setup guide'],
  ARRAY['n8n instance', 'Shopify API access', 'Fulfillment system access'],
  ARRAY['Test with test orders first', 'Configure inventory thresholds'],
  25, 50, 4, 8,
  NOW()
),
(
  'deal-stage-hygiene',
  'Deal Stage Hygiene',
  'Monitors CRM deals and ensures proper stage progression. Alerts sales teams to stale deals and updates forecasts automatically.',
  'Monitors CRM deals and alerts on stale opportunities.',
  'published',
  4900,
  false,
  ARRAY['Sales', 'B2B', 'Professional Services'],
  ARRAY['n8n', 'HubSpot', 'Salesforce', 'Slack'],
  ARRAY['Daily scan of active deals', 'Stale deals identified', 'Sales rep notified', 'Forecast updated'],
  ARRAY['n8n workflow JSON', 'Deployment guide PDF', 'Stage criteria template'],
  ARRAY['n8n instance', 'CRM API access', 'Notification channels'],
  ARRAY['Define stale thresholds per stage', 'Coordinate with sales team'],
  15, 30, 2, 4,
  NOW()
),
(
  'weekly-kpi-digest',
  'Weekly KPI Digest',
  'Compiles key performance indicators from multiple sources into a weekly digest. Delivers insights to stakeholders automatically.',
  'Compiles and delivers weekly KPI reports automatically.',
  'published',
  3900,
  true,
  ARRAY['All Industries', 'Management', 'Operations'],
  ARRAY['n8n', 'Google Sheets', 'Slack', 'Gmail'],
  ARRAY['Scheduled weekly trigger', 'Data pulled from sources', 'Report compiled and formatted', 'Delivered to stakeholders'],
  ARRAY['n8n workflow JSON', 'Deployment guide PDF', 'Report template'],
  ARRAY['n8n instance', 'Access to data sources', 'Distribution list'],
  ARRAY['Verify data source access', 'Customize report sections'],
  15, 30, 1, 3,
  NOW()
),
(
  'client-onboarding-pack',
  'Client Onboarding Pack',
  'Orchestrates client onboarding workflows including welcome emails, document collection, and system provisioning. Ensures consistent onboarding experience.',
  'Orchestrates complete client onboarding automatically.',
  'published',
  8900,
  true,
  ARRAY['Professional Services', 'SaaS', 'Consulting'],
  ARRAY['n8n', 'DocuSign', 'Gmail', 'Slack'],
  ARRAY['New client triggers onboarding', 'Welcome sequence initiated', 'Documents requested and tracked', 'Access provisioned'],
  ARRAY['n8n workflow JSON', 'Deployment guide PDF', 'Email templates', 'Checklist templates'],
  ARRAY['n8n instance', 'Document signing platform', 'Provisioning system access'],
  ARRAY['Customize for your onboarding process', 'Test complete flow before launch'],
  30, 60, 4, 10,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_outcome = EXCLUDED.short_outcome,
  status = EXCLUDED.status,
  price_cents = EXCLUDED.price_cents,
  featured = EXCLUDED.featured,
  sectors = EXCLUDED.sectors,
  systems = EXCLUDED.systems,
  how_it_works = EXCLUDED.how_it_works,
  includes = EXCLUDED.includes,
  requirements = EXCLUDED.requirements,
  important_notes = EXCLUDED.important_notes,
  setup_time_min = EXCLUDED.setup_time_min,
  setup_time_max = EXCLUDED.setup_time_max,
  capacity_recovered_min = EXCLUDED.capacity_recovered_min,
  capacity_recovered_max = EXCLUDED.capacity_recovered_max,
  updated_at = NOW();

-- Seed 5 published bundles using ON CONFLICT for idempotency
-- First, we need to get the agent IDs by slug
WITH agent_ids AS (
  SELECT id, slug FROM public.automation_agents
  WHERE slug IN (
    'lead-intake-router', 'weekly-kpi-digest', 'appointment-confirmations',
    'crm-enrichment-layer', 'deal-stage-hygiene', 'shopify-order-ops',
    'invoice-receipt-automations', 'customer-support-triage',
    'content-repurpose-pipeline', 'client-onboarding-pack'
  )
)
INSERT INTO public.automation_bundles (
  slug, name, description, objective, status, 
  bundle_price_cents, individual_value_cents, 
  included_agent_ids, featured, sectors, published_at
)
SELECT 
  'starter-ops-bundle',
  'Starter Ops Bundle',
  'Essential automation pack for teams getting started with operational automation. Covers lead routing, appointments, and weekly reporting.',
  'Foundation for operational automation',
  'published',
  14900,
  17600,
  ARRAY(SELECT id FROM agent_ids WHERE slug IN ('lead-intake-router', 'weekly-kpi-digest', 'appointment-confirmations')),
  true,
  ARRAY['All Industries', 'SMB', 'Startups'],
  NOW()
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  objective = EXCLUDED.objective,
  status = EXCLUDED.status,
  bundle_price_cents = EXCLUDED.bundle_price_cents,
  individual_value_cents = EXCLUDED.individual_value_cents,
  included_agent_ids = EXCLUDED.included_agent_ids,
  featured = EXCLUDED.featured,
  sectors = EXCLUDED.sectors,
  updated_at = NOW();

WITH agent_ids AS (
  SELECT id, slug FROM public.automation_agents
)
INSERT INTO public.automation_bundles (
  slug, name, description, objective, status, 
  bundle_price_cents, individual_value_cents, 
  included_agent_ids, featured, sectors, published_at
)
SELECT 
  'sales-ops-bundle',
  'Sales Ops Bundle',
  'Complete sales operations automation covering lead intake, CRM enrichment, deal hygiene, and appointment management.',
  'Streamline sales operations end-to-end',
  'published',
  19900,
  25800,
  ARRAY(SELECT id FROM agent_ids WHERE slug IN ('lead-intake-router', 'crm-enrichment-layer', 'deal-stage-hygiene', 'appointment-confirmations')),
  true,
  ARRAY['Sales', 'B2B', 'Professional Services'],
  NOW()
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  objective = EXCLUDED.objective,
  status = EXCLUDED.status,
  bundle_price_cents = EXCLUDED.bundle_price_cents,
  individual_value_cents = EXCLUDED.individual_value_cents,
  included_agent_ids = EXCLUDED.included_agent_ids,
  featured = EXCLUDED.featured,
  sectors = EXCLUDED.sectors,
  updated_at = NOW();

WITH agent_ids AS (
  SELECT id, slug FROM public.automation_agents
)
INSERT INTO public.automation_bundles (
  slug, name, description, objective, status, 
  bundle_price_cents, individual_value_cents, 
  included_agent_ids, featured, sectors, published_at
)
SELECT 
  'ecommerce-ops-bundle',
  'E-commerce Ops Bundle',
  'Comprehensive e-commerce automation covering order processing, invoicing, and customer support triage.',
  'Automate e-commerce operations',
  'published',
  21900,
  27600,
  ARRAY(SELECT id FROM agent_ids WHERE slug IN ('shopify-order-ops', 'invoice-receipt-automations', 'customer-support-triage')),
  true,
  ARRAY['E-commerce', 'Retail', 'DTC'],
  NOW()
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  objective = EXCLUDED.objective,
  status = EXCLUDED.status,
  bundle_price_cents = EXCLUDED.bundle_price_cents,
  individual_value_cents = EXCLUDED.individual_value_cents,
  included_agent_ids = EXCLUDED.included_agent_ids,
  featured = EXCLUDED.featured,
  sectors = EXCLUDED.sectors,
  updated_at = NOW();

WITH agent_ids AS (
  SELECT id, slug FROM public.automation_agents
)
INSERT INTO public.automation_bundles (
  slug, name, description, objective, status, 
  bundle_price_cents, individual_value_cents, 
  included_agent_ids, featured, sectors, published_at
)
SELECT 
  'support-ops-bundle',
  'Support Ops Bundle',
  'Customer support automation covering ticket triage, KPI reporting, and billing automation.',
  'Streamline customer support operations',
  'published',
  17900,
  23600,
  ARRAY(SELECT id FROM agent_ids WHERE slug IN ('customer-support-triage', 'weekly-kpi-digest', 'invoice-receipt-automations')),
  false,
  ARRAY['SaaS', 'E-commerce', 'Professional Services'],
  NOW()
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  objective = EXCLUDED.objective,
  status = EXCLUDED.status,
  bundle_price_cents = EXCLUDED.bundle_price_cents,
  individual_value_cents = EXCLUDED.individual_value_cents,
  included_agent_ids = EXCLUDED.included_agent_ids,
  featured = EXCLUDED.featured,
  sectors = EXCLUDED.sectors,
  updated_at = NOW();

WITH agent_ids AS (
  SELECT id, slug FROM public.automation_agents
)
INSERT INTO public.automation_bundles (
  slug, name, description, objective, status, 
  bundle_price_cents, individual_value_cents, 
  included_agent_ids, featured, sectors, published_at
)
SELECT 
  'creator-ops-bundle',
  'Creator Ops Bundle',
  'Content creator automation covering content repurposing, KPI tracking, and client onboarding.',
  'Scale content creation and client management',
  'published',
  20900,
  25600,
  ARRAY(SELECT id FROM agent_ids WHERE slug IN ('content-repurpose-pipeline', 'weekly-kpi-digest', 'client-onboarding-pack')),
  false,
  ARRAY['Marketing', 'Content Creation', 'Consulting'],
  NOW()
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  objective = EXCLUDED.objective,
  status = EXCLUDED.status,
  bundle_price_cents = EXCLUDED.bundle_price_cents,
  individual_value_cents = EXCLUDED.individual_value_cents,
  included_agent_ids = EXCLUDED.included_agent_ids,
  featured = EXCLUDED.featured,
  sectors = EXCLUDED.sectors,
  updated_at = NOW();