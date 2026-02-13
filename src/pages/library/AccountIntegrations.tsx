import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  RefreshCw,
  Trash2,
  ExternalLink,
  Unplug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/hooks/useAuth';
import { useIntegrationConnections, IntegrationConnection } from '@/hooks/useIntegrationConnections';
import { toast } from '@/hooks/use-toast';

/**
 * CONNECT ONCE. RUN MANY.
 * 
 * Account-level integrations management page.
 * Users connect their tools once here, and all automations can reuse them.
 */

const PROVIDER_INFO: Record<string, { name: string; description: string; icon?: string }> = {
  hubspot: {
    name: 'HubSpot',
    description: 'CRM, contacts, deals, and marketing automation',
  },
  gmail: {
    name: 'Gmail',
    description: 'Send and read emails on your behalf',
  },
  calendar: {
    name: 'Google Calendar',
    description: 'Manage calendar events and scheduling',
  },
  sheets: {
    name: 'Google Sheets',
    description: 'Read and write spreadsheet data',
  },
  slack: {
    name: 'Slack',
    description: 'Send messages and notifications to channels',
  },
  notion: {
    name: 'Notion',
    description: 'Access your Notion workspace pages and databases',
  },
  airtable: {
    name: 'Airtable',
    description: 'Connect to your Airtable bases',
  },
  stripe: {
    name: 'Stripe',
    description: 'Process payments and manage subscriptions',
  },
  quickbooks: {
    name: 'QuickBooks',
    description: 'Sync invoices and accounting data',
  },
  twilio: {
    name: 'Twilio',
    description: 'Send SMS and make voice calls',
  },
  email: {
    name: 'Email (SMTP)',
    description: 'Connect via SMTP for sending emails',
  },
  crm: {
    name: 'CRM',
    description: 'Generic CRM connection',
  },
};

function getProviderInfo(provider: string) {
  return PROVIDER_INFO[provider.toLowerCase()] || {
    name: provider.charAt(0).toUpperCase() + provider.slice(1),
    description: `Connected ${provider} integration`,
  };
}

function ConnectionCard({ 
  connection, 
  onRevoke,
  isRevoking,
}: { 
  connection: IntegrationConnection;
  onRevoke: (provider: string) => void;
  isRevoking: boolean;
}) {
  const info = getProviderInfo(connection.provider);
  const isConnected = connection.status === 'connected';

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{info.name}</CardTitle>
            {isConnected ? (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                {connection.status}
              </Badge>
            )}
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                disabled={isRevoking}
              >
                <Unplug className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect {info.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will revoke access for all automations using {info.name}. 
                  You can reconnect at any time, but active automations may stop working.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onRevoke(connection.provider)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <CardDescription>{info.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-1">
          {connection.connected_email && (
            <p>Connected as: <span className="text-foreground">{connection.connected_email}</span></p>
          )}
          {connection.granted_scopes && connection.granted_scopes.length > 0 && (
            <p>Scopes: {connection.granted_scopes.length} permissions granted</p>
          )}
          <p className="text-xs">
            Connected {new Date(connection.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AccountIntegrations() {
  const { user, isLoading: authLoading } = useAuth();
  const { 
    connections, 
    isLoading, 
    error, 
    fetchConnections,
    revokeConnection,
    isConnecting,
  } = useIntegrationConnections();
  
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async (provider: string) => {
    setIsRevoking(true);
    const result = await revokeConnection(provider);
    setIsRevoking(false);
    
    if (result.error) {
      toast({
        title: 'Failed to disconnect',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Disconnected',
        description: `${getProviderInfo(provider).name} has been disconnected.`,
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>
              Please sign in to manage your integrations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeConnections = connections.filter(c => c.status === 'connected');

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Connected Integrations</h1>
          <p className="text-muted-foreground">
            Connect your tools once and use them across all your automations.
          </p>
        </div>

        {/* Security Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">CONNECT ONCE. RUN MANY.</p>
                <p className="text-muted-foreground">
                  Your credentials are encrypted with AES-256 and never stored in plain text.
                  Each connection can power unlimited automations without reconnecting.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchConnections()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connections Grid */}
        {activeConnections.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {activeConnections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onRevoke={handleRevoke}
                isRevoking={isRevoking}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Integrations Connected</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                When you authorize a governed protocol, you'll be prompted to connect the required systems.
                Those connections will appear here and can be reused across protocols.
              </p>
              <Link to="/library">
                <Button>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  VIEW CAPABILITY MATRIX
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">Connect once</span> — 
                Link your tools (HubSpot, Gmail, etc.) from any automation's setup screen
              </li>
              <li>
                <span className="text-foreground font-medium">Use everywhere</span> — 
                All your automations automatically use these connections
              </li>
              <li>
                <span className="text-foreground font-medium">Stay in control</span> — 
                Disconnect any integration here to revoke access from all automations
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
