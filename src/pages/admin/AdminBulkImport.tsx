import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  FileJson, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Trash2,
  Plus,
  Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

/**
 * Bulk Workflow Import Wizard
 * 
 * Admin tool to import n8n workflow templates and register them as automation_agents.
 * Parses workflow JSON, detects providers, and creates/updates records.
 */

// Node type to provider mapping
const NODE_TO_PROVIDER: Record<string, string> = {
  // Google
  "n8n-nodes-base.gmail": "google",
  "n8n-nodes-base.googleSheets": "google",
  "n8n-nodes-base.googleCalendar": "google",
  "n8n-nodes-base.googleDrive": "google",
  // HubSpot
  "n8n-nodes-base.hubspot": "hubspot",
  "n8n-nodes-base.hubspotTrigger": "hubspot",
  // Slack
  "n8n-nodes-base.slack": "slack",
  "n8n-nodes-base.slackTrigger": "slack",
  // Notion
  "n8n-nodes-base.notion": "notion",
  "n8n-nodes-base.notionTrigger": "notion",
  // Airtable
  "n8n-nodes-base.airtable": "airtable",
  // Stripe
  "n8n-nodes-base.stripe": "stripe",
  "n8n-nodes-base.stripeTrigger": "stripe",
  // Twilio
  "n8n-nodes-base.twilio": "twilio",
  // HTTP/Webhook
  "n8n-nodes-base.webhook": "webhook",
  "n8n-nodes-base.httpRequest": "http",
  // Email
  "n8n-nodes-base.emailSend": "email",
  "n8n-nodes-base.emailReadImap": "email",
};

interface ParsedWorkflow {
  filename: string;
  name: string;
  slug: string;
  description: string;
  nodeCount: number;
  triggerType: string | null;
  detectedProviders: string[];
  rawJson: object;
  fileHash: string;
  isValid: boolean;
  errors: string[];
}

interface ImportResult {
  slug: string;
  status: 'created' | 'updated' | 'error';
  message: string;
  automationAgentId?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

function parseWorkflowJson(filename: string, content: string): ParsedWorkflow {
  const errors: string[] = [];
  let rawJson: object = {};
  
  try {
    rawJson = JSON.parse(content);
  } catch {
    return {
      filename,
      name: filename,
      slug: generateSlug(filename),
      description: '',
      nodeCount: 0,
      triggerType: null,
      detectedProviders: [],
      rawJson: {},
      fileHash: '',
      isValid: false,
      errors: ['Invalid JSON'],
    };
  }

  const workflow = rawJson as Record<string, unknown>;
  const nodes = (workflow.nodes as Array<{ type?: string; name?: string }>) || [];
  
  if (!Array.isArray(nodes) || nodes.length === 0) {
    errors.push('No nodes found in workflow');
  }

  // Extract workflow name
  const name = (workflow.name as string) || filename.replace('.json', '');
  
  // Detect trigger type
  let triggerType: string | null = null;
  const triggerNode = nodes.find(n => 
    n.type?.includes('Trigger') || 
    n.type === 'n8n-nodes-base.webhook' ||
    n.type === 'n8n-nodes-base.scheduleTrigger'
  );
  if (triggerNode) {
    triggerType = triggerNode.type || null;
  }

  // Detect providers from nodes
  const detectedProviders = new Set<string>();
  for (const node of nodes) {
    const nodeType = node.type || '';
    const provider = NODE_TO_PROVIDER[nodeType];
    if (provider && provider !== 'webhook' && provider !== 'http') {
      detectedProviders.add(provider);
    }
  }

  return {
    filename,
    name,
    slug: generateSlug(name),
    description: (workflow.description as string) || '',
    nodeCount: nodes.length,
    triggerType,
    detectedProviders: Array.from(detectedProviders),
    rawJson,
    fileHash: '', // Will be set async
    isValid: errors.length === 0,
    errors,
  };
}

export default function AdminBulkImport() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [workflows, setWorkflows] = useState<ParsedWorkflow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [jsonInput, setJsonInput] = useState('');

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const parsedWorkflows: ParsedWorkflow[] = [];

    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.json')) continue;
      
      const content = await file.text();
      const parsed = parseWorkflowJson(file.name, content);
      parsed.fileHash = await hashContent(content);
      parsedWorkflows.push(parsed);
    }

    setWorkflows(prev => [...prev, ...parsedWorkflows]);
    setResults([]);
  }, []);

  const handleJsonPaste = useCallback(async () => {
    if (!jsonInput.trim()) return;

    const parsed = parseWorkflowJson('pasted-workflow.json', jsonInput);
    parsed.fileHash = await hashContent(jsonInput);
    
    setWorkflows(prev => [...prev, parsed]);
    setJsonInput('');
    setResults([]);
  }, [jsonInput]);

  const removeWorkflow = useCallback((index: number) => {
    setWorkflows(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateSlug = useCallback((index: number, newSlug: string) => {
    setWorkflows(prev => prev.map((w, i) => 
      i === index ? { ...w, slug: newSlug } : w
    ));
  }, []);

  const importWorkflows = useCallback(async () => {
    setImporting(true);
    const importResults: ImportResult[] = [];

    for (const workflow of workflows) {
      if (!workflow.isValid) {
        importResults.push({
          slug: workflow.slug,
          status: 'error',
          message: workflow.errors.join(', '),
        });
        continue;
      }

      try {
        // Check if automation agent exists
        const { data: existingAgent } = await supabase
          .from('automation_agents')
          .select('id')
          .eq('slug', workflow.slug)
          .maybeSingle();

        // Prepare required_integrations
        const requiredIntegrations = workflow.detectedProviders.map(p => ({ provider: p }));

        const agentData = {
          name: workflow.name,
          slug: workflow.slug,
          description: workflow.description || `Imported workflow: ${workflow.name}`,
          short_outcome: `Automates ${workflow.detectedProviders.join(', ')} integration`,
          systems: workflow.detectedProviders,
          required_integrations: requiredIntegrations,
          status: 'draft',
        };

        let automationAgentId: string;

        if (existingAgent) {
          // Update existing
          const { error: updateError } = await supabase
            .from('automation_agents')
            .update(agentData)
            .eq('id', existingAgent.id);

          if (updateError) throw updateError;
          automationAgentId = existingAgent.id;

          importResults.push({
            slug: workflow.slug,
            status: 'updated',
            message: 'Automation agent updated',
            automationAgentId,
          });
        } else {
          // Create new
          const { data: newAgent, error: insertError } = await supabase
            .from('automation_agents')
            .insert(agentData)
            .select('id')
            .single();

          if (insertError) throw insertError;
          automationAgentId = newAgent.id;

          importResults.push({
            slug: workflow.slug,
            status: 'created',
            message: 'Automation agent created',
            automationAgentId,
          });
        }

        // Store workflow template
        const templateData = {
          slug: workflow.slug,
          name: workflow.name,
          description: workflow.description,
          workflow_json: JSON.parse(JSON.stringify(workflow.rawJson)),
          detected_providers: workflow.detectedProviders,
          node_count: workflow.nodeCount,
          trigger_type: workflow.triggerType,
          file_hash: workflow.fileHash,
          original_filename: workflow.filename,
          automation_agent_id: automationAgentId,
        };

        const { data: existingTemplate } = await supabase
          .from('n8n_workflow_templates')
          .select('id')
          .eq('slug', workflow.slug)
          .maybeSingle();

        if (existingTemplate) {
          await supabase
            .from('n8n_workflow_templates')
            .update(templateData)
            .eq('id', existingTemplate.id);
        } else {
          await supabase
            .from('n8n_workflow_templates')
            .insert(templateData);
        }

      } catch (err) {
        importResults.push({
          slug: workflow.slug,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    setResults(importResults);
    setImporting(false);

    const successCount = importResults.filter(r => r.status !== 'error').length;
    toast({
      title: 'Import Complete',
      description: `${successCount} of ${importResults.length} workflows imported successfully`,
    });
  }, [workflows]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be an admin to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/library" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Bulk Workflow Import</h1>
            <p className="text-muted-foreground">
              Import n8n workflow templates and register them as automation agents
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Files
              </CardTitle>
              <CardDescription>
                Upload one or more n8n workflow JSON files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                multiple
                accept=".json"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Paste JSON
              </CardTitle>
              <CardDescription>
                Or paste workflow JSON directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"name": "My Workflow", "nodes": [...], ...}'
                rows={4}
              />
              <Button onClick={handleJsonPaste} disabled={!jsonInput.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Workflow
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Parsed Workflows Preview */}
        {workflows.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workflows to Import ({workflows.length})</CardTitle>
                  <CardDescription>
                    Review and edit before importing
                  </CardDescription>
                </div>
                <Button 
                  onClick={importWorkflows} 
                  disabled={importing || workflows.length === 0}
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Import All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Nodes</TableHead>
                    <TableHead>Providers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map((workflow, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{workflow.name}</TableCell>
                      <TableCell>
                        <Input
                          value={workflow.slug}
                          onChange={(e) => updateSlug(idx, e.target.value)}
                          className="w-40 h-8"
                        />
                      </TableCell>
                      <TableCell>{workflow.nodeCount}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {workflow.detectedProviders.map(p => (
                            <Badge key={p} variant="secondary" className="text-xs">
                              {p}
                            </Badge>
                          ))}
                          {workflow.detectedProviders.length === 0 && (
                            <span className="text-muted-foreground text-sm">None detected</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {workflow.isValid ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            {workflow.errors[0]}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWorkflow(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Import Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm">{result.slug}</TableCell>
                      <TableCell>
                        {result.status === 'created' && (
                          <Badge className="bg-emerald-500/10 text-emerald-500">Created</Badge>
                        )}
                        {result.status === 'updated' && (
                          <Badge className="bg-blue-500/10 text-blue-500">Updated</Badge>
                        )}
                        {result.status === 'error' && (
                          <Badge variant="destructive">Error</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.message}
                      </TableCell>
                      <TableCell>
                        {result.automationAgentId && (
                          <Link 
                            to={`/admin/library/agents/${result.automationAgentId}`}
                            className="text-primary text-sm hover:underline"
                          >
                            Edit Agent
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Provider Detection Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Provider Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The importer automatically detects required integrations from n8n node types:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {Object.entries(NODE_TO_PROVIDER).filter(([_, v]) => v !== 'webhook' && v !== 'http').slice(0, 12).map(([node, provider]) => (
                <div key={node} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Badge variant="outline" className="text-xs">{provider}</Badge>
                  <span className="text-muted-foreground truncate">{node.split('.')[1]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
