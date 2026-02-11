# AERELION SYSTEMS — "Industrial Digital" Global Design System Rollout

## Objective

Apply the "Industrial Digital" aesthetic across the entire site: a disciplined, rectilinear, high-contrast interface that communicates technical authority and operational governance. All backend functionality (auth, engagement forms, portal, admin) remains untouched.

---

## 1. Design Token Overhaul

**Color Profile Update** (`src/index.css`):

* Background: Deep Obsidian `#0F0F0F` (replacing current `#000000`)
* Foreground text: Cool Grey `#E0E0E0`
* Primary accent: Operational Green `#39FF14` (replacing Signal Cyan)
* Secondary accent: High-Alert Amber `#FFBF00` (replacing Mission Orange)
* All `--primary`, `--accent`, `--ring`, `--glow` CSS variables updated accordingly

**Geometry** (`tailwind.config.ts` + `src/index.css`):

* Confirm `--radius: 0rem` (already set)
* Standardize all containers to `border-[1px]` wireframe borders (replacing current `0.5px`)
* Remove any remaining `rounded-*` classes across components

**Typography** (`index.html` + `tailwind.config.ts`):

* Keep **JetBrains Mono** for navigation, data labels, metadata, form labels
* Replace **Space Grotesk** with **Inter** (geometric sans-serif) for long-form body text and section descriptions
* Headers remain monospaced for the "system" voice

---

## 2. Persistent HUD Updates

**HUDNavbar** (`src/components/landing/HUDNavbar.tsx`):

* System identifier becomes: `AERELION // SYS.OPS.V2.06`
* Accent colors shift from cyan to Operational Green
* `NET.LATENCY` indicator uses Green for normal, Amber for elevated
* **Logical Intent:** The `V2.xx` suffix signals a version-controlled, audited operational doctrine.

**TerminalFooter** (`src/components/landing/TerminalFooter.tsx`):

* Status dot changes from green-500 to `#39FF14`
* Add "System Health Ticker" log entries that cycle through simulated heartbeat messages (e.g., `[HB-001] HEARTBEAT: NOMINAL`, `[HB-002] LATENCY: 11ms`)

**SystemStatusTicker** (`src/components/landing/SystemStatusTicker.tsx`):

* Update accent color from cyan to Operational Green
* Replace messages with governance-appropriate language: `STANDARDIZATION: ACTIVE`, `FRAMEWORK: DEPLOYED`, `INTEGRITY CHECK: PASSED`

---

## 3. Landing Page Sections (`src/pages/library/LibraryHome.tsx`)

### A. Hero Module — "System Stabilization"

**File**: `src/components/landing/CommandCenterHero.tsx`

* Headline: **"SYSTEM STABILIZATION & OPERATIONAL GOVERNANCE."**
* Subheadline: *"Engineering the foundational logic for enterprise-scale autonomous systems."*
* CTA button label: **"REQUEST BRIEFING"** (links to `/contact`)
* Secondary CTA: **"VIEW DOCTRINE"** (links to `/how-it-works`)
* Background: Retain `ConstellationCanvas` but shift node colors from cyan to Operational Green
* Remove "Managed Automation Operator" label; replace with `// OPERATIONAL INFRASTRUCTURE`

### B. "Doctrine Grid" — Replacing Manifesto + Protocol Grid

**Replace**: `ManifestoSection.tsx` and `ProtocolGrid.tsx` with a single new **`DoctrineGrid.tsx`**

* Section label: `// METHODOLOGY`
* Headline: **"The Doctrine Grid"**
* Three protocol cards in a strict wireframe grid:
1. **PROTOCOL HARDENING** — "Identifying and neutralizing operational friction."
2. **DATA ONTOLOGY** — "Establishing a universal schema for fragmented information environments."
3. **GOVERNANCE LOGIC** — "Installing automated oversight layers to maintain system integrity."


* Card style: `bg-[#0F0F0F]` with 1px `#39FF14/20` borders, Green glow on hover
* Each card has a `PROTOCOL_ID`, `STATUS: ACTIVE`, and `COMPLEXITY_LVL` metadata row

### C. "Operational Parameters" Section — New

**New file**: `src/components/landing/OperationalParameters.tsx`

* Section label: `// CONSTRAINTS & BOUNDARIES`
* Headline: **"Operational Parameters"**
* A high-authority list defining scope constraints:
* "Engagement scope is fixed at inception. No mid-cycle feature additions without revised authorization."
* "All credential handoffs must pass through encrypted intake channels."
* "Maximum deployment window: 30 calendar days from authorization."
* "Redundancy protocols require a minimum of two integration points per workflow."


* Styled as a numbered list with Amber `[PARAM-001]` reference IDs

### D. "Technical Briefing Archives" — Replacing BlueprintsFeed

**Replace**: `BlueprintsFeed.tsx` with **`BriefingArchives.tsx`**

* Section label: `// OPERATIONAL REPORTS`
* Headline: **"Technical Briefing Archives"**
* Entries styled as report rows (not horizontal scroll cards):
* Each row has: `[REF-ID]` (e.g., `OPS-2026-004`), Title, `[STATUS: RESOLVED]`, `[IMPACT-SCORE: 8.2]`
* 1px border rows, monospaced metadata
* Hover: border shifts to Operational Green



### E. Structural Schema Diagram — New

**New file**: `src/components/landing/AerelionLayerDiagram.tsx`

* **Visual Logic:** Depict the AERELION LAYER as a "Regulator/Filter" gate.
* **Architecture**:
* Left (Input): `[RAW DATA / OPERATIONAL CHAOS]` — Fragmented, thin lines.
* Center (The Core): `[AERELION REGULATOR]` — Thick 1px green-glow wireframe box with `[FILTER_STATUS: ACTIVE]` tag.
* Right (Output): `[EXECUTIVE OVERSIGHT]` — Stabilized, singular bold lines.


* **Label**: `// STRUCTURAL SCHEMA: REGULATORY FLOW`

### F. "Briefing Request Interface" — New CTA Section

**New file**: `src/components/landing/BriefingRequestCTA.tsx`

* A compact form-styled CTA before the footer.
* Label: `// INITIATE BRIEFING REQUEST`
* Styled like a technical intake document with field labels in mono.
* **Added Field:** `SYSTEM_CRITICALITY` (Selector: LOW, MED, HIGH).
* Fields: `DESIGNATION` (Name), `COMM_CHANNEL` (Email), `SUBJECT` (dropdown).
* Submit: **"TRANSMIT REQUEST"**
* On submit, redirects to `/contact` with pre-filled data.

---

## 4. Inner Page Restyling

### Contact Page (`src/pages/library/LibraryContact.tsx`)

* Remove `LibraryNavbar` / `LibraryFooter` references.
* Restyle form labels to mono uppercase: `TRANSMISSION_SOURCE`, `FREQUENCY`, `PAYLOAD`, etc.
* Add Metadata header: `INCIDENT_ID: [AUTO_GEN_HEX]` and `PROTOCOL_VERSION: SYS.OPS.V2`.
* Submit button: **`INITIATE SYSTEM HANDOFF`** with Amber highlight.
* Success state: `[STATUS: PACKET RECEIVED // REF: ENG-{timestamp}]`

### Security/Governance Page (`src/pages/library/Security.tsx`)

* Add `watermark-confidential` overlay and `scanline-overlay` class.
* Practice items styled as terminal rows with `[SEC-001]` reference IDs.
* Credential handling section bordered with Amber (high-alert accent).

### How It Works / Deployment (`src/pages/library/DeploymentOverview.tsx`)

* Phase numbers become `[PHASE_01]`, `[PHASE_02]`, `[PHASE_03]` in mono.
* CTA button: `REQUEST OPERATIONAL BRIEFING`.

### Automations / Protocols Page (`src/pages/library/AgentLibrary.tsx`)

* Update accent from cyan to Operational Green.
* Filter chips use Green active state.

---

## 5. Global Component Updates

### Buttons (`src/components/ui/button.tsx`)

* Primary variant: `bg-[#39FF14]` with `text-black`, sharp corners.
* Outline variant: 1px `#39FF14/50` border, Green text.
* Hover glow: `box-shadow: 0 0 20px rgba(57, 255, 20, 0.15)`

### Inputs (`src/components/ui/input.tsx`)

* Bottom-border-only style with Green focus state.

---

## 6. Ambient Effects Update

**File**: `src/components/landing/AmbientEffects.tsx`

* Grid line color: `rgba(57, 255, 20, 0.03)` (Green tint).
* Radar sweep gradient: Green.

**File**: `src/components/landing/ConstellationCanvas.tsx`

* Node and connection colors shift to Operational Green.

---

## 7. Lexicon Enforcement (Copy Updates)

Across all visible pages, replace consumer-grade language:

* "seamless" -> "standardized"
* "easy" -> "structured"
* "Book an AI Ops Installation" -> "Request Operational Briefing"
* "Initialize System" -> "Request Briefing"
* "Live Intelligence" -> "Technical Briefing Archives"

---

## 8. Files Changed Summary

| Action | File |
| --- | --- |
| Edit | `src/index.css`, `tailwind.config.ts`, `index.html` |
| Edit | `HUDNavbar.tsx`, `TerminalFooter.tsx`, `SystemStatusTicker.tsx` |
| Edit | `CommandCenterHero.tsx`, `AmbientEffects.tsx`, `ConstellationCanvas.tsx` |
| Edit | `LibraryHome.tsx`, `LibraryContact.tsx`, `Security.tsx`, `DeploymentOverview.tsx` |
| Create | `DoctrineGrid.tsx`, `OperationalParameters.tsx`, `BriefingArchives.tsx`, `AerelionLayerDiagram.tsx`, `BriefingRequestCTA.tsx` |
| Remove | `ManifestoSection.tsx`, `ProtocolGrid.tsx`, `BlueprintsFeed.tsx` |

---

## 9. What Remains Untouched

* All backend functions (Edge Functions, Supabase queries, auth flows).
* All portal and admin pages functional logic.
* Database schema, RLS policies, and API integrations.
