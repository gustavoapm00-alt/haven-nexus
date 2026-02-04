import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminGate from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, Loader2, Upload, Check, FileJson, FileText, 
  Download, RefreshCw, Clock, Trash2, Eye, History, AlertCircle
} from 'lucide-react';
import { 
  CANONICAL_FILE_TYPES, 
  FILE_TYPE_CONFIG, 
  ALL_FILE_TYPES,
  type CanonicalFileType,
  getFileExtension,
  buildStoragePath 
} from '@/lib/file-types';

interface AgentFile {
  id: string;
  agent_id: string;
  version: string;
  file_type: string;
  storage_path: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  slug: string;
  original_filename: string | null;
  detected_providers: string[] | null;
  node_count: number | null;
}

interface AgentFormData {
  name: string;
  slug: string;
  status: string;
  price_cents: number;
  description: string;
  short_outcome: string;
  sectors: string[];
  systems: string[];
  how_it_works: string[];
  includes: string[];
  requirements: string[];
  important_notes: string[];
  setup_time_min: number;
  setup_time_max: number;
  capacity_recovered_min: number;
  capacity_recovered_max: number;
  featured: boolean;
  workflow_file_path: string | null;
  guide_file_path: string | null;
  current_version: string;
  n8n_template_ids: string[];
}

const initialFormData: AgentFormData = {
  name: '',
  slug: '',
  status: 'draft',
  price_cents: 0,
  description: '',
  short_outcome: '',
  sectors: [],
  systems: [],
  how_it_works: [],
  includes: [],
  requirements: [],
  important_notes: [],
  setup_time_min: 15,
  setup_time_max: 30,
  capacity_recovered_min: 2,
  capacity_recovered_max: 5,
  featured: false,
  workflow_file_path: null,
  guide_file_path: null,
  current_version: 'v1',
  n8n_template_ids: [],
};

interface AdminAgentEditorProps {
  mode: 'create' | 'edit';
}

const AdminAgentEditor = ({ mode }: AdminAgentEditorProps) => {
  const { id: urlId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreate = mode === 'create';

  // Agent ID can change if we auto-create in create mode
  const [agentId, setAgentId] = useState<string | null>(isCreate ? null : urlId || null);
  const [formData, setFormData] = useState<AgentFormData>(initialFormData);
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  
  // File management state
  const [agentFiles, setAgentFiles] = useState<AgentFile[]>([]);
  const [uploadingType, setUploadingType] = useState<CanonicalFileType | null>(null);
  const [allVersions, setAllVersions] = useState<string[]>([]);
  const [selectedVersionForHistory, setSelectedVersionForHistory] = useState<string | null>(null);
  const [historyFiles, setHistoryFiles] = useState<AgentFile[]>([]);
  
  // Preview state
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'markdown' | 'pdf' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Workflow templates state
  const [availableTemplates, setAvailableTemplates] = useState<WorkflowTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    if (!isCreate && urlId) {
      setAgentId(urlId);
      fetchAgent(urlId);
    }
  }, [urlId, isCreate]);

  // Fetch available workflow templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      const { data, error } = await supabase
        .from('n8n_workflow_templates')
        .select('id, name, slug, original_filename, detected_providers, node_count')
        .order('name');
      
      if (!error && data) {
        setAvailableTemplates(data);
      }
      setLoadingTemplates(false);
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (agentId) {
      fetchAgentFiles();
      fetchAllVersions();
    }
  }, [agentId, formData.current_version]);

  const fetchAgent = async (id: string) => {
    const { data, error } = await supabase
      .from('automation_agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Failed to fetch agent');
      navigate('/admin/library/agents');
      return;
    }

    setFormData({
      name: data.name || '',
      slug: data.slug || '',
      status: data.status || 'draft',
      price_cents: data.price_cents || 0,
      description: data.description || '',
      short_outcome: data.short_outcome || '',
      sectors: data.sectors || [],
      systems: data.systems || [],
      how_it_works: data.how_it_works || [],
      includes: data.includes || [],
      requirements: data.requirements || [],
      important_notes: data.important_notes || [],
      setup_time_min: data.setup_time_min || 15,
      setup_time_max: data.setup_time_max || 30,
      capacity_recovered_min: data.capacity_recovered_min || 2,
      capacity_recovered_max: data.capacity_recovered_max || 5,
      featured: data.featured || false,
      workflow_file_path: data.workflow_file_path || null,
      guide_file_path: data.guide_file_path || null,
      current_version: data.current_version || 'v1',
      n8n_template_ids: data.n8n_template_ids || [],
    });
    setLoading(false);
  };

  const fetchAgentFiles = async () => {
    if (!agentId) return;
    
    const { data, error } = await supabase
      .from('agent_files')
      .select('*')
      .eq('agent_id', agentId)
      .eq('version', formData.current_version)
      .order('file_type');

    if (!error && data) {
      setAgentFiles(data);
    }
  };

  const fetchAllVersions = async () => {
    if (!agentId) return;
    
    const { data, error } = await supabase
      .from('agent_files')
      .select('version')
      .eq('agent_id', agentId);

    if (!error && data) {
      const versions = [...new Set(data.map(f => f.version))].sort();
      setAllVersions(versions);
    }
  };

  const fetchHistoryFiles = async (version: string) => {
    if (!agentId) return;
    
    const { data, error } = await supabase
      .from('agent_files')
      .select('*')
      .eq('agent_id', agentId)
      .eq('version', version)
      .order('file_type');

    if (!error && data) {
      setHistoryFiles(data);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isCreate && !agentId ? generateSlug(name) : prev.slug,
    }));
  };

  const handleArrayFieldChange = (field: keyof AgentFormData, value: string) => {
    const items = value.split('\n').filter((item) => item.trim());
    setFormData((prev) => ({ ...prev, [field]: items }));
  };

  // Auto-create agent as draft to prevent orphan uploads
  const ensureAgentExists = async (): Promise<string | null> => {
    if (agentId) return agentId;
    
    if (!formData.name || !formData.slug) {
      toast.error('Enter name and slug before uploading files');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('automation_agents')
        .insert({
          name: formData.name,
          slug: formData.slug,
          status: 'draft',
          current_version: formData.current_version,
          description: '',
          short_outcome: '',
        })
        .select('id')
        .single();

      if (error) throw error;
      
      setAgentId(data.id);
      toast.info('Draft agent created');
      return data.id;
    } catch (error) {
      console.error('Failed to auto-create agent:', error);
      toast.error('Failed to create draft agent');
      return null;
    }
  };

  const handleFileUpload = async (file: File, fileType: CanonicalFileType) => {
    setUploadingType(fileType);

    try {
      // Ensure agent exists (auto-create if needed)
      const targetAgentId = await ensureAgentExists();
      if (!targetAgentId) {
        setUploadingType(null);
        return;
      }

      const extension = getFileExtension(file.name);
      const version = formData.current_version || 'v1';
      const storagePath = buildStoragePath(formData.slug, version, fileType, extension);

      // Delete existing file at this path if it exists
      await supabase.storage.from('agent-files').remove([storagePath]);

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('agent-files')
        .upload(storagePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Upsert agent_files record
      const { data: existingFile } = await supabase
        .from('agent_files')
        .select('id')
        .eq('agent_id', targetAgentId)
        .eq('version', version)
        .eq('file_type', fileType)
        .maybeSingle();

      if (existingFile) {
        await supabase
          .from('agent_files')
          .update({ 
            storage_path: storagePath, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingFile.id);
      } else {
        await supabase.from('agent_files').insert({
          agent_id: targetAgentId,
          version,
          file_type: fileType,
          storage_path: storagePath,
        });
      }

      // Update legacy fields for backward compatibility
      if (fileType === 'workflow') {
        setFormData(prev => ({ ...prev, workflow_file_path: storagePath }));
      } else if (fileType === 'deployment_guide') {
        setFormData(prev => ({ ...prev, guide_file_path: storagePath }));
      }

      await fetchAgentFiles();
      await fetchAllVersions();
      toast.success(`${FILE_TYPE_CONFIG[fileType].label} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${FILE_TYPE_CONFIG[fileType].label}`);
    } finally {
      setUploadingType(null);
    }
  };

  const handleDownloadFile = async (file: AgentFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('agent-files')
        .createSignedUrl(file.storage_path, 3600);

      if (error || !data) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      toast.error('Failed to generate download link');
    }
  };

  const handlePreviewFile = async (file: AgentFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('agent-files')
        .createSignedUrl(file.storage_path, 3600);

      if (error || !data) throw error;

      const ext = getFileExtension(file.storage_path);
      
      if (ext === 'md' || ext === 'txt') {
        // Fetch and display markdown
        const response = await fetch(data.signedUrl);
        const text = await response.text();
        setPreviewContent(text);
        setPreviewType('markdown');
        setPreviewUrl(null);
      } else if (ext === 'pdf') {
        setPreviewContent(null);
        setPreviewType('pdf');
        setPreviewUrl(data.signedUrl);
      } else {
        // Just download for other types
        window.open(data.signedUrl, '_blank');
        return;
      }
      
      setPreviewOpen(true);
    } catch (error) {
      toast.error('Failed to preview file');
    }
  };

  const handleDeleteFile = async (file: AgentFile) => {
    if (!confirm('Delete this file?')) return;

    try {
      await supabase.storage.from('agent-files').remove([file.storage_path]);
      await supabase.from('agent_files').delete().eq('id', file.id);
      await fetchAgentFiles();
      toast.success('File deleted');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleSetCurrentVersion = async (version: string) => {
    if (!agentId) return;
    
    try {
      await supabase
        .from('automation_agents')
        .update({ current_version: version })
        .eq('id', agentId);
      
      setFormData(prev => ({ ...prev, current_version: version }));
      toast.success(`Current version set to ${version}`);
    } catch (error) {
      toast.error('Failed to update version');
    }
  };

  const checkWorkflowExists = async (): Promise<boolean> => {
    if (!agentId) return false;
    
    // Check agent_files first
    const { data: files } = await supabase
      .from('agent_files')
      .select('id')
      .eq('agent_id', agentId)
      .eq('version', formData.current_version)
      .eq('file_type', CANONICAL_FILE_TYPES.workflow)
      .limit(1);

    if (files && files.length > 0) return true;

    // Fallback to legacy workflow_file_path
    if (formData.workflow_file_path) return true;

    return false;
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    // Publish validation
    if (formData.status === 'published') {
      const hasWorkflow = await checkWorkflowExists();
      if (!hasWorkflow) {
        toast.error('Cannot publish without a workflow file for the current version.');
        return;
      }
    }

    setSaving(true);

    try {
      const saveData = {
        name: formData.name,
        slug: formData.slug,
        status: formData.status,
        price_cents: formData.price_cents,
        description: formData.description,
        short_outcome: formData.short_outcome,
        sectors: formData.sectors,
        systems: formData.systems,
        how_it_works: formData.how_it_works,
        includes: formData.includes,
        requirements: formData.requirements,
        important_notes: formData.important_notes,
        setup_time_min: formData.setup_time_min,
        setup_time_max: formData.setup_time_max,
        capacity_recovered_min: formData.capacity_recovered_min,
        capacity_recovered_max: formData.capacity_recovered_max,
        featured: formData.featured,
        workflow_file_path: formData.workflow_file_path,
        guide_file_path: formData.guide_file_path,
        current_version: formData.current_version,
        n8n_template_ids: formData.n8n_template_ids,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (agentId) {
        // Update existing
        const { error } = await supabase
          .from('automation_agents')
          .update(saveData)
          .eq('id', agentId);
        if (error) throw error;
        toast.success('Agent updated successfully');
      } else {
        // Create new
        const { data, error } = await supabase
          .from('automation_agents')
          .insert(saveData)
          .select('id')
          .single();
        if (error) throw error;
        setAgentId(data.id);
        toast.success('Agent created successfully');
      }

      navigate('/admin/library/agents');
    } catch (error: unknown) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save agent';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const hasWorkflowForCurrentVersion = agentFiles.some(
    f => f.file_type === CANONICAL_FILE_TYPES.workflow
  ) || !!formData.workflow_file_path;

  if (loading) {
    return (
      <AdminGate>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminGate>
    );
  }

  return (
    <AdminGate>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/library/agents">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Agents
                </Link>
              </Button>
              <h1 className="font-display text-xl">
                {isCreate && !agentId ? 'New Agent' : 'Edit Agent'}
              </h1>
              {agentId && (
                <Badge variant="outline" className="font-mono text-xs">
                  {agentId.slice(0, 8)}...
                </Badge>
              )}
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isCreate && !agentId ? 'Create' : 'Save'}
            </Button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="files">Files & Versions</TabsTrigger>
              <TabsTrigger value="history">Version History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-8">
              {/* Basic Info */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Basic Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Lead Intake Router"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="lead-intake-router"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Current Version</Label>
                    <Input
                      id="version"
                      value={formData.current_version}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, current_version: e.target.value }))
                      }
                      placeholder="v1"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={(formData.price_cents / 100).toFixed(2)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price_cents: Math.round(parseFloat(e.target.value || '0') * 100),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featured">Featured</Label>
                    <Select
                      value={formData.featured ? 'yes' : 'no'}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, featured: value === 'yes' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_outcome">Short Outcome (one sentence)</Label>
                  <Input
                    id="short_outcome"
                    value={formData.short_outcome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, short_outcome: e.target.value }))}
                    placeholder="Routes incoming leads to the right team automatically."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of what this agent does..."
                    rows={4}
                  />
                </div>
              </section>

              {/* n8n Template Selection */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Workflow Templates</h2>
                <p className="text-sm text-muted-foreground">
                  Link imported n8n workflow templates to this agent. These templates will be duplicated for each client activation.
                </p>
                
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Linked Templates</Label>
                      {loadingTemplates ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading templates...
                        </div>
                      ) : availableTemplates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No templates imported yet.{' '}
                          <Link to="/admin/library/templates" className="text-primary underline">
                            Import templates
                          </Link>
                        </p>
                      ) : (
                        <>
                          <Select
                            value=""
                            onValueChange={(templateId) => {
                              if (!formData.n8n_template_ids.includes(templateId)) {
                                setFormData(prev => ({
                                  ...prev,
                                  n8n_template_ids: [...prev.n8n_template_ids, templateId]
                                }));
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Add a template..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTemplates
                                .filter(t => !formData.n8n_template_ids.includes(t.id))
                                .map((template) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    <div className="flex items-center gap-2">
                                      <FileJson className="w-4 h-4 text-primary" />
                                      <span>{template.name}</span>
                                      {template.node_count && (
                                        <span className="text-xs text-muted-foreground">
                                          ({template.node_count} nodes)
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          {formData.n8n_template_ids.length > 0 && (
                            <div className="space-y-2 mt-4">
                              {formData.n8n_template_ids.map((templateId) => {
                                const template = availableTemplates.find(t => t.id === templateId);
                                if (!template) return null;
                                return (
                                  <div
                                    key={templateId}
                                    className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30"
                                  >
                                    <div className="flex items-center gap-3">
                                      <FileJson className="w-5 h-5 text-primary" />
                                      <div>
                                        <p className="font-medium">{template.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span className="font-mono">{template.slug}</span>
                                          {template.original_filename && (
                                            <>
                                              <span>•</span>
                                              <span>{template.original_filename}</span>
                                            </>
                                          )}
                                          {template.node_count && (
                                            <>
                                              <span>•</span>
                                              <span>{template.node_count} nodes</span>
                                            </>
                                          )}
                                        </div>
                                        {template.detected_providers && template.detected_providers.length > 0 && (
                                          <div className="flex items-center gap-1 mt-1">
                                            {template.detected_providers.map(provider => (
                                              <Badge key={provider} variant="outline" className="text-xs">
                                                {provider}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          n8n_template_ids: prev.n8n_template_ids.filter(id => id !== templateId)
                                        }));
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Metrics */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Metrics</h2>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Setup Time Min (mins)</Label>
                    <Input
                      type="number"
                      value={formData.setup_time_min}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, setup_time_min: parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Setup Time Max (mins)</Label>
                    <Input
                      type="number"
                      value={formData.setup_time_max}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, setup_time_max: parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity Min (hrs/wk)</Label>
                    <Input
                      type="number"
                      value={formData.capacity_recovered_min}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          capacity_recovered_min: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity Max (hrs/wk)</Label>
                    <Input
                      type="number"
                      value={formData.capacity_recovered_max}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          capacity_recovered_max: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
              </section>

              {/* Lists */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Details (one item per line)</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Sectors</Label>
                    <Textarea
                      value={formData.sectors.join('\n')}
                      onChange={(e) => handleArrayFieldChange('sectors', e.target.value)}
                      placeholder="Healthcare&#10;Professional Services&#10;Real Estate"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Systems</Label>
                    <Textarea
                      value={formData.systems.join('\n')}
                      onChange={(e) => handleArrayFieldChange('systems', e.target.value)}
                      placeholder="n8n&#10;Gmail&#10;Slack"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>How It Works</Label>
                  <Textarea
                    value={formData.how_it_works.join('\n')}
                    onChange={(e) => handleArrayFieldChange('how_it_works', e.target.value)}
                    placeholder="Import workflow JSON into n8n&#10;Configure system credentials&#10;Activate trigger and test"
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Includes</Label>
                    <Textarea
                      value={formData.includes.join('\n')}
                      onChange={(e) => handleArrayFieldChange('includes', e.target.value)}
                      placeholder="n8n workflow JSON&#10;Deployment guide PDF"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Requirements</Label>
                    <Textarea
                      value={formData.requirements.join('\n')}
                      onChange={(e) => handleArrayFieldChange('requirements', e.target.value)}
                      placeholder="n8n instance&#10;API access"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Important Notes</Label>
                  <Textarea
                    value={formData.important_notes.join('\n')}
                    onChange={(e) => handleArrayFieldChange('important_notes', e.target.value)}
                    placeholder="Test before production&#10;Review configuration"
                    rows={3}
                  />
                </div>
              </section>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              {/* Publish Warning */}
              {!hasWorkflowForCurrentVersion && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-500">
                    Workflow file required for version <code className="font-mono">{formData.current_version}</code> to publish.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Files for Version: {formData.current_version}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload files for the current version. Storage path: <code className="font-mono text-xs">agents/{formData.slug}/{formData.current_version}/</code>
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAgentFiles}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Upload Controls */}
              <div className="grid gap-4 md:grid-cols-2">
                {ALL_FILE_TYPES.map((fileType) => {
                  const config = FILE_TYPE_CONFIG[fileType];
                  const existingFile = agentFiles.find(f => f.file_type === fileType);
                  const isUploading = uploadingType === fileType;

                  return (
                    <Card key={fileType}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            {config.icon === 'json' && <FileJson className="w-4 h-4" />}
                            {config.icon === 'pdf' && <FileText className="w-4 h-4" />}
                            {config.icon === 'markdown' && <FileText className="w-4 h-4" />}
                            {config.label}
                          </span>
                          {config.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {existingFile ? (
                          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                              <Check className="w-4 h-4" />
                              <span className="flex-1 truncate font-mono text-xs">
                                {existingFile.storage_path.split('/').pop()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(existingFile.updated_at).toLocaleString()}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadFile(existingFile)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePreviewFile(existingFile)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteFile(existingFile)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : null}
                        
                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                          {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              <span>{existingFile ? 'Replace' : 'Upload'} {config.shortLabel}</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept={config.accept}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, fileType);
                            }}
                            disabled={isUploading}
                          />
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Accepts: {config.accept}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Version History
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    All versions with uploaded files for this agent.
                  </p>
                </div>
              </div>

              {allVersions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No file versions uploaded yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Version List */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Versions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {allVersions.map((version) => (
                            <div
                              key={version}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedVersionForHistory === version
                                  ? 'bg-primary/10 border border-primary/20'
                                  : 'hover:bg-muted'
                              }`}
                              onClick={() => {
                                setSelectedVersionForHistory(version);
                                fetchHistoryFiles(version);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-sm">{version}</span>
                                {version === formData.current_version && (
                                  <Badge variant="secondary" className="text-xs">Current</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Files for Selected Version */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>
                          {selectedVersionForHistory 
                            ? `Files in ${selectedVersionForHistory}`
                            : 'Select a version'}
                        </span>
                        {selectedVersionForHistory && selectedVersionForHistory !== formData.current_version && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetCurrentVersion(selectedVersionForHistory)}
                          >
                            Set as Current
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!selectedVersionForHistory ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Click a version to view its files.
                        </p>
                      ) : historyFiles.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No files in this version.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {historyFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {FILE_TYPE_CONFIG[file.file_type as CanonicalFileType]?.label || file.file_type}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {file.storage_path.split('/').pop()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadFile(file)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>File Preview</DialogTitle>
            </DialogHeader>
            {previewType === 'markdown' && previewContent && (
              <ScrollArea className="h-[60vh]">
                <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg">
                  {previewContent}
                </pre>
              </ScrollArea>
            )}
            {previewType === 'pdf' && previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-[60vh] rounded-lg border"
                title="PDF Preview"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminGate>
  );
};

export default AdminAgentEditor;
