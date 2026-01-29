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
  Download,
  Shield
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
 * Bulk Workflow Import Wizard (HARDENED)
 * 
 * Admin tool to import n8n workflow templates and register them as automation_agents.
 * All DB writes are handled by the admin-import-workflows edge function.
 * 
 * SECURITY:
 * - No direct DB writes from browser
 * - Server-side admin verification via edge function
 * - Validated input on both client and server
 */

// Node type to provider mapping (for preview display only - server does actual detection)
const NODE_TO_PROVIDER: Record<string, string> = {
  "n8n-nodes-base.gmail": "google",
  "n8n-nodes-base.googleSheets": "google",
  "n8n-nodes-base.googleCalendar": "google",
  "n8n-nodes-base.googleDrive": "google",
  "n8n-nodes-base.hubspot": "hubspot",
  "n8n-nodes-base.hubspotTrigger": "hubspot",
  "n8n-nodes-base.slack": "slack",
  "n8n-nodes-base.slackTrigger": "slack",
  "n8n-nodes-base.notion": "notion",
  "n8n-nodes-base.notionTrigger": "notion",
  "n8n-nodes-base.airtable": "airtable",
  "n8n-nodes-base.stripe": "stripe",
  "n8n-nodes-base.stripeTrigger": "stripe",
  "n8n-nodes-base.twilio": "twilio",
  "n8n-nodes-base.webhook": "webhook",
  "n8n-nodes-base.httpRequest": "http",
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
  rawContent: string;
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

function parseWorkflowJson(filename: string, content: string): ParsedWorkflow {
  const errors: string[] = [];
  
  let rawJson: Record<string, unknown>;
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
      rawContent: content,
      isValid: false,
      errors: ['Invalid JSON'],
    };
  }

  const nodes = (rawJson.nodes as Array<{ type?: string; name?: string }>) || [];
  
  if (!Array.isArray(nodes) || nodes.length === 0) {
    errors.push('No nodes found in workflow');
  }

  const name = (rawJson.name as string) || filename.replace('.json', '');
  
  let triggerType: string | null = null;
  const triggerNode = nodes.find(n => 
    n.type?.includes('Trigger') || 
    n.type === 'n8n-nodes-base.webhook' ||
    n.type === 'n8n-nodes-base.scheduleTrigger'
  );
  if (triggerNode) {
    triggerType = triggerNode.type || null;
  }

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
    description: (rawJson.description as string) || '',
    nodeCount: nodes.length,
    triggerType,
    detectedProviders: Array.from(detectedProviders),
    rawContent: content,
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
      parsedWorkflows.push(parsed);
    }

    setWorkflows(prev => [...prev, ...parsedWorkflows]);
    setResults([]);
  }, []);

  const handleJsonPaste = useCallback(async () => {
    if (!jsonInput.trim()) return;

    const parsed = parseWorkflowJson('pasted-workflow.json', jsonInput);
    
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
    setResults([]);

    try {
      // Prepare payload for edge function
      const workflowPayload = workflows
        .filter(w => w.isValid)
        .map(w => ({
          filename: w.filename,
          content: w.rawContent,
          override_slug: w.slug !== generateSlug(w.name) ? w.slug : undefined,
        }));

      if (workflowPayload.length === 0) {
        toast({
          title: 'No valid workflows',
          description: 'Please add valid workflow JSON files to import.',
          variant: 'destructive',
        });
        setImporting(false);
        return;
      }

      // Call the secure edge function
      const { data, error } = await supabase.functions.invoke('admin-import-workflows', {
        body: { workflows: workflowPayload },
      });

      if (error) {
        console.error('Import error:', error);
        toast({
          title: 'Import Failed',
          description: error.message || 'Failed to import workflows',
          variant: 'destructive',
        });
        setImporting(false);
        return;
      }

      // Handle results
      const importResults: ImportResult[] = data?.results || [];
      
      // Add error results for invalid workflows that weren't sent
      workflows.filter(w => !w.isValid).forEach(w => {
        importResults.push({
          slug: w.slug,
          status: 'error',
          message: w.errors.join(', '),
        });
      });

      setResults(importResults);

      const successCount = importResults.filter(r => r.status !== 'error').length;
      toast({
        title: 'Import Complete',
        description: `${successCount} of ${importResults.length} workflows imported successfully`,
      });

    } catch (err) {
      console.error('Import error:', err);
      toast({
        title: 'Import Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
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
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You must be an admin to access this page. Admin status is verified server-side.
            </CardDescription>
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
          <Badge variant="outline" className="ml-auto flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Server-side secured
          </Badge>
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
                    Review and edit before importing. All writes are processed securely server-side.
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
