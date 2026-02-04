import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminGate from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Upload, Loader2, CheckCircle, XCircle, AlertCircle, 
  FileJson, Trash2, Edit2, Info
} from 'lucide-react';

interface ParsedTemplate {
  id: string;
  filename: string;
  content: string;
  name: string;
  slug: string;
  description: string;
  nodeCount: number;
  triggerType: string | null;
  detectedProviders: string[];
  isValid: boolean;
  error?: string;
}

interface ImportedResult {
  id: string;
  slug: string;
  name: string;
  source_filename: string;
}

interface SkippedResult {
  source_filename: string;
  reason: string;
}

interface ErrorResult {
  source_filename: string;
  error: string;
}

interface ImportResponse {
  imported: ImportedResult[];
  skipped: SkippedResult[];
  errors: ErrorResult[];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function detectTriggerType(nodes: Array<{ type?: string }>): string | null {
  const triggerNode = nodes.find(
    (n) =>
      n.type?.toLowerCase().includes('trigger') ||
      n.type === 'n8n-nodes-base.webhook'
  );
  return triggerNode?.type || null;
}

const PROVIDER_MAP: Record<string, string> = {
  'n8n-nodes-base.gmail': 'Google',
  'n8n-nodes-base.gmailTrigger': 'Google',
  'n8n-nodes-base.googleSheets': 'Google',
  'n8n-nodes-base.googleCalendar': 'Google',
  'n8n-nodes-base.googleDrive': 'Google',
  'n8n-nodes-base.hubspot': 'HubSpot',
  'n8n-nodes-base.hubspotTrigger': 'HubSpot',
  'n8n-nodes-base.slack': 'Slack',
  'n8n-nodes-base.notion': 'Notion',
  'n8n-nodes-base.microsoftTeams': 'Microsoft Teams',
  'n8n-nodes-base.jira': 'Jira',
  'n8n-nodes-base.telegram': 'Telegram',
  '@n8n/n8n-nodes-langchain.lmChatOpenAi': 'OpenAI',
};

function detectProviders(nodes: Array<{ type?: string }>): string[] {
  const providers = new Set<string>();
  for (const node of nodes) {
    const provider = PROVIDER_MAP[node.type || ''];
    if (provider) providers.add(provider);
  }
  return Array.from(providers);
}

const AdminTemplateImport = () => {
  const [templates, setTemplates] = useState<ParsedTemplate[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResponse | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseJsonFile = useCallback(async (file: File): Promise<ParsedTemplate> => {
    const id = crypto.randomUUID();
    const filename = file.name;
    
    try {
      const content = await file.text();
      const json = JSON.parse(content);
      
      // Validate structure
      if (!json.nodes || !Array.isArray(json.nodes)) {
        return {
          id,
          filename,
          content,
          name: filename.replace(/\.json$/i, ''),
          slug: generateSlug(filename.replace(/\.json$/i, '')),
          description: '',
          nodeCount: 0,
          triggerType: null,
          detectedProviders: [],
          isValid: false,
          error: 'Missing "nodes" array',
        };
      }
      
      if (json.nodes.length === 0) {
        return {
          id,
          filename,
          content,
          name: filename.replace(/\.json$/i, ''),
          slug: generateSlug(filename.replace(/\.json$/i, '')),
          description: '',
          nodeCount: 0,
          triggerType: null,
          detectedProviders: [],
          isValid: false,
          error: 'Workflow has no nodes',
        };
      }

      const name = json.name || filename.replace(/\.json$/i, '');
      
      return {
        id,
        filename,
        content,
        name,
        slug: generateSlug(name),
        description: json.description || '',
        nodeCount: json.nodes.length,
        triggerType: detectTriggerType(json.nodes),
        detectedProviders: detectProviders(json.nodes),
        isValid: true,
      };
    } catch (e) {
      return {
        id,
        filename,
        content: '',
        name: filename.replace(/\.json$/i, ''),
        slug: generateSlug(filename.replace(/\.json$/i, '')),
        description: '',
        nodeCount: 0,
        triggerType: null,
        detectedProviders: [],
        isValid: false,
        error: `Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`,
      };
    }
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const jsonFiles = Array.from(files).filter(f => f.name.endsWith('.json'));
    if (jsonFiles.length === 0) {
      toast.error('No .json files selected');
      return;
    }
    
    const parsed = await Promise.all(jsonFiles.map(parseJsonFile));
    
    // Check for duplicate filenames
    setTemplates(prev => {
      const existingFilenames = new Set(prev.map(t => t.filename));
      const newTemplates = parsed.filter(t => !existingFilenames.has(t.filename));
      const duplicateCount = parsed.length - newTemplates.length;
      
      if (duplicateCount > 0) {
        toast.info(`Skipped ${duplicateCount} duplicate file(s)`);
      }
      
      return [...prev, ...newTemplates];
    });
  }, [parseJsonFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemoveTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleUpdateTemplate = useCallback((id: string, field: 'name' | 'slug' | 'description', value: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== id) return t;
      
      const updated = { ...t, [field]: value };
      // Auto-update slug when name changes (if slug was auto-generated)
      if (field === 'name' && t.slug === generateSlug(t.name)) {
        updated.slug = generateSlug(value);
      }
      return updated;
    }));
  }, []);

  const handleImport = async () => {
    const validTemplates = templates.filter(t => t.isValid);
    
    if (validTemplates.length === 0) {
      toast.error('No valid templates to import');
      return;
    }

    setImporting(true);
    setResults(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (!token) {
        toast.error('Authentication required');
        setImporting(false);
        return;
      }

      const response = await supabase.functions.invoke('import-n8n-templates', {
        body: {
          templates: validTemplates.map(t => ({
            filename: t.filename,
            content: t.content,
            name: t.name,
            slug: t.slug,
            description: t.description,
          })),
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data as ImportResponse;
      setResults(result);

      // Remove successfully imported templates from the list
      const importedFilenames = new Set(result.imported.map(i => i.source_filename));
      setTemplates(prev => prev.filter(t => !importedFilenames.has(t.filename)));

      if (result.imported.length > 0) {
        toast.success(`Successfully imported ${result.imported.length} template(s)`);
      }
      if (result.skipped.length > 0) {
        toast.info(`Skipped ${result.skipped.length} duplicate template(s)`);
      }
      if (result.errors.length > 0) {
        toast.error(`Failed to import ${result.errors.length} template(s)`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  const validCount = templates.filter(t => t.isValid).length;
  const invalidCount = templates.filter(t => !t.isValid).length;

  return (
    <AdminGate>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/library">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Library
                </Link>
              </Button>
              <h1 className="font-display text-xl">Import Workflow Templates</h1>
            </div>
            {templates.length > 0 && (
              <Button 
                onClick={handleImport} 
                disabled={importing || validCount === 0}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {validCount} Template{validCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          {/* Info Banner */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium">Workflow Templates are Immutable</p>
                <p className="text-muted-foreground">
                  Once imported, templates cannot be modified or deleted. They serve as permanent 
                  source definitions that are duplicated into per-client workflows during activation.
                  Templates never execute directly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Drop Zone */}
          <Card>
            <CardContent className="p-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                  transition-colors
                  ${isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                <FileJson className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">
                  Drop n8n workflow JSON files here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse • Multiple files supported
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Templates Queue */}
          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Templates to Import
                    <Badge variant="outline">{templates.length}</Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    {validCount > 0 && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        {validCount} valid
                      </Badge>
                    )}
                    {invalidCount > 0 && (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                        {invalidCount} invalid
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Review and edit template metadata before importing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[600px]">
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 rounded-lg border ${
                          template.isValid
                            ? 'border-border bg-card'
                            : 'border-destructive/50 bg-destructive/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <FileJson className={`w-5 h-5 ${template.isValid ? 'text-primary' : 'text-destructive'}`} />
                            <span className="font-mono text-sm text-muted-foreground">
                              {template.filename}
                            </span>
                            {template.isValid ? (
                              <Badge variant="outline" className="text-xs">
                                {template.nodeCount} nodes
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Invalid
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTemplate(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {template.error && (
                          <div className="mb-3 p-2 rounded bg-destructive/10 text-destructive text-sm">
                            {template.error}
                          </div>
                        )}

                        {template.isValid && (
                          <>
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="space-y-1.5">
                                <Label htmlFor={`name-${template.id}`} className="text-xs">Name</Label>
                                <Input
                                  id={`name-${template.id}`}
                                  value={template.name}
                                  onChange={(e) => handleUpdateTemplate(template.id, 'name', e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor={`slug-${template.id}`} className="text-xs">Slug (unique)</Label>
                                <Input
                                  id={`slug-${template.id}`}
                                  value={template.slug}
                                  onChange={(e) => handleUpdateTemplate(template.id, 'slug', e.target.value)}
                                  className="h-9 font-mono text-sm"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5 mb-3">
                              <Label htmlFor={`desc-${template.id}`} className="text-xs">Description (optional)</Label>
                              <Textarea
                                id={`desc-${template.id}`}
                                value={template.description}
                                onChange={(e) => handleUpdateTemplate(template.id, 'description', e.target.value)}
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                            {template.detectedProviders.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {template.detectedProviders.map((provider) => (
                                  <Badge key={provider} variant="secondary" className="text-xs">
                                    {provider}
                                  </Badge>
                                ))}
                                {template.triggerType && (
                                  <Badge variant="outline" className="text-xs">
                                    {template.triggerType.split('.').pop()}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.imported.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Imported ({results.imported.length})
                    </h4>
                    <div className="space-y-1">
                      {results.imported.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded bg-green-500/10">
                          <span className="font-mono text-sm">{item.slug}</span>
                          <span className="text-xs text-muted-foreground">{item.source_filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.skipped.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-600 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Skipped - Duplicates ({results.skipped.length})
                    </h4>
                    <div className="space-y-1">
                      {results.skipped.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-yellow-500/10">
                          <span className="text-sm">{item.source_filename}</span>
                          <span className="text-xs text-muted-foreground">{item.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.errors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Errors ({results.errors.length})
                    </h4>
                    <div className="space-y-1">
                      {results.errors.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-destructive/10">
                          <span className="text-sm">{item.source_filename}</span>
                          <span className="text-xs text-destructive">{item.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AdminGate>
  );
};

export default AdminTemplateImport;
