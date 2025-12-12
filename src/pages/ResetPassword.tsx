import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters').max(72, 'Password must be less than 72 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormErrors = {
  password?: string;
  confirmPassword?: string;
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  
  const { session, updatePassword, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to fully initialize and session to be established from URL token
    if (isLoading) return;
    
    // Give extra time for Supabase to process the recovery token from URL
    const timer = setTimeout(() => {
      setIsValidating(false);
      if (!session) {
        toast({
          title: 'Invalid or expired link',
          description: 'Please request a new password reset link.',
          variant: 'destructive',
        });
        navigate('/auth');
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [session, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        toast({
          title: 'Error updating password',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setIsSuccess(true);
        toast({
          title: 'Password updated!',
          description: 'Your password has been successfully changed.',
        });
        
        // Redirect to admin after a short delay
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }
    } catch (err) {
      console.error('ResetPassword: Unexpected error', err);
      toast({
        title: 'Unexpected error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="card-glow p-8 rounded-sm border border-border">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl mb-2">PASSWORD UPDATED</h1>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6">
        <a
          href="/auth"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          <div className="card-glow p-8 rounded-sm border border-border">
            <h1 className="font-display text-3xl md:text-4xl mb-2 text-center">
              SET NEW PASSWORD
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Enter your new password below
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  maxLength={72}
                  className={`w-full px-4 py-3 bg-background border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                    errors.password ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }}
                  maxLength={72}
                  className={`w-full px-4 py-3 bg-background border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                    errors.confirmPassword ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
