import { 
  Mail, 
  MessageSquare, 
  CreditCard, 
  ShoppingCart, 
  Users,
  Phone
} from 'lucide-react';

const IntegrationIcons = () => {
  const integrations = [
    { name: 'Google', icon: Mail },
    { name: 'Slack', icon: MessageSquare },
    { name: 'Stripe', icon: CreditCard },
    { name: 'Shopify', icon: ShoppingCart },
    { name: 'HubSpot', icon: Users },
    { name: 'Twilio', icon: Phone },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center justify-center w-10 h-10 rounded-md bg-muted"
            title={integration.name}
          >
            <integration.icon className="w-5 h-5 text-muted-foreground" />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Integrates with common operational systems.
      </p>
    </div>
  );
};

export default IntegrationIcons;
