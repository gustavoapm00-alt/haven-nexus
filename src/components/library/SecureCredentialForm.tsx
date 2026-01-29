import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CredentialSchema, CredentialField } from '@/lib/credential-schemas';
import { useActivationCredentials } from '@/hooks/useActivationCredentials';
import { useToast } from '@/hooks/use-toast';

interface SecureCredentialFormProps {
  requestId: string;
  schema: CredentialSchema;
  onSuccess?: () => void;
  existingCredential?: { id: string; status: string };
}

export function SecureCredentialForm({
  requestId,
  schema,
  onSuccess,
  existingCredential,
}: SecureCredentialFormProps) {
  const { toast } = useToast();
  const { storeCredential, revokeCredential, isSubmitting } = useActivationCredentials(requestId);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isRevoking, setIsRevoking] = useState(false);

  // Build dynamic Zod schema based on credential fields
  const buildValidationSchema = () => {
    const shape: Record<string, z.ZodString | z.ZodOptional<z.ZodString> | z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<''>]>> = {};
    
    for (const field of schema.fields) {
      let fieldSchema: z.ZodString;
      
      if (field.type === 'url') {
        fieldSchema = z.string().url('Please enter a valid URL');
      } else if (field.type === 'email') {
        fieldSchema = z.string().email('Please enter a valid email');
      } else {
        fieldSchema = z.string();
      }

      if (field.required) {
        shape[field.key] = fieldSchema.min(1, `${field.label} is required`);
      } else {
        shape[field.key] = fieldSchema.optional().or(z.literal(''));
      }
    }
    
    return z.object(shape);
  };

  const validationSchema = buildValidationSchema();
  type FormData = z.infer<typeof validationSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: schema.fields.reduce((acc, field) => {
      acc[field.key] = '';
      return acc;
    }, {} as Record<string, string>),
  });

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const onSubmit = async (data: FormData) => {
    // Filter out empty optional fields
    const credentials: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'string' && value.trim()) {
        credentials[key] = value.trim();
      }
    }

    const { error } = await storeCredential(
      schema.credentialType,
      schema.serviceName,
      credentials,
      { submittedAt: new Date().toISOString() }
    );

    if (error) {
      toast({
        title: 'Failed to store credentials',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Credentials stored securely',
        description: `Your ${schema.serviceName} credentials have been encrypted and saved.`,
      });
      reset();
      onSuccess?.();
    }
  };

  const handleRevoke = async () => {
    if (!existingCredential) return;
    
    setIsRevoking(true);
    const { error } = await revokeCredential(existingCredential.id, 'User requested rotation');
    setIsRevoking(false);

    if (error) {
      toast({
        title: 'Failed to revoke credentials',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Credentials revoked',
        description: 'You can now submit new credentials.',
      });
    }
  };

  const renderField = (field: CredentialField) => {
    const isPassword = field.type === 'password';
    const showPassword = showPasswords[field.key];
    const error = errors[field.key];

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key} className="flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
          {field.sensitive && (
            <Lock className="w-3 h-3 text-muted-foreground" />
          )}
        </Label>
        
        <div className="relative">
          {field.type === 'textarea' ? (
            <Textarea
              id={field.key}
              {...register(field.key)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
              rows={3}
            />
          ) : (
            <div className="relative">
              <Input
                id={field.key}
                type={isPassword && !showPassword ? 'password' : 'text'}
                {...register(field.key)}
                placeholder={field.placeholder}
                className={`${error ? 'border-red-500' : ''} ${isPassword ? 'pr-10' : ''}`}
                autoComplete="off"
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(field.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
        
        {error && (
          <p className="text-xs text-red-500">{String(error.message)}</p>
        )}
      </div>
    );
  };

  // If credential exists and is active, show status
  if (existingCredential && existingCredential.status === 'active') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <div className="flex-1">
            <p className="font-medium text-emerald-400">{schema.serviceName} Connected</p>
            <p className="text-sm text-muted-foreground">Credentials stored securely</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevoke}
            disabled={isRevoking}
            className="text-amber-500 border-amber-500/50 hover:bg-amber-500/10"
          >
            {isRevoking ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Rotate Credentials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security notice */}
      <Alert className="bg-primary/5 border-primary/30">
        <Shield className="w-4 h-4 text-primary" />
        <AlertDescription className="text-sm">
          Your credentials are sent securely via HTTPS and encrypted at rest with AES-256-GCM. 
          They are never logged, emailed, or shown again after submission.
        </AlertDescription>
      </Alert>

      {schema.additionalInstructions && (
        <Alert className="bg-blue-500/5 border-blue-500/30">
          <Info className="w-4 h-4 text-blue-400" />
          <AlertDescription className="text-sm text-muted-foreground">
            {schema.additionalInstructions}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {schema.fields.map(renderField)}

        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Sent securely and encrypted at rest
          </p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Connect Securely
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
