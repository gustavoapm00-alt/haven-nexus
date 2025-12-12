import { AlertTriangle, ExternalLink } from 'lucide-react';

const SecretsWarningBanner = () => {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-yellow-500 mb-1">Security Secrets Required</p>
          <p className="text-muted-foreground mb-2">
            For production security, ensure these secrets are configured in your Lovable project settings:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-2">
            <li><code className="bg-background px-1 rounded text-foreground">RELEVANCE_DEFAULT_OUTBOUND_SECRET</code> — sent to Relevance in webhook headers</li>
            <li><code className="bg-background px-1 rounded text-foreground">RELEVANCE_CALLBACK_SECRET</code> — validates callbacks from Relevance</li>
          </ul>
          <p className="text-muted-foreground">
            Configure these secrets in <strong>Project Settings → Secrets</strong>.{' '}
            <a
              href="https://docs.lovable.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Learn more <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecretsWarningBanner;
