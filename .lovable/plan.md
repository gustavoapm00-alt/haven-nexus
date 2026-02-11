
# AERELION Internalization and Infrastructure Directive

## Objective
Total de-commercialization: purge all consumer-grade language, labor-centric metrics, and marketing CTAs. Transition the site into a Technical Anthology and Doctrine-Led Portfolio with hardened infrastructure copy.

---

## 1. WorkflowExampleCard.tsx -- Full Restyle

**Current violations:**
- "Problem Solved" label (line 73)
- "Common Use Cases" label (line 87)
- "hrs activation" and "+X hrs/wk" metrics (lines 130-134)
- "We operate this for you" footer copy (line 143)
- "Learn More" CTA (line 153)
- `rounded-lg` and `rounded-full` classes (lines 46, 93, 103)

**Changes:**
- Remove "Problem Solved" section entirely -- replace with just the `shortOutcome` as a protocol description
- Remove "Common Use Cases" section -- replace sector chips with a simple `SECTOR_CLASSIFICATION` mono label
- Remove all time/hours metrics (Clock, TrendingUp icons and associated text)
- Replace footer: "We operate this for you" becomes `MANAGED_PROTOCOL`
- Replace "Learn More" with `VIEW_SPECIFICATIONS`
- Remove all `rounded-*` classes, use sharp corners
- Adapt styling to Industrial Digital wireframe aesthetic (1px borders, mono labels)

---

## 2. AgentDetail.tsx -- Full Overhaul

**Current violations:**
- Uses `LibraryNavbar` and `LibraryFooter` (double-nav bug)
- "What This Automation Delivers" section header
- "Who This Is For" section header
- "Typical Engagement Profile" with hours metrics (lines 183-207)
- "How We Operate This Automation" (consumer voice)
- "What's Included" section
- "What We Need From You" section
- "Frequently Asked Questions" header
- FAQ copy: "Schedule a discovery call" (line 39), "No technical experience required" (lines 52, 349)
- Sidebar: "Have This Operated for You" (line 297), "Schedule Discovery Call" (line 341), "Activate Now" (line 323)
- `rounded-full` on step numbers (line 217)

**Changes:**
- Remove `LibraryNavbar` and `LibraryFooter` imports and usage (HUD shell handles this)
- Section headers renamed:
  - "What This Automation Delivers" -> "PROTOCOL SPECIFICATION"
  - "Who This Is For" -> "SECTOR_CLASSIFICATION"
  - "Tools Commonly Involved" -> "SYSTEM_DEPENDENCIES"
  - "Typical Engagement Profile" -> DELETE entirely (removes hours saved metrics)
  - "How We Operate This Automation" -> "EXECUTION_SEQUENCE"
  - "What's Included" -> "PROTOCOL_DELIVERABLES"
  - "What We Need From You" -> "AUTHORIZATION_REQUIREMENTS"
  - "Important Notes" -> "OPERATIONAL_CONSTRAINTS"
  - "Frequently Asked Questions" -> "OPERATIONAL CLARIFICATIONS"
- FAQ copy rewritten to remove "discovery call," "pricing," "no technical experience"
- Sidebar: "Have This Operated for You" -> "PROTOCOL_AUTHORIZATION"; "Schedule Discovery Call" / "Activate Now" -> "INITIATE_HANDOFF"; "No technical experience required" -> removed
- Back link: "Back to Automations" -> "RETURN_TO_REGISTRY"
- All `rounded-*` classes removed
- Apply Industrial Digital styling (mono headers, 1px borders)

---

## 3. BundleDetail.tsx -- Full Overhaul

**Current violations:**
- Uses `LibraryNavbar` and `LibraryFooter` (double-nav)
- "Schedule Discovery Call" CTA (line 189)
- "Back to Automations" (line 75)
- "What This System Delivers" (line 101)
- "Automations in This System" (line 111)
- "Who This Is For" (line 141)
- "How We Deliver This System" with consumer engagement steps (lines 154-169)
- "Have This System Operated for You" (line 176)
- "No technical experience required" (line 195)
- `rounded-md` and `rounded-full` classes

**Changes:**
- Remove `LibraryNavbar` and `LibraryFooter`
- Section headers renamed to mono uppercase (SYSTEM_SPECIFICATION, INCLUDED_PROTOCOLS, SECTOR_CLASSIFICATION, DEPLOYMENT_SEQUENCE)
- Engagement steps rewritten to technical: "Submit authorization request" / "AERELION scopes protocol parameters" / "Infrastructure deployed and stabilized"
- Sidebar: "Have This System Operated for You" -> "SYSTEM_AUTHORIZATION"; CTA: "Schedule Discovery Call" -> "INITIATE_HANDOFF"
- "No technical experience required" -> removed
- All `rounded-*` removed, Industrial Digital styling applied

---

## 4. About.tsx -- Full Restyle

**Current violations:**
- Uses `LibraryNavbar` and `LibraryFooter` (double-nav)
- "Your Operational Systems Partner" -- consumer headline
- "Schedule Discovery Call" (lines 246, 249)
- "See How It Works" (line 252)
- "Ready to Work With a Systems Partner?" -- marketing CTA
- Multiple `rounded-md` classes
- Consumer copy: "makes automation actually work for your business," "No hidden complexity"

**Changes:**
- Remove `LibraryNavbar` and `LibraryFooter`
- Hero: "Your Operational Systems Partner" -> "OPERATIONAL DOCTRINE & PROVENANCE"
- Section "The Managed Operator Model" -> "THE REGULATOR MODEL"
- Rewrite principle descriptions using hardened language (no "focus," "breaks," consumer adjectives)
- "What You Get With AERELION" -> "SYSTEM_SCHEMATICS"
- CTA: "Ready to Work..." -> "INITIATE_HANDOFF"; "Schedule Discovery Call" -> "REQUEST OPERATIONAL BRIEFING"
- Remove all `rounded-*` classes
- Apply mono headers, Industrial Digital borders

---

## 5. Pricing.tsx -- DELETE

This page is dead code (redirected to `/contact` in routing). Will be deleted entirely.

---

## 6. AgentLibrary.tsx -- Minor Updates

Already mostly compliant. Changes:
- "Each protocol below is configured, hosted, and operated by AERELION on your behalf" -> "Active protocols under AERELION governance. Authenticated data provisioning."
- Fix border widths from `0.5px` to `1px` for consistency

---

## 7. Doctrine Grid Content Update (DoctrineGrid.tsx)

Update pillar descriptions per directive:
- Protocol Hardening: "We identify ambiguity and install hardened logic gates to ensure architectural stability."
- Data Ontology: "Establishing a universal truth through a singular, governed schema for fragmented information."
- Governance Logic: "Automating stabilization and oversight through a permanent regulatory layer."

---

## 8. CommandCenterHero.tsx -- Minor Copy

Already compliant. No changes needed.

---

## 9. DeploymentOverview.tsx -- Minor Copy

Already mostly compliant. Change:
- "No technical labor required from the authorizing entity" -- keep (compliant)
- Verify no "hours saved" or consumer metrics remain

---

## Technical Details

### Files to Edit
| File | Scope |
|---|---|
| `src/components/library/WorkflowExampleCard.tsx` | Full restyle: remove metrics, consumer labels, rounded corners |
| `src/pages/library/AgentDetail.tsx` | Full overhaul: remove LibraryNavbar/Footer, restyle all sections |
| `src/pages/library/BundleDetail.tsx` | Full overhaul: remove LibraryNavbar/Footer, restyle all sections |
| `src/pages/About.tsx` | Full restyle: remove LibraryNavbar/Footer, hardened copy |
| `src/components/landing/DoctrineGrid.tsx` | Update pillar descriptions |
| `src/pages/library/AgentLibrary.tsx` | Minor copy and border fixes |

### Files to Delete
| File | Reason |
|---|---|
| `src/pages/Pricing.tsx` | Dead code, already redirected |

### What Remains Untouched
- All backend functions, Edge Functions, and database logic
- All portal pages (`/portal/*`) functional logic
- All admin pages (`/admin/*`) functional logic
- Route structure in `App.tsx`
- Auth flows, RLS policies, credential handling
- HUD shell (HUDNavbar, TerminalFooter, AmbientEffects)
- Landing page components (CommandCenterHero, BriefingArchives, OperationalParameters, AerelionLayerDiagram, BriefingRequestCTA)
