THE AERELION SYSTEMS // SHADOW_COMMAND INSTALLATION (V2.06)
Instruction: "Install a hidden, admin-only operational node at /nexus/cmd. This installation must be invisible to public navigation and strictly follow the 'Industrial Digital' aesthetic: Obsidian (#0F0F0F), Operational Green (#39FF14), 0px border-radius, and 1px wireframe geometry.

1. NEXUS_GUARD (THE SILENT GATE):

Create src/components/nexus/NexusGuard.tsx.

Logic: Reuse the useAuth() hook. If !user or !isAdmin, return a silent redirect to /. Do not trigger login prompts or error messages. The node must appear non-existent to unauthorized entities.

2. SHADOW COMMAND PAGE (THE HUD):

Create src/pages/nexus/NexusCommand.tsx as a full-width dark dashboard.

Header: Implement a persistent amber watermark: AERELION // SHADOW_COMMAND // SYS.OPS.V2.06 // DOCTRINE_STABILIZED.

Layout: Integrate the SystemGrid (Top) and the LiveProvenanceLog (Bottom).

3. THE ELITE 7-AGENT GRID (THE ENGINE):

Create src/components/nexus/SystemGrid.tsx.

The Roster: AG-01 (Sentinel), AG-02 (Librarian), AG-03 (Watchman), AG-04 (Gatekeeper), AG-05 (Auditor), AG-06 (Chronicler), AG-07 (Envoy).

Card UI: Pulse-glow status indicators, Mono-spaced Protocol IDs, and inline <code> snippets for [REF-ID] and [SYSTEM_IMPACT] metadata.

Action: Include a [FORCE_STABILIZATION] button with a high-glow hover effect to signify master control.

4. LIVE PROVENANCE LOG (THE TERMINAL):

Create src/components/nexus/LiveProvenanceLog.tsx.

Data Source: Subscribe to the edge_function_logs table via Supabase Realtime.

Display: 50 most recent entries in a scrolling green-on-black terminal window.

Fields: Timestamp, Function_Name, Level, Message, Status_Code.

5. ROUTING & DATABASE SECURITY:

App.tsx: Add the route <Route path="/nexus/cmd" element={<NexusGuard><NexusCommand /></NexusGuard>} />. Ensure no public links point here.

SQL Directive: Enable Realtime on the edge_function_logs table to support the terminal feed.