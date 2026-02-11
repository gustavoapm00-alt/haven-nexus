import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileCheck, Server, ArrowRight, Check, Loader2, AlertTriangle, Database, Eye, Cpu, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import SEO, { schemas } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { enterpriseIntakeSchema, type EnterpriseIntakeData } from '@/lib/enterprise-validations';

const COMPLIANCE_DOMAINS = [
  { id: 'nist-171', label: 'NIST 800-171' },
  { id: 'cmmc-l2', label: 'CMMC Level 2' },
  { id: 'nist-53', label: 'NIST 800-53' },
  { id: 'itar', label: 'ITAR' },
  { id: 'dfars', label: 'DFARS 252.204-7012' },
  { id: 'fedramp', label: 'FedRAMP' },
  { id: 'nist-34', label: 'NIST 800-34 (COOP)' },
  { id: 'cui', label: 'CUI Handling' },
];

const POSTURE_OPTIONS = [
  { value: 'pre-assessment', label: 'Pre-Assessment — No formal compliance program' },
  { value: 'partial', label: 'Partial — Some controls implemented, gaps remain' },
  { value: 'documented', label: 'Documented — SSP exists, enforcement inconsistent' },
  { value: 'audited', label: 'Audited — Third-party assessment completed' },
  { value: 'certified', label: 'Certified — Active CMMC/FedRAMP certification' },
];

const TEAM_SIZES = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '500+', label: '500+ employees' },
];

const CONTRACT_VEHICLES = [
  { value: 'prime', label: 'Prime Contractor' },
  { value: 'sub', label: 'Subcontractor' },
  { value: 'both', label: 'Prime + Sub' },
  { value: 'pursuing', label: 'Pursuing First Contract' },
  { value: 'commercial', label: 'Commercial (Compliance-Driven)' },
];

const TIMELINES = [
  { value: 'immediate', label: 'Immediate — Active audit or contract deadline' },
  { value: '30-days', label: '30 Days — Upcoming compliance milestone' },
  { value: '90-days', label: '90 Days — Strategic planning phase' },
  { value: 'exploratory', label: 'Exploratory — Evaluating options' },
];

const CAPABILITY_PILLARS = [
  {
    icon: Shield,
    designation: 'AG-01',
    title: 'CUI HANDOFF PROTOCOL',
    nist: 'NIST 800-171 / CMMC L2',
    description: 'Autonomous scanning and classification of Controlled Unclassified Information across your operational stack. Continuous monitoring, not periodic audits.',
  },
  {
    icon: Database,
    title: 'DATA ONTOLOGY ENGINE',
    designation: 'AG-02',
    nist: 'NIST 800-53 AC/AU',
    description: 'Universal schema mapping that eliminates data ambiguity. Every field, every record, every transition governed by a singular truth model.',
  },
  {
    icon: Server,
    title: 'COOP LOGIC STABILIZATION',
    designation: 'AG-03',
    nist: 'NIST 800-34',
    description: 'Continuity of Operations enforcement with drift detection. If your systems deviate from the hardened baseline, AERELION auto-corrects.',
  },
  {
    icon: Lock,
    title: 'ACCESS GOVERNANCE LAYER',
    designation: 'AG-04',
    nist: 'NIST 800-171 3.1.x',
    description: 'Principle of Least Privilege enforcement across all integration points. Role-based access with immutable provenance logging.',
  },
  {
    icon: Eye,
    title: 'SHADOW IT ENUMERATION',
    designation: 'AG-05',
    nist: 'CMMC L2 AM.2.032',
    description: 'Complete asset surface reduction. Every unauthorized tool, API, and data flow is identified, catalogued, and either governed or eliminated.',
  },
  {
    icon: Cpu,
    title: 'EXECUTIVE DECISION INTEGRITY',
    designation: 'AG-07',
    nist: 'NIST 800-171 3.12.x',
    description: 'Real-time After-Action Reporting that transforms raw operational data into audit-ready executive briefings.',
  },
];

const Enterprise = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<EnterpriseIntakeData>({
    resolver: zodResolver(enterpriseIntakeSchema),
    defaultValues: {
      name: '', title: '', email: '', organization: '',
      cage_code: '', naics_codes: '', contract_vehicle: '',
      compliance_needs: [], current_posture: '', team_size: '',
      primary_challenge: '', timeline: '', additional_context: '',
    },
  });

  const handleSubmit = async (data: EnterpriseIntakeData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('engagement_requests')
        .insert({
          name: data.name,
          email: data.email,
          company_name: data.organization,
          team_size: data.team_size,
          primary_goal: 'enterprise-govcon',
          operational_pain: data.primary_challenge,
          calm_in_30_days: `CAGE: ${data.cage_code || 'N/A'} | NAICS: ${data.naics_codes || 'N/A'} | Vehicle: ${data.contract_vehicle || 'N/A'} | Posture: ${data.current_posture} | Compliance: ${data.compliance_needs.join(', ')} | Timeline: ${data.timeline} | Title: ${data.title} | Context: ${data.additional_context || 'N/A'}`,
          current_tools: data.compliance_needs,
          website: null,
        });
      if (error) throw error;
      setSubmitted(true);
      toast.success('Enterprise scoping request submitted');
    } catch (err) {
      console.error('Enterprise intake error:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDomain = (id: string, current: string[]) =>
    current.includes(id) ? current.filter(d => d !== id) : [...current, id];

  const refId = `ENT-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

  return (
    <>
      <SEO
        title="Enterprise GovCon Compliance – AERELION Systems"
        description="The Palantir for small-to-mid-sized Government Contractors. NIST 800-171, CMMC Level 2, and CUI compliance automation — embedded, not bolted on."
        keywords="NIST 800-171, CMMC Level 2, government contractor compliance, CUI handling, DFARS, FedRAMP, GovCon automation, compliance automation"
        canonicalUrl="/enterprise"
        structuredData={[
          schemas.webPage('Enterprise GovCon Compliance', 'NIST 800-171 and CMMC L2 compliance infrastructure for government contractors', '/enterprise'),
          schemas.breadcrumb([{ name: 'Home', url: '/' }, { name: 'Enterprise', url: '/enterprise' }]),
          schemas.service('GovCon Compliance Automation', 'Autonomous compliance infrastructure for NIST 800-171, CMMC Level 2, and CUI handling — designed for small-to-mid-sized government contractors', '/enterprise'),
        ]}
      />

      <div className="min-h-screen bg-black">
        {/* Hero */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(57,255,20,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(57,255,20,0.04),transparent)]" />

          <div className="relative z-10 container-main max-w-6xl py-32">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-2 h-2 bg-[#39FF14]" />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#39FF14]/70">
                ENTERPRISE // GOVCON COMPLIANCE INFRASTRUCTURE
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-mono text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#E0E0E0] leading-[1.05] tracking-tight mb-8 max-w-5xl"
            >
              THE PALANTIR FOR
              <br />
              <span className="text-[#39FF14]">SMALL-TO-MID-SIZED</span>
              <br />
              GOVCONS.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="font-sans text-base md:text-lg text-white/40 max-w-2xl mb-10 leading-relaxed"
            >
              NIST 800-171. CMMC Level 2. CUI Handling. Not as a checklist you print — as autonomous infrastructure that runs inside your operations, 24/7, without a single analyst on staff.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a href="#intake" className="btn-launch-primary gap-3 px-8 py-4">
                REQUEST SCOPING <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#capabilities" className="btn-launch px-8 py-4">
                VIEW CAPABILITY MATRIX
              </a>
            </motion.div>

            {/* Compliance badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap gap-3 mt-12"
            >
              {['NIST 800-171', 'CMMC L2', 'DFARS 7012', 'NIST 800-34', 'CUI'].map(badge => (
                <span key={badge} className="font-mono text-[10px] tracking-wider px-3 py-1.5 border border-[#39FF14]/20 text-[#39FF14]/60">
                  {badge}
                </span>
              ))}
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </section>

        {/* The Problem */}
        <section className="py-20 border-t border-white/5">
          <div className="container-main max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <span className="font-mono text-[10px] text-[#FFBF00]/60 tracking-[0.25em] uppercase mb-4 block">
                  // THREAT_LANDSCAPE
                </span>
                <h2 className="font-mono text-2xl md:text-3xl text-[#E0E0E0] font-semibold mb-6 leading-tight">
                  YOUR COMPLIANCE POSTURE IS A LIABILITY.
                </h2>
                <p className="font-sans text-sm text-white/35 leading-relaxed mb-6">
                  You're a 40-person government contractor. You won the contract because your team is exceptional — not because you have a compliance department. Now DFARS 252.204-7012 says you need NIST 800-171. CMMC L2 is coming. And your "compliance program" is a shared Google Drive folder with 47 unlabeled documents.
                </p>
                <p className="font-sans text-sm text-white/35 leading-relaxed">
                  Enterprise tools cost $200K/year and need a dedicated team. Consultants hand you a binder and leave. Neither option is built for you.
                </p>
              </div>

              <div className="border border-white/10 p-6">
                <h3 className="font-mono text-xs text-[#FFBF00] mb-4 tracking-wider">OPERATIONAL_GAP_ANALYSIS</h3>
                <ul className="space-y-3">
                  {[
                    'CUI scattered across 12+ unmonitored systems',
                    'No formal System Security Plan (SSP)',
                    'Access controls exist in name only',
                    'Audit readiness = scramble mode',
                    'Shadow IT surface unknown and growing',
                    'COOP plan is theoretical, not executable',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FFBF00]/60 shrink-0 mt-0.5" />
                      <span className="font-mono text-xs text-white/40">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Capability Matrix */}
        <section id="capabilities" className="py-20 border-t border-white/5">
          <div className="container-main max-w-6xl">
            <div className="mb-12">
              <span className="font-mono text-[10px] text-[#39FF14]/50 tracking-[0.25em] uppercase mb-3 block">
                // CAPABILITY_MATRIX
              </span>
              <h2 className="font-mono text-2xl md:text-3xl text-[#E0E0E0] font-semibold mb-3">
                THE ELITE 7 — GOVCON DEPLOYMENT
              </h2>
              <p className="font-sans text-sm text-white/30 max-w-2xl">
                Six autonomous agents deployed as a unified compliance substrate. Each agent maps directly to NIST control families.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
              {CAPABILITY_PILLARS.map((pillar) => (
                <div key={pillar.designation} className="bg-black p-6 group hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 border border-[#39FF14]/20 flex items-center justify-center">
                      <pillar.icon className="w-4 h-4 text-[#39FF14]/60" />
                    </div>
                    <span className="font-mono text-[10px] text-[#39FF14]/40 tracking-wider">{pillar.designation}</span>
                  </div>
                  <h3 className="font-mono text-xs text-[#E0E0E0] tracking-wider mb-1">{pillar.title}</h3>
                  <span className="font-mono text-[10px] text-[#FFBF00]/50 tracking-wider block mb-3">{pillar.nist}</span>
                  <p className="font-sans text-xs text-white/30 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Differentiator */}
        <section className="py-20 border-t border-white/5">
          <div className="container-main max-w-5xl">
            <div className="text-center mb-12">
              <span className="font-mono text-[10px] text-[#39FF14]/50 tracking-[0.25em] uppercase mb-3 block">
                // COMPETITIVE_ANALYSIS
              </span>
              <h2 className="font-mono text-2xl md:text-3xl text-[#E0E0E0] font-semibold">
                WHY NOT THEM
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-white/5">
              {[
                {
                  label: 'BIG GRC PLATFORMS',
                  problems: ['$200K+/yr licensing', 'Requires dedicated compliance team', 'Built for Fortune 500, not 40-person shops', '18-month implementation cycles'],
                },
                {
                  label: 'CONSULTANTS',
                  problems: ['Deliver a binder, not infrastructure', 'No continuous monitoring', 'Compliance decays the day they leave', 'Hourly billing misaligned with outcomes'],
                },
                {
                  label: 'AERELION',
                  problems: ['Autonomous compliance substrate', 'No analysts required', 'Continuous, not periodic', 'Priced for SMB GovCons'],
                  highlight: true,
                },
              ].map(col => (
                <div key={col.label} className={`bg-black p-6 ${col.highlight ? 'border border-[#39FF14]/20' : ''}`}>
                  <h3 className={`font-mono text-xs tracking-wider mb-4 ${col.highlight ? 'text-[#39FF14]' : 'text-white/30'}`}>
                    {col.label}
                  </h3>
                  <ul className="space-y-2.5">
                    {col.problems.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {col.highlight ? (
                          <Check className="w-3 h-3 text-[#39FF14]/60 shrink-0 mt-0.5" />
                        ) : (
                          <span className="w-3 h-3 flex items-center justify-center shrink-0 mt-0.5 font-mono text-[8px] text-white/20">✗</span>
                        )}
                        <span className={`font-sans text-xs ${col.highlight ? 'text-white/50' : 'text-white/25'}`}>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Intake Form */}
        <section id="intake" className="py-20 border-t border-white/5">
          <div className="container-main max-w-6xl">
            <div className="mb-10">
              <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
                // ENTERPRISE SCOPING REQUEST
              </span>
              <h2 className="font-mono text-2xl md:text-3xl font-semibold text-[#E0E0E0] mb-3">
                INITIATE ENTERPRISE SCOPING
              </h2>
              <div className="flex flex-wrap gap-4 font-mono text-[10px] text-white/20 tracking-wider">
                <span>REF_ID: [{refId}]</span>
                <span>CLASSIFICATION: ENTERPRISE_GOVCON</span>
                <span>PROTOCOL: SYS.OPS.V2</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="lg:col-span-2">
                <div className="border border-white/10 p-6 md:p-8">
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 border border-[#39FF14]/30 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-[#39FF14]" />
                      </div>
                      <h3 className="font-mono text-lg text-[#E0E0E0] mb-3">[STATUS: SCOPING REQUEST RECEIVED]</h3>
                      <p className="font-mono text-xs text-white/30 mb-6">REF: {refId}</p>
                      <p className="font-sans text-sm text-white/40 max-w-md mx-auto mb-4">
                        An AERELION systems architect will review your compliance posture and respond within 48 hours with a structured engagement proposal.
                      </p>
                      <p className="font-mono text-[10px] text-[#FFBF00]/40">CLASSIFICATION: ENTERPRISE // PRIORITY: ELEVATED</p>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Identity Block */}
                        <div>
                          <h3 className="font-mono text-[10px] text-[#39FF14]/40 tracking-wider mb-4 uppercase">SECTION_01 // IDENTITY</h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">OPERATOR_NAME *</FormLabel>
                                <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="title" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">DESIGNATION *</FormLabel>
                                <FormControl><Input placeholder="e.g., CISO, VP of Operations" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4 mt-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">FREQUENCY *</FormLabel>
                                <FormControl><Input type="email" placeholder="you@company.gov" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="organization" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">ORGANIZATION *</FormLabel>
                                <FormControl><Input placeholder="Company name" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        {/* Federal Identity */}
                        <div>
                          <h3 className="font-mono text-[10px] text-[#39FF14]/40 tracking-wider mb-4 uppercase">SECTION_02 // FEDERAL IDENTITY</h3>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <FormField control={form.control} name="cage_code" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">CAGE_CODE</FormLabel>
                                <FormControl><Input placeholder="e.g., 3A4B7" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="naics_codes" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">NAICS_CODES</FormLabel>
                                <FormControl><Input placeholder="e.g., 541512, 541519" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="contract_vehicle" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">CONTRACT_VEHICLE</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger></FormControl>
                                  <SelectContent>{CONTRACT_VEHICLES.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        {/* Compliance Profile */}
                        <div>
                          <h3 className="font-mono text-[10px] text-[#39FF14]/40 tracking-wider mb-4 uppercase">SECTION_03 // COMPLIANCE PROFILE</h3>
                          <FormField control={form.control} name="compliance_needs" render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">REQUIRED_FRAMEWORKS *</FormLabel>
                              <div className="flex flex-wrap gap-3 mt-2">
                                {COMPLIANCE_DOMAINS.map(d => {
                                  const sel = field.value.includes(d.id);
                                  return (
                                    <label key={d.id} className={`flex items-center gap-2 px-3 py-2 border cursor-pointer transition-colors font-mono text-xs ${
                                      sel ? 'bg-[rgba(57,255,20,0.08)] border-[rgba(57,255,20,0.3)] text-[#39FF14]' : 'border-white/10 text-white/30 hover:border-white/20'
                                    }`}>
                                      <Checkbox checked={sel} onCheckedChange={() => field.onChange(toggleDomain(d.id, field.value))} className="sr-only" />
                                      <span>{d.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="current_posture" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">CURRENT_POSTURE *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select posture" /></SelectTrigger></FormControl>
                                  <SelectContent>{POSTURE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="team_size" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">UNIT_SIZE *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger></FormControl>
                                  <SelectContent>{TEAM_SIZES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        {/* Operational Context */}
                        <div>
                          <h3 className="font-mono text-[10px] text-[#39FF14]/40 tracking-wider mb-4 uppercase">SECTION_04 // OPERATIONAL CONTEXT</h3>
                          <FormField control={form.control} name="primary_challenge" render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">PRIMARY_CHALLENGE *</FormLabel>
                              <p className="text-xs font-sans text-white/25 mb-2">What compliance gap, audit deadline, or operational risk is driving this inquiry?</p>
                              <FormControl><Textarea rows={4} placeholder="e.g., 'We have a CMMC L2 assessment in Q3 and no SSP. Our CUI is in 4 different cloud platforms with no access controls.'" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="timeline" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">ENGAGEMENT_TIMELINE *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger></FormControl>
                                  <SelectContent>{TIMELINES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="additional_context" render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel className="font-mono text-[10px] text-white/30 uppercase tracking-wider">ADDITIONAL_CONTEXT</FormLabel>
                              <FormControl><Textarea rows={3} placeholder="Any additional information relevant to scoping..." {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <div className="pt-4">
                          <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto bg-[#FFBF00] text-black border-[#FFBF00] hover:bg-[#ffc929] hover:shadow-[0_0_20px_rgba(255,191,0,0.3)]">
                            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />PROCESSING...</>) : 'REQUEST SCOPING'}
                          </Button>
                          <p className="font-mono text-[10px] text-white/20 mt-3 tracking-wider">
                            RESPONSE_TIME: 48 HOURS // CLASSIFICATION: ENTERPRISE // ENCRYPTION: ACTIVE
                          </p>
                        </div>
                      </form>
                    </Form>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="border border-white/10 p-6 sticky top-24">
                  <h3 className="font-mono text-sm font-semibold text-[#E0E0E0] mb-6">ENGAGEMENT_PARAMETERS</h3>
                  <ul className="space-y-4">
                    {[
                      { icon: Shield, text: 'All intake data encrypted via TLS 1.3 + AES-256-GCM at rest' },
                      { icon: FileCheck, text: 'Scoping includes compliance gap analysis mapped to NIST control families' },
                      { icon: Lock, text: 'No credentials required at intake — scoping only' },
                      { icon: Building2, text: 'Designed for 10–500 person GovCon organizations' },
                      { icon: Server, text: 'Autonomous deployment — no FTE compliance analysts needed' },
                    ].map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <point.icon className="w-4 h-4 text-[#39FF14]/50 shrink-0 mt-0.5" />
                        <span className="font-sans text-sm text-white/40">{point.text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-white/5 mt-6 pt-6">
                    <h4 className="font-mono text-[10px] text-white/25 uppercase tracking-wider mb-3">POST_SUBMISSION_SEQUENCE</h4>
                    <ol className="space-y-2 font-mono text-xs text-white/30">
                      <li className="flex gap-2"><span className="text-[#39FF14]/50">[01]</span> Compliance posture assessment</li>
                      <li className="flex gap-2"><span className="text-[#39FF14]/50">[02]</span> NIST control family gap mapping</li>
                      <li className="flex gap-2"><span className="text-[#39FF14]/50">[03]</span> Engagement scope + architecture proposal</li>
                      <li className="flex gap-2"><span className="text-[#39FF14]/50">[04]</span> Authorization and deployment initiation</li>
                    </ol>
                  </div>

                  <div className="border-t border-white/5 mt-6 pt-6">
                    <p className="font-mono text-[10px] text-white/15 tracking-wider">
                      AERELION // SYS.OPS.V2.06
                    </p>
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

export default Enterprise;
