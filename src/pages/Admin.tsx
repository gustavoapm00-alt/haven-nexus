import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogOut, Mail, MessageSquare, Trash2, RefreshCw } from 'lucide-react';

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
  
  const [activeTab, setActiveTab] = useState<'emails' | 'contacts'>('emails');
  const [emails, setEmails] = useState<EmailSignup[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="card-glow p-8 rounded-sm border border-border text-center max-w-md">
          <h1 className="font-display text-2xl mb-4">ACCESS DENIED</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges. Contact the site owner to request access.
          </p>
          <button onClick={handleSignOut} className="btn-secondary">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl">
            HAVEN <span className="text-primary">ADMIN</span>
          </h1>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card-glow p-6 rounded-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-sm">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-display">{emails.length}</p>
                <p className="text-muted-foreground text-sm">Email Signups</p>
              </div>
            </div>
          </div>
          <div className="card-glow p-6 rounded-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-sm">
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
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              activeTab === 'emails'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Email Signups
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
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
        <div className="card-glow rounded-sm border border-border overflow-hidden">
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
                  {emails.map((signup) => (
                    <tr key={signup.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-sm">{signup.email}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {signup.source || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(signup.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteEmail(signup.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
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
            <div className="divide-y divide-border">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-6 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{contact.name}</span>
                        <span className="text-muted-foreground text-sm">{contact.email}</span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{contact.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contact.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
