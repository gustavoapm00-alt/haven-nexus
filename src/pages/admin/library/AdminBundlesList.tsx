import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminGate from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, RefreshCw } from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  slug: string;
  status: string;
  bundle_price_cents: number;
  included_agent_ids: string[];
  created_at: string;
  updated_at: string;
}

const AdminBundlesList = () => {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBundles();
  }, [statusFilter]);

  const fetchBundles = async () => {
    setLoading(true);
    let query = supabase
      .from('automation_bundles')
      .select('id, name, slug, status, bundle_price_cents, included_agent_ids, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to fetch bundles');
      console.error(error);
    } else {
      setBundles(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase
      .from('automation_bundles')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete bundle');
      console.error(error);
    } else {
      toast.success(`Deleted "${name}"`);
      setBundles(bundles.filter((b) => b.id !== id));
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const filteredBundles = bundles.filter((bundle) =>
    bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bundle.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminGate>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
              <h1 className="font-display text-xl">System Bundles</h1>
            </div>
            <Button asChild>
              <Link to="/admin/library/bundles/new">
                <Plus className="w-4 h-4 mr-2" />
                New Bundle
              </Link>
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="Search bundles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchBundles} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No bundles found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Agents</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBundles.map((bundle) => (
                    <TableRow key={bundle.id}>
                      <TableCell className="font-medium">{bundle.name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {bundle.slug}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            bundle.status === 'published'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-yellow-500/10 text-yellow-500'
                          }`}
                        >
                          {bundle.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatPrice(bundle.bundle_price_cents)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-secondary rounded text-xs">
                          {bundle.included_agent_ids?.length || 0} agents
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/library/bundles/${bundle.id}`)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Bundle</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{bundle.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(bundle.id, bundle.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </main>
      </div>
    </AdminGate>
  );
};

export default AdminBundlesList;
