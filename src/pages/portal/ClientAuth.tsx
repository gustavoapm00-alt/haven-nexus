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
import { lovable } from '@/integrations/lovable/index';

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
  
  const { user, isAdmin, signIn, signUp, signInWithGoogle, resetPassword, isLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useClientProfile();
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (user && !profileLoading) {
      // Admin users go to Nexus Command
      if (isAdmin) {
        navigate('/nexus/cmd');
        return;
      }
      // Redirect based on onboarding status
      if (profile?.onboarding_complete) {
        navigate('/portal/dashboard');
      } else {
        navigate('/portal/onboarding');
      }
    }
  }, [user, isAdmin, profile, profileLoading, navigate]);

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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({
          title: 'Error signing in with Google',
          description: result.error.message,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Unexpected error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
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

              {/* Google OAuth Divider and Button - only for login/signup */}
              {viewMode !== 'forgot' && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background/80 px-2 text-muted-foreground">
                        or continue with
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isSubmitting}
                    className="w-full py-3 bg-background/50 border border-border/50 text-foreground font-medium rounded-lg hover:bg-background/80 hover:border-border disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </button>
                </>
              )}

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
