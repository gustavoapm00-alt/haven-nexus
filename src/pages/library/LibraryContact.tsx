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
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO from '@/components/SEO';
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
  'CRM',
  'Email',
  'Scheduling',
  'Forms',
  'Sheets',
  'Notion',
  'Slack',
  'Airtable',
  'Zapier',
  'Other',
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
      name: '',
      email: '',
      company_name: '',
      website: '',
      team_size: '',
      primary_goal: '',
      current_tools: [],
      operational_pain: '',
      calm_in_30_days: '',
    },
  });

  const handleSubmit = async (data: EngagementFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('engagement_requests')
        .insert({
          name: data.name,
          email: data.email,
          company_name: data.company_name || null,
          website: data.website || null,
          team_size: data.team_size,
          primary_goal: data.primary_goal,
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
    if (currentTools.includes(tool)) {
      return currentTools.filter((t) => t !== tool);
    }
    return [...currentTools, tool];
  };

  return (
    <>
      <SEO
        title="Book an AI Ops Installation"
        description="Tell us what's leaking time in your operations. We'll scope the engagement and handle the install."
        keywords="AI operations, automation installation, workflow integration, business operations"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12">
          <div className="container-main max-w-6xl">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-primary" />
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
                  Book an AI Ops Installation
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tell us what's leaking time in your operations. We'll scope the engagement and handle the install.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <div className="card-enterprise p-6 md:p-8">
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        Request Received
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        We're reviewing your stack and will reply with next steps within 24–48 hours.
                      </p>
                      <Link 
                        to="/how-it-works"
                        className="text-primary hover:underline font-medium"
                      >
                        Learn how we work →
                      </Link>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Contact Info */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="you@company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="company_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your company" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Team & Goal */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="team_size"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Team Size *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select team size" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {TEAM_SIZES.map((size) => (
                                      <SelectItem key={size.value} value={size.value}>
                                        {size.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="primary_goal"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Goal *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="What's the main focus?" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {PRIMARY_GOALS.map((goal) => (
                                      <SelectItem key={goal.value} value={goal.value}>
                                        {goal.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Current Tools */}
                        <FormField
                          control={form.control}
                          name="current_tools"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Tools</FormLabel>
                              <p className="text-sm text-muted-foreground mb-3">
                                Select the tools you currently use (we'll configure workflows around these)
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {TOOLS.map((tool) => {
                                  const isSelected = field.value.includes(tool);
                                  return (
                                    <label
                                      key={tool}
                                      className={`
                                        flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors
                                        ${isSelected 
                                          ? 'bg-primary/10 border-primary text-foreground' 
                                          : 'bg-background border-border hover:border-muted-foreground/50'
                                        }
                                      `}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => {
                                          field.onChange(toggleTool(tool, field.value));
                                        }}
                                        className="sr-only"
                                      />
                                      <span className="text-sm">{tool}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Pain Point */}
                        <FormField
                          control={form.control}
                          name="operational_pain"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Biggest Operational Pain *</FormLabel>
                              <p className="text-sm text-muted-foreground mb-2">
                                What's eating your time? Where do things fall through the cracks?
                              </p>
                              <FormControl>
                                <Textarea
                                  rows={4}
                                  placeholder="e.g., 'Follow-ups slip after initial calls. Leads go cold because no one remembers to check back.'"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Calm Vision */}
                        <FormField
                          control={form.control}
                          name="calm_in_30_days"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>What Would "Calm" Look Like in 30 Days?</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., 'Every lead gets a reply within 2 hours, without me checking anything.'"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            size="lg" 
                            disabled={loading}
                            className="w-full sm:w-auto"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Book an AI Ops Installation'
                            )}
                          </Button>
                          <p className="text-sm text-muted-foreground mt-3">
                            We'll review your submission and respond within 24–48 hours.
                          </p>
                        </div>
                      </form>
                    </Form>
                  )}
                </div>
              </div>

              {/* Trust Panel */}
              <div className="lg:col-span-1">
                <div className="card-enterprise p-6 sticky top-24">
                  <h3 className="font-semibold text-foreground mb-6">
                    What to Expect
                  </h3>
                  <ul className="space-y-4">
                    {TRUST_POINTS.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <point.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {point.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-border mt-6 pt-6">
                    <h4 className="font-medium text-foreground mb-2 text-sm">
                      After You Submit
                    </h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary font-medium">1.</span>
                        We review your stack
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-medium">2.</span>
                        We scope what can be automated
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-medium">3.</span>
                        We reply with a proposal + pricing
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default LibraryContact;
