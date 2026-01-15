import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminGate from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Package,
  Download,
  CheckCircle,
  Clock,
  FileJson,
  FileText,
  ShoppingCart,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Purchase {
  id: string;
  user_id: string | null;
  email: string;
  item_id: string;
  item_type: string;
  amount_cents: number;
  status: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  download_count: number;
  last_download_at: string | null;
  created_at: string;
}

interface PurchaseWithProduct extends Purchase {
  product_name: string;
  product_slug: string;
  current_version: string | null;
  file_types: string[];
}

interface AgentInfo {
  id: string;
  name: string;
  slug: string;
  current_version: string | null;
}

interface BundleInfo {
  id: string;
  name: string;
  slug: string;
}

const DOWNLOAD_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'downloaded', label: 'Downloaded' },
  { value: 'not_downloaded', label: 'Not Downloaded' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Payments' },
  { value: 'completed', label: 'Completed' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
];

const ITEMS_PER_PAGE = 20;

export default function AdminActivity() {
  const [purchases, setPurchases] = useState<PurchaseWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [downloadFilter, setDownloadFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      // Fetch purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (purchasesError) throw purchasesError;

      // Fetch agents and bundles for product names
      const [agentsRes, bundlesRes, filesRes] = await Promise.all([
        supabase.from('automation_agents').select('id, name, slug, current_version'),
        supabase.from('automation_bundles').select('id, name, slug'),
        supabase.from('agent_files').select('agent_id, file_type, version'),
      ]);

      const agentsMap = new Map<string, AgentInfo>();
      agentsRes.data?.forEach((agent) => agentsMap.set(agent.id, agent));

      const bundlesMap = new Map<string, BundleInfo>();
      bundlesRes.data?.forEach((bundle) => bundlesMap.set(bundle.id, bundle));

      // Map file types per agent
      const agentFilesMap = new Map<string, string[]>();
      filesRes.data?.forEach((file) => {
        const existing = agentFilesMap.get(file.agent_id) || [];
        if (!existing.includes(file.file_type)) {
          existing.push(file.file_type);
        }
        agentFilesMap.set(file.agent_id, existing);
      });

      // Enrich purchases with product info
      const enrichedPurchases: PurchaseWithProduct[] = (purchasesData || []).map((purchase) => {
        let productName = 'Unknown Product';
        let productSlug = '';
        let currentVersion: string | null = null;
        let fileTypes: string[] = [];

        if (purchase.item_type === 'agent') {
          const agent = agentsMap.get(purchase.item_id);
          if (agent) {
            productName = agent.name;
            productSlug = agent.slug;
            currentVersion = agent.current_version;
            fileTypes = agentFilesMap.get(agent.id) || [];
          }
        } else if (purchase.item_type === 'bundle') {
          const bundle = bundlesMap.get(purchase.item_id);
          if (bundle) {
            productName = bundle.name;
            productSlug = bundle.slug;
            fileTypes = ['bundle_zip'];
          }
        }

        return {
          ...purchase,
          product_name: productName,
          product_slug: productSlug,
          current_version: currentVersion,
          file_types: fileTypes,
        };
      });

      setPurchases(enrichedPurchases);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch =
        !search ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        p.user_id?.toLowerCase().includes(search.toLowerCase());

      const matchesDownload =
        downloadFilter === 'all' ||
        (downloadFilter === 'downloaded' && p.download_count > 0) ||
        (downloadFilter === 'not_downloaded' && p.download_count === 0);

      const matchesPayment =
        paymentFilter === 'all' || p.status === paymentFilter;

      return matchesSearch && matchesDownload && matchesPayment;
    });
  }, [purchases, search, downloadFilter, paymentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPurchases.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPurchases, currentPage]);

  // Stats
  const stats = useMemo(() => {
    const total = purchases.length;
    const downloaded = purchases.filter((p) => p.download_count > 0).length;
    const totalRevenue = purchases
      .filter((p) => ['completed', 'paid'].includes(p.status))
      .reduce((sum, p) => sum + p.amount_cents, 0);
    const avgDownloads =
      total > 0
        ? (purchases.reduce((sum, p) => sum + p.download_count, 0) / total).toFixed(1)
        : '0';

    return { total, downloaded, totalRevenue, avgDownloads };
  }, [purchases]);

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'workflow':
        return <FileJson className="w-3 h-3 text-blue-400" />;
      case 'deployment_guide':
      case 'requirements':
      case 'prompt_template':
        return <FileText className="w-3 h-3 text-amber-400" />;
      default:
        return <Package className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-display flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  Marketplace Activity
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track purchases, downloads, and delivery status
                </p>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Total Orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display">{stats.total}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="border-green-500/30 bg-green-500/5 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-green-400">
                    <Download className="w-4 h-4" />
                    Downloaded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display text-green-400">{stats.downloaded}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-primary/30 bg-primary/5 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-primary">
                    <DollarSign className="w-4 h-4" />
                    Total Revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display text-primary">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Avg Downloads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display">{stats.avgDownloads}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by order ID, email, or product..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={downloadFilter}
                  onValueChange={(v) => {
                    setDownloadFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Download Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOWNLOAD_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={paymentFilter}
                  onValueChange={(v) => {
                    setPaymentFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activity Table */}
          <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Loading activity...</p>
                      </TableCell>
                    </TableRow>
                  ) : paginatedPurchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No purchases found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <code className="text-xs font-mono text-muted-foreground">
                            {purchase.id.slice(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{purchase.email}</span>
                            {purchase.user_id && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {purchase.user_id.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{purchase.product_name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {purchase.item_type}
                              </Badge>
                              {purchase.current_version && (
                                <span className="text-xs text-muted-foreground">
                                  {purchase.current_version}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatCurrency(purchase.amount_cents)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              ['completed', 'paid'].includes(purchase.status)
                                ? 'border-green-500/50 text-green-400 bg-green-500/10'
                                : 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                            }
                          >
                            <span className="flex items-center gap-1.5">
                              {['completed', 'paid'].includes(purchase.status) ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              {purchase.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span
                              className={
                                purchase.download_count > 0
                                  ? 'text-green-400 font-medium'
                                  : 'text-muted-foreground'
                              }
                            >
                              {purchase.download_count > 0 ? (
                                <span className="flex items-center gap-1">
                                  <Download className="w-3 h-3" />
                                  {purchase.download_count}x
                                </span>
                              ) : (
                                'Not downloaded'
                              )}
                            </span>
                            {purchase.last_download_at && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(purchase.last_download_at), 'MMM d, HH:mm')}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {purchase.file_types.length > 0 ? (
                              purchase.file_types.map((type) => (
                                <span
                                  key={type}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded text-xs"
                                  title={type}
                                >
                                  {getFileTypeIcon(type)}
                                  {type.replace('_', ' ').slice(0, 8)}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(purchase.created_at), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-border p-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>

          {/* Summary */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Showing {paginatedPurchases.length} of {filteredPurchases.length} orders
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
