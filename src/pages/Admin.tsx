import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { 
  Loader2, LogOut, Mail, MessageSquare, Trash2, RefreshCw, 
  CreditCard, Crown, ArrowRight, Bot, Zap, Settings,
  LayoutDashboard
} from 'lucide-react';
import { STRIPE_TIERS } from '@/lib/stripe-config';
import { OnboardingModal, useOnboarding } from '@/components/OnboardingModal';
import { Button } from '@/components/ui/button';

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
  const { subscribed, tier, subscriptionEnd, isLoading: subLoading, openCustomerPortal, checkSubscription } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showOnboarding, closeOnboarding } = useOnboarding();
  
  const [activeTab, setActiveTab] = useState<'emails' | 'contacts'>('emails');
  const [emails, setEmails] = useState<EmailSignup[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Handle successful checkout
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      sonnerToast.success('Subscription activated! Welcome to AERELION.');
      checkSubscription();
      navigate('/admin', { replace: true });
    }
  }, [searchParams, navigate, checkSubscription]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
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

  // Non-admin users: redirect to dashboard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingModal 
          isOpen={showOnboarding} 
          onClose={closeOnboarding} 
          userName={user?.email?.split('@')[0]}
        />
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="font-display text-2xl">
              AERELION
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
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
            <h1 className="font-display text-4xl mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">You're logged in but don't have admin access.</p>
          </div>
          
          {/* Subscription Status */}
          <div className="card-glass p-8 rounded-lg mb-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl mb-1">
                    {subLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : subscribed && tier ? (
                      STRIPE_TIERS[tier].name
                    ) : (
                      'No Active Plan'
                    )}
                  </h2>
                  {subscribed && subscriptionEnd && (
                    <p className="text-muted-foreground text-sm">
                      Renews on {new Date(subscriptionEnd).toLocaleDateString()}
                    </p>
                  )}
                  {!subscribed && (
                    <p className="text-muted-foreground text-sm">
                      Start a subscription to access all features
                    </p>
                  )}
                </div>
              </div>
              {subscribed ? (
                <Button variant="outline" onClick={openCustomerPortal}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>
              ) : (
                <Link to="/pricing/ecom">
                  <Button>
                    View Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link 
              to="/dashboard" 
              className="group card-glass p-6 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg group-hover:text-primary transition-colors">AI Agents Dashboard</h3>
                  <p className="text-muted-foreground text-sm">Run your unlocked AI agents</p>
                </div>
              </div>
            </Link>
            <Link 
              to="/pricing/ecom" 
              className="group card-glass p-6 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg group-hover:text-primary transition-colors">Upgrade Plan</h3>
                  <p className="text-muted-foreground text-sm">Unlock more AI agents</p>
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Admin view
  return (
    <div className="min-h-screen bg-background">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={closeOnboarding} 
        userName={user?.email?.split('@')[0]}
      />
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl">
            AERELION <span className="text-primary">ADMIN</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
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
              <h2 className="font-display text-2xl">Admin Studio</h2>
              <p className="text-muted-foreground text-sm">Manage agents, plans, and entitlements</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Link 
              to="/studio/agents" 
              className="group card-glass p-6 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl mb-1 group-hover:text-primary transition-colors">Agent Templates</h3>
                  <p className="text-muted-foreground text-sm">Create and edit AI agent prompts</p>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/studio/plans" 
              className="group card-glass p-6 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl mb-1 group-hover:text-primary transition-colors">Plans</h3>
                  <p className="text-muted-foreground text-sm">Configure pricing tiers and limits</p>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/studio/entitlements" 
              className="group card-glass p-6 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl mb-1 group-hover:text-primary transition-colors">Entitlements</h3>
                  <p className="text-muted-foreground text-sm">Map agents to plans</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Data Overview */}
        <h2 className="font-display text-2xl mb-4">Data Overview</h2>
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
            disabled={dataLoading}
            className="ml-auto p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Data Table */}
        <div className="card-glass rounded-lg overflow-hidden">
          {dataLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : activeTab === 'emails' ? (
            emails.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No email signups yet
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Source
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {emails.map((email) => (
                    <tr key={email.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{email.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="px-2 py-1 bg-secondary rounded text-xs">
                          {email.source || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {new Date(email.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteEmail(email.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : contacts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No contact submissions yet
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Message
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{contact.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{contact.email}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm max-w-xs truncate">
                      {contact.message}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
