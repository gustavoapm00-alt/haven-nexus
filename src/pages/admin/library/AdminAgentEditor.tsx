import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminGate from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Upload, Check, FileJson, FileText } from 'lucide-react';

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
};

const AdminAgentEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [formData, setFormData] = useState<AgentFormData>(initialFormData);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingWorkflow, setUploadingWorkflow] = useState(false);
  const [uploadingGuide, setUploadingGuide] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      fetchAgent(id);
    }
  }, [id, isNew]);

  const fetchAgent = async (agentId: string) => {
    const { data, error } = await supabase
      .from('automation_agents')
      .select('*')
      .eq('id', agentId)
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
    });
    setLoading(false);
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
      slug: isNew ? generateSlug(name) : prev.slug,
    }));
  };

  const handleArrayFieldChange = (field: keyof AgentFormData, value: string) => {
    const items = value.split('\n').filter((item) => item.trim());
    setFormData((prev) => ({ ...prev, [field]: items }));
  };

  const handleFileUpload = async (
    file: File,
    type: 'workflow' | 'guide'
  ) => {
    const setUploading = type === 'workflow' ? setUploadingWorkflow : setUploadingGuide;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const folder = type === 'workflow' ? 'workflows' : 'guides';
      const filePath = `${folder}/${formData.slug || 'temp'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('agent-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      setFormData((prev) => ({
        ...prev,
        [type === 'workflow' ? 'workflow_file_path' : 'guide_file_path']: filePath,
      }));

      toast.success(`${type === 'workflow' ? 'Workflow' : 'Guide'} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
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
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (isNew) {
        const { error } = await supabase.from('automation_agents').insert(saveData);
        if (error) throw error;
        toast.success('Agent created successfully');
      } else {
        const { error } = await supabase
          .from('automation_agents')
          .update(saveData)
          .eq('id', id);
        if (error) throw error;
        toast.success('Agent updated successfully');
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
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/library/agents">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Agents
                </Link>
              </Button>
              <h1 className="font-display text-xl">
                {isNew ? 'New Agent' : 'Edit Agent'}
              </h1>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isNew ? 'Create' : 'Save'}
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-8">
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

              <div className="grid gap-4 md:grid-cols-3">
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
                  placeholder="Webhook receives new lead data&#10;Rules engine evaluates lead attributes&#10;Lead routed to destination"
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

            {/* File Uploads */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Files</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label>Workflow JSON</Label>
                  {formData.workflow_file_path ? (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <FileJson className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-500 flex-1 truncate">
                        {formData.workflow_file_path}
                      </span>
                    </div>
                  ) : null}
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    {uploadingWorkflow ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>{formData.workflow_file_path ? 'Replace' : 'Upload'} Workflow</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'workflow');
                      }}
                      disabled={uploadingWorkflow}
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <Label>Deployment Guide PDF</Label>
                  {formData.guide_file_path ? (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <FileText className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-500 flex-1 truncate">
                        {formData.guide_file_path}
                      </span>
                    </div>
                  ) : null}
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    {uploadingGuide ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>{formData.guide_file_path ? 'Replace' : 'Upload'} Guide</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'guide');
                      }}
                      disabled={uploadingGuide}
                    />
                  </label>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </AdminGate>
  );
};

export default AdminAgentEditor;
