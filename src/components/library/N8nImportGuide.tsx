import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';

// Import the generated screenshots
import step1Menu from '@/assets/n8n-step1-menu.png';
import step2Select from '@/assets/n8n-step2-select.png';
import step3Imported from '@/assets/n8n-step3-imported.png';
import step4Credentials from '@/assets/n8n-step4-credentials.png';
import step5Activate from '@/assets/n8n-step5-activate.png';

const importSteps = [
  {
    step: 1,
    title: 'Open n8n and access the import menu',
    description: 'In your n8n instance, click the menu icon (☰) in the top-left corner, then select "Import from File" from the dropdown.',
    image: step1Menu,
    tip: 'You can also use the keyboard shortcut Ctrl+I (Cmd+I on Mac) to open the import dialog.',
  },
  {
    step: 2,
    title: 'Select your downloaded JSON file',
    description: 'Navigate to where you saved the workflow pack JSON file and select it. Click "Open" or "Import" to proceed.',
    image: step2Select,
    tip: 'Keep your workflow files organized in a dedicated folder for easy access.',
  },
  {
    step: 3,
    title: 'Review the imported workflow',
    description: 'The workflow will appear on your canvas with all nodes and connections intact. Nodes requiring configuration will show warning indicators.',
    image: step3Imported,
    tip: 'Take a moment to review the workflow structure before configuring credentials.',
  },
  {
    step: 4,
    title: 'Configure your credentials',
    description: 'Click on each node with a warning indicator. Add your API keys and credentials for the connected services (e.g., Slack, Google Sheets, CRM).',
    image: step4Credentials,
    tip: 'Refer to the included documentation for specific credential requirements.',
  },
  {
    step: 5,
    title: 'Activate the workflow',
    description: 'Once all credentials are configured, toggle the "Active" switch in the top-right corner to enable the workflow on your n8n instance.',
    image: step5Activate,
    tip: 'Test with sample data before using in production.',
  },
];

const N8nImportGuide = () => {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Step-by-Step Import Guide
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Follow these steps to import any AERELION workflow pack into your n8n instance.
        </p>
      </div>

      <div className="space-y-16">
        {importSteps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 items-center`}
          >
            {/* Screenshot */}
            <div className="w-full lg:w-1/2">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur-sm group-hover:blur-md transition-all" />
                <div className="relative rounded-lg overflow-hidden border border-border bg-card shadow-lg">
                  <img
                    src={step.image}
                    alt={`Step ${step.step}: ${step.title}`}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
              </div>

              <p className="text-muted-foreground leading-relaxed pl-[52px]">
                {step.description}
              </p>

              {step.tip && (
                <div className="pl-[52px]">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Tip:</span> {step.tip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">You're ready to import your first workflow pack</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </motion.div>
    </section>
  );
};

export default N8nImportGuide;
