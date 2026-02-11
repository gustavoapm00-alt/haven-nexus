import { useState } from 'react';
import { Calendar, Check, Loader2, Shield, Clock, Users, Wrench } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SEO, { schemas } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { engagementFormSchema, type EngagementFormData } from '@/lib/validations';
import { Link } from 'react-router-dom';

const TEAM_SIZES = [
  { value: '1', label: 'Just me' },
  { value: '2-5', label: '2–5 people' },
  { value: '6-10', label: '6–10 people' },
  { value: '11+', label: '11+ people' },
];

const PRIMARY_GOALS = [
  { value: 'lead-followup', label: 'Lead follow-up' },
  { value: 'client-onboarding', label: 'Client onboarding' },
  { value: 'inbox-relief', label: 'Inbox relief' },
  { value: 'reporting', label: 'Reporting' },
  { value: 'internal-ops', label: 'Internal ops' },
  { value: 'other', label: 'Other' },
];

const TOOLS = [
  'CRM', 'Email', 'Scheduling', 'Forms', 'Sheets', 'Notion', 'Slack', 'Airtable', 'Zapier', 'Other',
];

const TRUST_POINTS = [
  { icon: Shield, text: 'No subscriptions' },
  { icon: Users, text: 'Pricing is scoped per engagement, not per workflow' },
  { icon: Wrench, text: 'No technical experience required' },
  { icon: Clock, text: 'We install, operate, and maintain workflows' },
  { icon: Shield, text: 'You can revoke access any time' },
];

const LibraryContact = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<EngagementFormData>({
    resolver: zodResolver(engagementFormSchema),
    defaultValues: {
      name: '', email: '', company_name: '', website: '',
      team_size: '', primary_goal: '', current_tools: [],
      operational_pain: '', calm_in_30_days: '',
    },
  });

  const handleSubmit = async (data: EngagementFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('engagement_requests')
        .insert({
          name: data.name, email: data.email,
          company_name: data.company_name || null,
          website: data.website || null,
          team_size: data.team_size, primary_goal: data.primary_goal,
          current_tools: data.current_tools,
          operational_pain: data.operational_pain,
          calm_in_30_days: data.calm_in_30_days || null,
        });
      if (error) throw error;
      setSubmitted(true);
      toast.success('Request submitted successfully');
    } catch (error) {
      console.error('Engagement form error:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTool = (tool: string, currentTools: string[]) => {
    return currentTools.includes(tool) ? currentTools.filter((t) => t !== tool) : [...currentTools, tool];
  };

  const incidentId = Math.random().toString(16).slice(2, 10).toUpperCase();

  const contactStructuredData = [
    schemas.webPage("Request Operational Briefing", "Submit an operational briefing request to AERELION Systems", "/contact"),
    schemas.breadcrumb([{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }])
  ];

  return (
    <>
      <SEO
        title="Request Operational Briefing – AERELION Systems"
        description="Submit an operational briefing request. Tell us where operational friction exists. We respond within 24-48 hours with a structured engagement proposal."
        keywords="operational briefing, automation consultation, managed automation inquiry, workflow automation"
        canonicalUrl="/contact"
        structuredData={contactStructuredData}
      />

      <div className="min-h-screen bg-[#0F0F0F]">
        <section className="section-padding !pt-12">
          <div className="container-main max-w-6xl">
            {/* Header */}
            <div className="mb-10">
              <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
                // SECURE UPLINK
              </span>
              <h1 className="font-mono text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-3">
                Request Operational Briefing
              </h1>
              <div className="flex flex-wrap gap-4 font-mono text-[10px] text-white/20 tracking-wider">
                <span>INCIDENT_ID: [{incidentId}]</span>
                <span>PROTOCOL_VERSION: SYS.OPS.V2</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <div className="border border-white/10 p-6 md:p-8">
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 border border-[#39FF14]/30 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-[#39FF14]" />
                      </div>
                      <h3 className="font-mono text-lg text-[#E0E0E0] mb-3">
                        [STATUS: PACKET RECEIVED]
                      </h3>
                      <p className="font-mono text-xs text-white/30 mb-6">
                        REF: ENG-{Date.now().toString(36).toUpperCase()}
                      </p>
                      <p className="font-sans text-sm text-white/40 mb-6 max-w-md mx-auto">
                        We are reviewing your operational stack and will respond with next steps within 24–48 hours.
                      </p>
                      <Link to="/how-it-works" className="font-mono text-xs text-[#39FF14]/60 hover:text-[#39FF14] transition-colors uppercase tracking-wider">
                        View deployment doctrine →
                      </Link>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">TRANSMISSION_SOURCE *</FormLabel>
                              <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">FREQUENCY *</FormLabel>
                              <FormControl><Input type="email" placeholder="you@company.com" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name="company_name" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">ORGANIZATION_ID</FormLabel>
                              <FormControl><Input placeholder="Your company" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="website" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">NETWORK_ADDRESS</FormLabel>
                              <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name="team_size" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">UNIT_SIZE *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select unit size" /></SelectTrigger></FormControl>
                                <SelectContent>{TEAM_SIZES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="primary_goal" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">PRIMARY_OBJECTIVE *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select objective" /></SelectTrigger></FormControl>
                                <SelectContent>{PRIMARY_GOALS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <FormField control={form.control} name="current_tools" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">CONNECTED_SYSTEMS</FormLabel>
                            <p className="text-xs font-sans text-white/25 mb-3">Select the tools currently in your operational stack</p>
                            <div className="flex flex-wrap gap-3">
                              {TOOLS.map((tool) => {
                                const isSelected = field.value.includes(tool);
                                return (
                                  <label key={tool} className={`flex items-center gap-2 px-3 py-2 border cursor-pointer transition-colors font-mono text-xs ${
                                    isSelected ? 'bg-[rgba(57,255,20,0.08)] border-[rgba(57,255,20,0.3)] text-[#39FF14]' : 'border-white/10 text-white/30 hover:border-white/20'
                                  }`}>
                                    <Checkbox checked={isSelected} onCheckedChange={() => field.onChange(toggleTool(tool, field.value))} className="sr-only" />
                                    <span>{tool}</span>
                                  </label>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="operational_pain" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">PAYLOAD *</FormLabel>
                            <p className="text-xs font-sans text-white/25 mb-2">Describe the primary operational friction point</p>
                            <FormControl>
                              <Textarea rows={4} placeholder="e.g., 'Follow-ups slip after initial calls. Leads go cold because no one remembers to check back.'" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="calm_in_30_days" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">TARGET_STATE_30D</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 'Every lead gets a reply within 2 hours, without me checking anything.'" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="pt-4">
                          <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto bg-[#FFBF00] text-black border-[#FFBF00] hover:bg-[#ffc929] hover:shadow-[0_0_20px_rgba(255,191,0,0.3)]">
                            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />TRANSMITTING...</>) : 'INITIATE SYSTEM HANDOFF'}
                          </Button>
                          <p className="font-mono text-[10px] text-white/20 mt-3 tracking-wider">
                            RESPONSE_TIME: 24-48 HOURS // ENCRYPTION: ACTIVE
                          </p>
                        </div>
                      </form>
                    </Form>
                  )}
                </div>
              </div>

              {/* Trust Panel */}
              <div className="lg:col-span-1">
                <div className="border border-white/10 p-6 sticky top-24">
                  <h3 className="font-mono text-sm font-semibold text-[#E0E0E0] mb-6">
                    OPERATIONAL_PARAMETERS
                  </h3>
                  <ul className="space-y-4">
                    {TRUST_POINTS.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <point.icon className="w-4 h-4 text-[#39FF14]/50 shrink-0 mt-0.5" />
                        <span className="font-sans text-sm text-white/40">{point.text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-white/5 mt-6 pt-6">
                    <h4 className="font-mono text-[10px] text-white/25 uppercase tracking-wider mb-3">
                      POST_SUBMISSION_SEQUENCE
                    </h4>
                    <ol className="space-y-2 font-mono text-xs text-white/30">
                      <li className="flex gap-2"><span className="text-[#39FF14]/50">[01]</span> Stack review initiated</li>
                      <li className="flex gap-2"><span className="text-[#39FF14]/50">[02]</span> Automation scope analysis</li>
                      <li className="flex gap-2"><span className="text-[#39FF14]/50">[03]</span> Proposal + pricing transmitted</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LibraryContact;
