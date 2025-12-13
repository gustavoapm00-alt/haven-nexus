-- ============================================
-- AERELION SaaS: Agent Catalog + Plans System
-- ============================================

-- 1. Create agent_catalog table (prepackaged AI agent templates)
CREATE TABLE public.agent_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  agent_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  system_prompt text NOT NULL,
  user_prompt_template text NOT NULL,
  output_schema jsonb,
  model text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Create plans table
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  price_display text NOT NULL,
  monthly_run_limit int NOT NULL DEFAULT 50,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. Create plan_entitlements table
CREATE TABLE public.plan_entitlements (
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
  agent_key text REFERENCES public.agent_catalog(agent_key) ON DELETE CASCADE,
  included boolean DEFAULT true,
  per_agent_run_limit int,
  PRIMARY KEY (plan_id, agent_key)
);

-- 4. Create org_subscriptions table
CREATE TABLE public.org_subscriptions (
  org_id uuid PRIMARY KEY REFERENCES public.orgs(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  period_start timestamptz DEFAULT now(),
  period_end timestamptz,
  runs_used_this_period int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- 5. Modify agent_runs table to use agent_catalog instead of relevance_agents
-- First drop the foreign key constraint if it exists
ALTER TABLE public.agent_runs DROP CONSTRAINT IF EXISTS agent_runs_relevance_agent_id_fkey;

-- Add agent_key column if it doesn't exist
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS agent_key text;

-- Add output_text column if it doesn't exist  
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS output_text text;

-- Update status check constraint
ALTER TABLE public.agent_runs DROP CONSTRAINT IF EXISTS agent_runs_status_check;
ALTER TABLE public.agent_runs ADD CONSTRAINT agent_runs_status_check 
  CHECK (status IN ('queued', 'running', 'succeeded', 'failed'));

-- ============================================
-- RLS Policies
-- ============================================

-- agent_catalog: Public read for pricing pages
ALTER TABLE public.agent_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active agents from catalog" 
  ON public.agent_catalog FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Only admins can modify agent catalog" 
  ON public.agent_catalog FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- plans: Public read for pricing pages
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active plans" 
  ON public.plans FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Only admins can modify plans" 
  ON public.plans FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- plan_entitlements: Public read (needed for pricing page)
ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plan entitlements" 
  ON public.plan_entitlements FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify plan entitlements" 
  ON public.plan_entitlements FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- org_subscriptions: Org members can read, owners/admins can modify
ALTER TABLE public.org_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their subscription" 
  ON public.org_subscriptions FOR SELECT 
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org owners/admins can update subscription" 
  ON public.org_subscriptions FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.org_members 
    WHERE org_id = org_subscriptions.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  ));

CREATE POLICY "System can insert subscriptions" 
  ON public.org_subscriptions FOR INSERT 
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- ============================================
-- Seed E-Commerce Agent Templates
-- ============================================

INSERT INTO public.agent_catalog (category, agent_key, name, description, system_prompt, user_prompt_template, model) VALUES
('ecom', 'ecom_shop_builder', 'AI Shop Builder', 'Generate complete Shopify store structure, product categories, and initial content based on your brand.', 
'You are an expert e-commerce strategist and Shopify consultant. Your task is to create comprehensive store structures, category hierarchies, and initial content for online stores. Be specific, actionable, and focus on conversion optimization.',
'Create a complete Shopify store structure for the following business:

Store Name: {{store_name}}
Brand Voice: {{brand_voice}}
Target Audience: {{target_audience}}
Product Types: {{product_types}}

Generate:
1. Recommended store theme and layout
2. Product category hierarchy
3. Homepage sections with content suggestions
4. Collection page structure
5. Key pages needed (About, FAQ, etc.)
6. Navigation menu structure', 
'google/gemini-2.5-flash'),

('ecom', 'ecom_seo_optimizer', 'SEO Optimizer', 'Optimize product titles, descriptions, and meta tags for maximum search visibility.',
'You are an SEO expert specializing in e-commerce. Analyze and optimize product content for search engines while maintaining compelling copy that converts. Focus on relevant keywords, meta descriptions, and structured data recommendations.',
'Optimize the following product for SEO:

Product Name: {{product_name}}
Current Description: {{current_description}}
Category: {{category}}
Target Keywords: {{target_keywords}}
Competitor URLs (optional): {{competitor_urls}}

Provide:
1. Optimized product title (60 chars max)
2. Meta description (160 chars max)
3. Optimized product description with keywords
4. Alt text suggestions for images
5. Schema markup recommendations
6. Internal linking suggestions',
'google/gemini-2.5-flash'),

('ecom', 'ecom_product_pages', 'Product Page Generator', 'Create compelling product descriptions, features, and benefits that drive conversions.',
'You are a master copywriter for e-commerce. Create compelling, benefit-focused product content that drives conversions while being SEO-friendly. Use persuasive techniques and clear formatting.',
'Generate product page content for:

Product Name: {{product_name}}
Brand: {{brand_name}}
Price Point: {{price_point}}
Key Features: {{key_features}}
Target Customer: {{target_customer}}
Unique Selling Points: {{usp}}

Create:
1. Compelling headline
2. Short description (50 words)
3. Long description (200-300 words)
4. Feature bullets (5-7 points)
5. Benefits section
6. Social proof suggestions
7. FAQ section (3-5 questions)',
'google/gemini-2.5-flash'),

('ecom', 'ecom_abandoned_cart', 'Abandoned Cart Writer', 'Generate personalized abandoned cart email sequences that recover lost sales.',
'You are an email marketing expert specializing in cart recovery. Create persuasive, personalized email sequences that bring customers back without being pushy. Focus on urgency, value, and removing objections.',
'Create an abandoned cart email sequence for:

Store Name: {{store_name}}
Brand Voice: {{brand_voice}}
Average Cart Value: {{avg_cart_value}}
Product Category: {{product_category}}
Offer (if any): {{discount_offer}}

Generate a 3-email sequence:
1. Email 1 (1 hour after abandonment): Gentle reminder
2. Email 2 (24 hours): Value proposition + social proof
3. Email 3 (72 hours): Urgency + final offer

For each email provide: Subject line, preview text, body copy, CTA button text.',
'google/gemini-2.5-flash'),

('ecom', 'ecom_pricing_optimizer', 'Pricing Optimizer', 'Analyze market data and suggest optimal pricing strategies for your products.',
'You are a pricing strategist with deep e-commerce expertise. Analyze market positioning, competitor pricing, and value perception to recommend optimal pricing strategies that maximize profit while remaining competitive.',
'Analyze pricing strategy for:

Product: {{product_name}}
Current Price: {{current_price}}
Cost/COGS: {{cost}}
Competitor Prices: {{competitor_prices}}
Target Market: {{target_market}}
Brand Positioning: {{brand_positioning}}

Provide:
1. Price elasticity analysis
2. Recommended price point with rationale
3. Bundle pricing suggestions
4. Psychological pricing tactics
5. Seasonal pricing recommendations
6. Discount strategy guidelines',
'google/gemini-2.5-flash'),

('ecom', 'ecom_support_assistant', 'Order/Support Assistant', 'Generate customer support responses, order updates, and FAQ content.',
'You are a customer support expert who creates helpful, empathetic, and efficient support content. Focus on resolving issues quickly while maintaining positive brand relationships.',
'Generate customer support content for:

Store Name: {{store_name}}
Support Scenario: {{scenario_type}}
Customer Issue: {{customer_issue}}
Order Details (if applicable): {{order_details}}
Brand Voice: {{brand_voice}}

Create:
1. Initial response template
2. Follow-up message if needed
3. Resolution confirmation
4. Feedback request
5. Related FAQ entries',
'google/gemini-2.5-flash'),

('ecom', 'ecom_email_flows', 'Email Flow Builder', 'Design complete email marketing flows: welcome series, post-purchase, win-back campaigns.',
'You are an email marketing automation expert. Design comprehensive email flows that nurture customer relationships, drive repeat purchases, and maximize lifetime value. Focus on personalization and timing.',
'Build an email flow for:

Store Name: {{store_name}}
Flow Type: {{flow_type}}
Brand Voice: {{brand_voice}}
Target Segment: {{target_segment}}
Products/Offers to Highlight: {{featured_products}}

Create a complete flow with:
1. Flow diagram (triggers, delays, conditions)
2. Email content for each step (subject, preview, body outline)
3. A/B test suggestions
4. KPI targets
5. Personalization tokens to use',
'google/gemini-2.5-flash');

-- ============================================
-- Seed Plans
-- ============================================

INSERT INTO public.plans (category, name, price_display, monthly_run_limit) VALUES
('ecom', 'Tier 1 - Essentials', '$49.99/mo', 50),
('ecom', 'Tier 2 - Growth', '$149/mo', 200),
('ecom', 'Tier 3 - Scale', '$399/mo', 1000);

-- ============================================
-- Seed Plan Entitlements
-- ============================================

-- Tier 1: Shop Builder + SEO Optimizer
INSERT INTO public.plan_entitlements (plan_id, agent_key, included)
SELECT p.id, 'ecom_shop_builder', true FROM public.plans p WHERE p.name = 'Tier 1 - Essentials';

INSERT INTO public.plan_entitlements (plan_id, agent_key, included)
SELECT p.id, 'ecom_seo_optimizer', true FROM public.plans p WHERE p.name = 'Tier 1 - Essentials';

-- Tier 2: All of Tier 1 + Product Pages + Abandoned Cart
INSERT INTO public.plan_entitlements (plan_id, agent_key, included)
SELECT p.id, 'ecom_shop_builder', true FROM public.plans p WHERE p.name = 'Tier 2 - Growth';

INSERT INTO public.plan_entitlements (plan_id, agent_key, included)
SELECT p.id, 'ecom_seo_optimizer', true FROM public.plans p WHERE p.name = 'Tier 2 - Growth';

INSERT INTO public.plan_entitlements (plan_id, agent_key, included)
SELECT p.id, 'ecom_product_pages', true FROM public.plans p WHERE p.name = 'Tier 2 - Growth';

INSERT INTO public.plan_entitlements (plan_id, agent_key, included)
SELECT p.id, 'ecom_abandoned_cart', true FROM public.plans p WHERE p.name = 'Tier 2 - Growth';

-- Tier 3: All agents
INSERT INTO public.plan_entitlements (plan_id, agent_key, included)
SELECT p.id, ac.agent_key, true 
FROM public.plans p 
CROSS JOIN public.agent_catalog ac 
WHERE p.name = 'Tier 3 - Scale' AND ac.category = 'ecom';

-- Create trigger for updating org_subscriptions.updated_at
CREATE TRIGGER update_org_subscriptions_updated_at
  BEFORE UPDATE ON public.org_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();