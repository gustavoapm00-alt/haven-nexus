import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminGate from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Upload, Check, FileArchive } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  slug: string;
}

interface BundleFormData {
  name: string;
  slug: string;
  status: string;
  bundle_price_cents: number;
  individual_value_cents: number;
  description: string;
  objective: string;
  sectors: string[];
  included_agent_ids: string[];
  featured: boolean;
  bundle_zip_path: string | null;
}

const initialFormData: BundleFormData = {
  name: '',
  slug: '',
  status: 'draft',
  bundle_price_cents: 0,
  individual_value_cents: 0,
  description: '',
  objective: '',
  sectors: [],
  included_agent_ids: [],
  featured: false,
  bundle_zip_path: null,
};

const AdminBundleEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [formData, setFormData] = useState<BundleFormData>(initialFormData);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingZip, setUploadingZip] = useState(false);

  useEffect(() => {
    fetchAgents();
    if (!isNew && id) {
      fetchBundle(id);
    } else {
      setLoading(false);
    }
  }, [id, isNew]);

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('automation_agents')
      .select('id, name, slug')
      .order('name');

    if (!error && data) {
      setAgents(data);
    }
  };

  const fetchBundle = async (bundleId: string) => {
    const { data, error } = await supabase
      .from('automation_bundles')
      .select('*')
      .eq('id', bundleId)
      .single();

    if (error) {
      toast.error('Failed to fetch bundle');
      navigate('/admin/library/bundles');
      return;
    }

    setFormData({
      name: data.name || '',
      slug: data.slug || '',
      status: data.status || 'draft',
      bundle_price_cents: data.bundle_price_cents || 0,
      individual_value_cents: data.individual_value_cents || 0,
      description: data.description || '',
      objective: data.objective || '',
      sectors: data.sectors || [],
      included_agent_ids: data.included_agent_ids || [],
      featured: data.featured || false,
      bundle_zip_path: data.bundle_zip_path || null,
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

  const handleAgentToggle = (agentId: string) => {
    setFormData((prev) => ({
      ...prev,
      included_agent_ids: prev.included_agent_ids.includes(agentId)
        ? prev.included_agent_ids.filter((id) => id !== agentId)
        : [...prev.included_agent_ids, agentId],
    }));
  };

  const handleFileUpload = async (file: File) => {
    setUploadingZip(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `bundles/${formData.slug || 'temp'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('agent-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      setFormData((prev) => ({ ...prev, bundle_zip_path: filePath }));
      toast.success('Bundle ZIP uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload ZIP');
    } finally {
      setUploadingZip(false);
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
        bundle_price_cents: formData.bundle_price_cents,
        individual_value_cents: formData.individual_value_cents,
        description: formData.description,
        objective: formData.objective,
        sectors: formData.sectors,
        included_agent_ids: formData.included_agent_ids,
        featured: formData.featured,
        bundle_zip_path: formData.bundle_zip_path,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (isNew) {
        const { error } = await supabase.from('automation_bundles').insert(saveData);
        if (error) throw error;
        toast.success('Bundle created successfully');
      } else {
        const { error } = await supabase
          .from('automation_bundles')
          .update(saveData)
          .eq('id', id);
        if (error) throw error;
        toast.success('Bundle updated successfully');
      }

      navigate('/admin/library/bundles');
    } catch (error: unknown) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save bundle';
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
                <Link to="/admin/library/bundles">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Bundles
                </Link>
              </Button>
              <h1 className="font-display text-xl">
                {isNew ? 'New Bundle' : 'Edit Bundle'}
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
                    placeholder="Sales Ops Bundle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="sales-ops-bundle"
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
                  <Label htmlFor="bundle_price">Bundle Price (USD)</Label>
                  <Input
                    id="bundle_price"
                    type="number"
                    step="0.01"
                    value={(formData.bundle_price_cents / 100).toFixed(2)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bundle_price_cents: Math.round(parseFloat(e.target.value || '0') * 100),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="individual_value">Individual Value (USD)</Label>
                  <Input
                    id="individual_value"
                    type="number"
                    step="0.01"
                    value={(formData.individual_value_cents / 100).toFixed(2)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        individual_value_cents: Math.round(parseFloat(e.target.value || '0') * 100),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, featured: checked === true }))
                  }
                />
                <Label htmlFor="featured">Featured on homepage</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objective (one sentence)</Label>
                <Input
                  id="objective"
                  value={formData.objective}
                  onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
                  placeholder="Streamline sales operations end-to-end"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of what this bundle includes..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Sectors (one per line)</Label>
                <Textarea
                  value={formData.sectors.join('\n')}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sectors: e.target.value.split('\n').filter((s) => s.trim()),
                    }))
                  }
                  placeholder="Sales&#10;B2B&#10;Professional Services"
                  rows={3}
                />
              </div>
            </section>

            {/* Included Agents */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Included Agents</h2>
              <p className="text-sm text-muted-foreground">
                Select the agents to include in this bundle.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {agents.map((agent) => (
                  <label
                    key={agent.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.included_agent_ids.includes(agent.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      checked={formData.included_agent_ids.includes(agent.id)}
                      onCheckedChange={() => handleAgentToggle(agent.id)}
                    />
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{agent.slug}</p>
                    </div>
                  </label>
                ))}
              </div>
              {formData.included_agent_ids.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {formData.included_agent_ids.length} agent(s) selected
                </p>
              )}
            </section>

            {/* Bundle ZIP Upload */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Bundle ZIP (Optional)</h2>
              <p className="text-sm text-muted-foreground">
                Optionally upload a single ZIP file containing all workflows and guides.
                If not provided, downloads will include individual agent files.
              </p>
              {formData.bundle_zip_path ? (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <FileArchive className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-500 flex-1 truncate">
                    {formData.bundle_zip_path}
                  </span>
                </div>
              ) : null}
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                {uploadingZip ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>{formData.bundle_zip_path ? 'Replace' : 'Upload'} Bundle ZIP</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  disabled={uploadingZip}
                />
              </label>
            </section>
          </div>
        </main>
      </div>
    </AdminGate>
  );
};

export default AdminBundleEditor;
