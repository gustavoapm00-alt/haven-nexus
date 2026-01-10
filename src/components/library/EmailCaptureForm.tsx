import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EmailCaptureFormProps {
  sourcePage?: string;
  buttonText?: string;
  placeholder?: string;
}

const EmailCaptureForm = ({ 
  sourcePage = 'homepage',
  buttonText = 'Subscribe',
  placeholder = 'Enter your email'
}: EmailCaptureFormProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('email_updates')
        .insert({ email: email.trim(), source_page: sourcePage });

      if (error) {
        if (error.code === '23505') {
          toast.info('You are already subscribed');
        } else {
          throw error;
        }
      } else {
        toast.success('Subscribed successfully');
        setEmail('');
      }
    } catch (error) {
      console.error('Email capture error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          buttonText
        )}
      </Button>
    </form>
  );
};

export default EmailCaptureForm;
