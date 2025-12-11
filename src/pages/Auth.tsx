import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, signupSchema } from '@/lib/auth-validations';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
});

type FormErrors = {
  displayName?: string;
  email?: string;
  password?: string;
};

type ViewMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const { user, signIn, signUp, resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (viewMode === 'forgot') {
      const result = emailSchema.safeParse({ email });
      if (!result.success) {
        setErrors({ email: result.error.errors[0].message });
        return;
      }

      setIsSubmitting(true);
      try {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          setResetEmailSent(true);
        }
      } catch (err) {
        toast({
          title: 'Unexpected error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate login/signup
    const schema = viewMode === 'login' ? loginSchema : signupSchema;
    const formData = viewMode === 'login' ? { email, password } : { email, password, displayName };
    const result = schema.safeParse(formData);

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
      console.log('Auth: Attempting', viewMode, { email });
      
      if (viewMode === 'login') {
        const { error } = await signIn(email, password);
        console.log('Auth: Sign in result', { error: error?.message });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Invalid credentials',
              description: 'Please check your email and password.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error signing in',
              description: error.message,
              variant: 'destructive',
            });
          }
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        console.log('Auth: Sign up result', { error: error?.message });
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Try logging in.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error signing up',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account created!',
            description: 'You can now sign in with your credentials.',
          });
          setViewMode('login');
          setPassword('');
        }
      }
    } catch (err) {
      console.error('Auth: Unexpected error', err);
      toast({
        title: 'Unexpected error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Reset email sent success view
  if (resetEmailSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="p-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </a>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-20">
          <div className="w-full max-w-md text-center">
            <div className="card-glow p-8 rounded-sm border border-border">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="font-display text-3xl mb-2">CHECK YOUR EMAIL</h1>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <span className="text-foreground">{email}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setResetEmailSent(false);
                  setViewMode('login');
                  setEmail('');
                }}
                className="text-primary hover:underline text-sm"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          <div className="card-glow p-8 rounded-sm border border-border">
            <h1 className="font-display text-3xl md:text-4xl mb-2 text-center">
              {viewMode === 'login' && 'ADMIN LOGIN'}
              {viewMode === 'signup' && 'CREATE ACCOUNT'}
              {viewMode === 'forgot' && 'RESET PASSWORD'}
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              {viewMode === 'login' && 'Sign in to access the dashboard'}
              {viewMode === 'signup' && 'Register for admin access'}
              {viewMode === 'forgot' && 'Enter your email to receive a reset link'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {viewMode === 'signup' && (
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (errors.displayName) setErrors((p) => ({ ...p, displayName: undefined }));
                    }}
                    maxLength={100}
                    className={`w-full px-4 py-3 bg-background border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                      errors.displayName ? 'border-destructive' : 'border-border'
                    }`}
                  />
                  {errors.displayName && (
                    <p className="text-destructive text-xs mt-1">{errors.displayName}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  maxLength={255}
                  className={`w-full px-4 py-3 bg-background border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                    errors.email ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {viewMode !== 'forgot' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
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
              )}

              {viewMode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot');
                      setErrors({});
                    }}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : viewMode === 'login' ? (
                  'Sign In'
                ) : viewMode === 'signup' ? (
                  'Create Account'
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              {viewMode === 'forgot' ? (
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setErrors({});
                  }}
                  className="text-primary hover:underline text-sm"
                >
                  Back to login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setViewMode(viewMode === 'login' ? 'signup' : 'login');
                    setErrors({});
                  }}
                  className="text-primary hover:underline text-sm"
                >
                  {viewMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
