import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  function_name: string;
  level: LogLevel;
  message: string;
  details?: Record<string, unknown>;
  user_id?: string;
  ip_address?: string;
  duration_ms?: number;
  status_code?: number;
}

// Create a service-role client for logging (bypasses RLS)
function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

// Sanitize details to remove sensitive information
function sanitizeDetails(details?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!details) return undefined;
  
  const sanitized = { ...details };
  
  // Remove sensitive fields
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    }
    // Truncate email to domain only
    if (key.toLowerCase() === 'email' && typeof sanitized[key] === 'string') {
      const email = sanitized[key] as string;
      const atIndex = email.indexOf('@');
      if (atIndex > 0) {
        sanitized[key] = `***@${email.slice(atIndex + 1)}`;
      }
    }
    // Truncate user IDs
    if (key.toLowerCase().includes('userid') && typeof sanitized[key] === 'string') {
      sanitized[key] = (sanitized[key] as string).substring(0, 8) + '...';
    }
  }
  
  return sanitized;
}

// Extract IP from request headers
export function getClientIP(req: Request): string | undefined {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         undefined;
}

// Log to database (fire-and-forget, non-blocking)
export async function logToDatabase(entry: LogEntry): Promise<void> {
  try {
    const client = getServiceClient();
    
    await client.from('edge_function_logs').insert({
      function_name: entry.function_name,
      level: entry.level,
      message: entry.message,
      details: sanitizeDetails(entry.details) ?? null,
      user_id: entry.user_id ?? null,
      ip_address: entry.ip_address ?? null,
      duration_ms: entry.duration_ms ?? null,
      status_code: entry.status_code ?? null,
    });
  } catch (err) {
    // Fail silently to not affect the main function
    console.error('[EDGE-LOGGER] Failed to log to database:', err);
  }
}

// Create a logger instance for a specific function
export function createLogger(functionName: string, req?: Request) {
  const startTime = Date.now();
  const ip = req ? getClientIP(req) : undefined;
  let userId: string | undefined;

  return {
    setUserId(id: string) {
      userId = id;
    },

    debug(message: string, details?: Record<string, unknown>) {
      console.log(`[${functionName}] DEBUG: ${message}`, details ?? '');
      // Don't log debug to database by default
    },

    info(message: string, details?: Record<string, unknown>) {
      console.log(`[${functionName}] INFO: ${message}`, details ?? '');
      logToDatabase({
        function_name: functionName,
        level: 'info',
        message,
        details,
        user_id: userId,
        ip_address: ip,
      });
    },

    warn(message: string, details?: Record<string, unknown>) {
      console.warn(`[${functionName}] WARN: ${message}`, details ?? '');
      logToDatabase({
        function_name: functionName,
        level: 'warn',
        message,
        details,
        user_id: userId,
        ip_address: ip,
      });
    },

    error(message: string, details?: Record<string, unknown>) {
      console.error(`[${functionName}] ERROR: ${message}`, details ?? '');
      logToDatabase({
        function_name: functionName,
        level: 'error',
        message,
        details,
        user_id: userId,
        ip_address: ip,
      });
    },

    // Log the final response with duration
    async logResponse(statusCode: number, message: string, details?: Record<string, unknown>) {
      const duration = Date.now() - startTime;
      const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
      
      console.log(`[${functionName}] ${level.toUpperCase()}: ${message} (${duration}ms, status: ${statusCode})`);
      
      await logToDatabase({
        function_name: functionName,
        level,
        message,
        details,
        user_id: userId,
        ip_address: ip,
        duration_ms: duration,
        status_code: statusCode,
      });
    },
  };
}
