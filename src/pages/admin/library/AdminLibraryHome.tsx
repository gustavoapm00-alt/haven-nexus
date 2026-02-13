import { Link } from 'react-router-dom';
import AdminGate from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Layers } from 'lucide-react';

const AdminLibraryHome = () => {
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
              <h1 className="font-display text-xl">Admin Library</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-2">Manage Marketplace Content</h2>
            <p className="text-muted-foreground">
              Create, edit, and publish workflow packs and system bundles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Workflow Packs Card */}
            <Link
              to="/admin/library/agents"
              className="group card-glass p-8 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl mb-2 group-hover:text-primary transition-colors">
                    Governed Protocols
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Manage governed protocols. Configure specifications, dependencies, and publish to the Capability Matrix.
                  </p>
                  <span className="text-sm text-primary font-medium">
                    Manage Protocols →
                  </span>
                </div>
              </div>
            </Link>

            {/* Bundles Card */}
            <Link
              to="/admin/library/bundles"
              className="group card-glass p-8 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl mb-2 group-hover:text-primary transition-colors">
                    System Bundles
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create curated bundles of agents. Set bundle pricing and combine agents for specific use cases.
                  </p>
                  <span className="text-sm text-primary font-medium">
                    Manage Bundles →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </AdminGate>
  );
};

export default AdminLibraryHome;
