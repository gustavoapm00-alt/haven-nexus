import { 
  Mail, 
  MessageSquare, 
  FileSpreadsheet, 
  CreditCard,
  Calendar,
  ShoppingCart,
  Phone,
  Bot,
  Webhook,
  Zap
} from 'lucide-react';

interface SystemIconProps {
  name: string;
  size?: 'sm' | 'md';
  variant?: 'light' | 'dark';
}

const SystemIcon = ({ name, size = 'sm', variant = 'light' }: SystemIconProps) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const isDark = variant === 'dark';
  
  const getIcon = () => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('gmail') || lowerName.includes('email')) {
      return <Mail className={iconSize} />;
    }
    if (lowerName.includes('slack')) {
      return <MessageSquare className={iconSize} />;
    }
    if (lowerName.includes('sheets') || lowerName.includes('spreadsheet')) {
      return <FileSpreadsheet className={iconSize} />;
    }
    if (lowerName.includes('stripe') || lowerName.includes('payment')) {
      return <CreditCard className={iconSize} />;
    }
    if (lowerName.includes('calendly') || lowerName.includes('calendar')) {
      return <Calendar className={iconSize} />;
    }
    if (lowerName.includes('shopify') || lowerName.includes('shop')) {
      return <ShoppingCart className={iconSize} />;
    }
    if (lowerName.includes('twilio') || lowerName.includes('phone') || lowerName.includes('sms')) {
      return <Phone className={iconSize} />;
    }
    if (lowerName.includes('openai') || lowerName.includes('ai') || lowerName.includes('gpt')) {
      return <Bot className={iconSize} />;
    }
    if (lowerName.includes('webhook')) {
      return <Webhook className={iconSize} />;
    }
    if (lowerName.includes('n8n') || lowerName.includes('zapier')) {
      return <Zap className={iconSize} />;
    }
    
    return <Zap className={iconSize} />;
  };

  return (
    <div className={`system-badge ${isDark ? 'bg-white/10 text-white/70' : ''}`}>
      {getIcon()}
      <span>{name}</span>
    </div>
  );
};

export default SystemIcon;
