

# AERELION Personality-Calibrated Upgrade — Implementation Plan

This plan implements all 12 tasks from the strategy brief, transforming the current site into an Assertive-primary / Analytical-secondary conversion machine. No new pages are created — all work targets existing files.

---

## Phase 1: Homepage Overhaul (Tasks 1–6)

### Task 1 — Hero: Assertive Above-the-Fold

**File: `src/pages/Home.tsx`**

- Add italic gold subline beneath headline: *"The only automation studio that signs your performance benchmark before you sign our invoice."*
- Add three-column trust bar (no cards, no borders — just spaced text columns): BENCHMARK SIGNED FIRST | KEEP WORKING IF WE MISS IT | YOU OWN THE SYSTEM FOREVER
- Add "Confidential. No pitch. No obligation." in 11px muted text beneath the CTA button
- CTA buttons already correct ("Request a Briefing" + "See Our Process") — no change needed

### Task 2 — Timeline Badges on Tier Cards

**File: `src/pages/Home.tsx`**

- Restructure each tier card to show delivery timeline as a prominent gold badge/highlighted line near the top (not buried in stats at bottom)
- Add muted text beneath each badge: *"If we don't hit the benchmark, we keep working. No additional charge."*

### Task 3 — Accountability Standard Section (NEW)

**File: `src/pages/Home.tsx`**

- Insert new full-width section between the Problem section and the Tier cards section
- Label: THE ACCOUNTABILITY STANDARD
- Headline: "Every other studio promises results. We sign them."
- Prose body about the Performance Confirmation Protocol
- Three stat callouts: 100% | 0 | 30 Days
- Gold-bordered contrast box with ownership statement

### Task 4 — Assertive-Optimized ICP Section (REBUILD)

**File: `src/pages/Home.tsx`**

- Replace the current missing/nonexistent ICP section on homepage with frustration-led trigger statements
- Label: THE RIGHT CLIENT
- Headline: "You're ready for AERELION when the cost of doing nothing finally exceeds the cost of changing."
- Five dark-bordered cards with gold number labels and activation trigger copy
- Italic closer: *"If you recognized yourself in more than one of these — the briefing call is the next step."*
- Demographics data follows underneath as supporting detail

### Task 5 — Rebuilt Competitive Table

**File: `src/pages/Home.tsx`**

- Replace the current 4-column comparison table with a full 5-competitor-column table (AERELION | Automation Agencies | AI SaaS Tools | Freelancers | Consultancies)
- Add 7 rows: Pricing Model, Performance Benchmark, Delivery Timeline, What You Own After, If It Doesn't Work, Client Selectivity, Post-Engagement
- "Performance Benchmark" row visually highlighted (gold bg on AERELION cell, larger text)
- AERELION column header in gold; others muted

### Task 6 — Content Signal Section (NEW)

**File: `src/pages/Home.tsx`**

- Add above the final CTA section
- Label: OPERATOR INTELLIGENCE
- Three article preview cards (dark bg, gold category tag, title, description, "Read Teardown" link)
- LinkedIn follow link placeholder beneath

### Task 12 (partial) — Homepage Stats Update

**File: `src/pages/Home.tsx`**

- Update stat labels to declarative versions:
  - "$16.6B" -> "Lost annually to manual process overhead in U.S. professional services"
  - "1.2M+" -> "Target operators in the United States"
  - "30 Days" -> "Standard system delivery guarantee"
  - "60%+" -> "Minimum admin reduction benchmark"

---

## Phase 2: Proof Page Full Build (Task 7)

### Complete Case Studies Page Rebuild

**File: `src/pages/CaseStudies.tsx`**

- Replace the placeholder content with three full case study cards
- Page header: Label "PERFORMANCE CONFIRMATION", Headline "Results we stand behind.", Subtext about documented outcomes
- Each card structure: CLIENT PROFILE, THE PROBLEM, WHAT WAS INSTALLED, PRE-AGREED BENCHMARK, CONFIRMED RESULT, gold "BENCHMARK CONFIRMED" badge
- Card 1: Boutique Legal Practice (Tier 1) — 94% autonomous, 27 days
- Card 2: Independent Financial Advisory (Tier 2) — 63% reduction, 41 days
- Card 3: Marketing Consultancy (Tier 3) — 71% admin reduction, 58 days
- Performance Confirmation Protocol explainer section: THE MECHANISM headline, three precision callouts (What counts as confirmed? / Who measures it? / What if window passes?)
- Gold-bordered contrast block
- Final CTA with "Confidential. No pitch. No obligation." sub-text

---

## Phase 3: Process Page Analytical Build (Task 8)

### 8A — Phase Precision Outputs

**File: `src/pages/HowItWorks.tsx`**

- Add "Output:" line to each of the five phase cards with specific deliverable language

### 8B — "What We Don't Do" Section (NEW)

**File: `src/pages/HowItWorks.tsx`**

- Label: SCOPE CLARITY
- Four numbered cards with declarative statements about what AERELION never does

### 8C — FAQ Accordion (NEW)

**File: `src/pages/HowItWorks.tsx`**

- Label: COMMON QUESTIONS
- Collapsible accordion with 10 Q&A pairs covering: tool replacement, Protocol details, missed benchmarks, time requirements, ownership, tools used, competitive differentiation, complexity, tier progression, longevity
- Uses existing Accordion component from `@radix-ui/react-accordion`
- Add "Confidential. No pitch. No obligation." beneath final CTA

---

## Phase 4: Services Page Updates (Tasks 9–10)

### Task 9 — Activation Signal Module (NEW)

**File: `src/pages/Services.tsx`**

- Insert above the existing ICP section
- Label: ACTIVATION SIGNAL
- Five cards with gold numbers and trigger event copy

### Task 10 — Retainer Section Rebuild

**File: `src/pages/Services.tsx`**

- Replace current single-line retainer mention with full card including:
  - Price display, prose body, coverage description
  - Gold-bordered Analytical callout (operational stewardship, not reactive maintenance)
  - Italic Assertive callout (expansion service, never a dependency)
  - Exclusivity note in muted text
- Add "Confidential. No pitch. No obligation." beneath final CTA

---

## Phase 5: About Page + Sitewide Micro-copy (Tasks 11–12)

### Task 11 — About Page Selectivity Paragraph

**File: `src/pages/AboutNew.tsx`**

- Add one paragraph after the existing Gustavo body copy about selectivity and benchmark confirmation rate

### Task 12 — Sitewide Micro-copy

**File: `src/components/layout/Navbar.tsx`**
- Rename "Proof" nav link to "Confirmed Results"
- Add "Managed Automation Operator" in small muted text beneath the AERELION logo

**File: `src/components/layout/Footer.tsx`**
- Rename "Proof" to "Confirmed Results"
- Add italic centered line above copyright: *"AERELION does not take every engagement. We take the right ones."*

**File: `src/pages/ContactNew.tsx`**
- Add "Confidential. No pitch. No obligation." beneath the submit button

**All CTA sections across all pages:**
- Add "Confidential. No pitch. No obligation." in 11px muted text beneath every CTA button

---

## Technical Notes

- No new dependencies required — uses existing framer-motion, react-router-dom, lucide-react, react-helmet-async, and radix accordion
- No database changes needed
- No new pages created — all modifications to existing files
- All new sections use existing CSS classes: `section-padding`, `container-narrow`, `card-premium`, `btn-primary`, `btn-outline`
- Accordion for FAQ uses the already-installed `@radix-ui/react-accordion` component at `src/components/ui/accordion.tsx`
- All sections fully responsive using existing Tailwind breakpoint patterns
- Motion uses the existing `fadeUp` variant pattern consistently

---

## Execution Order

1. Home.tsx (Tasks 1, 2, 3, 4, 5, 6, partial 12) — largest file, highest impact
2. CaseStudies.tsx (Task 7) — critical gap, currently empty
3. HowItWorks.tsx (Task 8) — Analytical conversion surface
4. Services.tsx (Tasks 9, 10) — activation signals + retainer
5. AboutNew.tsx (Task 11) — single paragraph addition
6. Navbar.tsx + Footer.tsx + ContactNew.tsx (Task 12) — micro-copy sweep
