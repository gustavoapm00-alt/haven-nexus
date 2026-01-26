import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, LogOut, Mail, MessageSquare, Trash2, RefreshCw, 
  ArrowRight, Settings, LayoutDashboard, Activity, Package, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivationRequestsTable } from '@/components/admin/ActivationRequestsTable';

interface EmailSignup {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'emails' | 'contacts'>('emails');
  const [emails, setEmails] = useState<EmailSignup[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/portal/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setDataLoading(true);
    
    const [emailsRes, contactsRes] = await Promise.all([
      supabase.from('email_signups').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
    ]);

    if (emailsRes.data) setEmails(emailsRes.data);
    if (contactsRes.data) setContacts(contactsRes.data);
    
    setDataLoading(false);
  };

  const handleDeleteEmail = async (id: string) => {
    const { error } = await supabase.from('email_signups').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    } else {
      setEmails(emails.filter((e) => e.id !== id));
      toast({ title: 'Deleted', description: 'Email signup removed' });
    }
  };

  const handleDeleteContact = async (id: string) => {
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    } else {
      setContacts(contacts.filter((c) => c.id !== id));
      toast({ title: 'Deleted', description: 'Contact submission removed' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Non-admin users: redirect to portal
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="font-display text-2xl">
              AERELION
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/portal/dashboard">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  My Downloads
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="font-display text-4xl mb-2">Access Restricted</h1>
            <p className="text-muted-foreground">You don't have admin access. Visit your portal to view purchases.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link 
              to="/portal/dashboard" 
              className="group card-glass p-6 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg group-hover:text-primary transition-colors">My Purchases</h3>
                  <p className="text-muted-foreground text-sm">View your purchased automations</p>
                </div>
              </div>
            </Link>
            <Link 
              to="/automations" 
              className="group card-glass p-6 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg group-hover:text-primary transition-colors">Browse Automations</h3>
                  <p className="text-muted-foreground text-sm">Explore hosted automations</p>
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Admin view - simplified for marketplace
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl">
            AERELION <span className="text-primary">ADMIN</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Marketplace
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Admin Studio Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl">Hosted Automations Admin</h2>
              <p className="text-muted-foreground text-sm">Manage automations, bundles, and track activity</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/admin/library" 
              className="group card-glass p-6 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl mb-1 group-hover:text-primary transition-colors">Product Library</h3>
                  <p className="text-muted-foreground text-sm">Manage automations & bundles</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/activity" 
              className="group card-glass p-6 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl group-hover:scale-105 transition-all">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl mb-1 group-hover:text-primary transition-colors">Marketplace Activity</h3>
                  <p className="text-muted-foreground text-sm">Track purchases & activity</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/setup" 
              className="group card-glass p-6 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                  <Settings className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl mb-1 group-hover:text-primary transition-colors">Admin Setup</h3>
                  <p className="text-muted-foreground text-sm">View access diagnostic</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Activation Requests Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl">Activation Requests</h2>
              <p className="text-muted-foreground text-sm">Pending automation activation requests from customers</p>
            </div>
          </div>
          
          <div className="card-glass rounded-lg p-6">
            <ActivationRequestsTable />
          </div>
        </div>

        {/* Data Overview */}
        <h2 className="font-display text-2xl mb-4">Lead Data</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card-glass p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-display">{emails.length}</p>
                <p className="text-muted-foreground text-sm">Email Signups</p>
              </div>
            </div>
          </div>
          <div className="card-glass p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-display">{contacts.length}</p>
                <p className="text-muted-foreground text-sm">Contact Submissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'emails'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Email Signups
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'contacts'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Contact Submissions
          </button>
          <button
            onClick={fetchData}
            className="ml-auto p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            disabled={dataLoading}
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="card-glass rounded-lg overflow-hidden">
          {dataLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : activeTab === 'emails' ? (
            emails.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No email signups yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {emails.map((signup) => (
                  <div key={signup.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                    <div>
                      <p className="font-medium">{signup.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {signup.source || 'Direct'} • {new Date(signup.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEmail(signup.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )
          ) : (
            contacts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No contact submissions yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.message}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
