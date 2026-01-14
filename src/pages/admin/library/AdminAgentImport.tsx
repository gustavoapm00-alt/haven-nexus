import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminGate from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Upload, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AgentImportData {
  name: string;
  slug: string;
  status?: string;
  price_cents?: number;
  description?: string;
  short_outcome?: string;
  sectors?: string[];
  systems?: string[];
  how_it_works?: string[];
  includes?: string[];
  requirements?: string[];
  important_notes?: string[];
  setup_time_min?: number;
  setup_time_max?: number;
  capacity_recovered_min?: number;
  capacity_recovered_max?: number;
  featured?: boolean;
  current_version?: string;
}

interface ImportResult {
  slug: string;
  status: 'created' | 'updated' | 'failed';
  error?: string;
}

const AdminAgentImport = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const validateAgent = (agent: unknown, index: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!agent || typeof agent !== 'object') {
      errors.push(`Item ${index + 1}: Not a valid object`);
      return { valid: false, errors };
    }

    const a = agent as Record<string, unknown>;
    
    if (!a.name || typeof a.name !== 'string') {
      errors.push(`Item ${index + 1}: Missing or invalid 'name' field`);
    }
    if (!a.slug || typeof a.slug !== 'string') {
      errors.push(`Item ${index + 1}: Missing or invalid 'slug' field`);
    }
    if (a.slug && !/^[a-z0-9-]+$/.test(a.slug as string)) {
      errors.push(`Item ${index + 1}: 'slug' must be lowercase alphanumeric with dashes only`);
    }
    if (a.price_cents !== undefined && typeof a.price_cents !== 'number') {
      errors.push(`Item ${index + 1}: 'price_cents' must be a number`);
    }
    if (a.sectors !== undefined && !Array.isArray(a.sectors)) {
      errors.push(`Item ${index + 1}: 'sectors' must be an array`);
    }
    if (a.systems !== undefined && !Array.isArray(a.systems)) {
      errors.push(`Item ${index + 1}: 'systems' must be an array`);
    }

    return { valid: errors.length === 0, errors };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setResults([]);
    setShowResults(false);

    // Parse JSON
    let agents: AgentImportData[];
    try {
      const parsed = JSON.parse(jsonInput);
      agents = Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      toast.error('Invalid JSON format');
      return;
    }

    if (agents.length === 0) {
      toast.error('No agents to import');
      return;
    }

    // Validate all agents first
    const allErrors: string[] = [];
    agents.forEach((agent, index) => {
      const { valid, errors } = validateAgent(agent, index);
      if (!valid) {
        allErrors.push(...errors);
      }
    });

    if (allErrors.length > 0) {
      toast.error(`Validation failed:\n${allErrors.slice(0, 5).join('\n')}${allErrors.length > 5 ? `\n...and ${allErrors.length - 5} more errors` : ''}`);
      return;
    }

    setImporting(true);
    const importResults: ImportResult[] = [];

    for (const agent of agents) {
      try {
        // Check if agent with this slug exists
        const { data: existing } = await supabase
          .from('automation_agents')
          .select('id')
          .eq('slug', agent.slug)
          .maybeSingle();

        const agentData = {
          name: agent.name,
          slug: agent.slug,
          status: agent.status || 'draft',
          price_cents: agent.price_cents || 0,
          description: agent.description || '',
          short_outcome: agent.short_outcome || '',
          sectors: agent.sectors || [],
          systems: agent.systems || [],
          how_it_works: agent.how_it_works || [],
          includes: agent.includes || [],
          requirements: agent.requirements || [],
          important_notes: agent.important_notes || [],
          setup_time_min: agent.setup_time_min || 15,
          setup_time_max: agent.setup_time_max || 30,
          capacity_recovered_min: agent.capacity_recovered_min || 2,
          capacity_recovered_max: agent.capacity_recovered_max || 5,
          featured: agent.featured || false,
          current_version: agent.current_version || 'v1',
        };

        if (existing) {
          // Update
          const { error } = await supabase
            .from('automation_agents')
            .update(agentData)
            .eq('id', existing.id);

          if (error) throw error;
          importResults.push({ slug: agent.slug, status: 'updated' });
        } else {
          // Insert
          const { error } = await supabase
            .from('automation_agents')
            .insert(agentData);

          if (error) throw error;
          importResults.push({ slug: agent.slug, status: 'created' });
        }
      } catch (error) {
        console.error(`Failed to import ${agent.slug}:`, error);
        importResults.push({
          slug: agent.slug,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    setResults(importResults);
    setShowResults(true);
    setImporting(false);

    const created = importResults.filter(r => r.status === 'created').length;
    const updated = importResults.filter(r => r.status === 'updated').length;
    const failed = importResults.filter(r => r.status === 'failed').length;

    if (failed === 0) {
      toast.success(`Import complete: ${created} created, ${updated} updated`);
    } else {
      toast.warning(`Import complete with errors: ${created} created, ${updated} updated, ${failed} failed`);
    }
  };

  const exampleJson = JSON.stringify([
    {
      name: "Example Agent",
      slug: "example-agent",
      status: "draft",
      price_cents: 4900,
      description: "An example automation agent",
      short_outcome: "Automates example tasks",
      sectors: ["Professional Services"],
      systems: ["n8n", "Slack"],
      how_it_works: ["Step 1", "Step 2"],
      includes: ["Workflow JSON", "Deployment Guide"],
      requirements: ["n8n instance"],
      important_notes: ["Test before production"],
      setup_time_min: 15,
      setup_time_max: 30,
      capacity_recovered_min: 2,
      capacity_recovered_max: 5,
      featured: false,
      current_version: "v1"
    }
  ], null, 2);

  return (
    <AdminGate>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/library/agents">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Agents
                </Link>
              </Button>
              <h1 className="font-display text-xl">Bulk Import Agents</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Agents from JSON</CardTitle>
              <CardDescription>
                Paste JSON or upload a file to bulk import/update agents. Existing agents (matched by slug) will be updated.
                Files must be uploaded separately via the agent editor after import.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-file">Upload JSON File</Label>
                <input
                  id="json-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="json-input">Or Paste JSON</Label>
                <Textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={exampleJson}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleImport} disabled={importing || !jsonInput.trim()}>
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Agents
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setJsonInput(exampleJson)}
                >
                  Load Example
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {showResults && results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Import Results
                  <Badge variant="outline">
                    {results.length} agents
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          result.status === 'created'
                            ? 'bg-green-500/10 border border-green-500/20'
                            : result.status === 'updated'
                            ? 'bg-blue-500/10 border border-blue-500/20'
                            : 'bg-destructive/10 border border-destructive/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {result.status === 'created' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {result.status === 'updated' && (
                            <AlertCircle className="w-5 h-5 text-blue-500" />
                          )}
                          {result.status === 'failed' && (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                          <div>
                            <p className="font-mono text-sm">{result.slug}</p>
                            {result.error && (
                              <p className="text-xs text-destructive mt-1">{result.error}</p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            result.status === 'created'
                              ? 'default'
                              : result.status === 'updated'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {result.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Schema Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div className="grid grid-cols-3 gap-4 font-semibold border-b pb-2">
                  <span>Field</span>
                  <span>Type</span>
                  <span>Required</span>
                </div>
                {[
                  ['name', 'string', 'Yes'],
                  ['slug', 'string (lowercase, dashes)', 'Yes'],
                  ['status', 'draft | published', 'No'],
                  ['price_cents', 'number', 'No'],
                  ['description', 'string', 'No'],
                  ['short_outcome', 'string', 'No'],
                  ['sectors', 'string[]', 'No'],
                  ['systems', 'string[]', 'No'],
                  ['how_it_works', 'string[]', 'No'],
                  ['includes', 'string[]', 'No'],
                  ['requirements', 'string[]', 'No'],
                  ['important_notes', 'string[]', 'No'],
                  ['setup_time_min', 'number (mins)', 'No'],
                  ['setup_time_max', 'number (mins)', 'No'],
                  ['capacity_recovered_min', 'number (hrs/wk)', 'No'],
                  ['capacity_recovered_max', 'number (hrs/wk)', 'No'],
                  ['featured', 'boolean', 'No'],
                  ['current_version', 'string', 'No'],
                ].map(([field, type, required]) => (
                  <div key={field} className="grid grid-cols-3 gap-4 py-1">
                    <code className="font-mono text-xs bg-muted px-1 rounded">{field}</code>
                    <span className="text-muted-foreground">{type}</span>
                    <span>{required}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminGate>
  );
};

export default AdminAgentImport;
