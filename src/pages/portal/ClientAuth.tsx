import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, signupSchema } from '@/lib/auth-validations';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, CheckCircle, Mail, Lock, User } from 'lucide-react';
import { z } from 'zod';
import PortalBackground from '@/components/portal/PortalBackground';
import { GlassCard } from '@/components/portal/GlassCard';
import { useClientProfile } from '@/hooks/useClientProfile';

const emailSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
});

type FormErrors = {
  displayName?: string;
  email?: string;
  password?: string;
};

type ViewMode = 'login' | 'signup' | 'forgot';

const ClientAuth = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const { user, signIn, signUp, resetPassword, isLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useClientProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !profileLoading) {
      // Redirect based on onboarding status
      if (profile?.onboarding_complete) {
        navigate('/portal/dashboard');
      } else {
        navigate('/portal/onboarding');
      }
    }
  }, [user, profile, profileLoading, navigate]);

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
      } catch {
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
      if (viewMode === 'login') {
        const { error } = await signIn(email, password);
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
            description: 'Welcome to AERELION.',
          });
        }
      }
    } catch {
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
      <PortalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalBackground>
    );
  }

  // Reset email sent success view
  if (resetEmailSent) {
    return (
      <PortalBackground>
        <div className="min-h-screen flex flex-col">
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
            <GlassCard className="w-full max-w-md p-8 text-center">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-2">Check Your Email</h1>
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
            </GlassCard>
          </div>
        </div>
      </PortalBackground>
    );
  }

  return (
    <PortalBackground>
      <div className="min-h-screen flex flex-col">
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
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold tracking-tight">AERELION</h1>
              <p className="text-muted-foreground mt-1">Client Portal</p>
            </div>

            <GlassCard className="p-8">
              {/* Tab Switcher */}
              {viewMode !== 'forgot' && (
                <div className="flex bg-muted/50 rounded-lg p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => { setViewMode('login'); setErrors({}); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      viewMode === 'login' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewMode('signup'); setErrors({}); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      viewMode === 'signup' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {viewMode === 'forgot' && (
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Reset Password</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Enter your email to receive a reset link
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {viewMode === 'signup' && (
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          if (errors.displayName) setErrors((p) => ({ ...p, displayName: undefined }));
                        }}
                        placeholder="John Doe"
                        maxLength={100}
                        className={`w-full pl-10 pr-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                          errors.displayName ? 'border-destructive' : 'border-border/50'
                        }`}
                      />
                    </div>
                    {errors.displayName && (
                      <p className="text-destructive text-xs mt-1">{errors.displayName}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                      }}
                      placeholder="you@company.com"
                      maxLength={255}
                      className={`w-full pl-10 pr-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        errors.email ? 'border-destructive' : 'border-border/50'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {viewMode !== 'forgot' && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                        }}
                        placeholder="••••••••"
                        maxLength={72}
                        className={`w-full pl-10 pr-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                          errors.password ? 'border-destructive' : 'border-border/50'
                        }`}
                      />
                    </div>
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
                  className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

              {viewMode === 'forgot' && (
                <div className="mt-6 text-center">
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
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </PortalBackground>
  );
};

export default ClientAuth;
