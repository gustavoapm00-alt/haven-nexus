import { useState, useEffect } from 'react';
import { Info, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'aerelion-secrets-banner-dismissed';

const SecretsWarningBanner = () => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-medium text-primary mb-1">Security Secrets Reminder</p>
          <p className="text-muted-foreground mb-2">
            For production security, ensure these secrets are configured in your Lovable project settings:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-2">
            <li><code className="bg-background px-1 rounded text-foreground">RELEVANCE_DEFAULT_OUTBOUND_SECRET</code> — sent to Relevance in webhook headers</li>
            <li><code className="bg-background px-1 rounded text-foreground">RELEVANCE_CALLBACK_SECRET</code> — validates callbacks from Relevance</li>
          </ul>
          <p className="text-muted-foreground">
            Configure in <strong>Project Settings → Secrets</strong>.{' '}
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
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
          aria-label="Dismiss reminder"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SecretsWarningBanner;
