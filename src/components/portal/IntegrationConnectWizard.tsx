 import React, { useState, useCallback, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import {
   X,
   CheckCircle2,
   Loader2,
   Shield,
   ExternalLink,
   ChevronRight,
   Sparkles,
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { useIntegrationConnections } from '@/hooks/useIntegrationConnections';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from '@/hooks/use-toast';
 
 /**
  * CONNECT ONCE. RUN MANY.
  * 
  * Streamlined post-login wizard that prompts users to connect
  * all their integrations in one flow.
  */
 
 interface ProviderConfig {
   id: string;
   name: string;
   description: string;
   icon: React.ReactNode;
   oauthSupported: boolean;
   scopes?: string[];
 }
 
 const AVAILABLE_PROVIDERS: ProviderConfig[] = [
   {
     id: 'google',
     name: 'Google Workspace',
     description: 'Gmail, Calendar, Sheets, Drive',
     icon: (
       <svg className="w-6 h-6" viewBox="0 0 24 24">
         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
       </svg>
     ),
     oauthSupported: true,
   },
   {
     id: 'hubspot',
     name: 'HubSpot',
     description: 'CRM, contacts, deals, marketing',
     icon: (
       <svg className="w-6 h-6" viewBox="0 0 24 24">
         <path fill="#FF7A59" d="M18.164 7.93V5.396a2.01 2.01 0 0 0 1.163-1.82v-.06A2.018 2.018 0 0 0 17.31 1.5h-.06a2.018 2.018 0 0 0-2.017 2.016v.06c0 .777.44 1.449 1.085 1.785v2.565a5.93 5.93 0 0 0-2.9 1.398l-7.97-6.2a2.352 2.352 0 0 0 .104-.7A2.35 2.35 0 0 0 3.2 0a2.35 2.35 0 0 0-2.35 2.35 2.35 2.35 0 0 0 2.35 2.35c.46 0 .89-.133 1.254-.361l7.843 6.102a5.96 5.96 0 0 0-.738 2.87c0 1.061.28 2.058.768 2.921l-2.394 2.393a1.972 1.972 0 0 0-.576-.09 2.004 2.004 0 0 0-2.004 2.004A2.004 2.004 0 0 0 9.357 22.5a2.004 2.004 0 0 0 2.004-2.004c0-.22-.036-.432-.102-.63l2.332-2.332a5.961 5.961 0 0 0 3.687 1.27 5.975 5.975 0 0 0 5.975-5.975 5.975 5.975 0 0 0-5.089-5.9z"/>
       </svg>
     ),
     oauthSupported: true,
   },
   {
     id: 'slack',
     name: 'Slack',
     description: 'Messages, notifications, channels',
     icon: (
       <svg className="w-6 h-6" viewBox="0 0 24 24">
         <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
         <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
         <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/>
         <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
       </svg>
     ),
     oauthSupported: true,
   },
   {
     id: 'notion',
     name: 'Notion',
     description: 'Pages, databases, workspaces',
     icon: (
       <svg className="w-6 h-6" viewBox="0 0 24 24">
         <path fill="currentColor" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.453-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933l3.222-.187zM2.361 1.247l13.123-.933c1.635-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.933.653.933 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.927c0-.84.374-1.54 1.635-1.68z"/>
       </svg>
     ),
     oauthSupported: true,
   },
 ];
 
 interface IntegrationConnectWizardProps {
   open: boolean;
   onClose: () => void;
   onComplete?: () => void;
 }
 
 export function IntegrationConnectWizard({ 
   open, 
   onClose, 
   onComplete 
 }: IntegrationConnectWizardProps) {
   const { connections, fetchConnections, isLoading } = useIntegrationConnections();
   const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
 
   // Check which providers are already connected
   const getConnectionStatus = useCallback((providerId: string) => {
     // Google includes multiple services
     if (providerId === 'google') {
       return connections.some(
         c => ['google', 'gmail', 'calendar', 'sheets'].includes(c.provider.toLowerCase()) && 
              c.status === 'connected'
       );
     }
     return connections.some(
       c => c.provider.toLowerCase() === providerId.toLowerCase() && 
            c.status === 'connected'
     );
   }, [connections]);
 
   const connectedCount = AVAILABLE_PROVIDERS.filter(p => getConnectionStatus(p.id)).length;
   const allConnected = connectedCount === AVAILABLE_PROVIDERS.length;
 
   const handleConnect = useCallback(async (provider: ProviderConfig) => {
     if (!provider.oauthSupported) {
       toast({
         title: 'Manual Setup Required',
         description: `${provider.name} requires manual credential setup.`,
       });
       return;
     }
 
     setConnectingProvider(provider.id);
 
     try {
       // Get auth token
       const { data: { session } } = await supabase.auth.getSession();
       if (!session?.access_token) {
         toast({
           title: 'Session expired',
           description: 'Please sign in again.',
           variant: 'destructive',
         });
         return;
       }
 
      // Call oauth-start to get authorization URL
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-start?provider=${provider.id}&redirect_path=/portal/dashboard`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start OAuth');
      }

      const data = await response.json();
      
      if (data.authorization_url) {
        // Redirect to provider's OAuth page
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No authorization URL received');
      }
     } catch (error) {
       console.error('OAuth start error:', error);
       toast({
         title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Unable to start authentication. Please try again.',
         variant: 'destructive',
       });
      setConnectingProvider(null);
     } finally {
      // Don't reset connecting state here - we're redirecting
     }
   }, []);
 
   // Refetch connections when wizard opens
   useEffect(() => {
     if (open) {
       fetchConnections();
     }
   }, [open, fetchConnections]);
 
   if (!open) return null;
 
   return (
     <AnimatePresence>
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}
       >
         <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
         >
           {/* Header */}
           <div className="relative px-6 pt-6 pb-4 border-b border-border">
             <button
               onClick={onClose}
               className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
             
             <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <Sparkles className="w-5 h-5 text-primary" />
               </div>
               <div>
                 <h2 className="text-lg font-semibold">Connect Your Tools</h2>
                 <p className="text-sm text-muted-foreground">
                   One-click setup for all your integrations
                 </p>
               </div>
             </div>
           </div>
 
           {/* Progress */}
           <div className="px-6 py-3 bg-muted/30 border-b border-border">
             <div className="flex items-center justify-between text-sm">
               <span className="text-muted-foreground">
                 {connectedCount} of {AVAILABLE_PROVIDERS.length} connected
               </span>
               <div className="flex items-center gap-2">
                 <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-primary transition-all duration-300"
                     style={{ width: `${(connectedCount / AVAILABLE_PROVIDERS.length) * 100}%` }}
                   />
                 </div>
               </div>
             </div>
           </div>
 
           {/* Provider List */}
           <div className="px-6 py-4 space-y-3 max-h-[400px] overflow-y-auto">
             {isLoading ? (
               <div className="flex items-center justify-center py-8">
                 <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
               </div>
             ) : (
               AVAILABLE_PROVIDERS.map((provider) => {
                 const isConnected = getConnectionStatus(provider.id);
                 const isConnecting = connectingProvider === provider.id;
 
                 return (
                   <div
                     key={provider.id}
                     className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                       isConnected 
                         ? 'border-primary/30 bg-primary/5' 
                         : 'border-border hover:border-primary/30 hover:bg-muted/30'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                         {provider.icon}
                       </div>
                       <div>
                         <p className="font-medium text-sm">{provider.name}</p>
                         <p className="text-xs text-muted-foreground">
                           {provider.description}
                         </p>
                       </div>
                     </div>
 
                     {isConnected ? (
                       <div className="flex items-center gap-1.5 text-primary text-sm">
                         <CheckCircle2 className="w-4 h-4" />
                         <span className="font-medium">Connected</span>
                       </div>
                     ) : (
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => handleConnect(provider)}
                         disabled={isConnecting}
                         className="gap-1.5"
                       >
                         {isConnecting ? (
                           <>
                             <Loader2 className="w-3.5 h-3.5 animate-spin" />
                             Connecting...
                           </>
                         ) : (
                           <>
                             Connect
                             <ChevronRight className="w-3.5 h-3.5" />
                           </>
                         )}
                       </Button>
                     )}
                   </div>
                 );
               })
             )}
           </div>
 
           {/* Footer */}
           <div className="px-6 py-4 border-t border-border bg-muted/20">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-xs text-muted-foreground">
                 <Shield className="w-3.5 h-3.5" />
                 <span>AES-256 encrypted • Connect once, use everywhere</span>
               </div>
               
               {allConnected ? (
                 <Button size="sm" onClick={() => { onComplete?.(); onClose(); }}>
                   Done
                 </Button>
               ) : (
                 <Button 
                   size="sm" 
                   variant="ghost" 
                   onClick={onClose}
                   className="text-muted-foreground"
                 >
                   Skip for now
                 </Button>
               )}
             </div>
           </div>
         </motion.div>
       </motion.div>
     </AnimatePresence>
   );
 }